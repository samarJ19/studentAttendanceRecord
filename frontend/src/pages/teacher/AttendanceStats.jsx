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

  if (loading) return <div className="flex justify-center p-8">Loading attendance statistics...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (stats.totalSessions === 0) return <div className="p-4">No sessions found for this teaching assignment.</div>;

  const pieChartData = [
    { name: 'Present', value: stats.totalPresent },
    { name: 'Absent', value: stats.totalAbsent }
  ];

  const COLORS = ['#4CAF50', '#F44336'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Attendance Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-blue-600">{stats.totalSessions}</div>
          <div className="text-gray-500">Total Sessions</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-purple-600">{stats.totalStudents}</div>
          <div className="text-gray-500">Total Students</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-green-600">{stats.attendanceRate}%</div>
          <div className="text-gray-500">Attendance Rate</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Overall Attendance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
          <div className="overflow-auto max-h-64">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.slice(0, 5).map(session => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">View</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Student Attendance Report</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.studentStats.map(student => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.sessionsPresent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.sessionsAbsent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${parseFloat(student.attendanceRate) >= 75 ? 'bg-green-100 text-green-800' : 
                        parseFloat(student.attendanceRate) >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
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
  );
};

export default AttendanceStats;