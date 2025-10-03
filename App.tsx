import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArtistGrid from './components/ArtistGrid';
import HowItWorksPage from './pages/HowItWorksPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProtectedRoute from './components/ProtectedRoute';
import ArtistDashboardPage from './pages/ArtistDashboardPage';
import EditProfilePage from './pages/EditProfilePage';
import EditPlansPage from './pages/EditPlansPage';
import EditRepertoirePage from './pages/EditRepertoirePage';
import EditGalleryPage from './pages/EditGalleryPage';
import EditCalendarPage from './pages/EditCalendarPage';
import EditTechPage from './pages/EditTechPage';
import EditHospitalityPage from './pages/EditHospitalityPage';
import EditTestimonialsPage from './pages/EditTestimonialsPage';
import EditFinancialsPage from './pages/EditFinancialsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminArtistsPage from './pages/admin/AdminArtistsPage';
import AdminVenuesPage from './pages/admin/AdminVenuesPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminFinancesPage from './pages/admin/AdminFinancesPage';
import VenueLoginPage from './pages/VenueLoginPage';
import VenueSignupPage from './pages/VenueSignupPage';
import VenueDashboardPage from './pages/VenueDashboardPage';
import VenueProtectedRoute from './components/VenueProtectedRoute';
import EditVenueProfilePage from './pages/EditVenueProfilePage';
import BookingPage from './pages/BookingPage';
import VenueList from './components/VenueList';
import OfferGigPage from './pages/OfferGigPage';
import OpenGigsPage from './pages/OpenGigsPage';
import GeneratePostPage from './pages/GeneratePostPage';
import ManualPage from './pages/ManualPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import DirectOffersPage from './pages/DirectOffersPage';
import SentOffersPage from './pages/SentOffersPage';
import ChatPage from './pages/ChatPage';
import ConversationsPage from './pages/ConversationsPage';
import SharedProtectedRoute from './components/SharedProtectedRoute';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ToastContainer from './components/ToastContainer';
import HomeLayout from './components/HomeLayout'; 

const App: React.FC = () => {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Admin Section with its own layout */}
        <Route 
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="artists" element={<AdminArtistsPage />} />
          <Route path="venues" element={<AdminVenuesPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="finances" element={<AdminFinancesPage />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Public-facing pages with Header/Footer */}
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/artists" element={<ArtistGrid />} />
          <Route path="/artists/:id" element={<ArtistGrid />} />
          <Route path="/venues" element={<VenueList />} />
          <Route path="/venues/:id" element={<VenueList />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/manual" element={<ManualPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<ArtistDashboardPage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/edit-plans" element={<EditPlansPage />} />
            <Route path="/edit-repertoire" element={<EditRepertoirePage />} />
            <Route path="/edit-gallery" element={<EditGalleryPage />} />
            <Route path="/edit-calendar" element={<EditCalendarPage />} />
            <Route path="/edit-tech" element={<EditTechPage />} />
            <Route path="/edit-hospitality" element={<EditHospitalityPage />} />
            <Route path="/edit-testimonials" element={<EditTestimonialsPage />} />
            <Route path="/edit-financials" element={<EditFinancialsPage />} />
            <Route path="/open-gigs" element={<OpenGigsPage />} />
            <Route path="/generate-post" element={<GeneratePostPage />} />
            <Route path="/direct-offers" element={<DirectOffersPage />} />
          </Route>

          <Route element={<VenueProtectedRoute />}>
             <Route path="/venue-dashboard" element={<VenueDashboardPage />} />
             <Route path="/edit-venue-profile" element={<EditVenueProfilePage />} />
             <Route path="/booking/:id" element={<BookingPage />} />
             <Route path="/offer-gig" element={<OfferGigPage />} />
             <Route path="/sent-offers" element={<SentOffersPage />} />
          </Route>

          <Route element={<SharedProtectedRoute />}>
            <Route path="/conversations" element={<ConversationsPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
          </Route>
        </Route>
        
        {/* Standalone pages (no Header/Footer) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/venue-login" element={<VenueLoginPage />} />
        <Route path="/venue-signup" element={<VenueSignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

      </Routes>
    </>
  );
};

export default App;