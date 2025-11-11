import React, { useEffect, useState } from "react";
import "./styles/AdminPage.css";
import SetUpUserModal from "./SetUpUserModal";
import UserCard from "./UserCard";
import API from "../API/API";
import unassignedIcon from "../resources/Immagine1.png";
import proIcon from "../resources/Immagine2.png";
import adminIcon from "../resources/Immagine3.png";
import techIcon from "../resources/Immagine4.png";

const iconMap = {
  0: unassignedIcon,
  2: proIcon,
  3: techIcon,
  4: adminIcon,
};

function AdminPage() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [users, setUsers] = useState([]);
  const [isSetUpModalOpen, setIsSetUpModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [visibleRoles, setVisibleRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const fetchedRoles = await API.getAllRoles();
        setRoles(fetchedRoles);

        const mapping = {};
        fetchedRoles.forEach((role) => {
          mapping[role.id] = role.role;
        });
        setRoleMapping(mapping);

        const filtered = fetchedRoles.filter((role) => role.id !== 1);
        setVisibleRoles(filtered);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await API.getAllInternalUsers();

        const roleNameToExclude = roleMapping[1];
        const filteredUsers = roleNameToExclude
          ? fetchedUsers.filter((user) => user.role !== roleNameToExclude)
          : fetchedUsers;

        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (Object.keys(roleMapping).length > 0) {
      fetchUsers();
    }
  }, [roleMapping]);

  const handleOpenSetUpModal = () => {
    setIsSetUpModalOpen(true);
  };

  const handleCloseSetUpModal = () => {
    setIsSetUpModalOpen(false);
  };

  const handleCreateUser = async (newUser) => {
    const createdUser = await API.registerInternalUser(newUser);
    setUsers((prevUsers) => [...prevUsers, createdUser]);
  };

  const filteredUsers =
    selectedFilter !== null
      ? users.filter((user) => {
          const selectedRoleName = roleMapping[selectedFilter];
          return user.role === selectedRoleName;
        })
      : users;

  const handleFilterClick = (roleId) => {
    setSelectedFilter(selectedFilter === roleId ? null : roleId);
  };

  const handleAssignRole = async (userId, newRoleId) => {
    try {
      // Trova l'utente corrente
      const currentUser = users.find((user) => user.id === userId);
      if (!currentUser) {
        console.error("User not found");
        return;
      }

      // Chiama l'API con i vecchi valori tranne il ruolo
      await API.updateInternalUserRole(
        userId,
        currentUser.firstName,
        currentUser.lastName,
        currentUser.email,
        newRoleId
      );

      // Aggiorna lo state locale con il nuovo ruolo (come nome)
      const newRoleName = roleMapping[newRoleId];
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRoleName } : user
        )
      );
    } catch (error) {
      console.error("Error assigning role:", error);
      // Potresti mostrare un messaggio di errore all'utente qui
    }
  };

  return (
    <div className="admin-board">
      <div className="admin-content-wrapper">
        {/* Prima Riga: Filtri e Legenda */}
        <div className="admin-top-row">
          {/* Colonna Sinistra: Filtri */}
          <div className="admin-sidebar">
            <button
              className="add-user-btn"
              onClick={() => handleOpenSetUpModal()}
            >
              Add a new user
            </button>
            <h3 className="filter-title">Filter by:</h3>
            <div className="filter-grid">
              {visibleRoles.map((role) => (
                <button
                  key={role.id}
                  className={`filter-btn ${
                    selectedFilter === role.id ? "active" : ""
                  }`}
                  onClick={() => handleFilterClick(role.id)}
                >
                  {role.role}
                </button>
              ))}
            </div>
          </div>

          {/* Colonna Destra: Legenda */}
          <div className="admin-legend-section">
            <div className="legend-box">
              <h3 className="legend-title">Legend for users</h3>
              <div className="legend-grid">
                {visibleRoles.map((role) => (
                  <div key={role.id} className="legend-item">
                    <img
                      src={iconMap[role.id] || unassignedIcon}
                      alt={role.role}
                    />
                    <span>{role.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="divider-line" />

        {/* Seconda Riga: Lista Utenti con Scroll */}
        <div className="admin-users-row">
          <div className="user-list">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onAssignRole={handleAssignRole}
                availableRoles={visibleRoles}
              />
            ))}
          </div>
        </div>
      </div>
      <SetUpUserModal
        isOpen={isSetUpModalOpen}
        onClose={handleCloseSetUpModal}
        onCreateUser={handleCreateUser}
      />
    </div>
  );
}

export default AdminPage;
