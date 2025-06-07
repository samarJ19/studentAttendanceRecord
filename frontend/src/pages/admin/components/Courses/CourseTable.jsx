export default function CourseTable ({courses,getBranchName}) {
    return (
        <div className="animate-in fade-in-50 slide-in-from-top-2 duration-500">
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 backdrop-blur-xl border-b border-white/25">
                            <tr>
                                <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Course
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Branch
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Semester
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Assigned Teacher
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {courses.map((course, index) => (
                                <tr 
                                    key={course.id} 
                                    className="hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                                >
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm mr-4 shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                                                {course.code.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="text-base font-semibold text-white">
                                                    {course.name}
                                                </div>
                                                <div className="text-sm text-white/70">
                                                    {course.code}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-base text-white">
                                        {getBranchName(course.branchId)}
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="inline-flex px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 backdrop-blur-sm border border-emerald-500/30">
                                            Semester {course.semester}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-base text-white">
                                        {course.teachingAssignments && course.teachingAssignments.length > 0
                                            ? course.teachingAssignments.map((assignment, idx) => (
                                                <div key={idx} className="mb-2">
                                                    <span className="font-medium">
                                                    {assignment.teacher?.user?.firstName} {assignment.teacher?.user?.lastName}
                                                    </span>
                                                    {assignment.section !== "NONE" && (
                                                        <span className="ml-2 text-sm text-white/70 bg-white/10 px-2 py-1 rounded-lg">
                                                            Section: {assignment.section}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                            : <span className="text-white/50 italic">Not assigned</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}