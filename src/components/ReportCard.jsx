import { Card, Badge } from "react-bootstrap";
import { useState, useEffect } from "react";
import { 
  Droplets, 
  Accessibility, 
  Waves, 
  Lightbulb, 
  Trash2, 
  TrafficCone,
  Construction,
  Trees,
  Wrench,
  MapPin
} from "lucide-react";
import { getAddressFromCoordinates } from "../utils/geocoding";
import "./styles/ReportCard.css";

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

  const getCategoryIcon = (category) => {
    const iconProps = { size: 30, color: "#3D5A80" };
    
    let icon;
    switch (category) {
      case "Water Supply – Drinking Water":
        icon = <Droplets {...iconProps} />;
        break;
      case "Architectural Barriers":
        icon = <Accessibility {...iconProps} />;
        break;
      case "Sewer System":
        icon = <Waves {...iconProps} />;
        break;
      case "Public Lighting":
        icon = <Lightbulb {...iconProps} />;
        break;
      case "Waste":
        icon = <Trash2 {...iconProps} />;
        break;
      case "Road Signs and Traffic Lights":
        icon = <TrafficCone {...iconProps} />;
        break;
      case "Roads and Urban Furnishings":
        icon = <Construction {...iconProps} />;
        break;
      case "Public Green Areas and Playgrounds":
        icon = <Trees {...iconProps} />;
        break;
      case "Other":
        icon = <Wrench {...iconProps} />;
        break;
      default:
        icon = <Wrench {...iconProps} />;
    }

    return <div className="category-icon-circle">{icon}</div>;
  };

  const getCategoryBadge = (category) => {
    return <Badge className="custom-category-badge">{category}</Badge>;
  };

  return (
    <Card 
      className="shadow-sm report-card-clickable" 
      onClick={() => onClick(report)}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          {getCategoryIcon(report.category)}
          <div className="d-flex flex-column gap-1">
            <Card.Title className="mb-0">{report.title}</Card.Title>
            <div className="d-flex align-items-center gap-1 text-muted small">
              <MapPin size={14} />
              <span>{address}</span>
            </div>
            <div>
              {getCategoryBadge(report.category)}
            </div>
          </div>
        </div>
        <div className="text-muted small">
          {new Date(report.createdAt).toLocaleDateString()}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ReportCard;