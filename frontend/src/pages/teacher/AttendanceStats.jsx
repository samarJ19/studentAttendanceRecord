import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../../services/api';

const AttendanceStats = ({ assignmentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalStudents: 0,
    attendanceRate: 0,
    studentStats: []
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // Fetch sessions for this teaching assignment
        const sessionsResponse = await api.get(`/api/teachers/sessions/${assignmentId}`);
        const sessionsData = sessionsResponse.data;
        setSessions(sessionsData);
        
        // Process each session to get attendance data
        let attendanceData = [];
        let studentsMap = new Map();
        
        for (const session of sessionsData) {
          const attendanceResponse = await api.get(`/api/teachers/sessions/${session.id}/attendance`);
          const sessionAttendance = attendanceResponse.data;
          
          attendanceData.push({
            sessionId: session.id,
            date: session.date,
            topic: session.topic,
            attendance: sessionAttendance
          });
          
          // Build student attendance records map
          sessionAttendance.forEach(record => {
            const studentId = record.student.id;
            const studentName = `${record.student.user.firstName} ${record.student.user.lastName}`;
            
            if (!studentsMap.has(studentId)) {
              studentsMap.set(studentId, {
                id: studentId,
                name: studentName,
                sessionsPresent: 0,
                sessionsAbsent: 0,
                attendanceRate: 0
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
        
        studentsMap.forEach(student => {
          const totalSessions = student.sessionsPresent + student.sessionsAbsent;
          student.attendanceRate = totalSessions > 0 
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
        const overallAttendanceRate = totalAttendanceRecords > 0 
          ? ((totalPresent / totalAttendanceRecords) * 100).toFixed(1) 
          : 0;
        
        setStats({
          totalSessions: sessionsData.length,
          totalStudents: studentsMap.size,
          attendanceRate: overallAttendanceRate,
          totalPresent,
          totalAbsent,
          studentStats
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data');
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAttendanceData();
    }
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50 slide-in-from-top-2">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-400/30 border-t-orange-400 mx-auto"></div>
              <p className="text-white/70 mt-4 text-center">Loading attendance statistics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-br from-red-500/20 via-red-400/15 to-red-300/10 backdrop-blur-2xl border border-red-400/30 shadow-2xl rounded-3xl p-6 animate-in fade-in-50">
            <p className="text-red-200 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (stats.totalSessions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-6 animate-in fade-in-50">
            <p className="text-white/70 text-center">No sessions found for this teaching assignment.</p>
          </div>
        </div>
      </div>
    );
  }

  const pieChartData = [
    { name: 'Present', value: stats.totalPresent },
    { name: 'Absent', value: stats.totalAbsent }
  ];

  const COLORS = ['#FB923C', '#EF4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50 slide-in-from-top-2">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Attendance Statistics
            </h2>
            <p className="text-white/70">Comprehensive attendance tracking and insights</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500/20 via-orange-400/15 to-orange-300/10 backdrop-blur-xl border border-orange-400/30 shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2" style={{animationDelay: '100ms'}}>
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent mb-2">
                {stats.totalSessions}
              </div>
              <div className="text-white/70 font-medium">Total Sessions</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-500/20 via-red-400/15 to-red-300/10 backdrop-blur-xl border border-red-400/30 shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2" style={{animationDelay: '200ms'}}>
              <div className="text-5xl font-bold bg-gradient-to-r from-red-300 to-red-500 bg-clip-text text-transparent mb-2">
                {stats.totalStudents}
              </div>
              <div className="text-white/70 font-medium">Total Students</div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-500/20 via-pink-400/15 to-pink-300/10 backdrop-blur-xl border border-pink-400/30 shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300 animate-in fade-in-50 slide-in-from-top-2" style={{animationDelay: '300ms'}}>
              <div className="text-5xl font-bold bg-gradient-to-r from-pink-300 to-pink-500 bg-clip-text text-transparent mb-2">
                {stats.attendanceRate}%
              </div>
              <div className="text-white/70 font-medium">Attendance Rate</div>
            </div>
          </div>
          
          {/* Charts and Recent Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Pie Chart */}
            <div className="bg-white/15 border border-white/25 backdrop-blur-xl rounded-2xl p-6 shadow-2xl animate-in fade-in-50 slide-in-from-top-2" style={{animationDelay: '400ms'}}>
              <h3 className="text-2xl font-bold text-white mb-6">Overall Attendance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Sessions */}
            <div className="bg-white/15 border border-white/25 backdrop-blur-xl rounded-2xl p-6 shadow-2xl animate-in fade-in-50 slide-in-from-top-2" style={{animationDelay: '500ms'}}>
              <h3 className="text-2xl font-bold text-white mb-6">Recent Sessions</h3>
              <div className="overflow-hidden rounded-xl">
                <div className="overflow-y-auto max-h-64 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <table className="w-full">
                    <thead className="bg-white/10 backdrop-blur-xl sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Topic</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {sessions.slice(0, 5).map((session, index) => (
                        <tr key={session.id} className="hover:bg-white/5 transition-colors duration-200">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80">
                            {new Date(session.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-white/80 max-w-32 truncate">
                            {session.topic}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <button className="bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 backdrop-blur-xl border border-orange-400/30 text-white/90 px-3 py-1 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Student Attendance Report */}
          <div className="bg-white/15 border border-white/25 backdrop-blur-xl rounded-2xl p-6 shadow-2xl animate-in fade-in-50 slide-in-from-top-2" style={{animationDelay: '600ms'}}>
            <h3 className="text-2xl font-bold text-white mb-6">Student Attendance Report</h3>
            <div className="overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-white/10">
                  <thead className="bg-white/10 backdrop-blur-xl">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Present</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Absent</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {stats.studentStats.map((student, index) => (
                      <tr key={student.id} className="hover:bg-white/5 transition-colors duration-200" style={{animationDelay: `${700 + index * 50}ms`}}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/80">{student.sessionsPresent}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white/80">{student.sessionsAbsent}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xl border transition-all duration-200 hover:scale-105
                            ${parseFloat(student.attendanceRate) >= 75 
                              ? 'bg-green-500/20 text-green-200 border-green-400/30' : 
                              parseFloat(student.attendanceRate) >= 50 
                              ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' : 
                              'bg-red-500/20 text-red-200 border-red-400/30'}`}>
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
      </div>
    </div>
  );
};

export default AttendanceStats;