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

  return (
    <>
      <Navbar className="navbar-custom">
        <Container>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Navbar.Brand>{navbarText}</Navbar.Brand>
          </Link>
          
          {isMobile ? (
            // Mobile hamburger menu
            <button 
              className="hamburger-button" 
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
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
      
      {/* Overlay - solo se menu aperto */}
      {isMobile && isMenuOpen && (
        <div className="menu-overlay" onClick={toggleMenu}></div>
      )}
      
      {/* Mobile side menu - solo se menu aperto */}
      {isMobile && isMenuOpen && (
        <div className="mobile-side-menu open">
          <div className="mobile-menu-header">
            <button 
              className="close-menu-button" 
              onClick={toggleMenu}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
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
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  className="mobile-menu-item" 
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default NavHeader;
