import { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  // State for all data
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentAcademicYear, setCurrentAcademicYear] = useState("2024-2025");
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

  const [ filters, setFilters] = useState({
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
    const branchMap = new Map(
      branches.map((branch) => [branch.id, branch.name])
    );
    return (branchId) => branchMap.get(branchId) || "Unknown Branch";
  }, [branches]);

  const handleLogout = () => {
    // Clear the auth token from localStorage
    localStorage.removeItem("token");
    // Clear any auth headers from the API service
    api.defaults.headers.common["Authorization"] = "";
    // Redirect to login page
    navigate("/login");
  };

  // Fetch initial data
  useEffect(() => {
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

        // Set default branch IDs if branches exist
        if (branchesRes.data.length > 0) {
          setNewUser((prev) => ({ ...prev, branchId: branchesRes.data[0].id }));
          setNewCourse((prev) => ({
            ...prev,
            branchId: branchesRes.data[0].id,
          }));
          setNewTeachingAssignment((prev) => ({
            ...prev,
            branchId: branchesRes.data[0].id,
          }));
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("Error fetching initial data:", err);
      } finally {
        setLoading(false);
      }
    };

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
  const getTeachers = () => users.filter((user) => user.role === "TEACHER");
  const getStudents = () => users.filter((user) => user.role === "STUDENT");

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Alert for errors */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span>{error}</span>
            <button className="float-right" onClick={() => setError(null)}>
              &times;
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("branches")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "branches"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Branches
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "courses"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "assignments"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Teaching Assignments
            </button>
            <button
              onClick={() => setActiveTab("enrollments")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "enrollments"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Enrollments
            </button>
            <button
              onClick={() => setActiveTab("promotions")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "promotions"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Semester Promotions
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {loading && <div className="text-center py-4">Loading...</div>}

          {/* Users Tab */}
          {activeTab === "users" && !loading && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Create New User</h2>
                <form
                  onSubmit={handleCreateUser}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.firstName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newUser.lastName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  {newUser.role === "STUDENT" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          required
                          value={newUser.rollNumber}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              rollNumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branch
                        </label>
                        <select
                          value={newUser.branchId}
                          required
                          onChange={(e) =>
                            setNewUser({ ...newUser, branchId: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {branches.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Semester
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          required
                          value={newUser.currentSemester}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              currentSemester: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section
                        </label>
                        <input
                          type="text"
                          value={newUser.section}
                          onChange={(e) =>
                            setNewUser({ ...newUser, section: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {newUser.role === "TEACHER" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        required
                        value={newUser.employeeId}
                        onChange={(e) =>
                          setNewUser({ ...newUser, employeeId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="col-span-full">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>

              <hr className="my-6" />

              <div>
                <h2 className="text-lg font-medium mb-4">User List</h2>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Role
                    </label>
                    <select
                      value={filters.userRole}
                      onChange={(e) =>
                        setFilters({ ...filters, userRole: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Roles</option>
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter Students by Branch
                    </label>
                    <select
                      value={filters.userBranchId}
                      onChange={(e) =>
                        setFilters({ ...filters, userBranchId: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Branches</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleFilterUsers}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.role === "STUDENT" && user.student && (
                              <>
                                Roll: {user.student.rollNumber} | Semester:{" "}
                                {user.student.currentSemester} | Branch:{" "}
                                {getBranchName(user.student.branchId)} |
                                Section: {user.student?.section}
                              </>
                            )}
                            {user.role === "TEACHER" && user.teacher && (
                              <>Employee ID: {user.teacher.employeeId}</>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Branches Tab */}
          {activeTab === "branches" && !loading && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Create New Branch</h2>
                <form
                  onSubmit={handleCreateBranch}
                  className="flex gap-4 items-end"
                >
                  <div className="w-full max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newBranch.name}
                      onChange={(e) => setNewBranch({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Branch
                  </button>
                </form>
              </div>

              <hr className="my-6" />

              <div>
                <h2 className="text-lg font-medium mb-4">Branch List</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch Name
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {branches.map((branch) => (
                        <tr key={branch.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {branch.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {branch.name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && !loading && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Create New Course</h2>
                <form
                  onSubmit={handleCreateCourse}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Code
                    </label>
                    <input
                      type="text"
                      required
                      value={newCourse.code}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, code: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newCourse.name}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      required
                      value={newCourse.semester}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          semester: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <select
                      value={newCourse.branchId}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, branchId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-full">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Course
                    </button>
                  </div>
                </form>
              </div>

              <hr className="my-6" />

              <div>
                <h2 className="text-lg font-medium mb-4">Course List</h2>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Branch
                    </label>
                    <select
                      value={filters.courseBranchId}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          courseBranchId: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Branches</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter by Semester
                    </label>
                    <select
                      value={filters.courseSemester}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          courseSemester: e.target.value,
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Semesters</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleFilterCourses}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                {/* Courses Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semester
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {course.code}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {course.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            Semester {course.semester}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {course.branch?.name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Teaching Assignments Tab */}
          {activeTab === "assignments" && !loading && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">
                  Create Teaching Assignment
                </h2>
                <form
                  onSubmit={handleTeachingAssignment}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher
                    </label>
                    <select
                      value={newTeachingAssignment.teacherId}
                      onChange={(e) =>
                        setNewTeachingAssignment({
                          ...newTeachingAssignment,
                          teacherId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Teacher</option>
                      {getTeachers().map((teacher) => (
                        <option
                          key={teacher.teacher.id}
                          value={teacher.teacher.id}
                        >
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      value={newTeachingAssignment.courseId}
                      onChange={(e) =>
                        setNewTeachingAssignment({
                          ...newTeachingAssignment,
                          courseId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <select
                      value={newTeachingAssignment.branchId}
                      onChange={(e) =>
                        setNewTeachingAssignment({
                          ...newTeachingAssignment,
                          branchId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      required
                      value={newTeachingAssignment.semester}
                      onChange={(e) =>
                        setNewTeachingAssignment({
                          ...newTeachingAssignment,
                          semester: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <select
                      value={newTeachingAssignment.section}
                      onChange={(e) =>
                        setNewTeachingAssignment({
                          ...newTeachingAssignment,
                          section: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {sectionList.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-full">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Enrollments Tab */}
          {activeTab === "enrollments" && !loading && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">Batch Enrollment</h2>
                <form onSubmit={handleBatchEnrollment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-md font-medium mb-2">
                        Select Students
                      </h3>
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                        {getStudents().map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center mb-2"
                          >
                            <input
                              type="checkbox"
                              id={`student-${student.id}`}
                              checked={batchEnrollment.studentIds.includes(
                                student.student.id
                              )}
                              onChange={() =>
                                handleStudentSelection(student.student.id)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`student-${student.id}`}
                              className="ml-2"
                            >
                              {student.firstName} {student.lastName} (
                              {student.student?.rollNumber})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium mb-2">
                        Select Courses
                      </h3>
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                        {courses.map((course) => (
                          <div
                            key={course.id}
                            className="flex items-center mb-2"
                          >
                            <input
                              type="checkbox"
                              id={`course-${course.id}`}
                              checked={batchEnrollment.courseIds.includes(
                                course.id
                              )}
                              onChange={() => handleCourseSelection(course.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`course-${course.id}`}
                              className="ml-2"
                            >
                              {course.code} - {course.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        required
                        value={batchEnrollment.semester}
                        onChange={(e) =>
                          setBatchEnrollment({
                            ...batchEnrollment,
                            semester: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Academic Year
                      </label>
                      <input
                        type="text"
                        required
                        value={batchEnrollment.academicYear}
                        onChange={(e) =>
                          setBatchEnrollment({
                            ...batchEnrollment,
                            academicYear: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Enroll Students
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Semester Promotions Tab */}
          {activeTab === "promotions" && !loading && (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-4">
                  Update Student Semester
                </h2>
                <form
                  onSubmit={handleUpdateSemester}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Student
                    </label>
                    <select
                      value={semesterUpdate.studentId}
                      onChange={(e) =>
                        setSemesterUpdate({
                          ...semesterUpdate,
                          studentId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Student</option>
                      {getStudents().map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} (
                          {student.student?.rollNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      required
                      value={semesterUpdate.newSemester}
                      onChange={(e) =>
                        setSemesterUpdate({
                          ...semesterUpdate,
                          newSemester: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year
                    </label>
                    <input
                      type="text"
                      required
                      value={semesterUpdate.academicYear}
                      onChange={(e) =>
                        setSemesterUpdate({
                          ...semesterUpdate,
                          academicYear: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-full">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Update Semester
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
