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
    if (percentage >= 75) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 75) return { status: 'Good', color: '#4CAF50' };
    if (percentage >= 50) return { status: 'Warning', color: '#FF9800' };
    return { status: 'Critical', color: '#F44336' };
  };

  if (loading) return <div className="flex justify-center p-8">Loading your attendance data...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

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

  const COLORS = ['#4CAF50', '#F44336'];
  const handleLogout = () => {
    // Clear the auth token from localStorage
    localStorage.removeItem('token');
    // Clear any auth headers from the API service
    api.defaults.headers.common['Authorization'] = '';
    // Redirect to login page
    navigate('/login');
  };
  return (
    <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6 flex items-center">
        <BookOpen className="mr-3" />
        My Attendance Dashboard
      </h1>
      <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 mb-5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </button>
        </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{attendanceOverview.length}</div>
          <div className="text-gray-600 text-sm">Enrolled Courses</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{overallStats.totalSessions}</div>
          <div className="text-gray-600 text-sm">Total Sessions</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{overallStats.attendedSessions}</div>
          <div className="text-gray-600 text-sm">Sessions Attended</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className={`text-3xl font-bold ${overallPercentage >= 75 ? 'text-green-600' : overallPercentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {overallPercentage}%
          </div>
          <div className="text-gray-600 text-sm">Overall Attendance</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Overall Attendance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2" />
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course-wise Attendance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course-wise Attendance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceOverview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="courseCode" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, 'Attendance']}
                  labelFormatter={(label) => {
                    const course = attendanceOverview.find(c => c.courseCode === label);
                    return course ? course.courseName : label;
                  }}
                />
                <Bar 
                  dataKey="attendancePercentage" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(enrollment => {
            const courseOverview = attendanceOverview.find(o => o.enrollmentId === enrollment.id);
            const attendanceStatus = getAttendanceStatus(courseOverview?.attendancePercentage || 0);
            
            return (
              <div 
                key={enrollment.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => fetchCourseAttendance(enrollment.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{enrollment.course.name}</h3>
                  {courseOverview?.attendancePercentage < 75 && (
                    <AlertTriangle className="text-yellow-500" size={20} />
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-2">Code: {enrollment.course.code}</p>
                
                {enrollment.teacher && (
                  <p className="text-gray-600 text-sm mb-3 flex items-center">
                    <User size={16} className="mr-1" />
                    {enrollment.teacher.name}
                  </p>
                )}
                
                {courseOverview && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Sessions: {courseOverview.attendedSessions}/{courseOverview.totalSessions}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceColor(courseOverview.attendancePercentage)}`}>
                        {courseOverview.attendancePercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${courseOverview.attendancePercentage}%`,
                          backgroundColor: attendanceStatus.color
                        }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 text-xs text-gray-500">
                  Click to view detailed attendance
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Course Attendance */}
      {courseAttendance && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Calendar className="mr-2" />
            {courseAttendance.course.name} - Detailed Attendance
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{courseAttendance.stats.totalSessions}</div>
              <div className="text-gray-600 text-sm">Total Sessions</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{courseAttendance.stats.attendedSessions}</div>
              <div className="text-gray-600 text-sm">Attended</div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{courseAttendance.stats.missedSessions}</div>
              <div className="text-gray-600 text-sm">Missed</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseAttendance.sessions.map((session, index) => (
                  <tr key={session.sessionId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.marked ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${session.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {session.present ? 'Present' : 'Absent'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Not Marked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setSelectedCourse(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Attendance Alerts */}
      {attendanceOverview.some(course => course.attendancePercentage < 75) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Attendance Warning:</strong> You have courses with attendance below 75%. 
                Consider attending more classes to maintain good academic standing.
              </p>
              <div className="mt-2">
                <p className="text-xs text-yellow-600">
                  Courses with low attendance: {
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
  );
};

export default StudentAttendanceDashboard;