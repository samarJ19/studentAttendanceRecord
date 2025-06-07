import api from "../../services/api";
import AttendanceTrends from "./AttendanceTrends";
import AttendanceStats from "./AttendanceStats";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import TabSwitcher from "./components/TabSwitcher";
import { RenderSelectionPanel } from "./components/SelectionPanel/CourseAndSessionSelector";
import { useTeacherDashboard } from "./useTeacherDashboard";

// Main component
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const {
    assignments,
    selectedAssignment,
    sessions,
    selectedSession,
    attendanceRecords,
    loading,
    error,
    saveStatus,
    rollNumberInput,
    setRollNumberInput,
    markAs,
    setMarkAs,
    activeTab,
    setActiveTab,
    showNewSessionForm,
    newSessionDate,
    setNewSessionDate,
    newSessionTopic,
    setNewSessionTopic,
    hasChanges,
    setSelectedAssignment,
    setSelectedSession,
    toggleNewSessionForm,
    createNewSession,
    toggleAttendance,
    submitAttendanceChanges,
    processRollNumbers,
  } = useTeacherDashboard();

  const renderAttendanceStats = () => (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-top-2">
      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:scale-105 transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-xl border border-white/20 mr-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Attendance Trends
          </h3>
        </div>
        <AttendanceTrends assignmentId={selectedAssignment} />
      </div>

      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:scale-105 transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-xl border border-white/20 mr-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            Attendance Statistics
          </h3>
        </div>
        <AttendanceStats assignmentId={selectedAssignment} />
      </div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    api.defaults.headers.common["Authorization"] = "";
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-in fade-in-50 slide-in-from-top-2">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Teacher Dashboard
            </h1>
            <p className="text-white/70 mt-2 text-lg">
              Manage your courses and track student attendance
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 text-white font-medium rounded-xl hover:from-red-500/30 hover:to-pink-500/30 hover:scale-105 transition-all duration-300 shadow-lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl border border-red-400/30 text-red-100 rounded-2xl flex items-center animate-in fade-in-50 shadow-lg">
            <div className="p-2 bg-red-500/20 rounded-xl mr-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {saveStatus && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/20 to-green-500/20 backdrop-blur-xl border border-emerald-400/30 text-emerald-100 rounded-2xl flex items-center animate-in fade-in-50 shadow-lg">
            <div className="p-2 bg-emerald-500/20 rounded-xl mr-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            </div>
            <span className="font-medium">{saveStatus}</span>
          </div>
        )}

        {/* Selection Panel */}
        <div className="animate-in fade-in-50 slide-in-from-top-2">
          <RenderSelectionPanel
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={setSelectedAssignment}
            assignments={assignments}
            toggleNewSessionForm={toggleNewSessionForm}
            showNewSessionForm={showNewSessionForm}
            selectedSession={selectedSession}
            sessions={sessions}
            loading={loading}
            createNewSession={createNewSession}
            newSessionDate={newSessionDate}
            setNewSessionDate={setNewSessionDate}
            newSessionTopic={newSessionTopic}
            setNewSessionTopic={setNewSessionTopic}
            setSelectedSession={setSelectedSession}
          />
        </div>

        {/* Tab Navigation and Content */}
        {selectedAssignment && (
          <div className="animate-in fade-in-50 slide-in-from-top-2">
            <TabSwitcher
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedSession={selectedSession}
              renderAttendanceStats={renderAttendanceStats}
              hasChanges={hasChanges}
              attendanceRecords={attendanceRecords}
              toggleAttendance={toggleAttendance}
              submitAttendanceChanges={submitAttendanceChanges}
              loading={loading}
              rollNumberInput={rollNumberInput}
              setRollNumberInput={setRollNumberInput}
              markAs={markAs}
              setMarkAs={setMarkAs}
              processRollNumbers={processRollNumbers}
            />
          </div>
        )}
      </div>
    </div>
  );
}