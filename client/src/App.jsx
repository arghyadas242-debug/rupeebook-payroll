import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import AttendanceReconciliation from './pages/AttendanceReconciliation';
import RunPayroll from './pages/RunPayroll';
import PayslipView from './pages/PayslipView';
import TaxCompliance from './pages/TaxCompliance';
import Settings from './pages/Settings';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('rupeebook_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing & Authentication Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Corporate Treasury & Payroll Console */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeeDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reconciliation"
          element={
            <ProtectedRoute>
              <AttendanceReconciliation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll/run"
          element={
            <ProtectedRoute>
              <RunPayroll />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payslips"
          element={
            <ProtectedRoute>
              <PayslipView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payslips/:id"
          element={
            <ProtectedRoute>
              <PayslipView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compliance"
          element={
            <ProtectedRoute>
              <TaxCompliance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
