// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import UploadLostItemForm from "./components/UploadLostItemForm";
import LostItemsGallery from "./components/LostItemsGallery";
import Callback from "./components/Callback";
import VerifyItem from "./components/VerifyItem";
import UserProfile from "./components/UserProfile";

export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/upload" element={<UploadLostItemForm />} />
                <Route path="/dashboard" element={<LostItemsGallery />} /> {/* public gallery */}
                <Route path="/my-profile" element={<UserProfile />} /> {/* route to /my-profile */}
                <Route path="/callback" element={<Callback />} />
                <Route path="/verify/:verificationCode" element={<VerifyItem />} />
            </Routes>
        </Router>
    );
}