import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Marksheet from "./pages/Marksheet";
import VerifyMarksheet from "./pages/VerifyMarksheet";
import LandingPage from "./pages/LandingPage";
import "react-toastify/ReactToastify.css";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/marksheet" element={<Marksheet />} />
        <Route path="/verify" element={<VerifyMarksheet />} />
        <Route
          path="/verify/:enrollmentNumber/:semesterNumber"
          element={<VerifyMarksheet />}
        />
      </Routes>
    </Router>
  );
}
