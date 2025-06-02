import { useState, useEffect } from 'react';
import api from '../../services/api';
import AttendanceTrends from './AttendanceTrends';
import AttendanceStats from './AttendanceStats';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

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
  const [markAs, setMarkAs] = useState('present'); // 'present' or 'absent'
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'bulk', or 'stats'
  const [saveStatus, setSaveStatus] = useState('');
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionTopic, setNewSessionTopic] = useState('');
  // Add state to track changes in attendance
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
      
      // Add the new session to the sessions list
      setSessions([response.data, ...sessions]);
      setSaveStatus('New session created successfully');
      
      // Reset form
      setNewSessionDate('');
      setNewSessionTopic('');
      setShowNewSessionForm(false);
      
      // Select the newly created session
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
      // Set default date to today when opening form
      const today = new Date().toISOString().split('T')[0];
      setNewSessionDate(today);
    }
  };

  // Fetch attendance when a session is selected
  useEffect(() => {
    if (selectedSession) {
      fetchAttendance(selectedSession);
      // Reset pendingChanges when selecting a new session
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
      setSelectedSession(null); // Reset selected session
      setAttendanceRecords([]); // Clear attendance records
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

  // Handle toggling attendance for a single student (storing locally)
  const toggleAttendance = (attendanceId, isPresent) => {
    // Store the change locally
    setPendingChanges(prev => ({
      ...prev,
      [attendanceId]: isPresent
    }));
    
    // Update UI immediately
    setAttendanceRecords(records => 
      records.map(record => 
        record.id === attendanceId ? { ...record, present: isPresent } : record
      )
    );
    
    // Indicate we have unsaved changes
    setHasChanges(true);
  };

  // Submit all pending changes as a batch
  const submitAttendanceChanges = async () => {
    if (!selectedSession || Object.keys(pendingChanges).length === 0) {
      return;
    }

    setLoading(true);
    try {
      // Convert pendingChanges to the format expected by the batch API
      const attendanceUpdates = Object.entries(pendingChanges).map(([attendanceId, isPresent]) => {
        // Find the student ID for this attendance record
        const record = attendanceRecords.find(r => r.id === attendanceId);
        return {
          studentId: record.studentId,
          present: isPresent
        };
      });

      // Send batch update request
      await api.put(`/api/teachers/attendance/batch/${selectedSession}`, {
        attendanceRecords: attendanceUpdates
      });

      setSaveStatus(`Attendance updated successfully for ${attendanceUpdates.length} students`);
      setPendingChanges({}); // Clear pending changes
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

    // Parse the input into an array of roll numbers
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
      // Find the student IDs corresponding to the roll numbers
      const studentsToUpdate = attendanceRecords.filter(record => 
        rollNumbers.includes(record.student.rollNumber?.toString() || '')
      );

      if (studentsToUpdate.length === 0) {
        setSaveStatus('No matching students found');
        setLoading(false);
        setTimeout(() => setSaveStatus(''), 3000);
        return;
      }

      // Prepare the batch update
      const shouldBePresent = markAs === 'present';
      const attendanceUpdates = studentsToUpdate.map(record => ({
        studentId: record.studentId,
        present: shouldBePresent
      }));

      // Send batch update request
      await api.put(`/api/teachers/attendance/batch/${selectedSession}`, {
        attendanceRecords: attendanceUpdates
      });

      // Update local state
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
      setRollNumberInput(''); // Clear input
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
    <div className="mb-6 p-4 border rounded bg-gray-50">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Course
        </label>
        <select 
          className="block w-full p-2 border rounded"
          value={selectedAssignment || ''}
          onChange={(e) => setSelectedAssignment(e.target.value)}
        >
          <option value="">Select a course...</option>
          {assignments.map(assignment => (
            <option key={assignment.id} value={assignment.id}>
              {assignment.course.name} - {assignment.branch.name} - {assignment.semester} - {assignment.section}
            </option>
          ))}
        </select>
      </div>
      
      {selectedAssignment && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Sessions</h3>
            <h4 className="text-lg font-medium">Select session to view attendance records </h4>
            <button
              onClick={toggleNewSessionForm}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
            >
              {showNewSessionForm ? 'Cancel' : '+ New Session'}
            </button>
          </div>
          
          {showNewSessionForm && (
            <div className="mb-4 p-3 border rounded bg-white">
              <h4 className="font-medium mb-3">Create New Session</h4>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="block w-full p-2 border rounded"
                  value={newSessionDate}
                  onChange={(e) => setNewSessionDate(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic (optional)
                </label>
                <input
                  type="text"
                  className="block w-full p-2 border rounded"
                  value={newSessionTopic}
                  onChange={(e) => setNewSessionTopic(e.target.value)}
                  placeholder="What's covered in this session?"
                />
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                onClick={createNewSession}
                disabled={loading || !newSessionDate}
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Session
            </label>
            <select 
              className="block w-full p-2 border rounded"
              value={selectedSession || ''}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="">Select a session...</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id}>
                  {new Date(session.date).toLocaleDateString()} - {session.topic || 'No topic'}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );

  // UI for bulk input method (Feature 1)
  const renderBulkInputPanel = () => (
    <div className="mb-6 p-4 border rounded">
      <h3 className="text-lg font-medium mb-4">Mark Attendance by Roll Numbers</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Roll Numbers (comma separated)
        </label>
        <textarea
          className="block w-full p-2 border rounded"
          value={rollNumberInput}
          onChange={(e) => setRollNumberInput(e.target.value)}
          placeholder="e.g. 101, 102, 105"
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mark these students as:
        </label>
        <div className="flex items-center">
          <label className="mr-4">
            <input
              type="radio"
              name="markAs"
              value="present"
              checked={markAs === 'present'}
              onChange={() => setMarkAs('present')}
              className="mr-1"
            />
            Present
          </label>
          <label>
            <input
              type="radio"
              name="markAs"
              value="absent"
              checked={markAs === 'absent'}
              onChange={() => setMarkAs('absent')}
              className="mr-1"
            />
            Absent
          </label>
        </div>
      </div>
      
      <button
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        onClick={processRollNumbers}
        disabled={loading || !selectedSession}
      >
        {loading ? 'Processing...' : 'Submit'}
      </button>
    </div>
  );

  // UI for list-based attendance (Feature 2 - now improved)
  const renderStudentListPanel = () => (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4">Attendance List</h3>
      
      {attendanceRecords.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Roll Number</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="border p-2">{record.student.rollNumber || 'N/A'}</td>
                    <td className="border p-2">
                      {record.student.user.firstName} {record.student.user.lastName}
                    </td>
                    <td className="border p-2 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={record.present}
                          onChange={() => toggleAttendance(record.id, !record.present)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {record.present ? 'Present' : 'Absent'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Submit button for batch update */}
          <div className="mt-4 flex justify-end">
            <button
              className={`px-4 py-2 rounded text-white ${
                hasChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
              onClick={submitAttendanceChanges}
              disabled={!hasChanges || loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          {/* Added status indicator for unsaved changes */}
          {hasChanges && (
            <div className="mt-2 text-amber-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              You have unsaved attendance changes
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-600">
          {selectedSession 
            ? 'No attendance records found for this session.' 
            : 'Please select a session to view attendance records.'}
        </p>
      )}
    </div>
  );

  const renderAttendanceStats = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">Attendance Trends</h3>
        <AttendanceTrends assignmentId={selectedAssignment} />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">Attendance Statistics</h3>
        <AttendanceStats assignmentId={selectedAssignment} />
      </div>
    </div>
  );

  const handleLogout = () => {
    // Clear the auth token from localStorage
    localStorage.removeItem('token');
    // Clear any auth headers from the API service
    api.defaults.headers.common['Authorization'] = '';
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {saveStatus && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {saveStatus}
        </div>
      )}

      {renderSelectionPanel()}
      
      {selectedAssignment && (
        <div>
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex -mb-px">
              <button
                className={`px-4 py-2 mr-4 font-medium ${
                  activeTab === 'stats'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                Attendance Stats
              </button>
              <button
                className={`px-4 py-2 mr-4 font-medium ${
                  activeTab === 'list'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('list')}
              >
                Mark Attendance
              </button>
            </nav>
          </div>
          
          {activeTab === 'stats' ? (
            renderAttendanceStats()
          ) : activeTab === 'list' ? (
            selectedSession ? (
              <div>
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex -mb-px">
                    <button
                      className={`px-4 py-2 mr-4 font-medium ${
                        activeTab === 'list'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('list')}
                    >
                      Student List
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeTab === 'bulk'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('bulk')}
                    >
                      Bulk Entry
                    </button>
                  </nav>
                </div>
                {renderStudentListPanel()}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-600">
                Please select a session to mark attendance
              </div>
            )
          ) : (
            selectedSession ? (
              <div>
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex -mb-px">
                    <button
                      className={`px-4 py-2 mr-4 font-medium ${
                        activeTab === 'list'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('list')}
                    >
                      Student List
                    </button>
                    <button
                      className={`px-4 py-2 font-medium ${
                        activeTab === 'bulk'
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('bulk')}
                    >
                      Bulk Entry
                    </button>
                  </nav>
                </div>
                {renderBulkInputPanel()}
              </div>
            ) : (
              <div className="text-center p-4 text-gray-600">
                Please select a session to mark attendance
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}