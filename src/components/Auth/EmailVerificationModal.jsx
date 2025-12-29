import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import PropTypes from "prop-types";
import API from "../../API/API";
import "../styles/EmailVerificationModal.css";

const EmailVerificationModal = ({ isOpen, onClose, email, onVerified }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.verifyEmail({ email, code: code.trim() });
      setSuccess(true);
      setTimeout(() => {
        onVerified?.();
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendMessage("");
    setResendLoading(true);

    try {
      await API.resendVerificationCode({ email });
      setResendMessage("Verification code sent successfully!");
    } catch (err) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleClose = () => {
    setCode("");
    setError("");
    setSuccess(false);
    setResendMessage("");
    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleClose}
      size="md"
      centered
      backdrop="static"
      keyboard={false}
      className="email-verification-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Verify Your Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success ? (
          <Alert variant="success">
            <Alert.Heading>Email verified successfully!</Alert.Heading>
            <p className="mb-0">Redirecting...</p>
          </Alert>
        ) : (
          <>
            <p className="verification-instructions">
              We&apos;ve sent a 6-digit verification code to:
            </p>
            <p className="email-display">
              <strong>{email}</strong>
            </p>
            <p className="verification-instructions">
              Please enter the code below to verify your email address.
            </p>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            {resendMessage && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setResendMessage("")}
              >
                {resendMessage}
              </Alert>
            )}

            <Form onSubmit={handleVerify}>
              <Form.Group className="mb-3" controlId="verificationCode">
                <Form.Label>Verification Code</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  pattern="\d{6}"
                  required
                  disabled={loading}
                  className="code-input"
                  autoComplete="off"
                />
                <Form.Text className="text-muted">
                  The code is valid for 30 minutes.
                </Form.Text>
              </Form.Group>

              <div className="button-group">
                <Button
                  className="verify-btn"
                  variant="primary"
                  type="submit"
                  disabled={loading || code.length !== 6}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </Button>
              </div>
            </Form>

            <div className="resend-section">
              <p className="resend-text">Did not receive the code?</p>
              <Button
                variant="link"
                onClick={handleResend}
                disabled={resendLoading}
                className="resend-btn"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </Button>
              <p className="resend-info">
                You can request a new code after 2 minutes (max 3 per hour).
              </p>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

EmailVerificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  onVerified: PropTypes.func,
};

export default EmailVerificationModal;
