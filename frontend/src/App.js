import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import JoinFamily from "./pages/JoinFamily";
import Dashboard from "./pages/Dashboard";
import Bills from "./pages/Bills";
import UploadBill from "./pages/UploadBill";
import BillDetails from "./pages/BillDetails";
import FamilyMembers from "./pages/FamilyMembers";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join-family" element={<JoinFamily />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/upload-bill" element={<UploadBill />} />
        <Route path="/bill-details" element={<BillDetails />} />
        <Route path="/family-members" element={<FamilyMembers />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;