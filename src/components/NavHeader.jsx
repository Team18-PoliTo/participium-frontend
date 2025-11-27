import "./styles/NavHeader.css";
import { Container, Navbar } from "react-bootstrap";
import { Link, useLocation } from "react-router";
import { useContext, useState, useEffect } from "react";
import { NavbarTextContext, UserContext, MobileContext } from "../App";
import API from "../API/API";
import { Menu, X, Map, User, LogOut, LogIn, UserPlus } from "lucide-react"; // Icone aggiunte: Map, User, LogOut, LogIn, UserPlus

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

  // chiudi il menu quando si scrolla / touch-move / resize (mobile)
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleCloseOnScroll = () => {
      setIsMenuOpen(false);
    };

    window.addEventListener("scroll", handleCloseOnScroll, { passive: true });
    window.addEventListener("touchmove", handleCloseOnScroll, { passive: true });
    window.addEventListener("resize", handleCloseOnScroll);

    return () => {
      window.removeEventListener("scroll", handleCloseOnScroll);
      window.removeEventListener("touchmove", handleCloseOnScroll);
      window.removeEventListener("resize", handleCloseOnScroll);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Overlay per chiudere il menu */}
      {isMobile && isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenu}></div>
      )}

      <div style={{ position: "relative" }}>
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
                  <div className="nav-auth-buttons">
                    {
                      citizenLoggedIn && location.pathname !== "/map" && (
                        <Link className="btn home-button" to="/map">
                          <Map size={20} className="me-2" /> Map
                        </Link>
                      )
                    }
                    {citizenLoggedIn && location.pathname !== "/profile" && (
                      <Link className="btn home-button" to="/profile">
                        <User size={20} className="me-2" /> Profile
                      </Link>
                    )}
                    <Link
                      className="btn home-button"
                      to="/"
                      onClick={handleLogout}
                    >
                      <LogOut size={20} className="me-2" /> Logout
                    </Link>
                  </div>
                )}
                {!citizenLoggedIn && !userLoggedIn && (
                  <div className="nav-auth-buttons">
                    <Link className="btn nav-login-button" to="/login">
                      <LogIn size={20} className="me-2" /> Login
                    </Link>
                    <Link className="btn nav-register-button" to="/register">
                      <UserPlus size={20} className="me-2" /> Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </Container>
        </Navbar>

        {/* Mobile dropdown menu - sotto la navbar */}
        {isMobile && (
          <div className={`mobile-dropdown-menu ${isMenuOpen ? "open" : ""}`}>
            <div className="mobile-menu-content">
              {citizenLoggedIn || userLoggedIn ? (
                <>
                  {citizenLoggedIn && location.pathname !== "/map" && (
                    <Link
                      className="mobile-menu-item"
                      to="/map"
                      onClick={closeMenu}
                    >
                      <Map size={20} className="me-2" /> Map
                    </Link>
                  )}
                  {citizenLoggedIn && location.pathname !== "/profile" && (
                    <Link
                      className="mobile-menu-item"
                      to="/profile"
                      onClick={closeMenu}
                    >
                      <User size={20} className="me-2" /> Profile
                    </Link>
                  )}
                  <Link
                    className="mobile-menu-item"
                    to="/"
                    onClick={handleLogout}
                  >
                    <LogOut size={20} className="me-2" /> Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    className="mobile-menu-item"
                    to="/login"
                    onClick={closeMenu}
                  >
                    <LogIn size={20} className="me-2" /> Login
                  </Link>
                  <Link
                    className="mobile-menu-item"
                    to="/register"
                    onClick={closeMenu}
                  >
                    <UserPlus size={20} className="me-2" /> Sign Up
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
