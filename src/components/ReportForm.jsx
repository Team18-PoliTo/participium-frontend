import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './styles/ReportForm.css';

/**
 * ReportForm Component
 * 
 * A form component for creating new reports with location, title, description, 
 * category, and photo uploads. Validates user input and handles photo management.
 * 
 * @param {Object} position - The geographic position selected on the map {lat, lng}
 * @param {Function} onFormSubmit - Callback function to execute when form is successfully submitted
 */
function ReportForm({ position, onFormSubmit }) {
  // Form state management
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle photo file upload
   * Validates that total photos don't exceed 3 and adds new photos to state
   */
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Check if adding new files would exceed the 3 photo limit
    if (photos.length + files.length > 3) {
      setError("You can upload a maximum of 3 photos.");
      return;
    }

    // Add new photos to existing photos array
    setPhotos(prevPhotos => [...prevPhotos, ...files]);
    setError('');
    event.target.value = ''; // Reset input to allow re-uploading same file
  };

  /**
   * Remove a photo from the upload list
   * @param {number} indexToRemove - Index of the photo to remove
   */
  const handleRemovePhoto = (indexToRemove) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, index) => index !== indexToRemove));
  };

  /**
   * Handle form submission
   * Validates all required fields and creates FormData for API submission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validate all required fields
    if (!position || !title || !description || !category || photos.length === 0) {
      setError("All fields are required.");
      return;
    }
    if (photos.length < 1 || photos.length > 3) {
      setError("You must upload between 1 and 3 photos.");
      return;
    }

    setLoading(true);

    // Create FormData object for API submission
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('latitude', position.lat);
    formData.append('longitude', position.lng);
    
    // Append all photos to FormData
    for (let i = 0; i < photos.length; i++) {
      formData.append('photos', photos[i]);
    }

    try {
      // TODO: Replace with actual API call
      console.log("Data ready to send:", Object.fromEntries(formData));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulates API call
      
      alert("Report submitted successfully!");
      onFormSubmit(); // Close the form panel
      
    } catch (apiError) {
      setError(apiError.message || "Error submitting the report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="report-form">
      {/* Error alert display */}
      {error && <Alert variant="danger" className="report-form__error">{error}</Alert>}
      
      {/* Selected position display (read-only) */}
      <Form.Group className="mb-3 report-form__group">
        <Form.Label className="report-form__label"><strong>Selected Position</strong></Form.Label>
        {position ? (
          <Form.Control 
            type="text" 
            value={`Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}`} 
            readOnly 
            disabled
            className="report-form__input report-form__input--readonly"
          />
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
      <Form.Group className="mb-3 report-form__group" controlId="formDescription">
        <Form.Label className="report-form__label">Description (Required)</Form.Label>
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
        <Form.Label className="report-form__label">Category (Required)</Form.Label>
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
        <Form.Label className="report-form__label">Photos (Required, min 1, max 3)</Form.Label>
        
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
          <label htmlFor="photo-upload-input" className={`report-form__upload-btn ${photos.length >= 3 ? 'report-form__upload-btn--disabled' : ''}`}>
            <i className='bi bi-camera-fill'></i> Upload Photo
          </label>
          <span className="report-form__photo-count">{photos.length}/3 photos uploaded</span>
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
        {loading ? 'Submitting...' : 'Submit Report'}
      </Button>
    </Form>
  );
}

export default ReportForm;