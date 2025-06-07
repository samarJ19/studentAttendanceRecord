import React, { useState, useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../../services/api";

const AttendanceStats = ({ assignmentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalStudents: 0,
    attendanceRate: 0,
    studentStats: [],
  });
  const [lastFetch, setLastFetch] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!assignmentId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch sessions for this teaching assignment
        const sessionsResponse = await api.get(
          `/api/teachers/sessions/${assignmentId}`
        );
        if (!mountedRef.current) return;

        const sessionsData = sessionsResponse.data;
        setSessions(sessionsData);

        // Process each session to get attendance data
        let attendanceData = [];
        let studentsMap = new Map();

        for (const session of sessionsData) {
          if (!mountedRef.current) return;

          const attendanceResponse = await api.get(
            `/api/teachers/sessions/${session.id}/attendance`
          );
          const sessionAttendance = attendanceResponse.data;

          attendanceData.push({
            sessionId: session.id,
            date: session.date,
            topic: session.topic,
            attendance: sessionAttendance,
          });

          // Build student attendance records map
          sessionAttendance.forEach((record) => {
            const studentId = record.student.id;
            const studentName = `${record.student.user.firstName} ${record.student.user.lastName}`;

            if (!studentsMap.has(studentId)) {
              studentsMap.set(studentId, {
                id: studentId,
                name: studentName,
                sessionsPresent: 0,
                sessionsAbsent: 0,
                attendanceRate: 0,
              });
            }

            const studentData = studentsMap.get(studentId);
            if (record.present) {
              studentData.sessionsPresent += 1;
            } else {
              studentData.sessionsAbsent += 1;
            }
          });
        }

        // Calculate attendance rates for each student
        let totalPresent = 0;
        let totalAbsent = 0;
        const studentStats = [];

        studentsMap.forEach((student) => {
          const totalSessions =
            student.sessionsPresent + student.sessionsAbsent;
          student.attendanceRate =
            totalSessions > 0
              ? ((student.sessionsPresent / totalSessions) * 100).toFixed(1)
              : 0;

          totalPresent += student.sessionsPresent;
          totalAbsent += student.sessionsAbsent;

          studentStats.push(student);
        });

        // Sort students by attendance rate in descending order
        studentStats.sort((a, b) => b.attendanceRate - a.attendanceRate);

        // Calculate overall stats
        const totalAttendanceRecords = totalPresent + totalAbsent;
        const overallAttendanceRate =
          totalAttendanceRecords > 0
            ? ((totalPresent / totalAttendanceRecords) * 100).toFixed(1)
            : 0;

        const calculatedStats = {
          totalSessions: sessionsData.length,
          totalStudents: studentsMap.size,
          attendanceRate: overallAttendanceRate,
          totalPresent,
          totalAbsent,
          studentStats,
        };

        if (!mountedRef.current) return;

        setStats(calculatedStats);
        setLastFetch(new Date().toLocaleString());
        setLoading(false);
      } catch (err) {
        console.error("Error fetching attendance data:", err);
        if (mountedRef.current) {
          setError("Failed to load attendance data");
          setLoading(false);
        }
      }
    };

    fetchAttendanceData();
  }, [assignmentId]);

  const refreshData = () => {
    setLoading(true);
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      window.location.reload(); // Simple refresh approach
    };
    fetchData();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50">
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-to-r from-orange-400 to-pink-400 mr-4"></div>
            <span className="text-white/70 text-lg">
              Loading attendance statistics...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-gradient-to-br from-red-500/20 via-red-600/15 to-red-700/10 backdrop-blur-2xl border border-red-400/30 shadow-2xl rounded-3xl p-8 animate-in fade-in-50">
          <div className="text-center p-8">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <p className="text-lg font-semibold text-red-300 mb-4">{error}</p>
            <button
              onClick={refreshData}
              className="px-6 py-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 hover:bg-red-500/30 transition-all duration-200 backdrop-blur-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stats.totalSessions === 0) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50">
          <div className="text-center p-8">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-white/60" />
            <p className="text-lg text-white/70">
              No sessions found for this teaching assignment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const pieChartData = [
    { name: "Present", value: stats.totalPresent },
    { name: "Absent", value: stats.totalAbsent },
  ];

  const COLORS = ["#10B981", "#EF4444"];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in-50 slide-in-from-top-2">
      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:scale-[1.01] transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Attendance Statistics
            </h2>
            <p className="text-white/70 text-lg">Comprehensive attendance overview and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastFetch && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-2">
                <div className="text-white/70 text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Updated: {lastFetch}
                </div>
              </div>
            )}
            <button
              onClick={refreshData}
              className="px-6 py-3 bg-gradient-to-r from-orange-500/20 to-pink-500/20 backdrop-blur-xl border border-orange-400/30 rounded-xl text-white hover:from-orange-500/30 hover:to-pink-500/30 transition-all duration-200 shadow-lg font-medium"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-500/20 via-orange-600/15 to-red-600/10 backdrop-blur-xl border border-orange-400/30 rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-orange-400" />
            <div className="text-4xl font-bold text-white mb-2">
              {stats.totalSessions}
            </div>
            <div className="text-white/70 font-medium">Total Sessions</div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 via-red-600/15 to-pink-600/10 backdrop-blur-xl border border-red-400/30 rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
            <Users className="w-8 h-8 mx-auto mb-3 text-red-400" />
            <div className="text-4xl font-bold text-white mb-2">
              {stats.totalStudents}
            </div>
            <div className="text-white/70 font-medium">Total Students</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/20 via-pink-600/15 to-rose-600/10 backdrop-blur-xl border border-pink-400/30 rounded-2xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-pink-400" />
            <div className="text-4xl font-bold text-white mb-2">
              {stats.attendanceRate}%
            </div>
            <div className="text-white/70 font-medium">Attendance Rate</div>
          </div>
        </div>

        {/* Charts and Recent Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-xl mr-3">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              Overall Attendance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                    labelStyle={{
                      fill: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)',
                      color: 'white'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 p-2 rounded-xl mr-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              Recent Sessions
            </h3>
            <div className="overflow-auto max-h-80">
              <table className="min-w-full">
                <thead className="bg-white/10 backdrop-blur-lg">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-xl">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {sessions.slice(0, 5).map((session, index) => (
                    <tr
                      key={session.id}
                      className="hover:bg-white/10 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80 font-medium">
                        {new Date(session.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80 max-w-32">
                        <div className="truncate font-medium" title={session.topic}>
                          {session.topic}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Student Attendance Report */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-6 shadow-lg">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-2 rounded-xl mr-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            Student Attendance Report
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/10 backdrop-blur-lg">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tl-xl">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider rounded-tr-xl">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats.studentStats.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-white/10 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">
                        {student.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                        <span className="text-sm text-emerald-300 font-bold">
                          {student.sessionsPresent}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-sm text-red-300 font-bold">
                          {student.sessionsAbsent}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-lg border transition-all duration-200 hover:scale-105 ${
                          parseFloat(student.attendanceRate) >= 75
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                            : parseFloat(student.attendanceRate) >= 50
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/30"
                            : "bg-red-500/20 text-red-300 border-red-400/30"
                        }`}
                      >
                        {student.attendanceRate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;