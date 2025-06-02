import { useState, useEffect } from 'react';
import api from '../../services/api';
import AttendanceTrends from './AttendanceTrends';
import AttendanceStats from './AttendanceStats';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Calendar, Users, TrendingUp, Plus, Save, AlertCircle, CheckCircle, Clock } from 'lucide-react';


// Main component
export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rollNumberInput, setRollNumberInput] = useState('');
  const [markAs, setMarkAs] = useState('present');
  const [activeTab, setActiveTab] = useState('list');
  const [saveStatus, setSaveStatus] = useState('');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  const [pendingChanges, setPendingChanges] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch teaching assignments on mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  // Create a new session
  const createNewSession = async () => {
    if (!selectedAssignment || !newSessionDate) {
      setSaveStatus('Please select an assignment and enter a valid date');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/teachers/sessions', {
        assignmentId: selectedAssignment,
        date: newSessionDate,
        topic: newSessionTopic.trim() || 'No topic'
      });
      
      setSessions([response.data, ...sessions]);
      setSaveStatus('New session created successfully');
      
      setNewSessionDate('');
      setNewSessionTopic('');
      setShowNewSessionForm(false);
      setSelectedSession(response.data.id);
      
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Failed to create session');
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Fetch sessions when an assignment is selected
  useEffect(() => {
    if (selectedAssignment) {
      fetchSessions(selectedAssignment);
    }
  }, [selectedAssignment]);
  
  // Toggle new session form
  const toggleNewSessionForm = () => {
    setShowNewSessionForm(!showNewSessionForm);
    if (!showNewSessionForm) {
      const today = new Date().toISOString().split('T')[0];
      setNewSessionDate(today);
    }
  };

  // Fetch attendance when a session is selected
  useEffect(() => {
    if (selectedSession) {
      fetchAttendance(selectedSession);
      setPendingChanges({});
      setHasChanges(false);
    }
  }, [selectedSession]);

  // Fetch teaching assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/teachers/assignments');
      setAssignments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load teaching assignments');
      setLoading(false);
    }
  };

  // Fetch sessions for a selected assignment
  const fetchSessions = async (assignmentId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/teachers/sessions/${assignmentId}`);
      setSessions(response.data);
      setSelectedSession(null);
      setAttendanceRecords([]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
      setLoading(false);
    }
  };

  // Fetch attendance for a selected session
  const fetchAttendance = async (sessionId) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/teachers/sessions/${sessionId}/attendance`);
      setAttendanceRecords(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to load attendance records');
      setLoading(false);
    }
  };

  // Handle toggling attendance for a single student
  const toggleAttendance = (attendanceId, isPresent) => {
    setPendingChanges(prev => ({
      ...prev,
      [attendanceId]: isPresent
    }));
    
    setAttendanceRecords(records => 
      records.map(record => 
        record.id === attendanceId ? { ...record, present: isPresent } : record
      )
    );
    
    setHasChanges(true);
  };

  // Submit all pending changes as a batch
  const submitAttendanceChanges = async () => {
    if (!selectedSession || Object.keys(pendingChanges).length === 0) {
      return;
    }

    setLoading(true);
    try {
      const attendanceUpdates = Object.entries(pendingChanges).map(([attendanceId, isPresent]) => {
        const record = attendanceRecords.find(r => r.id === attendanceId);
        return {
          studentId: record.studentId,
          present: isPresent
        };
      });

      await api.put(`/api/teachers/attendance/batch/${selectedSession}`, {
        attendanceRecords: attendanceUpdates
      });

      setSaveStatus(`Attendance updated successfully for ${attendanceUpdates.length} students`);
      setPendingChanges({});
      setHasChanges(false);
      setTimeout(() => setSaveStatus(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error updating attendance:', err);
      setSaveStatus('Failed to update attendance');
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Process roll numbers from input
  const processRollNumbers = async () => {
    if (!selectedSession || !rollNumberInput.trim()) {
      setSaveStatus('Please select a session and enter roll numbers');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    const rollNumbers = rollNumberInput
      .split(',')
      .map(num => num.trim())
      .filter(num => num);

    if (rollNumbers.length === 0) {
      setSaveStatus('Please enter valid roll numbers');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const studentsToUpdate = attendanceRecords.filter(record => 
        rollNumbers.includes(record.student.rollNumber?.toString() || '')
      );

      if (studentsToUpdate.length === 0) {
        setSaveStatus('No matching students found');
        setLoading(false);
        setTimeout(() => setSaveStatus(''), 3000);
        return;
      }

      const shouldBePresent = markAs === 'present';
      const attendanceUpdates = studentsToUpdate.map(record => ({
        studentId: record.studentId,
        present: shouldBePresent
      }));

      await api.put(`/api/teachers/attendance/batch/${selectedSession}`, {
        attendanceRecords: attendanceUpdates
      });

      setAttendanceRecords(prevRecords => 
        prevRecords.map(record => {
          const isInBatch = studentsToUpdate.some(s => s.studentId === record.studentId);
          if (isInBatch) {
            return { ...record, present: shouldBePresent };
          }
          return record;
        })
      );

      setSaveStatus(`Marked ${studentsToUpdate.length} students as ${markAs}`);
      setRollNumberInput('');
      setTimeout(() => setSaveStatus(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error processing roll numbers:', err);
      setSaveStatus('Failed to update attendance');
      setLoading(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // UI for course and session selection
  const renderSelectionPanel = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center mb-6">
        <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">Course & Session Selection</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Course
          </label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={selectedAssignment || ''}
            onChange={(e) => setSelectedAssignment(e.target.value)}
          >
            <option value="">Choose a course...</option>
            {assignments.map(assignment => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.course.name} - {assignment.branch.name} - {assignment.semester} - {assignment.section}
              </option>
            ))}
          </select>
        </div>
        
        {selectedAssignment && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Select Session
              </label>
              <button
                onClick={toggleNewSessionForm}
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                {showNewSessionForm ? 'Cancel' : 'New Session'}
              </button>
            </div>
            
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={selectedSession || ''}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="">Choose a session...</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {new Date(session.date).toLocaleDateString()} - {session.topic || 'No topic'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {showNewSessionForm && (
        <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Create New Session</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic (optional)
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={newSessionTopic}
                onChange={(e) => setNewSessionTopic(e.target.value)}
                placeholder="What's covered in this session?"
              />
            </div>
          </div>
          
          <button
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            onClick={createNewSession}
            disabled={loading || !newSessionDate}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  // UI for bulk input method
  const renderBulkInputPanel = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Users className="w-6 h-6 text-blue-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-900">Bulk Attendance Entry</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Enter Roll Numbers
          </label>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            value={rollNumberInput}
            onChange={(e) => setRollNumberInput(e.target.value)}
            placeholder="Enter roll numbers separated by commas (e.g., 101, 102, 105)"
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-2">Separate multiple roll numbers with commas</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Mark these students as:
          </label>
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="markAs"
                value="present"
                checked={markAs === 'present'}
                onChange={() => setMarkAs('present')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Present</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="markAs"
                value="absent"
                checked={markAs === 'absent'}
                onChange={() => setMarkAs('absent')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Absent</span>
            </label>
          </div>
        </div>
        
        <button
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          onClick={processRollNumbers}
          disabled={loading || !selectedSession || !rollNumberInput.trim()}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );

  // UI for list-based attendance
  const renderStudentListPanel = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Users className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Student Attendance List</h3>
        </div>
        {hasChanges && (
          <div className="flex items-center px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
            <span className="text-sm font-medium text-amber-800">Unsaved changes</span>
          </div>
        )}
      </div>
      
      {attendanceRecords.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attendance Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record, index) => (
                  <tr key={record.id} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-semibold text-blue-600">
                            {record.student.rollNumber || 'N/A'}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {record.student.rollNumber || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.student.user.firstName} {record.student.user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={record.present}
                          onChange={() => toggleAttendance(record.id, !record.present)}
                        />
                        <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 shadow-sm"></div>
                        <span className={`ml-3 text-sm font-semibold ${record.present ? 'text-green-600' : 'text-red-600'}`}>
                          {record.present ? 'Present' : 'Absent'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                hasChanges 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              onClick={submitAttendanceChanges}
              disabled={!hasChanges || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-500">
            {selectedSession 
              ? 'No attendance records found for this session.' 
              : 'Please select a session to view attendance records.'}
          </p>
        </div>
      )}
    </div>
  );

  const renderAttendanceStats = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Attendance Trends</h3>
        </div>
        <AttendanceTrends assignmentId={selectedAssignment} />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Users className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold text-gray-900">Attendance Statistics</h3>
        </div>
        <AttendanceStats assignmentId={selectedAssignment} />
      </div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    api.defaults.headers.common['Authorization'] = '';
    navigate('/login');
  };

  return ( 
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your courses and track student attendance</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
        
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {saveStatus && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Selection Panel */}
        {renderSelectionPanel()}
        
        {/* Tab Navigation and Content */}
        {selectedAssignment && (
          <div>
            <div className="mb-8">
              <nav className="flex space-x-8 border-b border-gray-200">
                <button
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('stats')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Attendance Statistics
                </button>
                <button
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'list'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('list')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Mark Attendance
                </button>
              </nav>
            </div>

            {activeTab === 'stats' ? (
              renderAttendanceStats()
            ) : (
              <>
                {selectedSession ? (
                  <>
                    <div className="mb-6">
                      <nav className="flex space-x-8 border-b border-gray-200">
                        <button
                          className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                            activeTab === 'list'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('list')}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Student List
                        </button>
                        <button
                          className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                            activeTab === 'bulk'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('bulk')}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Bulk Entry
                        </button>
                      </nav>
                    </div>

                    {activeTab === 'list' && renderStudentListPanel()}
                    {activeTab === 'bulk' && renderBulkInputPanel()}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Session Selected</h3>
                    <p className="text-gray-500">Please select or create a session to mark attendance.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
