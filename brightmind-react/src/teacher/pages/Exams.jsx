import { useUser } from '../../context/UserContext';
import api from '../../utils/axiosConfig';
import { FileQuestion, Plus, Search, Clock, FileText, CheckCircle, AlertCircle, Loader2, UploadCloud, X, Calendar, BarChart3 } from 'lucide-react';

const Exams = () => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('My Exams');
    const [courses, setCourses] = useState([]);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [examsRes, resultsRes, coursesRes] = await Promise.all([
                api.get(`/exams/teacher/${user.id}`),
                api.get(`/exams/results/teacher/${user.id}`),
                api.get('/courses')
            ]);
            setExams(examsRes.data);
            setResults(resultsRes.data.results || []);
            setCourses(coursesRes.data);
        } catch (err) {
            console.error("Failed to fetch teacher exam data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    const handleUpload = async () => {
        if (!form.title || !form.courseId) return;
        setUploading(true);
        try {
            const selectedCourse = courses.find(c => c.id.toString() === form.courseId.toString());
            const payload = {
                ...form,
                courseName: selectedCourse?.title || form.courseName,
                status: 'Pending Approval',
                teacherId: user.id,
                teacherName: user.name
            };
            const res = await api.post('/exams', payload);
            setExams([res.data, ...exams]);
            setShowUploadModal(false);
            setForm({ title: '', courseId: '', courseName: '', duration: 60, totalMarks: 100, questions: [] });
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleSchedule = async () => {
        if (!selectedExam || !scheduleForm.scheduledAt) return;
        setUploading(true);
        try {
            await api.post('/exams/schedule', {
                examId: selectedExam.id,
                scheduledAt: scheduleForm.scheduledAt,
                duration: scheduleForm.duration
            });

            // Create notification for students
            await api.post('/announcements', {
                title: 'New Exam Scheduled',
                content: `An exam for "${selectedExam.courseName}" (${selectedExam.title}) has been scheduled for ${new Date(scheduleForm.scheduledAt).toLocaleString()}.`,
                targetRole: 'Student',
                senderId: user.id
            });

            setShowScheduleModal(false);
            await fetchData();
        } catch (err) {
            console.error("Scheduling failed:", err);
        } finally {
            setUploading(false);
        }
    };

    // Helper to get status chip
    const getStatusChip = (status) => {
        switch (status) {
            case 'Active':
                return <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Calendar size={10} /> Live</span>;
            case 'Approved':
                return <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={10} /> Approved</span>;
            case 'Pending Approval':
                return <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={10} /> Reviewing</span>;
            default:
                return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
                    <p className="text-gray-500">Upload questions, schedule exams, and review student performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 bg-[#8b5cf6] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20"
                    >
                        <Plus size={18} /> Upload Question Paper
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                {['My Exams', 'Results'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-[#8b5cf6] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'My Exams' ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-600">
                            <tr>
                                <th className="px-6 py-4">Exam Title</th>
                                <th className="px-6 py-4">Course</th>
                                <th className="px-6 py-4">Scheduled</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {exams.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        <FileQuestion size={40} className="mx-auto mb-3 opacity-20" />
                                        No exams uploaded yet
                                    </td>
                                </tr>
                            ) : (
                                exams.map(exam => (
                                    <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="font-bold text-gray-900">{exam.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{exam.courseName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {exam.scheduledAt ? new Date(exam.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Not Scheduled'}
                                        </td>
                                        <td className="px-6 py-4">{getStatusChip(exam.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {exam.status === 'Approved' && (
                                                <button
                                                    onClick={() => { setSelectedExam(exam); setShowScheduleModal(true); }}
                                                    className="text-xs font-bold text-[#8b5cf6] hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-[#8b5cf6]/20 transition-all"
                                                >
                                                    Schedule
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-600">
                            <tr>
                                <th className="px-6 py-4">Student ID</th>
                                <th className="px-6 py-4">Exam ID</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                        <BarChart3 size={40} className="mx-auto mb-3 opacity-20" />
                                        No results yet
                                    </td>
                                </tr>
                            ) : (
                                results.map(res => (
                                    <tr key={res.id}>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{res.studentId.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{res.examId.substring(0, 8)}...</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${res.score / res.totalMarks >= 0.4 ? 'text-green-600' : 'text-red-500'}`}>
                                                {res.score}/{res.totalMarks}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(res.submittedAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Exam Schedular Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoomIn">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Schedule Exam</h3>
                            <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                    value={scheduleForm.scheduledAt}
                                    onChange={e => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                    value={scheduleForm.duration}
                                    onChange={e => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                            <button
                                onClick={handleSchedule}
                                disabled={uploading || !scheduleForm.scheduledAt}
                                className="flex-1 py-3 font-bold text-white bg-[#8b5cf6] rounded-xl hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50"
                            >
                                {uploading ? 'Scheduling...' : 'Lock Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoomIn">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Upload Exam Questions</h3>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Exam Title</label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    placeholder="e.g. Midterm Physics 2026"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Course</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                                    value={form.courseId}
                                    onChange={e => setForm({ ...form, courseId: e.target.value })}
                                >
                                    <option value="">Choose a course...</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration (min)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                        value={form.duration}
                                        onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Marks</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"
                                        value={form.totalMarks}
                                        onChange={e => setForm({ ...form, totalMarks: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            {/* Question Upload Mock */}
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50 hover:border-purple-300 transition-colors">
                                <UploadCloud size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-sm font-bold text-gray-600 mb-1">Upload Question Paper (PDF)</p>
                                <p className="text-xs text-gray-400">or Drag and Drop your file here</p>
                                <input type="file" className="hidden" id="exam-file" onChange={() => setForm({ ...form, questions: [{ text: 'Paper uploaded' }] })} />
                                <label htmlFor="exam-file" className="mt-4 inline-block px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">Select File</label>
                            </div>
                            {form.questions.length > 0 && (
                                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-xl border border-green-100">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span className="text-xs text-green-700 font-medium font-bold">File "Physics_Paper_2026.pdf" ready for upload</span>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !form.title}
                                className="flex-1 py-3 font-bold text-white bg-[#8b5cf6] rounded-xl hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <><UploadCloud size={18} /> Submit for Review</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Exams;
