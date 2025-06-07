export default function CourseFilters ({filters,setFilters,branches,handleFilterCourses}) {
    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-8 mb-8 animate-in fade-in-50 slide-in-from-top-2 duration-500">
            <div className="flex flex-wrap items-end gap-8">
                <div className="min-w-0 flex-1">
                    <label className="block text-sm font-bold text-white mb-3">
                        Filter by Branch
                    </label>
                    <select
                        value={filters.courseBranchId}
                        onChange={(e) =>
                            setFilters({ ...filters, courseBranchId: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:bg-white/15"
                    >
                        <option value="" className="bg-gray-800 text-white">All Branches</option>
                        {branches.map((branch) => (
                            <option key={branch.id} value={branch.id} className="bg-gray-800 text-white">
                                {branch.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="min-w-0 flex-1">
                    <label className="block text-sm font-bold text-white mb-3">
                        Filter by Semester
                    </label>
                    <select
                        value={filters.courseSemester}
                        onChange={(e) =>
                            setFilters({ ...filters, courseSemester: e.target.value })
                        }
                        className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 hover:bg-white/15"
                    >
                        <option value="" className="bg-gray-800 text-white">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem} className="bg-gray-800 text-white">
                                Semester {sem}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <button
                        onClick={handleFilterCourses}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 font-bold text-lg"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    )
}