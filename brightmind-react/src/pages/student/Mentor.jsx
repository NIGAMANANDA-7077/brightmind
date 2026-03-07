import React, { useState } from 'react';
import MentorCard from '../../components/student/mentor/MentorCard';
import BookingModal from '../../components/student/mentor/BookingModal';
import { myMentor, availableMentors } from '../../data/mentorsMock';
import { Search, Filter } from 'lucide-react';

const Mentor = () => {
    const [selectedMentor, setSelectedMentor] = useState(null);

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mentorship</h1>
                    <p className="text-gray-500 mt-1">Connect with industry experts</p>
                </div>
            </div>

            {/* My Mentor Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">My Mentor</h2>
                    <button className="text-[#8b5cf6] font-bold text-sm hover:underline">View Schedule</button>
                </div>
                <div className="max-w-md">
                    <MentorCard mentor={myMentor} onBook={setSelectedMentor} />
                </div>
            </section>

            {/* Browse Mentors Section */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-900">Find a Mentor</h2>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search skills, companies..."
                                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-[#8b5cf6] outline-none text-sm w-full md:w-64"
                            />
                        </div>
                        <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#8b5cf6] transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {availableMentors.map(mentor => (
                        <MentorCard key={mentor.id} mentor={mentor} onBook={setSelectedMentor} />
                    ))}
                </div>
            </section>

            {/* Booking Modal */}
            {selectedMentor && (
                <BookingModal
                    mentor={selectedMentor}
                    onClose={() => setSelectedMentor(null)}
                />
            )}
        </div>
    );
};

export default Mentor;
