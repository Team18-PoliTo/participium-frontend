import { useState, useEffect } from "react";
import {Modal} from "react-bootstrap";
import "leaflet/dist/leaflet.css";
import "./styles/ReportDescription.css";
import API from "../API/API";
import ReportInfo from "./ReportInfo";
import ReportActions from "./ReportActions";

function ReportDescriptionModal({ show, onHide, report, onReportUpdated, isOfficerView = false }) {
  const [selectedCategory, setSelectedCategory] = useState(
    report?.category?.id || ""
  );
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (report) {
      setSelectedCategory(report.category?.id || "");
      setError(null);
      setIsRejecting(false);
      setExplanation("");
    }
  }, [report]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await API.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleConfirm = async () => {
    try {
      setError(null);
      const status = isRejecting ? "Rejected" : "Assigned";
      const explanationText = isRejecting ? explanation : "No explanation required";
      const updatedReport = await API.judgeReport(
        report.id,
        status,
        selectedCategory,
        explanationText
      );
      
      if (onReportUpdated) {
        onReportUpdated(report.id);
      }
      
      handleClose();
    } catch (error) {
      setError(
        error.message || `Failed to ${isRejecting ? 'reject' : 'approve'} the report. Please try again.`
      );
    }
  };

  const handleClose = () => {
    setExplanation("");
    setSelectedCategory(report?.category?.id || "");
    setError(null);
    setIsRejecting(false);
    onHide();
  };

  if (!report) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered fullscreen="md-down">
      <Modal.Header closeButton className="report-desc-modal-header">
        <Modal.Title>Report Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="report-desc-modal-body">
        <ReportInfo
          report={report}
          canEditCategory={!isOfficerView} // o false, a seconda del contesto
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        {!isOfficerView && (
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
      </Modal.Body>
    </Modal>
  );
}

export default ReportDescriptionModal;
