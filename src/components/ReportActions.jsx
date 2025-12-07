import { Button, Form, Alert } from "react-bootstrap";
import { X, Check } from "lucide-react";

function ReportActions({ isRejecting, setIsRejecting, explanation, setExplanation, error, onConfirm, onCancel }) {
  return (
    <>
      {/* Action Toggle */}
      <div className="mb-3">
        <label className="report-desc-label fw-bold">Action</label>
        <div className={`report-desc-action-toggle ${isRejecting ? 'reject-active' : ''}`}>
          <Button
            className={`report-desc-toggle-btn ${isRejecting ? '' : 'active'}`}
            variant="link"
            onClick={() => setIsRejecting(false)}
          >
            Approve
          </Button>
          <Button
            className={`report-desc-toggle-btn ${isRejecting ? 'active' : ''}`}
            variant="link"
            onClick={() => setIsRejecting(true)}
          >
            Reject
          </Button>
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-3">
        <label className="report-desc-label fw-bold">Explanation</label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder={isRejecting ? "Enter your explanation here..." : "No explanation required"}
          value={isRejecting ? explanation : ""}
          onChange={(e) => setExplanation(e.target.value)}
          className="report-desc-textarea"
          disabled={!isRejecting}
          required={isRejecting}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => {}}
        >
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-between">
        <Button
          variant="secondary"
          onClick={onCancel}
          className="report-desc-btn-cancel"
        >
          Cancel
        </Button>
        <Button
          variant={isRejecting ? "danger" : "success"}
          onClick={onConfirm}
          className={`d-flex align-items-center gap-2 ${isRejecting ? 'report-desc-btn-reject' : 'report-desc-btn-approve'}`}
        >
          {isRejecting ? <X size={18} /> : <Check size={18} />}
          {isRejecting ? "Reject Report" : "Approve Report"}
        </Button>
      </div>
    </>
  );
}

export default ReportActions;