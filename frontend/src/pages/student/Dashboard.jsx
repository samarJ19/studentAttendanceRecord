import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Calendar, BookOpen, User, TrendingUp, AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentAttendanceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseAttendance, setCourseAttendance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch enrollments and attendance overview
        const [enrollmentsResponse, overviewResponse] = await Promise.all([
          api.get('/api/students/enrollments'),
          api.get('/api/students/attendance-overview')
        ]);
        
        setEnrollments(enrollmentsResponse.data);
        setAttendanceOverview(overviewResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load attendance data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchCourseAttendance = async (enrollmentId) => {
    try {
      const response = await api.get(`/api/students/attendance/${enrollmentId}`);
      setCourseAttendance(response.data);
      setSelectedCourse(enrollmentId);
    } catch (err) {
      console.error('Error fetching course attendance:', err);
      setError('Failed to load course attendance details');
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return 'text-emerald-300 bg-emerald-500/20';
    if (percentage >= 50) return 'text-amber-300 bg-amber-500/20';
    return 'text-rose-300 bg-rose-500/20';
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return { status: 'Good', color: '#10b981' };
    if (percentage >= 50) return { status: 'Warning', color: '#f59e0b' };
    return { status: 'Critical', color: '#ef4444' };
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50">
        <div className="text-white text-xl">Loading your attendance data...</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
      <div className="bg-gradient-to-br from-red-500/15 via-red-500/10 to-red-500/5 backdrop-blur-2xl border border-red-400/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50">
        <div className="text-red-300 text-xl">{error}</div>
      </div>
    </div>
  );

  // Prepare data for charts
  const overallStats = attendanceOverview.reduce((acc, course) => {
    acc.totalSessions += course.totalSessions;
    acc.attendedSessions += course.attendedSessions;
    return acc;
  }, { totalSessions: 0, attendedSessions: 0 });

  const overallPercentage = overallStats.totalSessions > 0 
    ? Math.round((overallStats.attendedSessions / overallStats.totalSessions) * 100) 
    : 0;

  const pieChartData = [
    { name: 'Present', value: overallStats.attendedSessions },
    { name: 'Absent', value: overallStats.totalSessions - overallStats.attendedSessions }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  const handleLogout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-in fade-in-50 slide-in-from-top-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 via-purple-200 to-blue-300 bg-clip-text text-transparent flex items-center">
            <BookOpen className="mr-4 text-indigo-300" size={40} />
            My Attendance Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-rose-500/20 to-red-500/20 backdrop-blur-xl border border-rose-400/30 text-rose-300 rounded-2xl hover:scale-105 hover:from-rose-500/30 hover:to-red-500/30 transition-all duration-300 shadow-lg"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in-50 slide-in-from-top-2 duration-500">
          <div className="bg-gradient-to-br from-indigo-500/15 via-indigo-500/10 to-indigo-500/5 backdrop-blur-2xl border border-indigo-400/20 shadow-2xl rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">
              {attendanceOverview.length}
            </div>
            <div className="text-white/70 text-sm mt-2">Enrolled Courses</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/15 via-purple-500/10 to-purple-500/5 backdrop-blur-2xl border border-purple-400/20 shadow-2xl rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
              {overallStats.totalSessions}
            </div>
            <div className="text-white/70 text-sm mt-2">Total Sessions</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 backdrop-blur-2xl border border-emerald-400/20 shadow-2xl rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              {overallStats.attendedSessions}
            </div>
            <div className="text-white/70 text-sm mt-2">Sessions Attended</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/15 via-blue-500/10 to-blue-500/5 backdrop-blur-2xl border border-blue-400/20 shadow-2xl rounded-3xl p-6 text-center hover:scale-105 transition-all duration-300">
            <div className={`text-4xl font-bold ${
              overallPercentage >= 75 
                ? 'bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent' 
                : overallPercentage >= 50 
                  ? 'bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent' 
                  : 'bg-gradient-to-r from-rose-300 to-red-300 bg-clip-text text-transparent'
            }`}>
              {overallPercentage}%
            </div>
            <div className="text-white/70 text-sm mt-2">Overall Attendance</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-in fade-in-50 slide-in-from-top-2 duration-700">
          {/* Overall Attendance Chart */}
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="mr-3 text-indigo-300" size={28} />
              Overall Attendance
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      color: 'white'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course-wise Attendance Chart */}
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Course-wise Attendance</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="courseCode" 
                    tick={{ fontSize: 12, fill: 'white' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: 'white' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, 'Attendance']}
                    labelFormatter={(label) => {
                      const course = attendanceOverview.find(c => c.courseCode === label);
                      return course ? course.courseName : label;
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      color: 'white'
                    }}
                  />
                  <Bar 
                    dataKey="attendancePercentage" 
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 mb-8 animate-in fade-in-50 slide-in-from-top-2 duration-1000">
          <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(enrollment => {
              const courseOverview = attendanceOverview.find(o => o.enrollmentId === enrollment.id);
              const attendanceStatus = getAttendanceStatus(courseOverview?.attendancePercentage || 0);
              
              return (
                <div 
                  key={enrollment.id} 
                  className="bg-gradient-to-br from-white/10 via-white/5 to-white/0 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => fetchCourseAttendance(enrollment.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                      {enrollment.course.name}
                    </h3>
                    {courseOverview?.attendancePercentage < 75 && (
                      <AlertTriangle className="text-amber-400 animate-pulse" size={20} />
                    )}
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3">Code: {enrollment.course.code}</p>
                  
                  {enrollment.teacher && (
                    <p className="text-white/70 text-sm mb-4 flex items-center">
                      <User size={16} className="mr-2 text-indigo-300" />
                      {enrollment.teacher.name}
                    </p>
                  )}
                  
                  {courseOverview && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-white/80">
                          Sessions: {courseOverview.attendedSessions}/{courseOverview.totalSessions}
                        </span>
                        <span className={`px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-sm border border-white/20 ${getAttendanceColor(courseOverview.attendancePercentage)}`}>
                          {courseOverview.attendancePercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm">
                        <div 
                          className="h-3 rounded-full transition-all duration-500 shadow-lg"
                          style={{ 
                            width: `${courseOverview.attendancePercentage}%`,
                            background: `linear-gradient(90deg, ${attendanceStatus.color}CC, ${attendanceStatus.color})`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 text-xs text-white/50 group-hover:text-white/70 transition-colors">
                    Click to view detailed attendance
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Course Attendance */}
        {courseAttendance && (
          <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50 slide-in-from-top-2">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Calendar className="mr-3 text-indigo-300" size={28} />
              {courseAttendance.course.name} - Detailed Attendance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-indigo-500/15 via-indigo-500/10 to-indigo-500/5 backdrop-blur-xl border border-indigo-400/20 shadow-lg rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-blue-300 bg-clip-text text-transparent">
                  {courseAttendance.stats.totalSessions}
                </div>
                <div className="text-white/70 text-sm mt-2">Total Sessions</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 backdrop-blur-xl border border-emerald-400/20 shadow-lg rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  {courseAttendance.stats.attendedSessions}
                </div>
                <div className="text-white/70 text-sm mt-2">Attended</div>
              </div>
              
              <div className="bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-rose-500/5 backdrop-blur-xl border border-rose-400/20 shadow-lg rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-300 to-red-300 bg-clip-text text-transparent">
                  {courseAttendance.stats.missedSessions}
                </div>
                <div className="text-white/70 text-sm mt-2">Missed</div>
              </div>
            </div>

            <div className="bg-white/15 border border-white/25 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Topic</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {courseAttendance.sessions.map((session, index) => (
                      <tr key={session.sessionId} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/80">
                          {new Date(session.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {session.topic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {session.marked ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium backdrop-blur-sm border border-white/20
                              ${session.present ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border-rose-400/30'}`}>
                              {session.present ? 'Present' : 'Absent'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium bg-white/10 text-white/70 border border-white/20 backdrop-blur-sm">
                              Not Marked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="px-6 py-3 bg-gradient-to-r from-gray-500/20 to-gray-600/20 backdrop-blur-xl border border-gray-400/30 text-gray-300 rounded-2xl hover:scale-105 hover:from-gray-500/30 hover:to-gray-600/30 transition-all duration-300 shadow-lg"
              >
                Close Details
              </button>
            </div>
          </div>
        )}

        {/* Attendance Alerts */}
        {attendanceOverview.some(course => course.attendancePercentage < 75) && (
          <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-amber-500/5 backdrop-blur-2xl border border-amber-400/30 shadow-2xl rounded-3xl p-8 mt-8 animate-in fade-in-50 slide-in-from-top-2">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-amber-400 animate-pulse" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-amber-300 mb-2">Attendance Warning</h3>
                <p className="text-white/80 mb-4">
                  You have courses with attendance below 75%. Consider attending more classes to maintain good academic standing.
                </p>
                <div className="bg-amber-500/10 backdrop-blur-sm border border-amber-400/20 rounded-xl p-4">
                  <p className="text-sm text-amber-200">
                    <strong>Courses with low attendance:</strong> {
                      attendanceOverview
                        .filter(course => course.attendancePercentage < 75)
                        .map(course => course.courseCode)
                        .join(', ')
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceDashboard;