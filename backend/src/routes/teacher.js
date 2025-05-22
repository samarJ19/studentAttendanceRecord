const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma'); // adjust path as needed

// @route   GET /api/teachers/assignments
// @desc    Get teaching assignments for the logged in teacher
// @access  Teacher
router.get('/assignments', async (req, res) => {
  try {
    const teacherId = req.user.teacher.id;  // We are able to do this because of the auth middleware
    
    const assignments = await prisma.teachingAssignment.findMany({
      where: {
        teacherId,
        active: true
      },
      include: {
        course: true,
        branch: true
      },
      orderBy: {
        course: {
          name: 'asc'
        }
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get teaching assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teachers/sessions
// @desc    Create a new class session
// @access  Teacher
router.post('/sessions', async (req, res) => {
  const { assignmentId, date, topic } = req.body;

  try {
    // Verify the teacher is assigned to this course
    const assignment = await prisma.teachingAssignment.findFirst({
      where: {
        id: assignmentId,
        teacherId: req.user.teacher.id,
        active: true
      }
    });

    if (!assignment) {
      return res.status(403).json({ message: 'Not authorized to create sessions for this course' });
    }

    // Create the session
    const session = await prisma.session.create({
      data: {
        assignmentId,
        date: new Date(date),
        topic
      }
    });

    // Find all students enrolled in this course WITH MATCHING branch, semester, and section
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: assignment.courseId,
        semester: assignment.semester,
        section: assignment.section,
        // We're matching the student's branch through their enrollment information
        student: {
          branchId: assignment.branchId
        },
        active: true
      }
    });

    // Create attendance records for all enrolled students (initially marked absent)
    const attendancePromises = enrollments.map(enrollment => 
      prisma.attendance.create({
        data: {
          sessionId: session.id,
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          present: false,
          markedBy: req.user.id
        }
      })
    );

    await Promise.all(attendancePromises);

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/teachers/sessions/:assignmentId
// @desc    Get all sessions for a teaching assignment
// @access  Teacher
router.get('/sessions/:assignmentId', async (req, res) => {
  const { assignmentId } = req.params;

  try {
    // Verify the teacher is assigned to this course
    const assignment = await prisma.teachingAssignment.findFirst({
      where: {
        id: assignmentId,
        teacherId: req.user.teacher.id,
        active: true
      }
    });

    if (!assignment) {
      return res.status(403).json({ message: 'Not authorized to view sessions for this course' });
    }

    // Get sessions
    const sessions = await prisma.session.findMany({
      where: {
        assignmentId
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/teachers/sessions/:sessionId/attendance
// @desc    Get attendance for a specific session
// @access  Teacher
router.get('/sessions/:sessionId/attendance', async (req, res) => {
  const { sessionId } = req.params;

  try {
    // First verify this session belongs to this teacher
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        assignment: true
      }
    });

    if (!session || session.assignment.teacherId !== req.user.teacher.id) {
      return res.status(403).json({ message: 'Not authorized to view this session' });
    }

    // Get attendance with student details
    const attendance = await prisma.attendance.findMany({
      where: {
        sessionId
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        student: {
          rollNumber: 'asc' // Order by roll number instead of first name
        }
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Get session attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/teachers/attendance/:attendanceId
// @desc    Update a student's attendance (mark present/absent)
// @access  Teacher
router.put('/attendance/:attendanceId', async (req, res) => {
  const { attendanceId } = req.params;
  const { present } = req.body;

  try {
    // Verify this attendance record belongs to a session taught by this teacher
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        session: {
          include: {
            assignment: true
          }
        }
      }
    });

    if (!attendance || attendance.session.assignment.teacherId !== req.user.teacher.id) {
      return res.status(403).json({ message: 'Not authorized to update this attendance record' });
    }

    // Update attendance
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        present,
        markedBy: req.user.id,
        markedAt: new Date() // Update timestamp when attendance is modified
      }
    });

    res.json(updatedAttendance);
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/teachers/attendance/batch/:sessionId
// @desc    Update multiple attendance records at once
// @access  Private (Teacher only)
router.put('/attendance/batch/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ msg: 'Attendance records array is required' });
    }

    // Verify the session exists and belongs to the teacher
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        assignment: true
      }
    });

    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }

    if (session.assignment.teacherId !== req.user.teacher.id) {
      return res.status(403).json({ msg: 'Not authorized to update this session' });
    }

    // Get the specific assignment details to filter students correctly
    const assignment = session.assignment;

    // Process each attendance record in the batch
    const results = await Promise.all(attendanceRecords.map(async record => {
      const { studentId, present } = record;
      
      // Find the enrollment for this student-session combination
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId,
          courseId: assignment.courseId,
          semester: assignment.semester,
          section: assignment.section,
          student: {
            branchId: assignment.branchId
          },
          active: true
        }
      });

      if (!enrollment) {
        return { studentId, status: 'failed', msg: 'Student not enrolled in this specific class section' };
      }

      // Update or create attendance record
      const attendance = await prisma.attendance.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId
          }
        },
        update: {
          present,
          markedAt: new Date(),
          markedBy: req.user.id
        },
        create: {
          sessionId,
          studentId,
          enrollmentId: enrollment.id,
          present,
          markedBy: req.user.id
        }
      });

      return { studentId, status: 'success', attendance };
    }));

    res.json(results);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;