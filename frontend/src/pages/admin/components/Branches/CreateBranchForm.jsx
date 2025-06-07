import { Building } from "lucide-react";

export default function CreateBranchForm ({handleCreateBranch,newBranch,setNewBranch}) {
    return (
        <div className="mb-8 animate-in fade-in-50 slide-in-from-top-2 duration-500">
            <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <Building className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Create New Branch</h2>
            </div>
            
            <form
                onSubmit={handleCreateBranch}
                className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-bold text-white mb-3">
                            Branch Name
                        </label>
                        <input
                            type="text"
                            required
                            value={newBranch.name}
                            onChange={(e) =>
                                setNewBranch({ ...newBranch, name: e.target.value })
                            }
                            className="w-full px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-white/15"
                            placeholder="Computer Science Engineering"
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 font-bold text-lg"
                    >
                        Create Branch
                    </button>
                </div>
            </form>
        </div>
    )
}