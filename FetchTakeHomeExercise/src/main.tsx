import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import './index.css'
import Login from "./section/Login";
import Search from "./section/Search";



createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login route */}
      <Route path="/login" element={<Login />} />

      {/* search route */}
      <Route
        path="/search"
        element={
            <Search />
        }
      />

      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);