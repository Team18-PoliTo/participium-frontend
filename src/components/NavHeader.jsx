import './styles/NavHeader.css';
import { Container, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';
import { useContext } from "react";
import { NavbarTextContext } from "../App";
import { UserContext } from "../App";
import API from '../API/API';

function NavHeader() {
  const { navbarText } = useContext(NavbarTextContext);
  const { loggedIn, setUser, setLoggedIn, setUserRole } = useContext(UserContext);

  const handleLogout = async () => {
    await API.logoutUser();
    setUser(null);
    setLoggedIn(false);
    setUserRole(null);
  };

  const location = useLocation();

  return(
    <Navbar className="navbar-custom">
      <Container>
        <Navbar.Brand>{navbarText}</Navbar.Brand>
        { (location.pathname == "/" || location.pathname == "/login" || location.pathname == "/register") &&
          <Link className='btn home-button' to="/login_internal_user">Municipality User Login</Link>
        }
        {
          (location.pathname == "/map" || location.pathname == "/admin") && loggedIn &&
          <Link className='btn home-button' to="/" onClick={handleLogout}>Logout</Link>
        }
        {
          (location.pathname == "/login_internal_user") &&
          <>
            <span className='navbar-center-text'>Municipality User Portal</span>
            <Link className='btn home-button' to="/login">Citizen Login</Link>
          </>
        }
      </Container>
    </Navbar>
  );
}

export default NavHeader;