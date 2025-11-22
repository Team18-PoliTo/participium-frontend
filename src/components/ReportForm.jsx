import { useState, useEffect, useRef } from "react";
import { Form, Button, Alert, Dropdown } from "react-bootstrap";
import "./styles/ReportForm.css";
import API from "../API/API";
import { getCategoryIcon } from "../constants/categoryIcons";
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
  const [categoryId, setCategoryId] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [citizenId, setCitizenId] = useState(null);
  const [categories, setCategories] = useState([]);

  const uploadedPhotosRef = useRef(uploadedPhotos);

  // Sync ref with state
  useEffect(() => {
    uploadedPhotosRef.current = uploadedPhotos;
  }, [uploadedPhotos]);

  useEffect(() => {
    // Load categories (could be fetched from API if needed)
    const loadCategories = async () => {
      try {
        const fetchedCategories = await API.getAllCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // Get citizen ID on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await API.getUserInfo();
        setCitizenId(user.profile.id);
      } catch (err) {
        setError("Error loading user information. Please login again.");
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup: Delete any uploaded temp files when form closes
      uploadedPhotosRef.current.forEach(async (photo) => {
        try {
          await API.deleteTempFile(photo.fileId);
        } catch (error) {
          console.error("Failed to cleanup temp file:", photo.fileId);
        }
      });

      // Cleanup: Revoke object URLs for previews
      uploadedPhotosRef.current.forEach((photo) => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });
    };
  }, []);

  /**
   * Handle photo file upload - Upload immediately to temporary storage
   * Validates that total photos don't exceed 3 and uploads new photos
   */
  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

    // Check if adding new files would exceed the 3 photo limit
    if (uploadedPhotos.length + files.length > 3) {
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

    setUploadingPhotos(true);
    setError("");

    try {
      // Upload each file immediately
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadedFile = await API.uploadFile(formData);

        // Store file ID and create preview
        const newPhoto = {
          fileId: uploadedFile.fileId,
          filename: uploadedFile.filename,
          preview: URL.createObjectURL(file),
          size: uploadedFile.size,
        };

        setUploadedPhotos((prev) => [...prev, newPhoto]);
      }
    } catch (error) {
      setError(error.message || "Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhotos(false);
      event.target.value = ""; // Reset input to allow re-uploading same file
    }
  };

  /**
   * Remove a photo from the upload list and delete from temp storage
   * @param {number} indexToRemove - Index of the photo to remove
   * @param {string} fileId - The file ID to delete from backend
   */
  const handleRemovePhoto = async (indexToRemove, fileId) => {
    try {
      // Delete from backend temp storage
      await API.deleteTempFile(fileId);

      // Revoke object URL
      const photoToRemove = uploadedPhotos[indexToRemove];
      if (photoToRemove?.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
      }

      // Remove from local state
      setUploadedPhotos((prevPhotos) =>
        prevPhotos.filter((_, index) => index !== indexToRemove)
      );
    } catch (error) {
      console.error("Failed to delete temp file:", error);
      // Still remove from UI even if backend delete fails
      const photoToRemove = uploadedPhotos[indexToRemove];
      if (photoToRemove?.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
      }

      setUploadedPhotos((prevPhotos) =>
        prevPhotos.filter((_, index) => index !== indexToRemove)
      );
    }
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
      !categoryId ||
      uploadedPhotos.length === 0
    ) {
      setError("All fields are required.");
      return;
    }
    if (uploadedPhotos.length < 1 || uploadedPhotos.length > 3) {
      setError("You must upload between 1 and 3 photos.");
      return;
    }

    setLoading(true);

    try {
      // Prepare report data according to API specification
      const reportData = {
        title,
        description,
        categoryId: parseInt(categoryId), // Ensure categoryId is a number
        citizenId: parseInt(citizenId),
        location: {
          latitude: position.lat,
          longitude: position.lng,
        },
        photoIds: uploadedPhotos.map((photo) => photo.fileId),
      };

      // Call API to create report
      const createdReport = await API.addNewReport(reportData);

      uploadedPhotos.forEach((photo) => {
        if (photo.preview) {
          URL.revokeObjectURL(photo.preview);
        }
      });

      // Reset form
      setTitle("");
      setDescription("");
      setCategoryId("");
      setUploadedPhotos([]);

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
        <Dropdown className="w-100">
          <Dropdown.Toggle
            variant="light"
            id="category-dropdown"
            className="w-100 text-start d-flex align-items-center justify-content-between report-form__select report-form__category-toggle"
          >
            {categoryId ? (
              <div className="d-flex align-items-center gap-2 report-form__category-selected">
                <span className="report-form__category-icon">
                  {getCategoryIcon(
                    categories.find((c) => c.id === categoryId)?.name || "",
                    18
                  )}
                </span>
                <span className="report-form__category-text">
                  {categories.find((c) => c.id === categoryId)?.name || ""}
                </span>
              </div>
            ) : (
              <span className="text-muted">Choose a category...</span>
            )}
          </Dropdown.Toggle>
          <Dropdown.Menu className="w-100 report-form__category-menu">
            {categories.map((categorie) => (
              <Dropdown.Item
                key={categorie.id}
                onClick={() => setCategoryId(categorie.id)}
                active={categoryId === categorie.id}
                className="report-form__category-item"
              >
                <div className="d-flex align-items-center gap-2 report-form__category-item-content">
                  <span className="report-form__category-icon">
                    {getCategoryIcon(categorie.name, 16)}
                  </span>
                  <span className="report-form__category-item-text">
                    {categorie.name}
                  </span>
                </div>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
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
            disabled={uploadedPhotos.length >= 3 || uploadingPhotos}
          />
          <label
            htmlFor="photo-upload-input"
            className={`report-form__upload-btn ${
              uploadedPhotos.length >= 3 || uploadingPhotos
                ? "report-form__upload-btn--disabled"
                : ""
            }`}
          >
            <i className="bi bi-camera-fill"></i>{" "}
            {uploadingPhotos ? "Uploading..." : "Upload Photo"}{" "}
          </label>
          <span className="report-form__photo-count">
            {uploadedPhotos.length}/3 photos uploaded
          </span>
        </div>

        {/* List of uploaded photos with preview and remove option */}
        {uploadedPhotos.length > 0 && (
          <div className="report-form__photo-list">
            {uploadedPhotos.map((photo, index) => (
              <div key={photo.fileId} className="report-form__photo-item">
                <img
                  src={photo.preview}
                  alt={`Preview ${index + 1}`}
                  className="report-form__photo-preview"
                />
                <div className="report-form__photo-info">
                  <span className="report-form__photo-name">
                    {photo.filename}
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemovePhoto(index, photo.fileId)}
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
        disabled={loading || uploadingPhotos}
      >
        {loading
          ? "Submitting..."
          : uploadingPhotos
          ? "Uploading Photos..."
          : "Submit Report"}
      </Button>
    </Form>
  );
}

export default ReportForm;
