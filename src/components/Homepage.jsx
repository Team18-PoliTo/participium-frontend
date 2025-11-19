import "./styles/Homepage.css";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router";
import { MapPin, FileText, CheckCircle, Users } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../App";

function Homepage() {
  const navigate = useNavigate();
  const { citizenLoggedIn } = useContext(UserContext);

  const features = [
    {
      icon: <MapPin size={48} />,
      title: "Report Issues",
      description:
        "Identify and report urban problems directly on Turin's interactive map",
    },
    {
      icon: <FileText size={48} />,
      title: "Add Details",
      description:
        "Provide detailed descriptions and attach photos to document the issue",
    },
    {
      icon: <Users size={48} />,
      title: "Municipal Management",
      description: "Municipal staff manage and resolve reports efficiently",
    },
    {
      icon: <CheckCircle size={48} />,
      title: "Track Status",
      description: "Follow the progress of your reports until resolution",
    },
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="hero-content">
              <h1 className="hero-title">Participate in improving your city</h1>
              <p className="hero-subtitle">
                PARTICIPIUM is the platform that connects Turin citizens with
                the municipal administration to report and solve urban issues.
              </p>
            </Col>
            <Col lg={6} className="hero-image">
              <div className="image-placeholder">
                <img src="/image.png" alt="Turin Map" className="map-preview" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <h2 className="section-title">Key Features</h2>
          <Row className="g-4">
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3} className="d-flex">
                <Card className="feature-card">
                  <Card.Body className="text-center">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="info-title">Georeferenced Reports</h2>
              <p className="info-text">
                Every report is precisely positioned on Turin's map. Citizens
                can report issues such as potholes, defective lighting,
                abandoned waste, and much more.
              </p>
              <p className="info-text">
                Reports include detailed descriptions, photos, and are
                categorized by type, allowing municipal staff to manage them
                efficiently and prioritize them.
              </p>
            </Col>
            <Col lg={6}>
              <div className="info-highlights">
                <div className="highlight-item">
                  <CheckCircle className="highlight-icon" />
                  <span>Precise geolocation</span>
                </div>
                <div className="highlight-item">
                  <CheckCircle className="highlight-icon" />
                  <span>Photo attachments</span>
                </div>
                <div className="highlight-item">
                  <CheckCircle className="highlight-icon" />
                  <span>Report categorization</span>
                </div>
                <div className="highlight-item">
                  <CheckCircle className="highlight-icon" />
                  <span>Status tracking</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container className="text-center">
          <h2 className="cta-title">Ready to make a difference?</h2>
          <p className="cta-text">
            Join the community of active citizens contributing to Turin's
            improvement
          </p>
          <Button
            className="cta-button-large"
            onClick={() => navigate(citizenLoggedIn ? "/map" : "/register")}
          >
            {citizenLoggedIn ? "Go to the Map" : "Sign Up for Free"}
          </Button>
        </Container>
      </section>
    </div>
  );
}

export default Homepage;
