import React, { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { weeklyStudyData, skills } from '../../data/analyticsMock';
import { Trophy, Star, Zap, Target, Award, Rocket, Shield, Flame, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import api from '../../utils/axiosConfig';

const Progress = () => {
    const [timeframe, setTimeframe] = useState('Last 7 Days');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get('/exams/results/student');
                if (res.data.success) {
                    setResults(res.data.results);
                }
            } catch (err) {
                console.error("Failed to fetch student results", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    // Rank Tiers Data
    const ranks = [
        { name: 'Starter', icon: '🌱', min: 0, color: 'text-green-500', bg: 'bg-green-50' },
        { name: 'Active', icon: '⚡', min: 100, color: 'text-blue-500', bg: 'bg-blue-50' },
        { name: 'Rising', icon: '🚀', min: 500, color: 'text-orange-500', bg: 'bg-orange-50' },
        { name: 'Star', icon: '🌟', min: 1000, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    ];

    const currentPoints = results.length * 50; // Simple XP logic based on completed exams
    const currentRank = ranks.find((r, i) => currentPoints >= r.min && (!ranks[i + 1] || currentPoints < ranks[i + 1].min)) || ranks[0];
    const nextRank = ranks[ranks.indexOf(currentRank) + 1] || currentRank;
    const progressToNext = nextRank === currentRank ? 100 : ((currentPoints - currentRank.min) / (nextRank.min - currentRank.min)) * 100;

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Creative Header with Rank Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Growth</h1>
                    <p className="text-gray-500 font-medium mt-1">You've studied for <span className="text-[#8b5cf6] font-bold">12.5 hours</span> this week. Keep it up!</p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-rose-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
                        <div className={`w-16 h-16 ${currentRank.bg} rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
                            {currentRank.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-black uppercase tracking-widest ${currentRank.color}`}>{currentRank.name} Tier</span>
                                <span className="text-xs font-bold text-gray-400">{currentPoints} / {nextRank.min} XP</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-orange-400 to-rose-400 h-full rounded-full transition-all duration-1000" style={{ width: `${progressToNext}%` }} />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-tighter italic">Next Rank: {nextRank.name} {nextRank.icon}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-purple-500/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 italic">Learning Velocity</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Consistency over intensity</p>
                        </div>
                        <div className="flex p-1 bg-gray-50 rounded-xl">
                            {['Week', 'Month'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeframe(t === 'Week' ? 'Last 7 Days' : 'Last Month')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${timeframe.includes(t) ? 'bg-white text-[#8b5cf6] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={weeklyStudyData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontWeight: 'bold', fontSize: 10 }} dy={10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skills Visual */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 mb-6">Skill Mastery</h3>
                        <div className="space-y-6">
                            {skills.slice(0, 4).map(skill => (
                                <div key={skill.name} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-gray-700 uppercase tracking-widest">{skill.name}</span>
                                        <span className="text-xs font-black text-[#8b5cf6]">{skill.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r transition-all duration-1000"
                                            style={{
                                                width: `${skill.progress}%`,
                                                backgroundColor: skill.color || '#8b5cf6'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-2">
                        Comprehensive Report <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Bottom Row: badges & activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recent Activity — Based on Exam Results */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Recent Exams</h3>
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[#8b5cf6]" /></div>
                        ) : results.length > 0 ? results.map((result, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <Zap size={16} className="text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">
                                        Completed <span className="text-[#8b5cf6]">{result.Exam?.title}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                                        Score: {result.score}/{result.totalMarks} • {new Date(result.submittedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 py-4 italic">No exams completed yet.</p>
                        )}
                    </div>
                </div>

                {/* Achievements Showcase */}
                <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all" />
                    <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-white/80">Special Achievements</h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        {[
                            { name: 'Fast Learner', icon: '⚡', desc: '5 lessons/day' },
                            { name: 'Streak King', icon: '🔥', desc: '15 day streak' },
                            { name: 'Top Scorer', icon: '🎯', desc: '95%+ in Quizzes' },
                            { name: 'Helper', icon: '🤝', desc: 'Assisted in Forum' },
                        ].map((badge, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 hover:bg-white/20 transition-all cursor-default group">
                                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{badge.icon}</div>
                                <h4 className="text-sm font-black leading-tight">{badge.name}</h4>
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-tighter">{badge.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Progress;
