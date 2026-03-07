import React from 'react';
import { Plus } from 'lucide-react';
import TicketCard from '../../components/student/support/TicketCard';
import PageTransition from '../../components/common/PageTransition';
import { tickets } from '../../data/ticketsMock';

const Support = () => {
    return (
        <PageTransition>
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
                        <p className="text-gray-500 mt-1">We are here to help you</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Ticket Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="font-bold text-lg text-gray-900 mb-6">Create New Ticket</h2>
                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                    <input type="text" placeholder="Briefly describe the issue" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-colors" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-colors">
                                            <option>Technical Issue</option>
                                            <option>Course Content</option>
                                            <option>Billing & Account</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-colors">
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea rows="4" placeholder="Provide more details..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-colors"></textarea>
                                </div>
                                <button className="w-full py-4 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2">
                                    <Plus size={20} /> Submit Ticket
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Recent Tickets List */}
                    <div className="space-y-4">
                        <h2 className="font-bold text-lg text-gray-900">Recent Tickets</h2>
                        {tickets.map(ticket => (
                            <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Support;
