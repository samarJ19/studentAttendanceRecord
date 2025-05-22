const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const prisma = require('../config/prisma'); // adjust path as needed


// @route   POST /api/admin/users
// @desc    Create a new user (student/teacher/admin)
// @access  Admin
router.post('/users', async (req, res) => {
  const { email, password, firstName, lastName, role, rollNumber, branchId, employeeId, currentSemester,section } = req.body;

  try {
    // Check if user with this email already exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with role-specific data
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        ...(role === 'STUDENT' && {
          student: {
            create: {
              rollNumber,
              currentSemester: currentSemester || 1,
              branchId,
              section: section || "NONE"
            }
          }
        }),
        ...(role === 'TEACHER' && {
          teacher: {
            create: {
              employeeId
            }
          }
        }),
        ...(role === 'ADMIN' && {
          admin: {
            create: {}
          }
        })
      },
      include: {
        student: true,
        teacher: true,
        admin: true
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filtering options
// @access  Admin
router.get('/users', async (req, res) => {
  const { role, branchId } = req.query;
  
  try {
    const where = {};
    if (role) where.role = role;
    
    const users = await prisma.user.findMany({
      where,
      include: {
        student: {
          include: {
            branch: true,
          }
        },
        teacher: true,
        admin: true
      },
      orderBy: {
        firstName: 'asc'
      }
    });

    // Filter by branch if specified (for students)
    const filteredUsers = branchId 
      ? users.filter(user => 
          user.role === 'STUDENT' && 
          user.student && 
          user.student.branchId === branchId
        )
      : users;

    // Remove passwords from response
    const usersWithoutPasswords = filteredUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/students/:id/semester
// @desc    Update student semester (promotion, retention)
// @access  Admin
router.put('/students/:id/semester', async (req, res) => {
  const { id } = req.params;
  const { newSemester, academicYear } = req.body;

  try {
    // Update student's semester
    const student = await prisma.student.update({
      where: { id },
      data: { currentSemester: newSemester },
      include: { user: true }
    });

    // Update enrollments - deactivate old ones if promoting to a new semester
    if (academicYear) {
      await prisma.enrollment.updateMany({
        where: { 
          studentId: id,
          semester: { not: newSemester }  
        },
        data: { active: false }
      });
    }

    res.json(student);
  } catch (error) {
    console.error('Update student semester error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/branches
// @desc    Create a new branch
// @access  Admin
router.post('/branches', async (req, res) => {
  const { name } = req.body;

  try {
    const branch = await prisma.branch.create({
      data: { name }
    });

    res.status(201).json(branch);
  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/branches
// @desc    Get all branches
// @access  Admin
router.get('/branches', async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/courses
// @desc    Create a new course
// @access  Admin
router.post('/courses', async (req, res) => {
  const { code, name, semester, branchId } = req.body;

  try {
    const course = await prisma.course.create({
      data: {
        code,
        name,
        semester,
        branchId
      }
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/courses
// @desc    Get all courses with optional filtering
// @access  Admin
router.get('/courses', async (req, res) => {
  const { branchId, semester } = req.query;
  
  try {
    const where = {};
    if (branchId) where.branchId = branchId;
    if (semester) where.semester = parseInt(semester);
    
    const courses = await prisma.course.findMany({
      where,
      include: {
        branch: true
      }
    });
    
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/teaching-assignments
// @desc    Assign a teacher to a course for a specific branch, semester and academic year
// @access  Admin
router.post('/teaching-assignments', async (req, res) => {
  const { teacherId, courseId, branchId, semester, academicYear,section } = req.body;

  try {
    // First deactivate any existing assignments for this course-branch-semester-year
    await prisma.teachingAssignment.updateMany({
      where: {
        courseId,
        branchId,
        semester,
        academicYear
      },
      data: {
        active: false
      }
    });

    // Create new teaching assignment
    const assignment = await prisma.teachingAssignment.create({
      data: {
        teacherId,
        courseId,
        branchId,
        semester,
        academicYear,
        active: true,
        section
      },
      include: {      //we are including the teacher which is being assigned to the course
        teacher: {
          include: {
            user: true
          }
        },
        course: true,
        branch: true
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create teaching assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/admin/enrollments/batch
// @desc    Enroll students in courses for a semester
// @access  Admin
router.post('/enrollments/batch', async (req, res) => {
  const { studentIds, courseIds, semester, academicYear } = req.body;

  try {
    const enrollments = [];

    // Create enrollments for each student-course combination
    for (const studentId of studentIds) {
      for (const courseId of courseIds) {
        // Check if enrollment already exists
        const existingEnrollment = await prisma.enrollment.findFirst({
          where: {
            studentId,
            courseId,
            semester,
            academicYear,
          }
        });

        if (existingEnrollment) {
          // Update if exists but not active
          if (!existingEnrollment.active) {
            await prisma.enrollment.update({
              where: { id: existingEnrollment.id },
              data: { active: true }
            });
          }
          enrollments.push(existingEnrollment);
        } else {
          // Create new enrollment
          const enrollment = await prisma.enrollment.create({
            data: {
              studentId,
              courseId,
              semester,
              academicYear,
              active: true,
            }
          });
          enrollments.push(enrollment);
        }
      }
    }

    res.status(201).json(enrollments);
  } catch (error) {
    console.error('Batch enrollment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;