import { CheckCircle, Users } from "lucide-react";

// UI for bulk input method
export const RenderBulkInputPanel = ({
  rollNumberInput,
  setRollNumberInput,
  markAs,
  setMarkAs,
  processRollNumbers,
  selectedSession,
  loading,
}) => {
  return (
    <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in-50 slide-in-from-top-2">
      <div className="flex items-center mb-8">
        <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-3 rounded-2xl mr-4 shadow-lg">
          <Users className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white">
          Bulk Attendance Entry
        </h3>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-semibold text-white mb-4">
            Enter Roll Numbers
          </label>
          <div className="relative">
            <textarea
              className="w-full p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 transition-all duration-300 resize-none shadow-lg hover:bg-white/15"
              value={rollNumberInput}
              onChange={(e) => setRollNumberInput(e.target.value)}
              placeholder="Enter roll numbers separated by commas (e.g., 101, 102, 105)"
              rows={4}
            />
          </div>
          <p className="text-xs text-white/70 mt-3">
            Separate multiple roll numbers with commas
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-white mb-4">
            Mark these students as:
          </label>
          <div className="flex items-center space-x-8">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  name="markAs"
                  value="present"
                  checked={markAs === "present"}
                  onChange={() => setMarkAs("present")}
                  className="w-5 h-5 text-emerald-400 bg-white/10 border-white/30 focus:ring-emerald-400/50 focus:ring-2 transition-all duration-200"
                />
                {markAs === "present" && (
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="ml-3 text-sm font-medium text-white group-hover:text-emerald-300 transition-colors duration-200">
                Present
              </span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="radio"
                  name="markAs"
                  value="absent"
                  checked={markAs === "absent"}
                  onChange={() => setMarkAs("absent")}
                  className="w-5 h-5 text-red-400 bg-white/10 border-white/30 focus:ring-red-400/50 focus:ring-2 transition-all duration-200"
                />
                {markAs === "absent" && (
                  <div className="absolute inset-0 bg-red-400/20 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="ml-3 text-sm font-medium text-white group-hover:text-red-300 transition-colors duration-200">
                Absent
              </span>
            </label>
          </div>
        </div>

        <button
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 disabled:from-gray-500/50 disabled:via-gray-600/50 disabled:to-gray-500/50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl border border-white/20 backdrop-blur-xl hover:scale-105 hover:shadow-indigo-500/25 active:scale-95"
          onClick={processRollNumbers}
          disabled={loading || !selectedSession || !rollNumberInput.trim()}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              <span className="text-white/90">Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-3" />
              Submit Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );
};