import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, GraduationCap, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  // Mock login function for demo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
      
    try {
      const user = await login(email, password);
      
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'TEACHER') {
        navigate('/teacher');
      } else if (user.role === 'STUDENT') {
        navigate('/student');
      }
    } catch (err) {
      // Error is handled in auth context
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 text-white/10 animate-bounce">
        <GraduationCap size={40} />
      </div>
      <div className="absolute bottom-20 right-20 text-white/10 animate-bounce animation-delay-1000">
        <BookOpen size={35} />
      </div>
      <div className="absolute top-1/3 right-1/4 text-white/10 animate-bounce animation-delay-2000">
        <Users size={30} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-2xl">
            <GraduationCap className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-blue-200 text-lg">College Attendance System</p>
        </div>
        {/* Login Card */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-300 hover:bg-white/15">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 backdrop-blur border border-red-300/50 text-red-100 px-4 py-3 rounded-xl text-sm animate-shake">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input
                  id="email"
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-white font-medium text-sm" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur border border-white/30 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
          
          
          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-500/20 backdrop-blur rounded-xl border border-blue-300/30">
            <p className="text-blue-100 text-sm text-center mb-2 font-medium">Demo Credentials:</p>
            <p className="text-blue-200 text-xs text-center">Email: demo@college.edu</p>
            <p className="text-blue-200 text-xs text-center">Password: password</p>
          </div>
        </div>
        </form>
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            Secure • Reliable • Easy to Use
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;