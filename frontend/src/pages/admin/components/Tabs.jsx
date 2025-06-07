import {  Users, BookOpen, GraduationCap, UserCheck, Calendar, Building } from "lucide-react";
  // Tab configuration with icons
  export const tabs = [
    { id: "users", label: "Users", icon: Users },
    { id: "branches", label: "Branches", icon: Building },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "assignments", label: "Teaching Assignments", icon: GraduationCap },
    { id: "enrollments", label: "Enrollments", icon: UserCheck },
    { id: "promotions", label: "Semester Promotions", icon: Calendar },
  ];

export const Tabs = ({activeTab, setActiveTab })=>{
    return ( <div className="mb-8">
                  <div className="mx-auto border-gray-200 bg-transparent rounded-md shadow-sm">
                    <nav className="flex justify-evenly">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex bg-transparent items-center px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                              activeTab === tab.id
                                ? "border-b-2 border-blue-500 text-black bg-blue-50"
                                : "text-white/90 hover:text-black "
                            }`}
                          >
                            <Icon size={18} className="mr-2" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
    )

};