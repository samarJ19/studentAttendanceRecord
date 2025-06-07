import { BookOpen, Calendar, Plus } from "lucide-react";

// UI for course and session selection
export const RenderSelectionPanel = ({ selectedAssignment,setSelectedAssignment,assignments,toggleNewSessionForm,showNewSessionForm,selectedSession,setSelectedSession,sessions,loading,createNewSession,newSessionDate,setNewSessionDate,newSessionTopic,setNewSessionTopic }) => {

  return (
    <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 mb-8 animate-in fade-in-50 slide-in-from-top-2 hover:scale-105 transition-all duration-300">
      <div className="flex items-center mb-8">
        <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl backdrop-blur-xl border border-white/20 mr-4">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Course & Session Selection</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <label className="block text-lg font-bold text-white mb-4">
            Select Course
          </label>
          <select 
            className="w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
            value={selectedAssignment || ''}
            onChange={(e) => setSelectedAssignment(e.target.value)}
          >
            <option value="" className="bg-gray-800 text-white">Choose a course...</option>
            {assignments.map(assignment => (
              <option key={assignment.id} value={assignment.id} className="bg-gray-800 text-white">
                {assignment.course.name} - {assignment.branch.name} - {assignment.semester} - {assignment.section}
              </option>
            ))}
          </select>
        </div>
        
        {selectedAssignment && (
          <div className="animate-in fade-in-50 slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-lg font-bold text-white">
                Select Session
              </label>
              <button
                onClick={toggleNewSessionForm}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-white/20 text-white text-sm font-medium rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showNewSessionForm ? 'Cancel' : 'New Session'}
              </button>
            </div>
            
            <select 
              className="w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
              value={selectedSession || ''}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="" className="bg-gray-800 text-white">Choose a session...</option>
              {sessions.map(session => (
                <option key={session.id} value={session.id} className="bg-gray-800 text-white">
                  {new Date(session.date).toLocaleDateString()} - {session.topic || 'No topic'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {showNewSessionForm && (
        <div className="mt-8 p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl animate-in fade-in-50 slide-in-from-top-2">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl backdrop-blur-xl border border-white/20 mr-3">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white">Create New Session</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-white mb-3">
                Date *
              </label>
              <input
                type="date"
                className="w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                value={newSessionDate}
                onChange={(e) => setNewSessionDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-3">
                Topic (optional)
              </label>
              <input
                type="text"
                className="w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 focus:bg-white/15 transition-all duration-300 hover:bg-white/15"
                value={newSessionTopic}
                onChange={(e) => setNewSessionTopic(e.target.value)}
                placeholder="What's covered in this session?"
              />
            </div>
          </div>
          
          <button
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-white/20 text-white font-medium rounded-xl hover:from-emerald-500/30 hover:to-teal-500/30 hover:scale-105 disabled:from-gray-500/20 disabled:to-gray-500/20 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg"
            onClick={createNewSession}
            disabled={loading || !newSessionDate}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-3" />
                Create Session
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}