import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AdminDashboard from './pages/admin/Dashboard';

// import StudentDashboard from './pages/student/Dashboard';
// import Header from './components/Header';
// import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/Dashboard';
import StudentAttendanceDashboard from './pages/student/Dashboard';

// Protected route component
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return element;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 blended-scrollbar">
      
          <main className="container mx-auto ">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute 
                    element={<AdminDashboard />} 
                    allowedRoles={['ADMIN']} 
                  />
                } 
              />
              
              <Route 
                path="/teacher/*" 
                element={
                  <ProtectedRoute 
                    element={<TeacherDashboard />} 
                    allowedRoles={['TEACHER']} 
                  />
                } 
              />
              
              <Route 
                path="/student/*" 
                element={
                  <ProtectedRoute 
                    element={<StudentAttendanceDashboard />} 
                    allowedRoles={['STUDENT']} 
                  />
                } 
              />
              
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/unauthorized" element={<div>You are not authorized to view this page</div>} />
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;