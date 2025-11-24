import { Card, Badge } from "react-bootstrap";
import { useState, useEffect } from "react";
import { getCategoryIcon } from "../constants/categoryIcons";
import { getAddressFromCoordinates } from "../utils/geocoding";
import "./styles/ReportCard.css";
import { MapPin } from "lucide-react";

function ReportCard({ report, onClick }) {
  const [address, setAddress] = useState("Loading address...");

  useEffect(() => {
    const fetchAddress = async () => {
      if (report.location) {
        try {
          const addr = await getAddressFromCoordinates(
            report.location.latitude,
            report.location.longitude
          );
          setAddress(addr);
        } catch (error) {
          setAddress("Address not available");
        }
      }
    };

    fetchAddress();
  }, [report.location]);

  const getCategoryBadge = (category) => {
    return <Badge className="custom-category-badge">{category}</Badge>;
  };

  const getStatusBadge = (status) => {
    let bg = "secondary";
    if (status === "Assigned") bg = "primary";
    else if (status === "Rejected") bg = "danger";
    else if (status === "Resolved") bg = "success";
    return <Badge className="custom-status-badge" bg={bg}>{status}</Badge>;
  };

  return (
    <Card 
      className="shadow-sm report-card-clickable" 
      onClick={() => onClick({ ...report, address })}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="category-icon-circle">
            {getCategoryIcon(report.category.name, 32)}
          </div>
          <div className="d-flex flex-column gap-1">
            <Card.Title className="mb-0">{report.title}</Card.Title>
            <div className="d-flex align-items-center gap-1 text-muted small">
              <MapPin size={14} />
              <span>{address}</span>
            </div>
            <div>
              {getCategoryBadge(report.category.name)}
            </div>
          </div>
        </div>
        <div className="d-flex flex-column align-items-end gap-1">
          {getStatusBadge(report.status)}
          <span className="text-muted small">{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ReportCard;