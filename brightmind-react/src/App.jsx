import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import ScrollToTop from './components/ScrollToTop';
import Preloader from './components/Preloader';

import Courses from './pages/Courses';
import PublicCourseDetail from './pages/PublicCourseDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Contact from './pages/Contact';
import Login from './pages/Login';
import DashboardPlaceholder from './pages/DashboardPlaceholder';
import StudentLayout from './layouts/StudentLayout';
import Dashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses'; // Updated import
import StudentLive from './pages/student/Live';
import StudentChat from './pages/student/Chat';
import StudentProgress from './pages/student/Progress';
import StudentSupport from './pages/student/Support';
import StudentSettings from './pages/student/Settings';
import StudentAssignments from './pages/student/Assignments';
import StudentMentor from './pages/student/Mentor';
import StudentExams from './pages/student/Exams';
import StudentExamTake from './pages/student/ExamTake';
import CourseDetail from './pages/student/CourseDetail';
import ExploreCourseDetail from './pages/student/ExploreCourseDetail';
import CoursePlayer from './pages/student/CoursePlayer';
import ForumHome from './pages/student/ForumHome';
import CourseForum from './pages/student/CourseForum';
import ThreadDetail from './pages/student/ThreadDetail';
import AssignmentDetail from './pages/student/AssignmentDetail';
import StudentNotifications from './pages/student/Notifications';
import { UserProvider } from './context/UserContext';
import { CourseProvider } from './context/CourseContext';
import { ForumProvider } from './context/ForumContext';
import { AssignmentProvider } from './context/AssignmentContext';
import AdminLayout from './admin/layouts/AdminLayout';
import AdminDashboard from './admin/pages/Dashboard';
import AdminCourses from './admin/pages/Courses';
import AdminCourseCreate from './admin/pages/CourseCreate';
import AdminPlaceholder from './admin/pages/AdminPlaceholder';
import AdminQuestions from './admin/pages/Questions';
import AdminExams from './admin/pages/Exams';
import AdminExamCreate from './admin/pages/ExamCreate';
import AdminSubmissionsList from './admin/pages/SubmissionsList';
import AdminScheduler from './admin/pages/Scheduler';
import AdminResults from './admin/pages/Results';
import AdminUsers from './admin/pages/Users';
import AdminUserCreate from './admin/pages/UserCreate';
import AdminAnnouncements from './admin/pages/Announcements';
import AdminSettings from './admin/pages/AdminSettings';
import AdminLiveClasses from './admin/pages/LiveClasses';
import { AdminGlobalProvider } from './admin/context/AdminGlobalContext';
import { AdminSchedulerProvider } from './admin/context/AdminSchedulerContext';
import { AdminExamProvider } from './admin/context/AdminExamContext';
import { AdminCourseProvider } from './admin/context/AdminCourseContext';
import { Navigate } from 'react-router-dom';

// --- Teacher Panel ---
import TeacherLayout from './teacher/layouts/TeacherLayout';
import TeacherDashboard from './teacher/pages/Dashboard';
import TeacherCourses from './teacher/pages/Courses';
import TeacherAssignments from './teacher/pages/Assignments';
import TeacherStudents from './teacher/pages/Students';
import TeacherAnnouncements from './teacher/pages/Announcements';
import TeacherProfile from './teacher/pages/Profile';
import TeacherLive from './teacher/pages/Live';
import TeacherCourseDetail from './teacher/pages/TeacherCourseDetail';
import TeacherExams from './teacher/pages/Exams';
import { SharedAnnouncementsProvider } from './context/SharedAnnouncementsContext';
import { ThemeProvider } from './context/ThemeContext';
import { BatchProvider } from './context/BatchContext';
import TeacherBatches from './teacher/pages/Batches';
import TeacherBatchDetail from './teacher/pages/BatchDetail';
import TeacherNotifications from './teacher/pages/Notifications';
import AdminBatches from './admin/pages/Batches';
import AdminBatchCreate from './admin/pages/BatchCreate';
import AdminEnrollmentRequests from './admin/pages/EnrollmentRequests';
import AdminNotifications from './admin/pages/Notifications';
import AdminManagement from './admin/pages/AdminManagement';
import AdminActivity from './admin/pages/AdminActivity';
import AllAdminActivities from './admin/pages/AllAdminActivities';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isStudentRoute = location.pathname.startsWith('/student');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isTeacherRoute = location.pathname.startsWith('/teacher');
  const isDashboardRoute = isStudentRoute || isAdminRoute || isTeacherRoute;

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <ThemeProvider>
      <UserProvider>
        <SharedAnnouncementsProvider>
          <div className="min-h-screen flex flex-col overflow-x-hidden w-full">
            <ScrollToTop />
            {!isDashboardRoute && <Navbar />}
            <main className="flex-grow">
              <CourseProvider>
                <ForumProvider>
                  <AssignmentProvider>
                    <AdminExamProvider>
                      <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/courses/:courseId" element={<PublicCourseDetail />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogDetail />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />

                      {/* Dashboard Routes */}
                      <Route path="/student" element={<BatchProvider role="Student"><StudentLayout /></BatchProvider>}>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="courses" element={<StudentCourses />} />
                        <Route path="courses" element={<StudentCourses />} />
                        <Route path="course/:courseId" element={<CourseDetail />} />
                        <Route path="explore/:courseId" element={<ExploreCourseDetail />} />
                        <Route path="course/:courseId/watch" element={<CoursePlayer />} />
                        <Route path="live" element={<StudentLive />} />
                        <Route path="forum" element={<ForumHome />} />
                        <Route path="forum/course/:courseId" element={<CourseForum />} />
                        <Route path="forum/thread/:threadId" element={<ThreadDetail />} />
                        <Route path="progress" element={<StudentProgress />} />
                        <Route path="assignments" element={<StudentAssignments />} />
                        <Route path="assignment/:assignmentId" element={<AssignmentDetail />} />
                        <Route path="exams" element={<StudentExams />} />
                        <Route path="exam/:examId" element={<StudentExamTake />} />
                        <Route path="mentors" element={<StudentMentor />} />
                        <Route path="support" element={<StudentSupport />} />
                        <Route path="settings" element={<StudentSettings />} />
                        <Route path="notifications" element={<StudentNotifications />} />
                        <Route path="*" element={<Dashboard />} />
                      </Route>

                      {/* Teacher Dashboard Routes */}
                      <Route path="/teacher-dashboard" element={<Navigate to="/teacher/dashboard" replace />} />
                      <Route path="/teacher" element={<BatchProvider role="Teacher"><TeacherLayout /></BatchProvider>}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<TeacherDashboard />} />
                        <Route path="courses" element={<TeacherCourses />} />
                        <Route path="courses/:courseId" element={<TeacherCourseDetail />} />
                        <Route path="assignments" element={<TeacherAssignments />} />
                        <Route path="students" element={<TeacherStudents />} />
                        <Route path="announcements" element={<TeacherAnnouncements />} />
                        <Route path="live" element={<TeacherLive />} />
                        <Route path="batches" element={<TeacherBatches />} />
                        <Route path="batches/:batchId" element={<TeacherBatchDetail />} />
                        <Route path="forum" element={<ForumHome />} />
                        <Route path="forum/course/:courseId" element={<CourseForum />} />
                        <Route path="forum/thread/:threadId" element={<ThreadDetail />} />
                        <Route path="questions" element={<AdminQuestions />} />
                        <Route path="exams" element={<TeacherExams />} />
                        <Route path="notifications" element={<TeacherNotifications />} />
                        <Route path="profile" element={<TeacherProfile />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Route>

                      {/* Admin Dashboard Routes */}
                      <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="/admin" element={
                        <AdminCourseProvider>
                            <AdminSchedulerProvider>
                              <AdminGlobalProvider>
                                <AdminLayout />
                              </AdminGlobalProvider>
                            </AdminSchedulerProvider>
                        </AdminCourseProvider>
                      }>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />

                        {/* Course Management */}
                        <Route path="courses" element={<AdminCourses />} />
                        <Route path="courses/create" element={<AdminCourseCreate />} />
                        <Route path="courses/edit/:id" element={<AdminCourseCreate />} />

                        {/* Question Bank & Exams */}
                        <Route path="questions" element={<AdminQuestions />} />
                        <Route path="exams" element={<AdminExams />} />
                        <Route path="exams/create" element={<AdminExamCreate />} />
                        <Route path="exams/edit/:id" element={<AdminExamCreate />} />
                        <Route path="exams/:examId/submissions" element={<AdminSubmissionsList />} />
                        <Route path="exams/schedule" element={<AdminScheduler />} />

                        {/* Analytics */}
                        <Route path="results" element={<AdminResults />} />

                        {/* Final Phase Modules */}
                        <Route path="users-create" element={<AdminUserCreate />} />
                        <Route path="users-edit/:id" element={<AdminUserCreate />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="announcements" element={<AdminAnnouncements />} />
                        <Route path="live-classes" element={<AdminLiveClasses />} />
                        <Route path="settings" element={<AdminSettings />} />

                        {/* Placeholders / Catch-all */}
                        <Route path="scheduler" element={<Navigate to="exams/schedule" replace />} />
                        <Route path="batches" element={<AdminBatches />} />
                        <Route path="batches/create" element={<AdminBatchCreate />} />
                        <Route path="batches/edit/:id" element={<AdminBatchCreate />} />
                        <Route path="enrollment-requests" element={<AdminEnrollmentRequests />} />
                        <Route path="notifications" element={<AdminNotifications />} />
                        <Route path="admin-management" element={<AdminManagement />} />
                        <Route path="admin-management/activity-logs" element={<AllAdminActivities />} />
                        <Route path="admin-management/:id/activity" element={<AdminActivity />} />
                        <Route path="*" element={<AdminDashboard />} />
                      </Route>

                    </Routes>
                    </AdminExamProvider>
                  </AssignmentProvider>
                </ForumProvider>
              </CourseProvider>
            </main>
            {!isDashboardRoute && <Footer />}
            </div>
        </SharedAnnouncementsProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
