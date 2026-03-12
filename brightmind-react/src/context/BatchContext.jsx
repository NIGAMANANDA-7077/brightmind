import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

const BatchContext = createContext(null);

export const BatchProvider = ({ children, role }) => {
    const [myBatch, setMyBatch] = useState(null);
    const [myLiveClasses, setMyLiveClasses] = useState([]);
    const [myBatches, setMyBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            try {
                const [bRes, lcRes] = await Promise.all([
                    api.get('/batches/student/my-batch'),
                    api.get('/batches/student/live-classes')
                ]);
                if (bRes.data.success) setMyBatch(bRes.data.data);
                if (lcRes.data.success) setMyLiveClasses(lcRes.data.data || []);
            } catch (err) { 
                console.error("[BatchContext] Error fetching student data:", err.response?.data || err.message);
            }
            finally { setLoading(false); }
        };

        const fetchTeacherData = async () => {
            setLoading(true);
            try {
                const res = await api.get('/batches/teacher/my-batches');
                if (res.data.success) setMyBatches(res.data.data || []);
            } catch (_) { }
            finally { setLoading(false); }
        };

        if (role === 'Student') fetchStudentData();
        else if (role === 'Teacher') fetchTeacherData();
    }, [role]);

    const refetchStudentBatch = async () => {
        try {
            const [bRes, lcRes] = await Promise.all([
                api.get('/batches/student/my-batch'),
                api.get('/batches/student/live-classes')
            ]);
            if (bRes.data.success) setMyBatch(bRes.data.data);
            if (lcRes.data.success) setMyLiveClasses(lcRes.data.data || []);
        } catch (_) { }
    };

    return (
        <BatchContext.Provider value={{ myBatch, myLiveClasses, myBatches, loading, refetchStudentBatch }}>
            {children}
        </BatchContext.Provider>
    );
};

export const useBatch = () => {
    const ctx = useContext(BatchContext);
    if (!ctx) throw new Error('useBatch must be used within BatchProvider');
    return ctx;
};

export default BatchContext;
