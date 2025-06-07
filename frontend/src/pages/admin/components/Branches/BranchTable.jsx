export default function BranchTable ({branches}) {
    return (
        <div className="animate-in fade-in-50 slide-in-from-top-2 duration-500">
            <div className="bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 backdrop-blur-xl border-b border-white/25">
                            <tr>
                                <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Branch Name
                                </th>
                                <th className="px-8 py-6 text-left text-xs font-bold text-white uppercase tracking-wider">
                                    Created Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {branches.map((branch, index) => (
                                <tr 
                                    key={branch.id} 
                                    className="hover:bg-white/5 hover:shadow-lg group"
                                >
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                                                {branch.name.charAt(0)}
                                            </div>
                                            <div className="text-base font-semibold text-white">
                                                {branch.name}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap text-base text-white/70">
                                        {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}