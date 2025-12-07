import React, { useState, useEffect, useRef } from "react";
import { Card, Badge } from "react-bootstrap";
import { getCategoryIcon } from "../constants/categoryIcons";
import "./styles/ReportCard.css";
import { MapPin, User } from "lucide-react";

function ReportCard({ report, onClick, showUser = false, showPRO = true }) {
  const [isVisible, setIsVisible] = useState(false);
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

  const getStatusBadge = (status) => {
    return (
      <Badge className={`custom-status-badge status-${status.replaceAll(/\s/g, '').toLowerCase()}`}>
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
                : report.address
              }
            </span>
          </div>

          <div className="report-card-category">
            {report.category.name}
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