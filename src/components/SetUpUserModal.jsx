import React, { useState } from "react";
import {
  Modal,
  Container,
  Form,
  Button,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import "./styles/SetUpUserModal.css";

function SetUpUserModal({ isOpen, onClose, onCreateUser }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.target);
    const newUser = {
      name: formData.get("name"),
      surname: formData.get("surname"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      await onCreateUser(newUser);
      handleClose();
      event.target.reset();
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
      className="setup-user-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Add a new municipality user</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="setup-user-container">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit} className="setup-user-form">
            {isLoading && <div className="loading-indicator">Creating...</div>}
            <Row className="mb-3">
              <Col>
                <Form.Group controlId="formName">
                  <Form.Label className="form-label">Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter name"
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formSurname">
                  <Form.Label className="form-label">Surname</Form.Label>
                  <Form.Control
                    type="text"
                    name="surname"
                    placeholder="Enter surname"
                    required
                    className="form-control"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label className="form-label">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                required
                className="form-control"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label className="form-label">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                required
                className="form-control"
              />
            </Form.Group>
            <Button
              className="setup-user-btn"
              variant="primary"
              type="submit"
              disabled={isLoading}
            >
              Create User
            </Button>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default SetUpUserModal;
