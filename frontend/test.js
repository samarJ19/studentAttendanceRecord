//axios api instance 
import axios from 'axios';
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

//backend routes for student
// @route   GET /api/students/enrollments
// @desc    Get all active course enrollments for the current student
// @access  Student
router.get('/enrollments', async (req, res) => {
  try {
    const studentId = req.user.student.id;
    
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        active: true
      },
      include: {
        course: true
      },
      orderBy: {
        course: {
          name: 'asc'
        }
      }
    });

    // For each enrollment, get the teacher assigned to the course
    const enrollmentsWithTeachers = await Promise.all(
      enrollments.map(async (enrollment) => {
        const teachingAssignment = await prisma.teachingAssignment.findFirst({
          where: {
            courseId: enrollment.courseId,
            semester: enrollment.semester,
            academicYear: enrollment.academicYear,
            active: true
          },
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        });

        return {
          ...enrollment,
          teacher: teachingAssignment?.teacher ? {
            id: teachingAssignment.teacher.id,
            name: `${teachingAssignment.teacher.user.firstName} ${teachingAssignment.teacher.user.lastName}`
          } : null,
          assignmentId: teachingAssignment?.id || null
        };
      })
    );

    res.json(enrollmentsWithTeachers);
  } catch (error) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/attendance/:enrollmentId
// @desc    Get attendance details for a specific course enrollment
// @access  Student
router.get('/attendance/:enrollmentId', async (req, res) => {
  const { enrollmentId } = req.params;
  
  try {
    // Verify this enrollment belongs to this student
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        studentId: req.user.student.id
      },
      include: {
        course: true
      }
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Get teaching assignment for this course
    const teachingAssignment = await prisma.teachingAssignment.findFirst({
      where: {
        courseId: enrollment.courseId,
        semester: enrollment.semester,
        academicYear: enrollment.academicYear,
        active: true
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Get all sessions for this teaching assignment
    const sessions = await prisma.session.findMany({
      where: {
        assignmentId: teachingAssignment?.id
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get attendance records for this student for these sessions
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: req.user.student.id,
        enrollmentId,
        sessionId: {
          in: sessions.map(s => s.id)
        }
      }
    });

    // Combine session data with attendance
    const sessionAttendance = sessions.map(session => {
      const attendance = attendanceRecords.find(a => a.sessionId === session.id);
      
      return {
        sessionId: session.id,
        date: session.date,
        topic: session.topic,
        present: attendance ? attendance.present : false,
        marked: !!attendance
      };
    });

    // Calculate attendance statistics
    const totalSessions = sessions.length;
    const attendedSessions = attendanceRecords.filter(record => record.present).length;
    const attendancePercentage = totalSessions > 0 
      ? Math.round((attendedSessions / totalSessions) * 100) 
      : 0;

    const response = {
      course: enrollment.course,
      teacher: teachingAssignment?.teacher ? {
        name: `${teachingAssignment.teacher.user.firstName} ${teachingAssignment.teacher.user.lastName}`
      } : null,
      stats: {
        totalSessions,
        attendedSessions,
        missedSessions: totalSessions - attendedSessions,
        attendancePercentage
      },
      sessions: sessionAttendance
    };

    res.json(response);
  } catch (error) {
    console.error('Get student course attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/attendance-overview
// @desc    Get attendance overview for all active enrollments
// @access  Student
router.get('/attendance-overview', async (req, res) => {
  try {
    const studentId = req.user.student.id;
    
    // Get all active enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        active: true
      },
      include: {
        course: true
      }
    });

    // For each enrollment, calculate attendance statistics
    const attendanceOverview = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get teaching assignment for this course
        const teachingAssignment = await prisma.teachingAssignment.findFirst({
          where: {
            courseId: enrollment.courseId,
            semester: enrollment.semester,
            academicYear: enrollment.academicYear,
            active: true
          }
        });

        if (!teachingAssignment) {
          return {
            enrollmentId: enrollment.id,
            courseCode: enrollment.course.code,
            courseName: enrollment.course.name,
            totalSessions: 0,
            attendedSessions: 0,
            attendancePercentage: 0
          };
        }

        // Count sessions
        const sessionCount = await prisma.session.count({
          where: {
            assignmentId: teachingAssignment.id
          }
        });

        // Count attended sessions
        const attendedCount = await prisma.attendance.count({
          where: {
            studentId,
            enrollmentId: enrollment.id,
            present: true
          }
        });

        const attendancePercentage = sessionCount > 0 
          ? Math.round((attendedCount / sessionCount) * 100) 
          : 0;

        return {
          enrollmentId: enrollment.id,
          courseCode: enrollment.course.code,
          courseName: enrollment.course.name,
          totalSessions: sessionCount,
          attendedSessions: attendedCount,
          attendancePercentage
        };
      })
    );

    // Sort by attendance percentage (ascending)
    attendanceOverview.sort((a, b) => a.attendancePercentage - b.attendancePercentage);

    res.json(attendanceOverview);
  } catch (error) {
    console.error('Get attendance overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});