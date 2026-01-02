import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import BlokPage from "./pages/Dashboard/BlokPage";
import RumahPage from "./pages/Dashboard/RumahPage";
import BookingAdminPage from "./pages/Dashboard/BookingAdminPage";
import UsersPage from "./pages/Dashboard/UsersPage";
import AppLayout from "./layout/AppLayout";
import AppLayoutUser from "./layout/AppLayoutUser";
import { ScrollToTop } from "./components/common/ScrollToTop";
import DashboardAdmin from "./pages/Dashboard/Home";
import Calendar from "./pages//OtherPage/Calendar";
import UserProfiles from "./pages/Dashboard/UserProfiles";
import LandingPage from "./pages/OtherPage/LandingPage";
import DashboardUser from "./pages/Dashboard/UserDashboard";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>

            {/* Others Page */}
             <Route path="/dashboardadmin" element={<DashboardAdmin/>} />
            <Route path="/blok" element={<BlokPage/>} />
            <Route path="/rumah" element={<RumahPage />} />
            <Route path="/booking" element={<BookingAdminPage/>} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/calender" element={<Calendar />} />
            <Route path="/profile" element={<UserProfiles />} />

          </Route>

          <Route element={<AppLayoutUser />}>
  <Route path="/dashboarduser" element={<DashboardUser />} />
</Route>


          <Route index path="/" element={<LandingPage/>} />
          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
