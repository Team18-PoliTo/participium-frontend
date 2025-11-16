import { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import "./styles/ReportForm.css";
import API from "../API/API";

/**
 * ReportForm Component
 *
 * A form component for creating new reports with location, title, description,
 * category, and photo uploads. Validates user input and handles photo management.
 *
 * @param {Object} position - The geographic position selected on the map {lat, lng}
 * @param {Function} onFormSubmit - Callback function to close the form
 * @param {Function} onReportResult - Callback function to handle report submission result (isSuccess, message)
 */
function ReportForm({ position, onFormSubmit, onReportResult }) {
  // Form state management
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [citizenId, setCitizenId] = useState(null);

  // Get citizen ID on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await API.getUserInfo();
        // ID is in user.profile.id, not user.id
        setCitizenId(user.profile.id);
      } catch (err) {
        setError("Error loading user information. Please login again.");
      }
    };
    fetchUserInfo();
  }, []);

  /**
   * Handle photo file upload
   * Validates that total photos don't exceed 3 and adds new photos to state
   */
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

    // Check if adding new files would exceed the 3 photo limit
    if (photos.length + files.length > 3) {
      setError("You can upload a maximum of 3 photos.");
      return;
    }

    // Check if any file exceeds the size limit
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(
        `Some files exceed the 5 MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`
      );
      return;
    }

    // Add new photos to existing photos array
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);
    setError("");
    event.target.value = ""; // Reset input to allow re-uploading same file
  };

  /**
   * Remove a photo from the upload list
   * @param {number} indexToRemove - Index of the photo to remove
   */
  const handleRemovePhoto = (indexToRemove) => {
    setPhotos((prevPhotos) =>
      prevPhotos.filter((_, index) => index !== indexToRemove)
    );
  };

  /**
   * Convert a File object to BinaryFileDTO format
   * @param {File} file - The file to convert
   * @returns {Promise<Object>} BinaryFileDTO object with base64 data
   */
  const convertFileToBinaryDTO = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result.split(",")[1]; // Remove data:image/...;base64, prefix
        resolve({
          filename: file.name,
          mimetype: file.type,
          size: file.size,
          data: base64Data,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handle form submission
   * Validates all required fields and creates FormData for API submission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validate all required fields
    if (
      !position ||
      !title ||
      !description ||
      !category ||
      photos.length === 0
    ) {
      setError("All fields are required.");
      return;
    }
    if (photos.length < 1 || photos.length > 3) {
      setError("You must upload between 1 and 3 photos.");
      return;
    }
    if (!citizenId) {
      setError("User information not loaded. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Convert photos to BinaryFileDTO format
      const binaryPhotos = await Promise.all(
        photos.map((photo) => convertFileToBinaryDTO(photo))
      );

      console.log("Binary photos:", binaryPhotos);

      // Prepare report data according to API specification
      const reportData = {
        title,
        description,
        citizenId,
        category,
        location: {
          latitude: position.lat,
          longitude: position.lng,
        },
      };

      // Add photos only if they exist (don't send undefined fields)
      if (binaryPhotos[0]) reportData.binaryPhoto1 = binaryPhotos[0];
      if (binaryPhotos[1]) reportData.binaryPhoto2 = binaryPhotos[1];
      if (binaryPhotos[2]) reportData.binaryPhoto3 = binaryPhotos[2];

      // Call API to create report
      const createdReport = await API.addNewReport(reportData);

      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setPhotos([]);

      // Call the callback to handle success
      onReportResult(true, "Your report has been submitted successfully!");
    } catch (apiError) {
      // Call the callback to handle error
      onReportResult(
        false,
        apiError.message || "Error submitting the report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="report-form">
      {/* Error alert display */}
      {error && (
        <Alert variant="danger" className="report-form__error">
          {error}
        </Alert>
      )}

      {/* Selected position display (read-only) */}
      <Form.Group className="mb-3 report-form__group">
        <Form.Label className="report-form__label">
          <strong>Selected Position</strong>
        </Form.Label>
        {position ? (
          <>
            {position.address && (
              <Form.Control
                type="text"
                value={position.address}
                readOnly
                disabled
                className="report-form__input report-form__input--readonly mb-2"
              />
            )}
            <Form.Label className="report-form__label mt-2">
              Coordinates
            </Form.Label>
            <Form.Control
              type="text"
              value={`Lat: ${position.lat.toFixed(
                4
              )}, Lng: ${position.lng.toFixed(4)}`}
              readOnly
              disabled
              className="report-form__input report-form__input--readonly"
            />
          </>
        ) : (
          <Form.Control
            type="text"
            value="Error: Position not found"
            readOnly
            disabled
            className="report-form__input report-form__input--readonly report-form__input--error"
          />
        )}
      </Form.Group>

      {/* Title input field */}
      <Form.Group className="mb-3 report-form__group" controlId="formTitle">
        <Form.Label className="report-form__label">Title (Required)</Form.Label>
        <Form.Control
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="report-form__input"
        />
      </Form.Group>

      {/* Description textarea */}
      <Form.Group
        className="mb-3 report-form__group"
        controlId="formDescription"
      >
        <Form.Label className="report-form__label">
          Description (Required)
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="report-form__textarea"
        />
      </Form.Group>

      {/* Category selection dropdown */}
      <Form.Group className="mb-3 report-form__group" controlId="formCategory">
        <Form.Label className="report-form__label">
          Category (Required)
        </Form.Label>
        <Form.Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="report-form__select"
        >
          <option value="">Choose a category...</option>
          <option value="water">Water Supply - Drinking Water</option>
          <option value="barriers">Architectural Barriers</option>
          <option value="sewer">Sewer System</option>
          <option value="lighting">Public Lighting</option>
          <option value="waste">Waste</option>
          <option value="signs">Road Signs and Traffic Lights</option>
          <option value="roads">Roads and Urban Furnishings</option>
          <option value="green">Public Green Areas and Playgrounds</option>
          <option value="other">Other</option>
        </Form.Select>
      </Form.Group>

      {/* Photo upload section */}
      <Form.Group className="mb-3 report-form__group">
        <Form.Label className="report-form__label">
          Photos (Required, min 1, max 3)
        </Form.Label>

        {/* Upload button and photo counter */}
        <div className="report-form__photo-upload">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            id="photo-upload-input"
            className="report-form__file-input-hidden"
            disabled={photos.length >= 3}
          />
          <label
            htmlFor="photo-upload-input"
            className={`report-form__upload-btn ${
              photos.length >= 3 ? "report-form__upload-btn--disabled" : ""
            }`}
          >
            <i className="bi bi-camera-fill"></i> Upload Photo
          </label>
          <span className="report-form__photo-count">
            {photos.length}/3 photos uploaded
          </span>
        </div>

        {/* List of uploaded photos with preview and remove option */}
        {photos.length > 0 && (
          <div className="report-form__photo-list">
            {photos.map((photo, index) => (
              <div key={index} className="report-form__photo-item">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Preview ${index + 1}`}
                  className="report-form__photo-preview"
                />
                <div className="report-form__photo-info">
                  <span className="report-form__photo-name">{photo.name}</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemovePhoto(index)}
                    className="report-form__remove-photo-btn"
                  >
                    <i className="bi bi-x-lg"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Form.Group>

      {/* Submit button */}
      <Button
        variant="primary"
        type="submit"
        className="w-100 report-form__submit-btn"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Report"}
      </Button>
    </Form>
  );
}

export default ReportForm;
