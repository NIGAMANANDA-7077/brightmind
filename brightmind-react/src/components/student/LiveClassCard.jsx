import { Calendar, Clock, Video, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';

const LiveClassCard = ({ session }) => {
    const isLive = session.status === 'Live' || session.isLive;
    const isCompleted = session.status === 'Completed';

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        if (dateStr === 'Today' || dateStr === 'Tomorrow') return dateStr;
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const getDayNumber = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.getDate();
        } catch (e) {
            return '';
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        try {
            // Track attendance silently
            await api.post('/live-classes/attendance', {
                liveClassId: session.id,
                durationMinutes: 0 // Server sets joinTime
            });
        } catch (err) {
            console.error("Failed to track attendance", err);
        }

        // Open the link regardless of tracking success
        window.open(session.link, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#8b5cf6]/30 transition-all shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Date Box */}
            <div className={`w-full md:w-24 h-24 rounded-2xl flex flex-col items-center justify-center shrink-0 ${isLive ? 'bg-red-50 text-red-500' : isCompleted ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-[#8b5cf6]'
                }`}>
                <span className="text-xs font-bold uppercase tracking-wider">{formatDate(session.date)}</span>
                <span className="text-2xl font-black mt-1">{session.status === 'Live' ? 'LIVE' : getDayNumber(session.date)}</span>
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    {isLive && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                            ● LIVE NOW
                        </span>
                    )}
                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">{session.course}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{session.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-2">
                        <img src={session.avatar || `https://ui-avatars.com/api/?name=${session.mentor || 'Teacher'}`} alt={session.mentor} className="w-5 h-5 rounded-full" />
                        <span>{session.mentor || 'Teacher'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{session.time}</span>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-auto">
                {isLive ? (
                    <button
                        onClick={handleJoin}
                        className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20"
                    >
                        <Video size={18} /> Join Now
                    </button>
                ) : (
                    <a
                        href={session.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isCompleted
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                : 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20'
                            }`}
                    >
                        {isCompleted ? <><PlayCircle size={18} /> Watch Recording</> : 'Join Session'}
                    </a>
                )}
            </div>
        </div>
    );
};

export default LiveClassCard;
