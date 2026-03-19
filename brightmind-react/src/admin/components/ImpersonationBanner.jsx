import React from 'react';
import { useUser } from '../../context/UserContext';
import { Eye, LogOut, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ImpersonationBanner = () => {
    const { user, exitImpersonation } = useUser();
    const navigate = useNavigate();

    if (!user?.isImpersonating) return null;

    const handleExit = async () => {
        const res = await exitImpersonation();
        if (res.success) {
            navigate('/admin/admin-management');
        }
    };

    return (
        <div className="bg-[#8b5cf6] text-white py-2.5 px-6 shadow-xl relative z-[9999] animate-slideDown">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                        <ShieldAlert size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-80 leading-none">System Monitoring Mode</p>
                        <p className="text-sm font-bold mt-0.5">
                            Viewing system as Admin: <span className="underline decoration-2 underline-offset-4 decoration-white/40">{user.name}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleExit}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-[#8b5cf6] rounded-xl font-black text-xs uppercase tracking-wider transition-all hover:bg-purple-50 hover:scale-105 active:scale-95 shadow-lg shadow-black/10"
                >
                    <LogOut size={14} />
                    Exit Admin View
                </button>
            </div>
        </div>
    );
};

export default ImpersonationBanner;
