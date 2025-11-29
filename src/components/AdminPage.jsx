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
        <header className="admin-headline">
          <div className="admin-headline-text">
            <p className="admin-eyebrow">Administration</p>
            <h1>Internal operators</h1>
            <p className="admin-subtitle">
              Quickly locate a colleague and adjust their role. Filters apply instantly and the view adapts to any screen size.
            </p>
          </div>
          <button className="add-user-btn desktop-only" onClick={handleOpenSetUpModal}>
            + Add user
          </button>
        </header>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="filter-card">
              <label className="filter-title" htmlFor="admin-search-input">
                Search by email
              </label>
              <div className="input-with-icon">
                <span className="input-icon">🔍</span>
                <Form.Control
                  id="admin-search-input"
                  type="text"
                  placeholder="name.surname@participium.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="search-email-input"
                />
              </div>
            </div>

            <div className="filter-card">
              <label className="filter-title" htmlFor="admin-role-filter">
                Filter by role
              </label>
              <Dropdown>
                <Dropdown.Toggle
                  id="admin-role-filter"
                  className="custom-dropdown-toggle"
                >
                  {selectedFilter !== null
                    ? roleMapping[selectedFilter]
                    : "All users"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="custom-dropdown-menu">
                  <Dropdown.Item
                    className="custom-dropdown-item"
                    onClick={() => setSelectedFilter(null)}
                    active={selectedFilter === null}
                  >
                    All users
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

            <button className="add-user-btn mobile-only" onClick={handleOpenSetUpModal}>
              + Add user
            </button>

            <div className="legend-card" aria-label="Legend for user roles">
              <p className="legend-card-title">Roles</p>
              <div className="legend-chips">
                {visibleRoles.map((role) => (
                  <div key={role.id} className="legend-chip">
                    <span className="legend-chip-icon">
                      {getRoleIcon(role.role, 20)}
                    </span>
                    {role.role}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="admin-main">
            <div className="admin-users-card">
              <div className="admin-users-header">
                <div>
                  <h2>Team directory</h2>
                  <p>
                    Showing {filteredUsers.length} user
                    {filteredUsers.length === 1 ? "" : "s"} for the selected filters.
                  </p>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="admin-empty-state">
                  No users match this filter. Try another email or role.
                </div>
              ) : (
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
              )}
            </div>
          </section>
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
