import { useState, useActionState, useContext } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { RegistrationSuccessfulModal } from "./AuthModals";
import { UserContext } from "../App";
import API from "../API/API";
import ErrorModal from "./ErrorModal";
import "./styles/Registration.css";

function Registration() {
  const [, formAction, isPending] = useActionState(registrationFunction, {
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
  });

  const { setCitizenLoggedIn, setUser } = useContext(UserContext);
  const [errorModalShow, setErrorModalShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModalShow, setSuccessModalShow] = useState(false);

  const navigate = useNavigate();

  async function registrationFunction(prevState, formData) {
    const credentials = {
      name: formData.get("name").trim(),
      surname: formData.get("surname").trim(),
      username: formData.get("username").trim(),
      email: formData.get("email").trim(),
      password: formData.get("password"),
    };
    try {
      // Register the citizen
      const citizen = await API.registerCitizen(credentials);

      // Automatically login after registration
      await API.loginCitizen({
        email: credentials.email,
        password: credentials.password,
      });

      // Get user info and update context
      const user = await API.getUserInfo();
      setUser(user);
      setCitizenLoggedIn(true);

      // Navigate to how it works page
      navigate("/how-it-works");

      return { ...prevState, citizen };
    } catch (error) {
      setErrorMessage(error.message);
      setErrorModalShow(true);
    }
  }

  return (
    <div className="registration-wrapper">
      <Container className="registration-container">
        <Form action={formAction} className="registration-form">
          {isPending && <div className="loading-indicator">Registering...</div>}
          <Row className="mb-3">
            <Col>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formSurname">
                <Form.Label>Surname</Form.Label>
                <Form.Control
                  type="text"
                  name="surname"
                  placeholder="Enter your surname"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Choose a username"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </Form.Group>

          <div className="login-link-text">
            If you already have an account, <Link to="/login">login</Link>
          </div>

          <Button
            className="register-btn"
            variant="primary"
            type="submit"
            disabled={isPending}
          >
            Register
          </Button>
        </Form>
      </Container>

      {/* Modale errore */}
      <ErrorModal
        isOpen={errorModalShow}
        onClose={() => setErrorModalShow(false)}
        title="Registration error"
        message={errorMessage}
      />

      {/* Modale successo */}
      <RegistrationSuccessfulModal
        isOpen={successModalShow}
        onClose={() => setSuccessModalShow(false)}
      />
    </div>
  );
}

export default Registration;
