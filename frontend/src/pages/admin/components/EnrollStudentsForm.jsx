import { UserCheck, Users, BookOpen, Calendar, GraduationCap } from "lucide-react";

export default function EnrollStudentsForm({
  handleBatchEnrollment,
  getStudents,
  handleStudentSelection,
  handleCourseSelection,
  getBranchName,
  courses,
  batchEnrollment,
  setBatchEnrollment,
}) {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in-50 slide-in-from-top-2">
      {/* Header Section */}
      <div className="flex items-center mb-8">
        <div className="p-3 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 rounded-2xl mr-4 shadow-lg">
          <UserCheck className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Batch Student Enrollment
          </h1>
          <p className="text-white/70 mt-2">Enroll multiple students into courses simultaneously</p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8">
        <form onSubmit={handleBatchEnrollment} className="space-y-8">
          {/* Selection Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Students Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-indigo-400" />
                <h2 className="text-2xl font-bold text-white">Select Students</h2>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="max-h-80 overflow-y-auto space-y-3 blended-scrollbar">
                  {getStudents().map((student) => (
                    <label
                      key={student.id}
                      className="group flex items-center p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-white/10 hover:border-white/20"
                    >
                      <input
                        type="checkbox"
                        checked={batchEnrollment.studentIds.includes(student.id)}
                        onChange={() => handleStudentSelection(student.id)}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 bg-white/10 border-white/30 rounded transition-all duration-200"
                      />
                      <div className="flex items-center flex-1 ml-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-base uppercase font-semibold text-white group-hover: transition-colors">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                            {student.rollNumber} • {getBranchName(student.student.branchId)}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Courses Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-6 w-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Select Courses</h2>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="max-h-80 overflow-y-auto space-y-3 blended-scrollbar">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="group flex items-center p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-white/10 hover:border-white/20"
                    >
                      <input
                        type="checkbox"
                        checked={batchEnrollment.courseIds.includes(course.id)}
                        onChange={() => handleCourseSelection(course.id)}
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 focus:ring-2 focus:ring-offset-0 bg-white/10 border-white/30 rounded transition-all duration-200"
                      />
                      <div className="flex items-center flex-1 ml-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {course.name.substring(0, 4)}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {course.name}
                          </div>
                          <div className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                            {course.code} • Semester {course.semester}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Details */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <GraduationCap className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Enrollment Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-white/90">
                  <Calendar className="h-4 w-4 text-indigo-400" />
                  <span>Semester</span>
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
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="Enter semester (1-8)"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-white/90">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span>Academic Year</span>
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
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="e.g., 2024-25"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="group relative px-12 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-indigo-500/25 transform hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Enroll Selected Students</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}