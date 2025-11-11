import { Modal } from "react-bootstrap";
import "./styles/ReportStatusModal.css";

/**
 * ReportStatusModal Component
 *
 * A modal to show success or error messages after report submission
 *
 * @param {boolean} show - Whether the modal is visible
 * @param {Function} onClose - Callback function when modal is closed
 * @param {boolean} isSuccess - True for success message, false for error
 * @param {string} message - The message to display
 */
function ReportStatusModal({ show, onClose, isSuccess, message }) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName={
        isSuccess ? "report-status-modal success" : "report-status-modal error"
      }
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {isSuccess ? (
            <>
              <i className="bi bi-check-circle-fill me-2"></i>
              Success
            </>
          ) : (
            <>
              <i className="bi bi-exclamation-circle-fill me-2"></i>
              Error
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
    </Modal>
  );
}

export default ReportStatusModal;
