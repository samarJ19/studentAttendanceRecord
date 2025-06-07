import { Clock, TrendingUp, Users } from "lucide-react";
import { RenderStudentListPanel } from "./AttendancePanel/StudentList";
import { RenderBulkInputPanel } from "./AttendancePanel/BulkEntry";

export default function TabSwitcher({
  activeTab,
  setActiveTab,
  selectedSession,
  renderAttendanceStats,
  hasChanges,
  attendanceRecords,
  toggleAttendance,
  submitAttendanceChanges,
  loading,
  rollNumberInput,
  setRollNumberInput,
  markAs,
  setMarkAs,
  processRollNumbers
}) {
  return (
    <div className="animate-in fade-in-50 slide-in-from-top-2">
      {/* Main Tab Navigation */}
      <div className="mb-8">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-2">
          <nav className="flex space-x-2">
            <button
              className={`flex items-center px-6 py-4 font-bold text-sm transition-all duration-300 rounded-xl hover:scale-105 ${
                activeTab === "stats"
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("stats")}
            >
              <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                activeTab === "stats" 
                  ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30" 
                  : "bg-white/10"
              }`}>
                <TrendingUp className="w-4 h-4" />
              </div>
              Attendance Statistics
            </button>
            <button
              className={`flex items-center px-6 py-4 font-bold text-sm transition-all duration-300 rounded-xl hover:scale-105 ${
                activeTab === "list" || activeTab === "bulk"
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => setActiveTab("list")}
            >
              <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                activeTab === "list" || activeTab === "bulk"
                  ? "bg-gradient-to-br from-blue-500/30 to-purple-500/30" 
                  : "bg-white/10"
              }`}>
                <Users className="w-4 h-4" />
              </div>
              Mark Attendance
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "stats" ? (
        renderAttendanceStats()
      ) : (
        <>
          {selectedSession ? (
            <>
              {/* Sub Tab Navigation for Attendance */}
              <div className="mb-8">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-2">
                  <nav className="flex space-x-2">
                    <button
                      className={`flex items-center px-6 py-3 font-bold text-sm transition-all duration-300 rounded-xl hover:scale-105 ${
                        activeTab === "list"
                          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-white/20 text-white shadow-lg"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setActiveTab("list")}
                    >
                      <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                        activeTab === "list" 
                          ? "bg-gradient-to-br from-orange-500/30 to-red-500/30" 
                          : "bg-white/10"
                      }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      Student List
                    </button>
                    <button
                      className={`flex items-center px-6 py-3 font-bold text-sm transition-all duration-300 rounded-xl hover:scale-105 ${
                        activeTab === "bulk"
                          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-white/20 text-white shadow-lg"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                      onClick={() => setActiveTab("bulk")}
                    >
                      <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                        activeTab === "bulk" 
                          ? "bg-gradient-to-br from-orange-500/30 to-red-500/30" 
                          : "bg-white/10"
                      }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      Bulk Entry
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="animate-in fade-in-50 slide-in-from-top-2">
                {activeTab === "list" && (
                  <RenderStudentListPanel
                    hasChanges={hasChanges}
                    attendanceRecords={attendanceRecords}
                    toggleAttendance={toggleAttendance}
                    submitAttendanceChanges={submitAttendanceChanges}
                    loading={loading}
                    selectedSession={selectedSession}
                  />
                )}
                {activeTab === "bulk" && (
                  <RenderBulkInputPanel
                    rollNumberInput={rollNumberInput}
                    selectedSession={selectedSession}
                    setRollNumberInput={setRollNumberInput}
                    markAs={markAs}
                    setMarkAs={setMarkAs}
                    processRollNumbers={processRollNumbers}
                    loading={loading}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-12 text-center animate-in fade-in-50 slide-in-from-top-2">
              <div className="p-6 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl backdrop-blur-xl border border-white/20 inline-block mb-6">
                <Clock className="w-16 h-16 text-white/60 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No Session Selected
              </h3>
              <p className="text-white/70 text-lg">
                Please select or create a session to mark attendance.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}