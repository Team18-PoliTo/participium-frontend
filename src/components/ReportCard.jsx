import { Card, Badge } from "react-bootstrap";
import { getCategoryIcon } from "../constants/categoryIcons";
import "./styles/ReportCard.css";
import { MapPin, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getAddressFromCoordinates } from "../utils/geocoding";

function ReportCard({ report, onClick, showUser = false, showPRO = true }) {
  const [address, setAddress] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);

  // Intersection Observer per rilevare quando la card è visibile
  useEffect(() => {
    const currentCard = cardRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: "100px", // Inizia a caricare 100px prima che sia visibile
        threshold: 0.1,
      }
    );

    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, [isVisible]);

  // Carica l'indirizzo solo quando la card diventa visibile
  useEffect(() => {
    if (isVisible && !address && !isLoading && !showUser) {
      setIsLoading(true);

      const loadAddress = async () => {
        try {
          const addr = await getAddressFromCoordinates(
            report.location.latitude,
            report.location.longitude
          );
          setAddress(addr);
        } catch (error) {
          console.error("Error loading address:", error);
          setAddress(
            `${report.location.latitude.toFixed(
              4
            )}, ${report.location.longitude.toFixed(4)}`
          );
        } finally {
          setIsLoading(false);
        }
      };
      loadAddress();
    }
  }, [
    isVisible,
    address,
    isLoading,
    report.location.latitude,
    report.location.longitude,
  ]);

  const locationDisplay =
    address ||
    `${report.location.latitude.toFixed(
      4
    )}, ${report.location.longitude.toFixed(4)}`;

  const getCategoryBadge = (category) => {
    return <Badge className="custom-category-badge">{category}</Badge>;
  };

  const getStatusBadge = (status) => {
    return (
      <Badge className={`custom-status-badge status-${status.replace(/\s/g, '').toLowerCase()}`}>
        {status}
      </Badge>
    );
  };

  return (
    <Card
      ref={cardRef}
      className="shadow-sm report-card-clickable position-relative"
      onClick={() => onClick(report)}
      style={{ cursor: "pointer" }}
    >
      {/* Badge in alto a destra */}
      <div className="report-status-badge-container">
        {getStatusBadge(report.status)}
      </div>
      <Card.Body className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          {
            showPRO && 
            (
              <div className="category-icon-circle">
                {getCategoryIcon(report.category.name, 32)}
              </div>
            )
          }
          <div className="d-flex flex-column gap-1">
            <Card.Title className="mb-0">{report.title}</Card.Title>
            <div className="d-flex align-items-center gap-1 text-muted small">
              {!showUser && (
                <>
                  <MapPin size={14} /> <span>{locationDisplay}</span>
                </>
              )}
              {showUser && (
                <>
                  <User size={14} />
                  <span>  {report.citizenName} {report.citizenLastName}</span>
                </>
              )}
            </div>
            {showPRO && (
              <div className="mt-1">
                {getCategoryBadge(report.category.name)}
              </div>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ReportCard;