import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import './index.css'
import Login from "./section/Login";
import Search from "./section/Search";
import { UserProvider } from "./context/UserContext";



createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/search" element={<Search />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </UserProvider>
);