import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/actions/authActions'
import './Navbar.css'
import {
  DashboardIcon,
  NewRentalIcon,
  RentalsIcon,
  ReturnEquipmentIcon,
  EquipmentIcon,
  ReportsIcon,
  ProfileIcon,
  CustomerIcon,
  StaffIcon
} from './navbarIcons'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useSelector(state => state.auth)
  const isActive = (path) => location.pathname === path
  const isAdmin = auth.user?.role === 'Admin'

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const isAuthenticated = !!auth.token

  return (
    <nav className="navbar">
        {/* <div className="sidebar-rail">
        <Link to="/" className="rail-logo" aria-label="Rento dashboard home">
          <span className="rail-logo-mark">
            <DashboardIcon />
          </span>
        </Link>

        {isAuthenticated && (
          <div className="rail-icons">
            <Link to="/" className={`rail-link ${isActive('/') ? 'active' : ''}`} aria-label="Dashboard">
              <DashboardIcon />
            </Link>
            <Link to="/create-rental" className={`rail-link ${isActive('/create-rental') ? 'active' : ''}`} aria-label="New rental">
              <NewRentalIcon />
            </Link>
            <Link to="/rentals" className={`rail-link ${isActive('/rentals') ? 'active' : ''}`} aria-label="Rentals">
              <RentalsIcon />
            </Link>
            <Link to="/return-equipment" className={`rail-link ${isActive('/return-equipment') ? 'active' : ''}`} aria-label="Return equipment">
              <ReturnEquipmentIcon />
            </Link>
            <Link to="/equipment" className={`rail-link ${isActive('/equipment') ? 'active' : ''}`} aria-label="Equipment">
              <EquipmentIcon />
            </Link>
            <Link to="/reports" className={`rail-link ${isActive('/reports') ? 'active' : ''}`} aria-label="Reports">
              <ReportsIcon />
            </Link>
            <Link to="/profile" className={`rail-link ${isActive('/profile') ? 'active' : ''}`} aria-label="Profile">
              <ProfileIcon />
            </Link>
          </div>
        )}
      </div>*/}

      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <span className="brand-mark">
          <img src="/images/logo3.jpeg" alt="" />
            </span>
            <div>
              <h1>Rento</h1>
              <p>Operations Hub</p>
            </div>
          </Link>
        </div>

        {isAuthenticated ? (
          <>
            <div className="nav-section">
              <span className="nav-label">Workspace</span>
              <ul className="navbar-menu">
                <li><Link to="/" className={isActive("/") ? "active" : ""}><DashboardIcon />Dashboard</Link></li>
                <li><Link to="/create-rental" className={isActive("/create-rental") ? "active" : ""}><NewRentalIcon />New Rental</Link></li>
                <li><Link to="/rentals" className={isActive("/rentals") ? "active" : ""}><RentalsIcon />Rentals</Link></li>
                <li><Link to="/return-equipment" className={isActive("/return-equipment") ? "active" : ""}><ReturnEquipmentIcon />Returns</Link></li>
                <li><Link to="/equipment" className={isActive("/equipment") ? "active" : ""}><EquipmentIcon />Equipment</Link></li>
                {isAdmin && (
                  <li><Link to="/reports" className={isActive("/reports") ? "active" : ""}><ReportsIcon />Reports</Link></li>
                )}
              </ul>
            </div>

            {isAdmin && (
              <div className="nav-section">
                <span className="nav-label">Management</span>
                <ul className="navbar-menu">
                  <li><Link to="/staff" className={isActive("/staff") ? "active" : ""}><StaffIcon />Staff Management</Link></li>
                  <li><Link to="/users" className={isActive("/users") ? "active" : ""}><CustomerIcon />Customer Management</Link></li>
                </ul>
              </div>
            )}

            <div className="nav-section">
              <span className="nav-label">Account</span>
              <ul className="navbar-menu">
                <li><Link to="/profile" className={isActive("/profile") ? "active" : ""}><ProfileIcon />Profile</Link></li>
              </ul>
            </div>

            <div className="sidebar-footer">
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  {(auth.user?.name || auth.user?.email || 'R').charAt(0).toUpperCase()}
                </div>
                <div className="sidebar-user-copy">
                  <strong>{auth.user?.name || 'Rento User'}</strong>
                  <span>{auth.user?.role || auth.user?.email || 'Team member'}</span>
                </div>
              </div>

              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <ul className="navbar-menu">
            <li><Link to="/login">Login</Link></li>
          </ul>
        )}
      </div>
    </nav>
  )
}

export default Navbar
