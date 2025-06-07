import { Users } from "lucide-react";

export default function CreateUserForm({handleCreateUser,newUser,setNewUser,branches}) {
  return (
    <div className="animate-in fade-in-50 slide-in-from-top-2 duration-700 mb-8">
      <div className="flex items-center mb-6">
        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-blue-500/25 animate-pulse">
          <Users className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Create New User
        </h2>
      </div>
      
      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:shadow-blue-500/10 transition-all duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-white/90 tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-white/90 tracking-wide">
              Password
            </label>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-white/90 tracking-wide">
              First Name
            </label>
            <input
              type="text"
              required
              value={newUser.firstName}
              onChange={(e) =>
                setNewUser({ ...newUser, firstName: e.target.value })
              }
              className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
              placeholder="John"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-white/90 tracking-wide">
              Last Name
            </label>
            <input
              type="text"
              required
              value={newUser.lastName}
              onChange={(e) =>
                setNewUser({ ...newUser, lastName: e.target.value })
              }
              className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
              placeholder="Doe"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-white/90 tracking-wide">
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
            >
              <option value="STUDENT" className="bg-gray-900">Student</option>
              <option value="TEACHER" className="bg-gray-900">Teacher</option>
              <option value="ADMIN" className="bg-gray-900">Admin</option>
            </select>
          </div>

          {newUser.role === "STUDENT" && (
            <>
              <div className="space-y-3 animate-in fade-in-50 slide-in-from-right-2 duration-500">
                <label className="block text-sm font-bold text-white/90 tracking-wide">
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
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
                  placeholder="2023001"
                />
              </div>

              <div className="space-y-3 animate-in fade-in-50 slide-in-from-right-2 duration-700">
                <label className="block text-sm font-bold text-white/90 tracking-wide">
                  Branch
                </label>
                <select
                  value={newUser.branchId}
                  required
                  onChange={(e) =>
                    setNewUser({ ...newUser, branchId: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id} className="bg-gray-900">
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 animate-in fade-in-50 slide-in-from-right-2 duration-900">
                <label className="block text-sm font-bold text-white/90 tracking-wide">
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
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
                />
              </div>
              
              <div className="space-y-3 animate-in fade-in-50 slide-in-from-right-2 duration-1100">
                <label className="block text-sm font-bold text-white/90 tracking-wide">
                  Section
                </label>
                <input
                  type="text"
                  value={newUser.section}
                  onChange={(e) =>
                    setNewUser({ ...newUser, section: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
                  placeholder="A"
                />
              </div>
            </>
          )}

          {newUser.role === "TEACHER" && (
            <div className="space-y-3 animate-in fade-in-50 slide-in-from-right-2 duration-500">
              <label className="block text-sm font-bold text-white/90 tracking-wide">
                Employee ID
              </label>
              <input
                type="text"
                required
                value={newUser.employeeId}
                onChange={(e) =>
                  setNewUser({ ...newUser, employeeId: e.target.value })
                }
                className="w-full px-5 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 hover:bg-white/15 transition-all duration-300"
                placeholder="EMP001"
              />
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleCreateUser}
            className="group relative px-10 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transform transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center">
              <Users className="w-5 h-5 mr-2" />
              Create User
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}