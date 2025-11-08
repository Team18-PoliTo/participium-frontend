import React, { useContext, useEffect } from "react";
import "./styles/AdminPage.css";
import { NavbarTextContext } from "../App";
import UserCard from "./UserCard";

import unassignedIcon from "../resources/Immagine1.png";
import proIcon from "../resources/Immagine2.png";
import adminIcon from "../resources/Immagine3.png";
import techIcon from "../resources/Immagine4.png";

const iconMap = {
  unassigned: unassignedIcon,
  pro: proIcon,
  admin: adminIcon,
  tech: techIcon,
};

const dummyUsers = [
  {
    id: 1,
    name: "Jacopo",
    surname: "Esposito",
    username: "Jaja",
    role: "unassigned",
  },
  {
    id: 2,
    name: "Matteo",
    surname: "Rosato",
    username: "Matte",
    role: "unassigned",
  },
  {
    id: 3,
    name: "Jacopo",
    surname: "Esposito",
    username: "Jaja",
    role: "admin",
  },
  { id: 4, name: "Matteo", surname: "Rosato", username: "Jaja", role: "tech" },
  {
    id: 5,
    name: "Jacopo",
    surname: "Esposito",
    username: "Jaja",
    role: "unassigned",
  },
  { id: 6, name: "Jacopo", surname: "Esposito", username: "Jaja", role: "pro" },
  { id: 7, name: "Jacopo", surname: "Esposito", username: "Jaja", role: "pro" },
  { id: 8, name: "Jacopo", surname: "Esposito", username: "Jaja", role: "pro" },
];

function AdminPage() {
  return (
    <div className="admin-board">
      <div className="admin-content-wrapper">
        {/* Prima Riga: Filtri e Legenda */}
        <div className="admin-top-row">
          {/* Colonna Sinistra: Filtri */}
          <div className="admin-sidebar">
            <button className="add-user-btn">Add a new user</button>
            <h3 className="filter-title">Filter by:</h3>
            <div className="filter-grid">
              <button className="filter-btn">unassigned users</button>
              <button className="filter-btn">
                municipal public relations officer
              </button>
              <button className="filter-btn">municipal administrator</button>
              <button className="filter-btn">
                technical office staff member
              </button>
            </div>
          </div>

          {/* Colonna Destra: Legenda */}
          <div className="admin-legend-section">
            <div className="legend-box">
              <h3 className="legend-title">Legend for users</h3>
              <div className="legend-grid">
                <div className="legend-item">
                  <img src={unassignedIcon} alt="unassigned" />
                  <span>unassigned users</span>
                </div>
                <div className="legend-item">
                  <img src={proIcon} alt="pro" />
                  <span>municipal public relations officer</span>
                </div>
                <div className="legend-item">
                  <img src={adminIcon} alt="admin" />
                  <span>municipal administrator</span>
                </div>
                <div className="legend-item">
                  <img src={techIcon} alt="tech" />
                  <span>technical office staff member</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider-line" />

        {/* Seconda Riga: Lista Utenti con Scroll */}
        <div className="admin-users-row">
          <div className="user-list">
            {dummyUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
