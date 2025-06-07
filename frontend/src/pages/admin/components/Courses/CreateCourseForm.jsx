import { BookOpen } from "lucide-react";

export default function CreateCourseForm ({handleCreateCourse,newCourse,setNewCourse,branches}) {
    return (
        <div className="mb-8 animate-in fade-in-50 slide-in-from-top-2 duration-500">
            <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Create New Course</h2>
            </div>
            
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-sm font-bold text-white mb-3">
                            Course Code
                        </label>
                        <input
                            type="text"
                            required
                            value={newCourse.code}
                            onChange={(e) =>
                                setNewCourse({ ...newCourse, code: e.target.value })
                            }
                            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:bg-white/15"
                            placeholder="CSE101"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-3">
                            Course Name
                        </label>
                        <input
                            type="text"
                            required
                            value={newCourse.name}
                            onChange={(e) =>
                                setNewCourse({ ...newCourse, name: e.target.value })
                            }
                            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:bg-white/15"
                            placeholder="Introduction to Programming"
                        />
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
                            value={newCourse.semester}
                            onChange={(e) =>
                                setNewCourse({
                                    ...newCourse,
                                    semester: parseInt(e.target.value),
                                })
                            }
                            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:bg-white/15"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-white mb-3">
                            Branch
                        </label>
                        <select
                            value={newCourse.branchId}
                            required
                            onChange={(e) =>
                                setNewCourse({ ...newCourse, branchId: e.target.value })
                            }
                            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:bg-white/15"
                        >
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id} className="bg-gray-800 text-white">
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={handleCreateCourse}
                        className="px-10 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 font-bold text-lg"
                    >
                        Create Course
                    </button>
                </div>
            </div>
        </div>
    )
}