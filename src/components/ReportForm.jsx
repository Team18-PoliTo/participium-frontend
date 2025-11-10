import { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

function ReportForm({ position, onFormSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!position || !title || !description || !category || !photos) {
      setError("Tutti i campi sono obbligatori.");
      return;
    }
    if (photos.length < 1 || photos.length > 3) {
      setError("Devi caricare da 1 a 3 foto.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('latitude', position.lat);
    formData.append('longitude', position.lng);
    for (let i = 0; i < photos.length; i++) {
      formData.append('photos', photos[i]);
    }

    try {
      
      console.log("Dati pronti per l'invio:", Object.fromEntries(formData));
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula chiamata API
      
      alert("Segnalazione inviata con successo!");
      onFormSubmit(); // Chiude il pannello (Offcanvas)
      
    } catch (apiError) {
      setError(apiError.message || "Errore nell'invio della segnalazione.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Rimuovi la Row/Col e il componente Mappa da qui
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label><strong>Posizione Selezionata (PT04)</strong></Form.Label>
        {position ? (
          <Form.Control 
            type="text" 
            value={`Lat: ${position.lat.toFixed(4)}, Lng: ${position.lng.toFixed(4)}`} 
            readOnly 
            disabled
          />
        ) : (
          <Form.Control type="text" value="Errore: Posizione non trovata" readOnly disabled />
        )}
      </Form.Group>

      <Form.Group className="mb-3" controlId="formTitle">
        <Form.Label>Titolo (Obbligatorio)</Form.Label>
        <Form.Control 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formDescription">
        <Form.Label>Descrizione (Obbligatoria)</Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required 
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formCategory">
        <Form.Label>Categoria (Obbligatoria)</Form.Label>
        <Form.Select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Scegli una categoria...</option>
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

      <Form.Group className="mb-3" controlId="formPhotos">
        <Form.Label>Foto (Obbligatorie, min 1, max 3)</Form.Label>
        <Form.Control 
          type="file" 
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(e.target.files)}
          required 
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="w-100" disabled={loading}>
        {loading ? 'Invio in corso...' : 'Invia Segnalazione'}
      </Button>
    </Form>
  );
}

export default ReportForm;