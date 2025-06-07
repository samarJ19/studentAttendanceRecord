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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gradient-to-r from-orange-400 to-pink-400"></div>
            <span className="text-white/70 text-lg">Loading attendance trends...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-gradient-to-br from-red-500/20 via-pink-500/15 to-rose-500/10 backdrop-blur-2xl border border-red-400/30 shadow-2xl rounded-3xl p-8 animate-in fade-in-50">
          <div className="text-center">
            <div className="text-red-400 text-xl font-semibold mb-2">Error Loading Data</div>
            <div className="text-red-300/80">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50">
          <div className="text-center">
            <div className="text-white/70 text-lg">No attendance data available to show trends.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 animate-in fade-in-50 slide-in-from-top-2">
      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 hover:scale-[1.01] transition-all duration-300">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Attendance Trends
          </h2>
          <p className="text-white/70 text-lg">Track attendance patterns across all sessions</p>
        </div>
        
        {/* Chart Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 mb-8">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{
                  top: 20,
                  right: 40,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  interval={Math.ceil(trendData.length / 10) - 1}
                />
                <YAxis 
                  yAxisId="left" 
                  domain={[0, 100]} 
                  label={{ 
                    value: 'Attendance Rate (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' }
                  }}
                  tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 'auto']} 
                  label={{ 
                    value: 'Student Count', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.7)' }
                  }}
                  tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                    color: 'white',
                    fontSize: '14px'
                  }}
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
                <Legend 
                  wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="attendanceRate" 
                  stroke="#ff6b35" 
                  strokeWidth={3}
                  activeDot={{ r: 8, fill: '#ff6b35', stroke: '#fff', strokeWidth: 2 }} 
                  name="Attendance Rate"
                  dot={{ fill: '#ff6b35', r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="presentCount" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Present"
                  dot={{ fill: '#10b981', r: 3 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="absentCount" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Absent"
                  dot={{ fill: '#ef4444', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Session Breakdown Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h3 className="text-2xl font-bold text-white mb-2">Session-by-Session Breakdown</h3>
            <p className="text-white/70">Detailed attendance data for each session</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Present</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Absent</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white/5 backdrop-blur-xl divide-y divide-white/10">
                {trendData.map((session, index) => (
                  <tr key={index} className="hover:bg-white/10 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                      {session.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium max-w-xs">
                      <div className="truncate" title={session.topic}>
                        {session.topic}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-sm font-semibold text-green-400">{session.presentCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-sm font-semibold text-red-400">{session.absentCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-sm
                        ${session.attendanceRate >= 75 
                          ? 'bg-green-500/20 text-green-300 border border-green-400/30' : 
                          session.attendanceRate >= 50 
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' : 
                          'bg-red-500/20 text-red-300 border border-red-400/30'}`}>
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
    </div>
  );
};

export default AttendanceTrends;