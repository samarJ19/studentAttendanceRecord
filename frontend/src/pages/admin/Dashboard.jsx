import {
  Users,
  BookOpen,
  Building,
  Sparkles,
  Shield,
} from "lucide-react";
import {
  FormSkeleton,
  TableSkeleton,
} from "../../services/helperfunctionsAdmin";
import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import ErrorAlerts from "./components/ErrorAlerts";
import CreateUserForm from "./components/Users/CreateUserForm";
import UserFilter from "./components/Users/UserFilter";
import UserTable from "./components/Users/UserTable";
import CreateBranchForm from "./components/Branches/CreateBranchForm";
import BranchTable from "./components/Branches/BranchTable";
import CreateCourseForm from "./components/Courses/CreateCourseForm";
import CourseFilters from "./components/Courses/CourseFilters";
import CourseTable from "./components/Courses/CourseTable";
import AssignTeacherForm from "./components/AssignTeacherForm";
import EnrollStudentsForm from "./components/EnrollStudentsForm";
import PromoteStudentForm from "./components/PromoteStudentForm";
import { useAdminDashboard } from "./useAdminDashboardData";


const AdminDashboard = () => {
  const {
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
  } = useAdminDashboard();

  // Tab configuration with vibrant styling
  const tabConfig = {
    users: {
      icon: Users,
      title: "User Management",
      description: "Manage student and teacher accounts",
      gradient: "from-blue-600 via-purple-600 to-indigo-700",
      bgPattern: "from-blue-500/20 via-purple-500/15 to-indigo-500/20"
    },
    branches: {
      icon: Building,
      title: "Branch Management", 
      description: "Organize and manage institutional branches",
      gradient: "from-purple-600 via-pink-600 to-rose-700",
      bgPattern: "from-purple-500/20 via-pink-500/15 to-rose-500/20"
    },
    courses: {
      icon: BookOpen,
      title: "Course Management",
      description: "Create and oversee academic programs",
      gradient: "from-emerald-600 via-teal-600 to-cyan-700",
      bgPattern: "from-emerald-500/20 via-teal-500/15 to-cyan-500/20"
    },
    assignments: {
      icon: Shield,
      title: "Teaching Assignments",
      description: "Assign instructors to courses",
      gradient: "from-orange-600 via-red-600 to-pink-700",
      bgPattern: "from-orange-500/20 via-red-500/15 to-pink-500/20"
    },
    enrollments: {
      icon: Users,
      title: "Student Enrollments",
      description: "Manage student course registrations", 
      gradient: "from-indigo-600 via-purple-600 to-blue-700",
      bgPattern: "from-indigo-500/20 via-purple-500/15 to-blue-500/20"
    },
    promotions: {
      icon: Sparkles,
      title: "Student Promotions",
      description: "Handle semester and grade transitions",
      gradient: "from-pink-600 via-rose-600 to-purple-700",
      bgPattern: "from-pink-500/20 via-rose-500/15 to-purple-500/20"
    }
  };

  const currentTabConfig = tabConfig[activeTab] || tabConfig.users;
  const IconComponent = currentTabConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden blended-scrollbar">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-700/40 to-pink-600/30" />
        
        {/* Floating orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/25 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-blue-600/15 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:50px_50px] opacity-20" />
      </div>
      
      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Alerts */}
        {error && (
          <div className="mb-8 animate-in slide-in-from-top-2 duration-300">
            <ErrorAlerts />
          </div>
        )}

        {/* Spectacular Page Header */}
        <div className="mb-8 text-center ">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className={`p-4 rounded-3xl bg-gradient-to-r ${currentTabConfig.gradient} shadow-2xl shadow-purple-500/25 animate-pulse`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-2">
                {currentTabConfig.title}
              </h1>
              <p className="text-white/80 text-lg">{currentTabConfig.description}</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="relative mx-auto">
            <Tabs setActiveTab={setActiveTab} activeTab={activeTab} />
          </div>
        </div>

        {/* Main Content Card with Glass Morphism */}
        <div className="group relative">
          {/* Stunning Glass Card Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl shadow-black/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-3xl" />
          <div className={`absolute inset-0 bg-gradient-to-br ${currentTabConfig.bgPattern} rounded-3xl opacity-50`} />
          
          {/* Content */}
          <div className="relative">
            {loading ? (
              <div className="p-8 lg:p-12 space-y-8">
                <div className="animate-pulse">
                  <FormSkeleton />
                </div>
                <div className="animate-pulse">
                  <TableSkeleton />
                </div>
              </div>
            ) : (
              <div className="p-8 lg:p-12">
                {/* Tab Content Sections */}
                <div className="space-y-12">
                  {/* Users Tab */}
                  {activeTab === "users" && (
                    <div className="space-y-10 animate-in fade-in-50 duration-500">
                      {/* Create User Section */}
                      <div className="bg-gradient-to-br from-white/20 via-blue-500/10 to-purple-500/15 backdrop-blur-xl rounded-3xl p-8 border border-white/25 shadow-xl shadow-blue-500/10">
                        <CreateUserForm
                          handleCreateUser={handleCreateUser}
                          newUser={newUser}
                          setNewUser={setNewUser}
                          branches={branches}
                        />
                      </div>

                      {/* User Management Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-white/20">
                          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                              Manage Users
                            </h2>
                            <p className="text-white/70">Filter and view all registered users</p>
                          </div>
                        </div>

                        {/* Filter Controls */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                          <UserFilter
                            filters={filters}
                            setFilters={setFilters}
                            branches={branches}
                            handleFilterUsers={handleFilterUsers}
                          />
                        </div>

                        {/* Users Table */}
                        <div className="bg-white/15 backdrop-blur-xl rounded-2xl border border-white/25 overflow-hidden  shadow-xl">
                          <UserTable users={users} getBranchName={getBranchName} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Branches Tab */}
                  {activeTab === "branches" && (
                    <div className="space-y-10 animate-in fade-in-50 duration-500">
                      {/* Create Branch Section */}
                      <div className="bg-gradient-to-br from-white/20 via-purple-500/10 to-pink-500/15 backdrop-blur-xl rounded-3xl p-8 border border-white/25 shadow-xl shadow-purple-500/10">
                        <CreateBranchForm
                          handleCreateBranch={handleCreateBranch}
                          newBranch={newBranch}
                          setNewBranch={setNewBranch}
                        />
                      </div>

                      {/* Branch Management Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-white/20">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/25">
                            <Building className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                              All Branches
                            </h2>
                            <p className="text-white/70">View and manage institutional branches</p>
                          </div>
                        </div>

                        <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/25 overflow-hidden  shadow-xl">
                          <BranchTable branches={branches} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Courses Tab */}
                  {activeTab === "courses" && (
                    <div className="space-y-10 animate-in fade-in-50 duration-500">
                      {/* Create Course Section */}
                      <div className="bg-gradient-to-br from-white/20 via-emerald-500/10 to-teal-500/15 backdrop-blur-xl rounded-3xl p-8 border border-white/25 shadow-xl shadow-emerald-500/10">
                        <CreateCourseForm
                          handleCreateCourse={handleCreateCourse}
                          newCourse={newCourse}
                          setNewCourse={setNewCourse}
                          branches={branches}
                        />
                      </div>

                      {/* Course Management Section */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-white/20">
                          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                              Course Overview
                            </h2>
                            <p className="text-white/70">Filter and manage academic courses</p>
                          </div>
                        </div>

                        {/* Filter Controls */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
                          <CourseFilters
                            branches={branches}
                            setFilters={setFilters}
                            filters={filters}
                            handleFilterCourses={handleFilterCourses}
                          />
                        </div>

                        {/* Courses Table */}
                        <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/25 overflow-hidden shadow-xl">
                          <CourseTable
                            courses={courses}
                            getBranchName={getBranchName}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teaching Assignments Tab */}
                  {activeTab === "assignments" && (
                    <div className="animate-in fade-in-50 duration-500">
                      <div className="bg-gradient-to-br from-white/20 via-orange-500/10 to-red-500/15 backdrop-blur-xl rounded-3xl p-8 border border-white/25 shadow-xl shadow-orange-500/10">
                        <AssignTeacherForm
                          handleTeachingAssignment={handleTeachingAssignment}
                          newTeachingAssignment={newTeachingAssignment}
                          setNewTeachingAssignment={setNewTeachingAssignment}
                          getTeachers={getTeachers}
                          courses={courses}
                          branches={branches}
                          sectionList={sectionList}
                        />
                      </div>
                    </div>
                  )}

                  {/* Enrollments Tab */}
                  {activeTab === "enrollments" && (
                    <div className="animate-in fade-in-50 duration-500">
                      <div className="bg-gradient-to-br from-white/20 via-indigo-500/10 to-purple-500/15 backdrop-blur-xl rounded-3xl p-8 border border-white/25 shadow-xl shadow-indigo-500/10">
                        <EnrollStudentsForm
                          handleBatchEnrollment={handleBatchEnrollment}
                          getStudents={getStudents}
                          handleStudentSelection={handleStudentSelection}
                          getBranchName={getBranchName}
                          courses={courses}
                          batchEnrollment={batchEnrollment}
                          setBatchEnrollment={setBatchEnrollment}
                        />
                      </div>
                    </div>
                  )}

                  {/* Promotions Tab */}
                  {activeTab === "promotions" && (
                    <div className="animate-in fade-in-50 duration-500">
                      <div className="bg-gradient-to-br from-white/20 via-pink-500/10 to-rose-500/15 backdrop-blur-xl rounded-3xl p-8 border border-white/25 shadow-xl shadow-pink-500/10">
                        <PromoteStudentForm
                          handleUpdateSemester={handleUpdateSemester}
                          semesterUpdate={semesterUpdate}
                          setSemesterUpdate={setSemesterUpdate}
                          getStudents={getStudents}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;