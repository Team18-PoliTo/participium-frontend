import './styles/AdminPage.css';
import { Container, Row, Col, Button } from 'react-bootstrap';

import unassignedIcon from '../resources/Immagine1.png'; //
import proIcon from '../resources/Immagine2.png'; //
import adminIcon from '../resources/Immagine3.png'; //
import techIcon from '../resources/Immagine4.png'; //

const iconMap = {
  unassigned: unassignedIcon,
  pro: proIcon,
  admin: adminIcon,
  tech: techIcon,
};

const dummyUsers = [
  { id: 1, name: 'Jacopo', surname: 'Esposito', username: 'Jaja', role: 'unassigned' },
  { id: 2, name: 'Matteo', surname: 'Rosato', username: 'Matte', role: 'unassigned' },
  { id: 3, name: 'Jacopo', surname: 'Esposito', username: 'Jaja', role: 'admin' },
  { id: 4, name: 'Matteo', surname: 'Rosato', username: 'Jaja', role: 'tech' },
  { id: 5, name: 'Jacopo', surname: 'Esposito', username: 'Jaja', role: 'unassigned' },
  { id: 6, name: 'Jacopo', surname: 'Esposito', username: 'Jaja', role: 'pro' },
];

function AdminPage() {
  return (
    <div className="admin-page-container">
      <div className='admin-container'>
        <Row className="mb-4">
          {/* Colonna Filtri */}
          <Col md={6} lg={6}>
            <Button className="add-user-btn mb-4">Add a new user</Button>   
            <h3 className="section-title">Filter by:</h3>
            <div className="filter-buttons">
              <Button className="filter-btn">unassigned users</Button>
              <Button className="filter-btn">municipal public relations officer</Button>
              <Button className="filter-btn">municipal administrator</Button>
              <Button className="filter-btn">technical office staff member</Button>
            </div>
          </Col>

          {/* Colonna Legenda */}
          <Col md={6} lg={6}>
            <div className="legend-box">
              <h3 className="section-title mb-3">Legend for users</h3>
              <Row>
                <Col xs={6}>
                    <div className="legend-item">
                        <img src={unassignedIcon} alt="unassigned" className="icona-legend"/>
                        <span>unassigned users</span>
                    </div>
                </Col>
                <Col xs={6}>
                    <div className="legend-item">
                        <img src={adminIcon} alt="admin" className="icona-legend" />
                        <span>municipal administrator</span>
                    </div>
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                    <div className="legend-item">
                        <img src={proIcon} alt="pro" className="icona-legend"/>
                        <span>municipal public relations officer</span>
                    </div>
                </Col>
                <Col xs={6}>
                    <div className="legend-item">
                        <img src={techIcon} alt="tech" className="icona-legend" />
                        <span>technical office staff member</span>
                    </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Lista Utenti */}
        <Row xs={1} lg={2} className="g-4">
          {dummyUsers.map((user) => (
            <Col key={user.id}>
              <div className="user-card">
                <img
                  src={iconMap[user.role]}
                  alt={user.role}
                  className="user-icon"
                />
                <div className="user-info">
                  <p><strong>name:</strong> {user.name}</p>
                  <p><strong>surname:</strong> {user.surname}</p>
                  <p><strong>username:</strong> {user.username}</p>
                </div>
                <Button className="add-btn">+</Button>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
export default AdminPage;