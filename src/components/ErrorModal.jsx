import { Modal } from 'react-bootstrap';
import './styles/ErrorModal.css';

const ErrorModal = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
      className="error-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
    </Modal>
  );
};

export default ErrorModal;

