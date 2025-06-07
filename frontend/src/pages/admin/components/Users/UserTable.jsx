import {
  User,
  Mail,
  Shield,
  GraduationCap,
  BookOpen,
  Hash,
} from "lucide-react";

export default function UserTable({ users, getBranchName }) {
  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-4 h-4" />;
      case "TEACHER":
        return <GraduationCap className="w-4 h-4" />;
      case "STUDENT":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColors = (role) => {
    switch (role) {
      case "ADMIN":
        return "from-purple-500/30 to-indigo-500/30 text-purple-300 border-purple-400/30";
      case "TEACHER":
        return "from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30";
      case "STUDENT":
        return "from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-400/30";
      default:
        return "from-gray-500/20 to-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  return (
    <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-700 backdrop-blur-xl border border-white/25 shadow-2xl  overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-white/20 via-white/15 to-white/10 backdrop-blur-xl border-b border-white/20">
            <tr>
              <th className="px-8 py-6 text-left text-sm font-bold text-black/90 uppercase tracking-wider">
                <div className="flex items-center ">
                  <User className="w-4 h-4 mr-2 text-blue-400" />
                  Name
                </div>
              </th>
              <th className="px-8 py-6 text-left text-sm font-bold text-black/90 uppercase tracking-wider">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-purple-400" />
                  Email
                </div>
              </th>
              <th className="px-8 py-6 text-left text-sm font-bold text-black/90 uppercase tracking-wider">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-indigo-400" />
                  Role
                </div>
              </th>
              <th className="px-8 py-6 text-left text-sm font-bold text-black/90 uppercase tracking-wider">
                <div className="flex items-center">
                  <Hash className="w-4 h-4 mr-2 text-cyan-400" />
                  Branch
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={user.id || idx}
                className="border-b border-white/10 hover:bg-white/5 transition duration-200"
              >
                <td className="px-8 py-5 whitespace-nowrap uppercase text-black/90">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-black/70">
                  {user.email}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium bg-gradient-to-r ${getRoleColors(
                      user.role
                    )}`}
                  >
                    {getRoleIcon(user.role)}
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-black/70">
                  {user.role == 'STUDENT' ? getBranchName(user?.student.branchId) : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
