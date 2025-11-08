import './styles/NavHeader.css';
import { Container, Navbar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router';
import { useContext } from "react";
import { NavbarTextContext } from "../App";

function NavHeader() {
  const { navbarText } = useContext(NavbarTextContext);

  const location = useLocation();

  return(
    <Navbar className="navbar-custom">
      <Container className='mx-3'>
        <Navbar.Brand>{navbarText}</Navbar.Brand>
        { (location.pathname == "/" || location.pathname == "/login" || location.pathname == "/register") &&
          <Link className='btn home-button' to="/login_internal_user">Internal Login</Link>
        }
      </Container>
    </Navbar>
  );
}

export default NavHeader;