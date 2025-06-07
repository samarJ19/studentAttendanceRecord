import { AlertCircle, Save, Users } from "lucide-react";

// UI for list-based attendance
export const RenderStudentListPanel = ({
  hasChanges,
  attendanceRecords,
  toggleAttendance,
  submitAttendanceChanges,
  loading,
  selectedSession,
}) => {
  return (
    <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50 slide-in-from-top-2">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl backdrop-blur-xl border border-white/20 mr-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Student Attendance List
          </h3>
        </div>
        {hasChanges && (
          <div className="flex items-center px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-xl border border-amber-400/30 rounded-xl animate-in fade-in-50">
            <div className="p-1.5 bg-amber-500/20 rounded-lg mr-3">
              <AlertCircle className="w-4 h-4 text-amber-200" />
            </div>
            <span className="text-sm font-bold text-amber-100">
              Unsaved changes
            </span>
          </div>
        )}
      </div>

      {attendanceRecords.length > 0 ? (
        <>
          <div className="bg-white/15 border border-white/25 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl border-b border-white/20">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-8 py-6 text-center text-sm font-bold text-white uppercase tracking-wider">
                    Attendance Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {attendanceRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-white/10 transition-all duration-300 hover:scale-[1.01] ${
                      index % 2 === 0 ? "bg-white/5" : "bg-white/10"
                    }`}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mr-4">
                          <span className="text-sm font-bold text-white">
                            {record.student.rollNumber || "N/A"}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          {record.student.rollNumber || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">
                        {record.student.user.firstName}{" "}
                        {record.student.user.lastName}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      <label className="relative inline-flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={record.present}
                          onChange={() =>
                            toggleAttendance(record.id, !record.present)
                          }
                        />
                        <div className="w-16 h-8 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl peer peer-focus:ring-4 peer-focus:ring-orange-400/30 peer-checked:after:translate-x-8 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-white/30 after:border after:rounded-xl after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500/40 peer-checked:to-green-500/40 shadow-lg group-hover:scale-105 transition-all duration-300"></div>
                        <span
                          className={`ml-4 text-sm font-bold transition-colors duration-300 ${
                            record.present ? "text-emerald-200" : "text-red-200"
                          }`}
                        >
                          {record.present ? "Present" : "Absent"}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-8">
            <button
              className={`inline-flex items-center px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg hover:scale-105 ${
                hasChanges
                  ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-white/20 text-white hover:from-orange-500/30 hover:to-red-500/30"
                  : "bg-white/10 backdrop-blur-xl border border-white/20 text-white/50 cursor-not-allowed hover:scale-100"
              }`}
              onClick={submitAttendanceChanges}
              disabled={!hasChanges || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-3" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-12 text-center animate-in fade-in-50 slide-in-from-top-2">
          <div className="p-8 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl backdrop-blur-xl border border-white/20 inline-block mb-6">
            <Users className="w-20 h-20 text-white/40 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            No Students Found
          </h3>
          <p className="text-white/70 text-lg">
            {selectedSession
              ? "No attendance records found for this session."
              : "Please select a session to view attendance records."}
          </p>
        </div>
      )}
    </div>
  );
};