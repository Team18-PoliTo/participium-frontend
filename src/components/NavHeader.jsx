import "./styles/NavHeader.css";
import { Container, Navbar } from "react-bootstrap";
import { Link, useLocation } from "react-router";
import { useContext, useState } from "react";
import { NavbarTextContext, UserContext, MobileContext } from "../App";
import API from "../API/API";
import { Menu, X } from "lucide-react";

function NavHeader() {
  const { navbarText } = useContext(NavbarTextContext);
  const {
    citizenLoggedIn,
    setCitizenLoggedIn,
    setUser,
    userLoggedIn,
    setUserLoggedIn,
    setUserRole,
  } = useContext(UserContext);
  const { isMobile } = useContext(MobileContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await API.logoutUser();
    setUser(null);
    setCitizenLoggedIn(false);
    setUserLoggedIn(false);
    setUserRole(null);
    setIsMenuOpen(false);
  };

  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Overlay per chiudere il menu */}
      {isMobile && isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenu}></div>
      )}
      
      <div style={{ position: 'relative' }}>
        <Navbar className="navbar-custom">
          <Container>
            <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
              <Navbar.Brand>{navbarText}</Navbar.Brand>
            </Link>
            
            {isMobile ? (
              // Mobile hamburger menu
              <button 
                className="hamburger-button" 
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            ) : (
              // Desktop buttons
              <>
                {(citizenLoggedIn || userLoggedIn) && (
                  <Link className="btn home-button" to="/" onClick={handleLogout}>
                    Logout
                  </Link>
                )}
                {!citizenLoggedIn && !userLoggedIn && (
                  <div className="nav-auth-buttons">
                    <Link className="btn nav-login-button" to="/login">
                      Login
                    </Link>
                    <Link className="btn nav-register-button" to="/register">
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </Container>
        </Navbar>
        
        {/* Mobile dropdown menu - sotto la navbar */}
        {isMobile && (
          <div className={`mobile-dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
            <div className="mobile-menu-content">
              {(citizenLoggedIn || userLoggedIn) ? (
                <Link 
                  className="mobile-menu-item" 
                  to="/" 
                  onClick={handleLogout}
                >
                  Logout
                </Link>
              ) : (
                <>
                  <Link 
                    className="mobile-menu-item" 
                    to="/login"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    className="mobile-menu-item" 
                    to="/register"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default NavHeader;
