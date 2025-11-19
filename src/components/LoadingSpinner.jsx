import { Container, Spinner } from "react-bootstrap";
import "./styles/LoadingSpinner.css";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Container 
      className="d-flex flex-column justify-content-center align-items-center gap-3" 
      style={{ minHeight: "80vh" }}
    >
      <Spinner animation="border" role="status" className="custom-spinner">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <p className="text-muted">{message}</p>
    </Container>
  );
}

export default LoadingSpinner;