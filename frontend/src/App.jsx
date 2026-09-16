import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Equipment from './pages/Equipment'
import CreateRental from './pages/CreateRental'
import RentalsList from './pages/RentalsList'
import ReturnEquipment from './pages/ReturnEquipment'
import StaffManagement from './pages/StaffManagement'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import UserManagement from './pages/UserManagement'
import './App.css'

function AppLayout() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login'

  return (
    <div className={hideNavbar ? 'app-shell login-shell' : 'app-shell'}>
      {!hideNavbar && <Navbar />}
      <main className={hideNavbar ? 'app-content login-content' : 'app-content'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
          <Route path="/create-rental" element={<ProtectedRoute><CreateRental /></ProtectedRoute>} />
          <Route path="/rentals" element={<ProtectedRoute><RentalsList /></ProtectedRoute>} />
          <Route path="/return-equipment" element={<ProtectedRoute><ReturnEquipment /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin']}><Reports /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppLayout />
      </Router>
    </Provider>
  )
}

export default App
