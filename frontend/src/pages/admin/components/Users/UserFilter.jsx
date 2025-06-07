import { Filter } from "lucide-react";

export default function UserFilter({filters,setFilters,branches,handleFilterUsers}) {
    return (
        <div className="animate-in fade-in-50 slide-in-from-top-2 duration-500 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 mb-8 hover:bg-white/15 transition-all duration-300">
          <div className="flex flex-wrap items-end gap-8">
            <div className="min-w-0 flex-1 space-y-3">
              <label className="flex items-center text-sm font-bold text-white/90 tracking-wide">
                <Filter className="w-4 h-4 mr-2 text-blue-400" />
                Filter by Role
              </label>
              <select
                value={filters.userRole}
                onChange={(e) =>
                  setFilters({ ...filters, userRole: e.target.value })
                }
                className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
              >
                <option value="" className="bg-gray-900">All Roles</option>
                <option value="STUDENT" className="bg-gray-900">Student</option>
                <option value="TEACHER" className="bg-gray-900">Teacher</option>
                <option value="ADMIN" className="bg-gray-900">Admin</option>
              </select>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <label className="flex items-center text-sm font-bold text-white/90 tracking-wide">
                <Filter className="w-4 h-4 mr-2 text-purple-400" />
                Filter by Branch
              </label>
              <select
                value={filters.userBranchId}
                onChange={(e) =>
                  setFilters({ ...filters, userBranchId: e.target.value })
                }
                className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 hover:bg-white/15 transition-all duration-300"
              >
                <option value="" className="bg-gray-900">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id} className="bg-gray-900">
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFilterUsers}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transform transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </span>
              </button>
            </div>
          </div>
        </div>
    );
}