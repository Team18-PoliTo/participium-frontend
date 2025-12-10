import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import API from "../API/API";
import ReportInfo from "./ReportInfo";
import { Hammer, CheckCircle, PauseCircle } from "lucide-react";
import "./styles/ReportDescription.css"; // Riutilizziamo lo stile base

function MaintainerReportModal({ show, onHide, report, onReportUpdated }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [actionType, setActionType] = useState(null); // 'In Progress', 'Resolved', 'Suspended'

  useEffect(() => {
    if (report) {
      setNote("");
      setError(null);
      setSuccessData(null);
      setActionType(null);
    }
  }, [report]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setError(null);

      // Chiamata API per aggiornare lo stato
      const response = await API.updateReportStatus(
        report.id,
        newStatus,
        note
      );

      setSuccessData({
        status: newStatus,
        message: "Report status updated successfully."
      });

      if (onReportUpdated) {
        onReportUpdated(report.id);
      }
    } catch (err) {
      setError(err.message || "Failed to update report status.");
    }
  };

  const handleClose = () => {
    setNote("");
    setError(null);
    setSuccessData(null);
    setActionType(null);
    onHide();
  };

  if (!report) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      contentClassName="report-desc-modal-content"
    >
      <Modal.Header closeButton className="report-desc-modal-header">
        <Modal.Title>
          {successData ? "Status Updated" : "Manage Maintenance Report"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="report-desc-modal-body">
        {successData ? (
          <div className="d-flex flex-column align-items-center justify-content-center p-4">
            <div className="text-success mb-3" style={{ fontSize: "3rem" }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h4 className="text-center mb-3">Update Successful!</h4>
            <p className="text-center mb-1">
              The report is now marked as <strong>{successData.status}</strong>.
            </p>
            <Button variant="success" className="mt-4 rounded-pill px-4" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Riutilizziamo ReportInfo per i dettagli readonly */}
            <ReportInfo report={report} canEditCategory={false} />

            <div className="mt-4 p-3 bg-white rounded-4 border border-light shadow-sm">
              <h5 className="text-primary mb-3" style={{ color: '#3D5A80', fontWeight: 700 }}>Update Status</h5>

              {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-muted small text-uppercase">Maintenance Note (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Add details about the intervention (e.g., 'Team dispatched', 'Parts ordered', 'Work completed')..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="report-desc-textarea"
                />
              </Form.Group>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                {/* Logica bottoni basata sullo stato corrente */}
                {report.status !== "In Progress" && report.status !== "Resolved" && (
                  <Button
                    variant="warning"
                    className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 text-white fw-bold"
                    onClick={() => handleUpdateStatus("In Progress")}
                    style={{ background: '#F59E0B', border: 'none' }}
                  >
                    <Hammer size={18} /> Start Work
                  </Button>
                )}

                {report.status === "In Progress" && (
                  <>
                    <Button
                      variant="warning"
                      className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 text-white fw-bold"
                      onClick={() => handleUpdateStatus("Suspended")}
                      style={{ background: '#F97316', border: 'none' }}
                    >
                      <PauseCircle size={18} /> Suspend
                    </Button>
                    <Button
                      variant="success"
                      className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold"
                      onClick={() => handleUpdateStatus("Resolved")}
                      style={{ background: '#10B981', border: 'none' }}
                    >
                      <CheckCircle size={18} /> Mark as Resolved
                    </Button>
                  </>
                )}

                {report.status === "Suspended" && (
                  <Button
                    variant="warning"
                    className="d-flex align-items-center gap-2 rounded-pill px-4 py-2 text-white fw-bold"
                    onClick={() => handleUpdateStatus("In Progress")}
                    style={{ background: '#F59E0B', border: 'none' }}
                  >
                    <Hammer size={18} /> Resume Work
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

MaintainerReportModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  report: PropTypes.object,
  onReportUpdated: PropTypes.func,
};

export default MaintainerReportModal;