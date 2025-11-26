import { useState, useEffect, useContext } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Image,
  Alert,
} from "react-bootstrap";
import { UserContext } from "../App";
import API from "../API/API";
import { Camera, Save, Bell, Send, Edit2, X } from "lucide-react"; // Icone coerenti con il resto del sito
import "./styles/UserPage.css";
import ReportCard from "./ReportCard";
import ReportMapDescription from "./ReportMapDescription";
import LoadingSpinner from "./LoadingSpinner";
import defaultAvatar from "../resources/Immagine1.png";

function UserProfile() {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [reportsError, setReportsError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null); // URL anteprima
  const [selectedFile, setSelectedFile] = useState(null); // File reale per upload
  const [citizenReports, setCitizenReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Valori originali per undo
  const [originalValues, setOriginalValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    telegramUsername: "",
    emailNotifications: false,
    photoUrl: null,
  });

  // Caricamento dati iniziali
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const userData = await API.getUserInfo();
        setUser(userData);

        if (userData && userData.profile) {
          setFirstName(userData.profile.firstName || "");
          setLastName(userData.profile.lastName || "");
          setEmail(userData.profile.email || "");
          setUsername(userData.profile.username || "");
          setTelegramUsername(userData.profile.telegramUsername || "");
          setEmailNotifications(userData.profile.emailNotifications || false);
          setPhotoUrl(userData.profile.photoUrl || null);

          // Salva i valori originali
          setOriginalValues({
            firstName: userData.profile.firstName || "",
            lastName: userData.profile.lastName || "",
            email: userData.profile.email || "",
            username: userData.profile.username || "",
            telegramUsername: userData.profile.telegramUsername || "",
            emailNotifications: userData.profile.emailNotifications || false,
            photoUrl: userData.profile.photoUrl || null,
          });
        }

        // fetch reports AFTER avere userData disponibile
        if (userData && userData.profile && userData.profile.id) {
          setLoadingReports(true);
          setReportsError("");
          try {
            const reportsResult = await API.getCitizenReports();

            // Normalizza la risposta: accetta array diretto o wrapper { data: [], reports: [] }
            const normalize = (r) => {
              if (!r) return [];
              if (Array.isArray(r)) return r;
              if (Array.isArray(r.data)) return r.data;
              if (Array.isArray(r.reports)) return r.reports;
              return [];
            };

            setCitizenReports(normalize(reportsResult));
          } catch (error) {
            console.error("Error fetching reports:", error);
            setReportsError(
              "Failed to load your reports. Please try again later."
            );
            setCitizenReports([]);
          } finally {
            setLoadingReports(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setMessage({ type: "danger", text: "Failed to load profile data." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Ripristina i valori originali
    setFirstName(originalValues.firstName);
    setLastName(originalValues.lastName);
    setEmail(originalValues.email);
    setUsername(originalValues.username);
    setTelegramUsername(originalValues.telegramUsername);
    setEmailNotifications(originalValues.emailNotifications);
    setPhotoUrl(originalValues.photoUrl);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPhotoUrl(URL.createObjectURL(file)); // Anteprima locale immediata
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let uploadedPhotoPath = user.profile?.photoUrl;

      // 1. Se c'è un nuovo file, caricalo (PT09 - Upload foto)
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadResult = await API.uploadFile(formData);
        uploadedPhotoPath = uploadResult.filePath; // Assumendo che l'API restituisca il path
      }

      // 2. Aggiorna il profilo utente (PT09 - Configurazione)
      // Nota: Questa funzione API.updateCitizenProfile va aggiunta in API.js
      const updatedProfile = await API.updateCitizenProfile(user.profile.id, {
        email: email || null,
        username: username || null,
        firstName: firstName || null,
        lastName: lastName || null,
        telegramUsername: telegramUsername || null,
        emailNotificationsEnabled:
          typeof emailNotifications === "boolean" ? emailNotifications : null,
        accountPhoto: uploadedPhotoPath || null,
      });

      // 3. Aggiorna lo stato globale
      setUser((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...updatedProfile },
      }));

      // Aggiorna i valori originali
      setOriginalValues({
        firstName: updatedProfile.firstName ?? firstName,
        lastName: updatedProfile.lastName ?? lastName,
        email: updatedProfile.email ?? email,
        username: updatedProfile.username ?? username,
        telegramUsername: updatedProfile.telegramUsername || telegramUsername,
        emailNotifications:
          updatedProfile.emailNotifications !== undefined
            ? updatedProfile.emailNotifications
            : emailNotifications,
        photoUrl: uploadedPhotoPath,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "danger",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="user-profile-wrapper">
      <Container className="user-profile-container">
        <div className="position-relative mb-4">
          <h1 className="profile-title text-center mb-0">My Profile</h1>
          <div className="profile-actions">
            {!isEditing ? (
              <Button
                variant="link"
                onClick={handleEdit}
                className="edit-profile-btn"
                title="Edit Profile"
              >
                <Edit2 size={24} />
              </Button>
            ) : (
              <div className="d-flex gap-2">
                <Button
                  variant="outline-light"
                  onClick={handleCancel}
                  className="cancel-btn"
                >
                  <X size={20} className="me-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="profile-form"
                  className="save-profile-btn-inline"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save size={20} className="me-2" /> Save
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {message.text && (
          <Alert
            variant={message.type}
            onClose={() => setMessage({ type: "", text: "" })}
            dismissible
          >
            {message.text}
          </Alert>
        )}

        <Form
          onSubmit={handleSubmit}
          className="profile-form"
          id="profile-form"
        >
          <Row className="align-items-center mb-5">
            <Col md={4} className="text-center mb-4 mb-md-0">
              <div className="profile-image-wrapper">
                <Image
                  src={photoUrl || defaultAvatar} // Immagine di fallback
                  roundedCircle
                  className="profile-image"
                  alt="Profile"
                />
                {isEditing && (
                  <>
                    <label htmlFor="photo-upload" className="photo-upload-btn">
                      <Camera size={20} />
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                  </>
                )}
              </div>
            </Col>

            {/* Dati Anagrafici (Sola lettura) */}

            <Col md={8}>
              <Row className="align-items-center">
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label className="profile-label">
                      First Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      readOnly={!isEditing}
                      className={`profile-input ${
                        !isEditing ? "read-only" : ""
                      }`}
                    />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label className="profile-label">Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      readOnly={!isEditing}
                      className={`profile-input ${
                        !isEditing ? "read-only" : ""
                      }`}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row className="align-items-start">
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label className="profile-label">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!isEditing}
                      className={`profile-input ${
                        !isEditing ? "read-only" : ""
                      }`}
                    />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="mb-3" controlId="formNotifications">
                    <Form.Label className="profile-label">
                      Notifications
                    </Form.Label>
                    <div className="d-flex justify-content-between align-items-center notification-toggle-container">
                      <Form.Label className="profile-label mb-0 d-flex align-items-center">
                        <Bell size={18} className="me-2" /> Email Notifications
                      </Form.Label>
                      <Form.Check
                        type="switch"
                        id="email-switch"
                        checked={emailNotifications}
                        onChange={(e) =>
                          setEmailNotifications(e.target.checked)
                        }
                        className="custom-switch"
                        disabled={!isEditing}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="align-items-start">
                <Col md="6">
                  <Form.Group className="mb-3">
                    <Form.Label className="profile-label">Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      readOnly={!isEditing}
                      className={`profile-input ${
                        !isEditing ? "read-only" : ""
                      }`}
                    />
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className="mb-3" controlId="formTelegram">
                    <Form.Label className="profile-label">
                      <Send size={18} className="me-2" /> Telegram Username
                    </Form.Label>
                    <div className="telegram-input-group">
                      <span className="telegram-prefix">@</span>
                      <Form.Control
                        type="text"
                        placeholder="username"
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        className="profile-input telegram-input"
                        disabled={!isEditing}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>

          <hr className="profile-divider" />

          <h4 className="section-subtitle mb-4">Your Reports</h4>

          {reportsError && (
            <Alert
              variant="danger"
              className="mb-3"
              dismissible
              onClose={() => setReportsError("")}
            >
              {reportsError}
            </Alert>
          )}

          {loadingReports ? (
            <LoadingSpinner />
          ) : citizenReports.length === 0 ? (
            <p className="text-center text-muted">
              You haven't submitted any reports yet.
            </p>
          ) : (
            <div className="profile-reports-scrollable">
              {citizenReports.map((report) => (
                <div key={report.id} className="profile-report-card-wrapper">
                  <ReportCard report={report} onClick={handleReportClick} />
                </div>
              ))}
            </div>
          )}
        </Form>
      </Container>

      <ReportMapDescription
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        report={selectedReport}
      />
    </div>
  );
}

export default UserProfile;
