import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';


const AttendanceTrends = ({ assignmentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        
        // Fetch sessions for this teaching assignment
        const sessionsResponse = await api.get(`/api/teachers/sessions/${assignmentId}`);
        const sessions = sessionsResponse.data;
        
        // Sort sessions by date (oldest first)
        sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Process each session to get attendance data
        const trends = [];
        
        for (const session of sessions) {
          const attendanceResponse = await api.get(`/api/teachers/sessions/${session.id}/attendance`);
          const attendance = attendanceResponse.data;
          
          const presentCount = attendance.filter(record => record.present).length;
          const absentCount = attendance.filter(record => !record.present).length;
          const totalCount = attendance.length;
          const attendanceRate = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
          
          trends.push({
            date: new Date(session.date).toLocaleDateString(),
            topic: session.topic,
            attendanceRate: parseFloat(attendanceRate.toFixed(1)),
            presentCount,
            absentCount,
            totalCount
          });
        }
        
        setTrendData(trends);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance trend data:', err);
        setError('Failed to load attendance trends');
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchTrendData();
    }
  }, [assignmentId]);

  if (loading) return <div className="flex justify-center p-4">Loading attendance trends...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (trendData.length === 0) return <div className="p-4">No attendance data available to show trends.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6">Attendance Trends</h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={Math.ceil(trendData.length / 10) - 1} // Show fewer ticks when there are many sessions
            />
            <YAxis 
              yAxisId="left" 
              domain={[0, 100]} 
              label={{ value: 'Attendance Rate (%)', angle: -90, position: 'insideLeft' }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 'auto']} 
              label={{ value: 'Student Count', angle: 90, position: 'insideRight' }} 
            />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'attendanceRate') return [`${value}%`, 'Attendance Rate'];
                if (name === 'presentCount') return [value, 'Present'];
                if (name === 'absentCount') return [value, 'Absent'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const session = trendData.find(item => item.date === label);
                return `${label}: ${session.topic}`;
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="attendanceRate" 
              stroke="#8884d8" 
              strokeWidth={2}
              activeDot={{ r: 8 }} 
              name="Attendance Rate"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="presentCount" 
              stroke="#4CAF50" 
              name="Present"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="absentCount" 
              stroke="#F44336" 
              name="Absent"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Session-by-Session Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trendData.map((session, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {session.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.topic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {session.presentCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {session.absentCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${session.attendanceRate >= 75 ? 'bg-green-100 text-green-800' : 
                        session.attendanceRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {session.attendanceRate}%
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

export default AttendanceTrends;