import "./styles/NavHeader.css";
import { Container, Navbar } from "react-bootstrap";
import { Link, useLocation } from "react-router";
import { useContext } from "react";
import { NavbarTextContext } from "../App";
import { UserContext } from "../App";
import API from "../API/API";

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

  const handleLogout = async () => {
    await API.logoutUser();
    setUser(null);
    setCitizenLoggedIn(false);
    setUserLoggedIn(false);
    setUserRole(null);
  };

  const location = useLocation();

  return (
    <Navbar className="navbar-custom">
      <Container>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Navbar.Brand>{navbarText}</Navbar.Brand>
        </Link>
        {(citizenLoggedIn || userLoggedIn) && (
          <Link className="btn home-button" to="/" onClick={handleLogout}>
            Logout
          </Link>
        )}
        {!citizenLoggedIn &&
          !userLoggedIn &&
          location.pathname !== "/login" &&
          location.pathname !== "/register" && (
            <div className="nav-auth-buttons">
              <Link className="btn nav-login-button" to="/login">
                Login
              </Link>
              <Link className="btn nav-register-button" to="/register">
                Sign Up
              </Link>
            </div>
          )}
      </Container>
    </Navbar>
  );
}

export default NavHeader;
