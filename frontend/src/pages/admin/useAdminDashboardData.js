// AdminDashboard/hooks/useAdminDashboard.js
import { useState, useEffect, useMemo } from "react";
import api from "../../../src/services/api";

export const useAdminDashboard = () => {
  // State for all data
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentAcademicYear = "2024-2025";
  const sectionList = ["A", "B", "NONE"];
  // Form states
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "STUDENT",
    rollNumber: "",
    branchId: "",
    employeeId: "",
    currentSemester: 1,
    section: "",
  });
  const [newBranch, setNewBranch] = useState({ name: "" });
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    semester: 1,
    branchId: "",
  });
  const [newTeachingAssignment, setNewTeachingAssignment] = useState({
    teacherId: "",
    courseId: "",
    branchId: "",
    semester: 1,
    academicYear: currentAcademicYear,
    section: "NONE",
  });
  const [batchEnrollment, setBatchEnrollment] = useState({
    studentIds: [],
    courseIds: [],
    semester: 1,
    academicYear: currentAcademicYear,
  });
  const [filters, setFilters] = useState({
    userRole: "",
    userBranchId: "",
    courseBranchId: "",
    courseSemester: "",
  });
  const [semesterUpdate, setSemesterUpdate] = useState({
    studentId: "",
    newSemester: 1,
    academicYear: currentAcademicYear,
  });
  // Memoized function to get branch name from branch ID
  const getBranchName = useMemo(() => {
    const branchMap = new Map(branches.map((b) => [b.id, b.name]));
    return (id) => branchMap.get(id) || "Unknown Branch";
  }, [branches]);
  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, branchesRes, coursesRes] = await Promise.all([
        api.get("/api/admin/users"),
        api.get("/api/admin/branches"),
        api.get("/api/admin/courses"),
      ]);
      setUsers(usersRes.data);
      setBranches(branchesRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);
  // Handlers for form submissions
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/api/admin/users", newUser);
      setUsers([...users, res.data]);
      setNewUser({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "STUDENT",
        rollNumber: "",
        branchId: branches.length > 0 ? branches[0].id : "",
        employeeId: "",
        currentSemester: 1,
        section: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateBranch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/api/admin/branches", newBranch);
      setBranches([...branches, res.data]);
      setNewBranch({ name: "" });
    } catch (err) {
      setError("Failed to create branch");
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/api/admin/courses", newCourse);
      setCourses([...courses, res.data]);
      setNewCourse({
        code: "",
        name: "",
        semester: 1,
        branchId: branches.length > 0 ? branches[0].id : "",
      });
    } catch (err) {
      setError("Failed to create course");
    } finally {
      setLoading(false);
    }
  };
  const handleTeachingAssignment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/api/admin/teaching-assignments", newTeachingAssignment);
      // Refresh courses after assignment to see updated data
      const coursesRes = await api.get("/api/admin/courses");
      setCourses(coursesRes.data);

      setNewTeachingAssignment({
        teacherId: "",
        courseId: "",
        branchId: branches.length > 0 ? branches[0].id : "",
        semester: 1,
        academicYear: currentAcademicYear,
        section: "NONE",
      });
    } catch (err) {
      setError("Failed to assign teacher");
    } finally {
      setLoading(false);
    }
  };
  const handleBatchEnrollment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/api/admin/enrollments/batch", batchEnrollment);
      // Refresh courses after assignment to see updated data
      const coursesRes = await api.get("/api/admin/courses");
      setCourses(coursesRes.data);
      setBatchEnrollment({
        studentIds: [],
        courseIds: [],
        semester: 1,
        academicYear: currentAcademicYear,
      });
    } catch (err) {
      setError("Failed to enroll students");
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateSemester = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(
        `/api/admin/students/${semesterUpdate.studentId}/semester`,
        {
          newSemester: semesterUpdate.newSemester,
          academicYear: semesterUpdate.academicYear,
        }
      );

      // Refresh users data
      const usersRes = await api.get("/api/admin/users");
      setUsers(usersRes.data);

      setSemesterUpdate({
        studentId: "",
        newSemester: 1,
        academicYear: currentAcademicYear,
      });
    } catch (err) {
      setError("Failed to update semester");
    } finally {
      setLoading(false);
    }
  };
  // Filter handlers
  const handleFilterUsers = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/users?";
      if (filters.userRole) url += `role=${filters.userRole}&`;
      if (filters.userBranchId) url += `branchId=${filters.userBranchId}`;

      const res = await api.get(url);
      setUsers(res.data);
    } catch (err) {
      setError("Failed to filter users");
    } finally {
      setLoading(false);
    }
  };
  const handleFilterCourses = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/courses?";
      if (filters.courseBranchId) url += `branchId=${filters.courseBranchId}&`;
      if (filters.courseSemester) url += `semester=${filters.courseSemester}`;

      const res = await api.get(url);
      setCourses(res.data);
    } catch (err) {
      setError("Failed to filter courses");
    } finally {
      setLoading(false);
    }
  };
  // UI Helper functions
  const getTeachers = () => users.filter((u) => u.role === "TEACHER");
  const getStudents = () => users.filter((u) => u.role === "STUDENT");
  // Multiple select handler for batch enrollments
  const handleStudentSelection = (studentId) => {
    setBatchEnrollment((prev) => {
      const updatedStudentIds = prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId];

      return { ...prev, studentIds: updatedStudentIds };
    });
  };
  const handleCourseSelection = (courseId) => {
    setBatchEnrollment((prev) => {
      const updatedCourseIds = prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId];

      return { ...prev, courseIds: updatedCourseIds };
    });
  };

  return {
    users,
    branches,
    courses,
    loading,
    error,
    setError,
    activeTab,
    setActiveTab,
    newUser,
    setNewUser,
    newBranch,
    setNewBranch,
    newCourse,
    setNewCourse,
    newTeachingAssignment,
    setNewTeachingAssignment,
    batchEnrollment,
    setBatchEnrollment,
    filters,
    setFilters,
    semesterUpdate,
    setSemesterUpdate,
    getBranchName,
    sectionList,
    handleCreateUser,
    handleCreateBranch,
    handleCreateCourse,
    handleTeachingAssignment,
    handleBatchEnrollment,
    handleUpdateSemester,
    handleFilterUsers,
    handleFilterCourses,
    getTeachers,
    getStudents,
    handleStudentSelection,
    handleCourseSelection,
  };
};
