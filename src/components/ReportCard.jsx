import React, { useState, useEffect, useRef } from "react";
import { Card, Badge } from "react-bootstrap";
import { getCategoryIcon } from "../constants/categoryIcons";
import "./styles/ReportCard.css";
import { MapPin, User } from "lucide-react";
import { getAddressFromCoordinates } from "../utils/geocoding";

function ReportCard({ report, onClick, showUser = false, showPRO = true }) {
  const [address, setAddress] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);

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
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (currentCard) observer.observe(currentCard);
    return () => { if (currentCard) observer.unobserve(currentCard); };
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && !address && !isLoading && !showUser) {
      setIsLoading(true);
      const loadAddress = async () => {
        try {
          const addr = await getAddressFromCoordinates(report.location.latitude, report.location.longitude);
          setAddress(addr);
        } catch (error) {
          setAddress(`${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`);
        } finally {
          setIsLoading(false);
        }
      };
      loadAddress();
    }
  }, [isVisible, address, isLoading, report, showUser]);

  const locationDisplay = address || `${report.location.latitude.toFixed(4)}, ${report.location.longitude.toFixed(4)}`;

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
      className="report-card-clickable"
      onClick={() => onClick(report)}
    >
      <Card.Body>
        <div className="category-icon-circle">
          {getCategoryIcon(report.category.name, 20)}
        </div>

        <div className="report-content-wrapper">
          <div className="report-card-title" title={report.title}>
            {report.title}
          </div>

          <div className="report-card-subtitle">
            {!showUser && <MapPin size={12} />}
            {showUser && <User size={12} />}

            <span className="text-truncate">
              {showUser
                ? `${report.citizenName} ${report.citizenLastName}`
                : locationDisplay
              }
            </span>
          </div>

          <div className="report-card-category">
            {typeof report.category === 'object' ? report.category.name : report.category}
          </div>
        </div>

        <div className="report-status-badge-container">
          {getStatusBadge(report.status)}
        </div>
      </Card.Body>
    </Card>
  );
}

export default React.memo(ReportCard);