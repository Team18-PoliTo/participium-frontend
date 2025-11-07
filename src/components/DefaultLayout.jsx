import { Container } from "react-bootstrap";
import { Outlet } from "react-router";
import NavHeader from "./NavHeader";
//import Footer from "./Footer";

function DefaultLayout() {
  return (
    <>
      <NavHeader />
      <Container fluid >
        <Outlet />
      </Container>
      
    </>
  );
}

export default DefaultLayout;
