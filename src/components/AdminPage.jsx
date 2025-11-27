import React, { useEffect, useState } from "react";
import { Dropdown, Form } from "react-bootstrap";
import "./styles/AdminPage.css";
import SetUpUserModal from "./SetUpUserModal";
import UserCard from "./UserCard";
import API from "../API/API";
import { getRoleIcon } from "../constants/roleIcons";

function AdminPage() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [users, setUsers] = useState([]);
  const [isSetUpModalOpen, setIsSetUpModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [visibleRoles, setVisibleRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});
  const [searchEmail, setSearchEmail] = useState("");

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

  const filteredUsers = users.filter((user) => {
    // Filtra per ruolo
    const roleMatch =
      selectedFilter !== null
        ? user.role === roleMapping[selectedFilter]
        : true;

    // Filtra per email
    const emailMatch = user.email
      .toLowerCase()
      .includes(searchEmail.toLowerCase());

    return roleMatch && emailMatch;
  });

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
            
            <h3 className="filter-title">Search by email:</h3>
            <Form.Control
              type="text"
              placeholder="Enter email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="search-email-input"
            />

            <h3 className="filter-title">Filter by role:</h3>
            <Dropdown>
              <Dropdown.Toggle className="custom-dropdown-toggle" id="dropdown-basic">
                {selectedFilter !== null 
                  ? roleMapping[selectedFilter] 
                  : "All Users"}
              </Dropdown.Toggle>

              <Dropdown.Menu className="custom-dropdown-menu">
                <Dropdown.Item 
                  className="custom-dropdown-item"
                  onClick={() => setSelectedFilter(null)}
                  active={selectedFilter === null}
                >
                  All Users
                </Dropdown.Item>
                {visibleRoles.map((role) => (
                  <Dropdown.Item
                    key={role.id}
                    className="custom-dropdown-item"
                    onClick={() => setSelectedFilter(role.id)}
                    active={selectedFilter === role.id}
                  >
                    {role.role}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Colonna Destra: Legenda */}
          <div className="admin-legend-section">
            <div className="legend-box">
              <h3 className="legend-title">Legend for users</h3>
              <div className="legend-grid">
                {visibleRoles.map((role) => (
                  <div key={role.id} className="legend-item">
                    <div className="legend-icon">
                      {getRoleIcon(role.role, 30)}
                    </div>
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
