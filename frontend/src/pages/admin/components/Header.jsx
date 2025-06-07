import { GraduationCap, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";


export const Header = ()=>{
  const navigate = useNavigate();
  const handleLogout = () => {
    // Clear the auth token from localStorage
    localStorage.removeItem("token");
    // Clear any auth headers from the API service
    api.defaults.headers.common["Authorization"] = "";
    // Redirect to login page
    navigate("/login");
  };
    return (
        <header className="bg-transparent backdrop-blur-sm shadow-sm border-b  sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-md text-gray-800 mt-1">Manage your educational platform</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <LogOut size={20} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>
    )
}