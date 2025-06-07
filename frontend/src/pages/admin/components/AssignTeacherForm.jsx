import { GraduationCap } from "lucide-react";

export default function AssignTeacherForm({handleTeachingAssignment,newTeachingAssignment,setNewTeachingAssignment,getTeachers,courses,branches,sectionList}) {
  return (
    <div className="animate-in fade-in-50 slide-in-from-top-2 duration-500">
      <div className="flex items-center mb-6">
        <div className="h-10 w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Assign Teacher to Course
        </h2>
      </div>
      
      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <label className="block text-sm font-bold text-white mb-3">
              Teacher
            </label>
            <select
              value={newTeachingAssignment.teacherId}
              required
              onChange={(e) =>
                setNewTeachingAssignment({
                  ...newTeachingAssignment,
                  teacherId: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 hover:bg-white/15"
            >
              <option value="" className="bg-gray-800 text-white">Select Teacher</option>
              {getTeachers().map((teacher) => (
                <option key={teacher.id} value={teacher.id} className="bg-gray-800 text-white">
                  {teacher.firstName} {teacher.lastName} ({teacher.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3">
              Course
            </label>
            <select
              value={newTeachingAssignment.courseId}
              required
              onChange={(e) =>
                setNewTeachingAssignment({
                  ...newTeachingAssignment,
                  courseId: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 hover:bg-white/15"
            >
              <option value="" className="bg-gray-800 text-white">Select Course</option>
              {courses
                .filter(
                  (course) => course.branchId === newTeachingAssignment.branchId
                )
                .map((course) => (
                  <option key={course.id} value={course.id} className="bg-gray-800 text-white">
                    {course.code} - {course.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3">
              Branch
            </label>
            <select
              value={newTeachingAssignment.branchId}
              required
              onChange={(e) =>
                setNewTeachingAssignment({
                  ...newTeachingAssignment,
                  branchId: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 hover:bg-white/15"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id} className="bg-gray-800 text-white">
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3">
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
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 hover:bg-white/15"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3">
              Academic Year
            </label>
            <input
              type="text"
              required
              value={newTeachingAssignment.academicYear}
              onChange={(e) =>
                setNewTeachingAssignment({
                  ...newTeachingAssignment,
                  academicYear: e.target.value,
                })
              }
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 hover:bg-white/15"
              placeholder="2024-2025"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-3">
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
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 hover:bg-white/15"
            >
              {sectionList.map((section) => (
                <option key={section} value={section} className="bg-gray-800 text-white">
                  {section === "NONE" ? "All Sections" : `Section ${section}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleTeachingAssignment}
            className="px-10 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white rounded-xl hover:from-orange-700 hover:via-red-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-orange-500/25 font-bold text-lg"
          >
            Assign Teacher
          </button>
        </div>
      </div>
    </div>
  );
}