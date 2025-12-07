import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import "leaflet/dist/leaflet.css";
import "./styles/ReportDescription.css";
import API from "../API/API";
import ReportInfo from "./ReportInfo";
import ReportActions from "./ReportActions";

function ReportDescriptionModal({
  show,
  onHide,
  report,
  onReportUpdated,
  isOfficerView = false,
}) {
  const [selectedCategory, setSelectedCategory] = useState(
    report?.category || ""
  );
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (report) {
      setSelectedCategory(report.category || "");
      setError(null);
      setIsRejecting(false);
      setExplanation("");
      setSuccessData(null);
    }
  }, [report]);

  const handleConfirm = async () => {
    try {
      setError(null);
      const status = isRejecting ? "Rejected" : "Assigned";
      const explanationText = isRejecting
        ? explanation
        : "No explanation required";

      const categoryId = selectedCategory.id;

      const response = await API.judgeReport(
        report.id,
        status,
        categoryId,
        explanationText
      );

      setSuccessData(response);

      if (onReportUpdated) {
        onReportUpdated(report.id);
      }
    } catch (error) {
      setError(
        (error.message && typeof error.message === "string"
          ? error.message
          : "An error occurred") ||
          `Failed to ${
            isRejecting ? "reject" : "approve"
          } the report. Please try again.`
      );
    }
  };

  const handleClose = () => {
    setExplanation("");
    setSelectedCategory(report.category || "");
    setError(null);
    setIsRejecting(false);
    setSuccessData(null);
    onHide();
  };

  const renderSafeValue = (val) => {
    if (typeof val === "object" && val !== null) {
      return val.name || val.description || JSON.stringify(val);
    }
    return val;
  };

  if (!report) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size={successData ? undefined : "lg"}
      centered
      fullscreen={successData ? undefined : "md-down"}
      contentClassName="report-desc-modal-content"
    >
      <Modal.Header closeButton className="report-desc-modal-header">
        <Modal.Title>
          {successData ? "Report Processed" : "Report Details"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="report-desc-modal-body">
        {successData ? (
          <div className="d-flex flex-column align-items-center justify-content-center p-4">
            <div className="text-success mb-3" style={{ fontSize: "3rem" }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h4 className="text-center mb-3">Operation Successful!</h4>
            {successData.status && (
              <p className="text-center mb-1">
                <strong>Status:</strong> {renderSafeValue(successData.status)}
              </p>
            )}
            {successData.message && (
              <p className="text-center mb-1">
                <strong>Message:</strong> {renderSafeValue(successData.message)}
              </p>
            )}
            {successData.assignedTo && (
              <p className="text-center">
                <strong>Assigned To:</strong>{" "}
                {renderSafeValue(successData.assignedTo)}
              </p>
            )}
            <Button variant="success" className="mt-4" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <ReportInfo
              report={report}
              canEditCategory={!isOfficerView}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            {isOfficerView ? (
              <Modal.Footer className="report-map-desc-modal-footer">
                <Button
                  className="report-map-desc-btn-cancel"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </Modal.Footer>
            ) : (
              <ReportActions
                isRejecting={isRejecting}
                setIsRejecting={setIsRejecting}
                explanation={explanation}
                setExplanation={setExplanation}
                error={error}
                onConfirm={handleConfirm}
                onCancel={handleClose}
              />
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

ReportDescriptionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  report: PropTypes.shape({
    id: PropTypes.number,
    category: PropTypes.object,
  }),
  onReportUpdated: PropTypes.func,
  isOfficerView: PropTypes.bool,
};

export default ReportDescriptionModal;
