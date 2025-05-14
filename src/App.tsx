import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Children from "./pages/Children";
import WednesdayReservations from "./pages/WednesdayReservations";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminNewReservation from "./pages/admin/AdminNewReservation";
import AdminNewTeenHolidayReservation from "./pages/admin/AdminNewTeenHolidayReservation";
import AdminEditReservation from "./pages/admin/AdminEditReservation";
import AdminEditHolidayReservation from "./pages/admin/AdminEditHolidayReservation";
import AdminHolidayReservations from "./pages/admin/AdminHolidayReservations";
import AdminNewWednesday from "./pages/admin/AdminNewWednesday";
import AdminEditWednesday from "./pages/admin/AdminEditWednesday";
import AdminWednesdayList from "./pages/admin/AdminWednesdayList";
import AdminNewHoliday from "./pages/admin/AdminNewHoliday";
import AdminEditHoliday from "./pages/admin/AdminEditHoliday";
import AdminHolidayList from "./pages/admin/AdminHolidayList";
import AdminNewUser from "./pages/admin/AdminNewUser";
import AdminEditUser from "./pages/admin/AdminEditUser";
import AdminUserList from "./pages/admin/AdminUserList";
import AdminNewChild from "./pages/admin/AdminNewChild";
import AdminEditChild from "./pages/admin/AdminEditChild";
import AdminChildList from "./pages/admin/AdminChildList";
import AdminNewRdv from "./pages/admin/AdminNewRdv";
import AdminEditRdv from "./pages/admin/AdminEditRdv";
import AdminRdvList from "./pages/admin/AdminRdvList";
import AdminPrices from "./pages/admin/AdminPrices";
import AdminTerms from "./pages/admin/AdminTerms";
import AdminHolidayProgram from "./pages/admin/AdminHolidayProgram";
import Prices from "./pages/Prices";
import TermsOfOperation from "./pages/TermsOfOperation";
import HolidayProgram from "./pages/HolidayProgram";
import TeenHolidayReservations from "./pages/TeenHolidayReservations";
import HolidayReservations from "./pages/HolidayReservations";
import RdvPage from "./pages/Rdv";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/terms-of-operation" element={<TermsOfOperation />} />
        <Route path="/holiday-program" element={<HolidayProgram />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/children" element={<Children />} />
          <Route path="/wednesday-reservations" element={<WednesdayReservations />} />
          <Route path="/holiday-reservations" element={<HolidayReservations />} />
          <Route path="/teenholiday-reservations" element={<TeenHolidayReservations />} />
          <Route path="/rdv" element={<RdvPage />} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
        <Route path="/admin/reservations" element={<ProtectedRoute adminOnly={true}><AdminReservations /></ProtectedRoute>} />
        <Route path="/admin/reservations/new" element={<ProtectedRoute adminOnly={true}><AdminNewReservation /></ProtectedRoute>} />
        <Route path="/admin/reservations/new-teen-holiday" element={<ProtectedRoute adminOnly={true}><AdminNewTeenHolidayReservation /></ProtectedRoute>} />
        <Route path="/admin/reservations/:id" element={<ProtectedRoute adminOnly={true}><AdminEditReservation /></ProtectedRoute>} />
        <Route path="/admin/holiday-reservations/:id" element={<ProtectedRoute adminOnly={true}><AdminEditHolidayReservation /></ProtectedRoute>} />
        <Route path="/admin/holiday-reservations" element={<ProtectedRoute adminOnly={true}><AdminHolidayReservations /></ProtectedRoute>} />
        <Route path="/admin/wednesdays/new" element={<ProtectedRoute adminOnly={true}><AdminNewWednesday /></ProtectedRoute>} />
        <Route path="/admin/wednesdays/:id" element={<ProtectedRoute adminOnly={true}><AdminEditWednesday /></ProtectedRoute>} />
        <Route path="/admin/wednesdays" element={<ProtectedRoute adminOnly={true}><AdminWednesdayList /></ProtectedRoute>} />
        <Route path="/admin/holidays/new" element={<ProtectedRoute adminOnly={true}><AdminNewHoliday /></ProtectedRoute>} />
        <Route path="/admin/holidays/:id" element={<ProtectedRoute adminOnly={true}><AdminEditHoliday /></ProtectedRoute>} />
        <Route path="/admin/holidays" element={<ProtectedRoute adminOnly={true}><AdminHolidayList /></ProtectedRoute>} />
        <Route path="/admin/users/new" element={<ProtectedRoute adminOnly={true}><AdminNewUser /></ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute adminOnly={true}><AdminEditUser /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUserList /></ProtectedRoute>} />
        <Route path="/admin/children/new" element={<ProtectedRoute adminOnly={true}><AdminNewChild /></ProtectedRoute>} />
        <Route path="/admin/children/:id" element={<ProtectedRoute adminOnly={true}><AdminEditChild /></ProtectedRoute>} />
        <Route path="/admin/children" element={<ProtectedRoute adminOnly={true}><AdminChildList /></ProtectedRoute>} />
         <Route path="/admin/rdvs/new" element={<ProtectedRoute adminOnly={true}><AdminNewRdv /></ProtectedRoute>} />
        <Route path="/admin/rdvs/:id" element={<ProtectedRoute adminOnly={true}><AdminEditRdv /></ProtectedRoute>} />
        <Route path="/admin/rdvs" element={<ProtectedRoute adminOnly={true}><AdminRdvList /></ProtectedRoute>} />
        <Route path="/admin/prices" element={<ProtectedRoute adminOnly={true}><AdminPrices /></ProtectedRoute>} />
        <Route path="/admin/terms" element={<ProtectedRoute adminOnly={true}><AdminTerms /></ProtectedRoute>} />
        <Route path="/admin/holiday-program" element={<ProtectedRoute adminOnly={true}><AdminHolidayProgram /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
