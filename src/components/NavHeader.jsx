import './styles/NavHeader.css';
import { Container, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';
import { useContext } from "react";
import { NavbarTextContext } from "../App";
import { UserContext } from "../App";
import API from '../API/API';

function NavHeader() {
  const { navbarText } = useContext(NavbarTextContext);
  const { citizenLoggedIn, setCitizenLoggedIn, setUser, userLoggedIn, setUserLoggedIn, setUserRole } = useContext(UserContext);

  const handleLogout = async () => {
    await API.logoutUser();
    setUser(null);
    setCitizenLoggedIn(false);
    setUserLoggedIn(false);
    setUserRole(null);
  };

  const location = useLocation();

  return(
    <Navbar className="navbar-custom">
      <Container>
        <Navbar.Brand>{navbarText}</Navbar.Brand>
        {
          (location.pathname == "/map" || location.pathname == "/admin") && (citizenLoggedIn || userLoggedIn) &&
          <Link className='btn home-button' to="/login" onClick={handleLogout}>Logout</Link>
        }
      </Container>
    </Navbar>
  );
}

export default NavHeader;