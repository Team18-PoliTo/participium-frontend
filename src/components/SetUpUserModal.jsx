import React from "react";
import { Modal, Container, Form, Button, Row, Col } from "react-bootstrap";
import "./styles/SetUpUserModal.css";

function SetUpUserModal({ isOpen, onClose, onCreateUser }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newUser = {
      name: formData.get("name"),
      surname: formData.get("surname"),
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };
    onCreateUser(newUser);
    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="setup-modal-dialog-custom"
      contentClassName="setup-modal-content-custom"
    >
      <Modal.Header closeButton>
        <Modal.Title>Add a new municipality user</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="setup-user-container">
          <Form onSubmit={handleSubmit} className="setup-user-form">
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
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label className="form-label">Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Choose a username"
                required
                className="form-control"
              />
            </Form.Group>
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
            <Button className="setup-user-btn" variant="primary" type="submit">
              Create User
            </Button>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default SetUpUserModal;
