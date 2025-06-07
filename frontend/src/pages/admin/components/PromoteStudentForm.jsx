import { Calendar, TrendingUp, User, GraduationCap, ChevronDown } from "lucide-react";

export default function PromoteStudentForm({
  handleUpdateSemester,
  getStudents,
  semesterUpdate,
  setSemesterUpdate,
}) {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in-50 slide-in-from-top-2">
      {/* Header Section */}
      <div className="flex items-center mb-8">
        <div className="p-3 bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-2xl mr-4 shadow-lg">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
            Promote Student
          </h1>
          <p className="text-white/70 mt-2">Update student semester and academic year progression</p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 max-w-4xl">
        <form onSubmit={handleUpdateSemester} className="space-y-8">
          {/* Form Header */}
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="h-6 w-6 text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Student Promotion Details</h2>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Selection */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-white/90">
                <User className="h-4 w-4 text-pink-400" />
                <span>Select Student</span>
              </label>
              <div className="relative">
                <select
                  value={semesterUpdate.studentId}
                  onChange={(e) =>
                    setSemesterUpdate({
                      ...semesterUpdate,
                      studentId: e.target.value,
                    })
                  }
                  required
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 hover:bg-white/15 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-800 text-white">
                    Choose a student...
                  </option>
                  {getStudents().map((student) => (
                    <option key={student.id} value={student.id} className="bg-gray-800 text-white">
                      {student.firstName} {student.lastName} ({student.student.rollNumber})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
              </div>
            </div>

            {/* New Semester */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-white/90">
                <GraduationCap className="h-4 w-4 text-rose-400" />
                <span>New Semester</span>
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
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                placeholder="Enter semester (1-8)"
              />
            </div>

            {/* Academic Year */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-white/90">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span>Academic Year</span>
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
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                placeholder="e.g., 2024-25"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              className="group relative px-12 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:via-rose-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-pink-500/25 transform hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Promote Student</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg max-w-4xl">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl">
            <Calendar className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Promotion Guidelines</h3>
            <ul className="text-white/70 space-y-1 text-sm">
              <li>• Students can only be promoted to the next consecutive semester</li>
              <li>• Ensure all previous semester requirements are completed</li>
              <li>• Academic year format should be YYYY-YY (e.g., 2024-25)</li>
              <li>• Promotion will update all associated course enrollments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}