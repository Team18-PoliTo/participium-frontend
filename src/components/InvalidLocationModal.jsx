import { Modal } from 'react-bootstrap';
import './styles/InvalidLocationModal.css';


function InvalidLocationModal({ showInvalidModal, setShowInvalidModal }) {
    return (
        <Modal
            show={showInvalidModal}
            onHide={() => setShowInvalidModal(false)}
            centered
            dialogClassName="invalid-location-modal"
            >
            <Modal.Header closeButton>
                <Modal.Title>Invalid position</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Please, select an area inside Turin.
            </Modal.Body>
        </Modal>
    )
}

export default InvalidLocationModal;