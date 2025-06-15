import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast'
import { useAuth } from './context/AuthContext';
// Pages
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPassword';
import ChildAbuse from './pages/ChildAbuse';
import Discover from './pages/DiscoverPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import Dashboard from './pages/Dashboard/NewDashboard';
import Robots from "./robots.txt"
import ChatPage from './pages/ChatPage';
import NearbyProfessionals from './pages/NetworkPage';
import NotFoundPage from './pages/NotFoundPage';
import SettingsPage from './pages/SettingsPage';
import NetworkPage from './components/network/NearbyProfessional';
import CreateStoryPage from './pages/CreateStroyPage';
import StoryViewPage from './pages/StoryViewPage';
import CreatePost from './components/posts/CreatePost';
import ProfilePage from './pages/ProfilePage';
import PortfolioPage from './pages/PortfolioPage';
import AddAchievementForm from './components/profile/AddAchievementForm';
import AddProjectForm from './components/profile/AddProjectForm';
import ProfileViewersPage from './pages/ProfileViewerPage';
import RecommendedConnections from './pages/RecommendedConnections';
import EditProfilePage from './pages/EditProfilePage';
import NetworkExplorePage from './pages/NetworkExplorePage';
import ProjectCreationPage from './components/portfolio/ProjectCreation';
import ConnectionRequestPage from './pages/ConnectionRecommendation';
import AchievementCreationPage from './components/portfolio/AchievementCreation';
import StreakCreationPage from './components/portfolio/StreakCreation';
import PostsFetcher from './pages/PostFetcher';
import LinkCall from './pages/LinkCall';
// import LandingPage from './pages/LandingPage';
import { BhoomiLandingPage } from './pages/BhoomiLandingPage/BhoomiLandingPage';
// Event Management Pages
import EventListingPage from './pages/EventsListingPage';
// import EventDetailPage from './pages/EventDetailPage';
import {EventDetailPage} from './pages/EventDetailPage/EventDetailPage';
import EventCreationPage from './pages/EventCreationPage';
import TicketPurchasePage from './pages/TicketPurchasePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import TicketBookingPage from './pages/TicketBookingPage';
import TicketConfirmationPage from './pages/TicketConfirmationPage';
import MyEventsPage from './pages/MyEventsPage';
import MyTicketsPage from './pages/MyTicketsPage';
import EventDashboardPage from './pages/EventsDashboard';
import CreateTicketsPage from './pages/CreateTicketsPage';
import AttendeeManagementPage from './pages/AttendeeManagementPage'; 
import TicketManagementPage from './pages/TicketManagementPage';
import CheckInPage from './pages/CheckInPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CustomFormCreatorPage from './pages/CustomFormCreatorPage';
import CustomFormSubmissionPage from './pages/CustomFormSubmissionPage';
import CustomFormSubmissionsPage from './pages/CustomFormSubmissionsPage';
import TermsAndConditions from './pages/TermsAndConditions';
import Refundpolicy from './pages/RefundPolicy';
import PaymentResponsePage from './pages/PaymentResponsePage';
import EditEventForm from './pages/EditEventPage';
import EditFormPage from './pages/EditFormPage';
import CouponManagementPage from './pages/CouponManagementPage';
import QRCertificateGenerator from "./pages/CertificateCreation.jsx"
import RegisterEvent from './pages/RegisterEvent';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // If authentication is still loading, you could show a loading spinner
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If user is not logged in, redirect to landing page
  if (!user) {
    return <Navigate to="/landingpage" replace />;
  }
  
  // If user is logged in, render the protected component
  return children;
};

const WithAuth = ({ children }) => {
  const { user, logout } = useAuth();
  return children(user, logout);
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
          <ToastProvider>
        <Routes>
          {/* Public Routes - Accessible without authentication */}
          {/*<Route path="/landingpage" element={<LandingPage />} />*/}
          <Route path="/landingpage" element={<BhoomiLandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/signup" element={<AuthPage type="signup" />} />
          <Route path="/phone-login" element={<AuthPage type="phone-login" />} />
          <Route path="/auth/callback" element={<AuthPage />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/termsandconditons" element={<TermsAndConditions/>} />
          <Route path="/refundpolicy" element={<Refundpolicy/>} />
          <Route path="/auth/linkedin-callback" element={<LinkCall />} />
          
          {/* Protected Routes - Require authentication */}
          <Route path="/profile-setup" element={
            <ProtectedRoute>
              <ProfileSetupPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          
          {/* Profile Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path = "/robots.txt" element ={<Robots/>} />
          <Route path="/profile/:userId" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/form/create" element={
            <ProtectedRoute>
              <CustomFormCreatorPage />
            </ProtectedRoute>
          } />
           <Route path="/events/:eventId/register-event" element={
            <ProtectedRoute>
              <RegisterEvent />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/edit" element={
            <ProtectedRoute>
              <EditEventForm />
            </ProtectedRoute>
          } />
            <Route path="/events/:eventId/coupons" element={<CouponManagementPage />} />
          <Route path="/events/:eventId/form" element={
            <ProtectedRoute>
              <CustomFormSubmissionPage />
            </ProtectedRoute>
          } />
           <Route path="/events/:eventId/form/edit" element={
            <ProtectedRoute>
             <EditFormPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/submissions" element={
            <ProtectedRoute>
              <CustomFormSubmissionsPage />
            </ProtectedRoute>
          } />
          
          {/* Network Routes */}
          <Route path="/network" element={
            <ProtectedRoute>
              <NetworkExplorePage />
            </ProtectedRoute>
          } />
          <Route path="/childabuse" element={
            <ProtectedRoute>
            <ChildAbuse/>
            </ProtectedRoute>
          } />
          <Route path="/network/:section" element={
            <ProtectedRoute>
              <NetworkPage />
            </ProtectedRoute>
          } />
          
          <Route path="/network/suggested" element={
            <ProtectedRoute>
              <RecommendedConnections />
            </ProtectedRoute>
          } />
          
          <Route path="/network/nearby" element={
            <ProtectedRoute>
              <NearbyProfessionals />
            </ProtectedRoute>
          } />
          
          <Route path='/psf' element={
            <ProtectedRoute>
              <PostsFetcher/>
            </ProtectedRoute>
          } />
           <Route path='/certificate' element={
            <ProtectedRoute>
              <QRCertificateGenerator/>
            </ProtectedRoute>
          } />
          {/* Chat Routes */}
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          
          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          
          <Route path="/posts/create" element={
            <ProtectedRoute>
              <CreatePost/>
            </ProtectedRoute>
          } />
          
          <Route path="/stories/create" element={
            <ProtectedRoute>
              <CreateStoryPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/stories/view" element={
            <ProtectedRoute>
              <StoryViewPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <PortfolioPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/projects/new" element={
            <ProtectedRoute>
              <ProjectCreationPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/achievements/new" element={
            <ProtectedRoute>
              <AchievementCreationPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio/streak/new" element={
            <ProtectedRoute>
              <StreakCreationPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/porfile/views" element={
            <ProtectedRoute>
              <ProfileViewersPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/connections" element={
            <ProtectedRoute>
              <ConnectionRequestPage/>
            </ProtectedRoute>
          } />
          
          {/* Event Management Routes */}
          <Route path="/events" element={
            <ProtectedRoute>
              <EventListingPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/events/new" element={
            <ProtectedRoute>
              <EventCreationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId" element={
            <ProtectedRoute>
              <WithAuth>
                {(user, logout) => <EventDetailPage user={user} onLogout={logout} />}
              </WithAuth>
            </ProtectedRoute>
          } />
          
          <Route path="/events/create" element={
            <ProtectedRoute>
              <EventCreationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/edit" element={
            <ProtectedRoute>
              <EventCreationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/tickets" element={
            <ProtectedRoute>
              <TicketBookingPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/manage" element={
            <ProtectedRoute>
              <EventDashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/attendees" element={
            <ProtectedRoute>
              <AttendeeManagementPage />
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/tickets/create" element={
            <ProtectedRoute>
              <CreateTicketsPage/>
            </ProtectedRoute>
          } />
            
            <Route path="/events/:eventId/tickets/manage" element={
            <ProtectedRoute>
              <TicketManagementPage/>
            </ProtectedRoute>
          } />
          
          <Route path="/events/:eventId/checkin" element={
            <ProtectedRoute>
              <CheckInPage />
            </ProtectedRoute>
          } />
          
          {/* My Events & Tickets */}
          <Route path="/my-events" element={
            <ProtectedRoute>
              <MyEventsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/tickets" element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/tickets/book/:eventId" element={
            <ProtectedRoute>
              <TicketPurchasePage />
            </ProtectedRoute>
          } />
          
          <Route path="/tickets/confirmation/:bookingId" element={
            <ProtectedRoute>
              <TicketConfirmationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/payment/success/:bookingId" element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          } />
          <Route path="/payment-response" element={
  <ProtectedRoute>
    <PaymentResponsePage />
  </ProtectedRoute>
} />
          <Route path="/discover" element={
            <ProtectedRoute>
              <Discover/>
            </ProtectedRoute>
          } />
          
          {/* Redirect root to dashboard if logged in, otherwise to landing page */}
          <Route path="/" element={
            <WithAuth>
              {(user) => user ? <Navigate to="/dashboard" replace /> : <Navigate to="/landingpage" replace />}
            </WithAuth>
          } />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
          </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
