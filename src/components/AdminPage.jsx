import { useEffect, useState } from "react";
import { Form, Card, Container, Button, Badge, InputGroup, } from "react-bootstrap";
import "./styles/AdminPage.css";
import SetUpUserModal from "./SetUpUserModal";
import UserCard from "./UserCard";
import RoleAssignmentModal from "./RoleAssignmentModal";
import API from "../API/API";
import { getRoleIcon } from "../constants/roleIcons";

function AdminPage() {
  const [selectedFilter, setSelectedFilter] = useState(new Set());
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isSetUpModalOpen, setIsSetUpModalOpen] = useState(false);
  const [visibleRoles, setVisibleRoles] = useState([]);
  const [roleMapping, setRoleMapping] = useState({});
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const fetchedRoles = await API.getAllRoles();

        const mapping = {};
        for (const role of fetchedRoles) {
          mapping[role.id] = role.role;
        }
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
    const fetchData = async () => {
      try {
        const [fetchedUsers, fetchedCompanies] = await Promise.all([
          API.getAllInternalUsers(),
          API.getAllCompanies(),
        ]);

        const roleNameToExclude = roleMapping[1];
        const filteredUsers = roleNameToExclude
          ? fetchedUsers.filter((user) => user.role !== roleNameToExclude)
          : fetchedUsers;

        setUsers(filteredUsers);
        setCompanies(fetchedCompanies);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (Object.keys(roleMapping).length > 0) {
      fetchData();
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

  const handleOpenRoleModal = (user) => {
    setSelectedUserForRole(user);
    setIsRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setSelectedUserForRole(null);
  };

  const filteredUsers = users.filter((user) => {
    // Filtra per ruolo (multi-select)
    const userRoleId = Object.keys(roleMapping).find(
      (id) => roleMapping[id] === user.role
    );
    const roleMatch =
      selectedFilter.size === 0 ? true : selectedFilter.has(Number(userRoleId));

    // Filtra per email
    const emailMatch = user.email
      .toLowerCase()
      .includes(searchEmail.toLowerCase());

    return roleMatch && emailMatch;
  });

  const handleFilterClick = (roleId) => {
    setSelectedFilter((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(roleId)) {
        newSelected.delete(roleId);
      } else {
        newSelected.add(roleId);
      }
      return newSelected;
    });
  };

  const handleAssignRole = async (userId, newRoleId, companyId = null) => {
    try {
      // Trova l'utente corrente
      const currentUser = users.find((user) => user.id === userId);
      if (!currentUser) {
        console.error("User not found");
        return;
      }

      const updatedUser = await API.updateInternalUserRole(
        userId,
        currentUser.firstName,
        currentUser.lastName,
        currentUser.email,
        newRoleId,
        companyId
      );

      setSelectedFilter(new Set());
      setSearchEmail("");

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...currentUser, ...updatedUser } : user
        )
      );

      handleCloseRoleModal();
    } catch (error) {
      console.error("Error assigning role:", error);
    }
  };

  return (
    <div className="admin-board">
      <Container fluid className="admin-content-wrapper">
        <header className="admin-headline">
          <div className="admin-headline-text">
            <Badge className="admin-eyebrow">Administrator</Badge>
            <h1 className="admin-title">Administration</h1>
            <p className="admin-subtitle">
              Manage internal municipality users and assign roles
            </p>
          </div>
          <Button
            variant="primary"
            className="add-user-btn desktop-only"
            onClick={handleOpenSetUpModal}
          >
            <i className="bi bi-plus-lg me-2" /> Add user
          </Button>
        </header>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <Card className="filter-card">
              <Card.Body>
                <label className="filter-title" htmlFor="admin-search-input">
                  Search by email
                </label>
                <InputGroup className="search-input-group">
                  <InputGroup.Text className="search-icon">
                    <i className="bi bi-search" />
                  </InputGroup.Text>
                  <Form.Control
                    id="admin-search-input"
                    type="text"
                    placeholder="name.surname@participium.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="search-email-input"
                  />
                </InputGroup>
              </Card.Body>
            </Card>

            <Button
              variant="primary"
              className="add-user-btn mobile-only w-100"
              onClick={handleOpenSetUpModal}
            >
              <i className="bi bi-plus-lg me-2" /> Add user
            </Button>
            <Card className="legend-card">
              <Card.Body>
                <p className="legend-card-title">Filter by roles</p>
                <div className="legend-chips">
                  {visibleRoles.map((role) => (
                    <Badge
                      key={role.id}
                      bg="light"
                      className={`legend-chip ${
                        selectedFilter.has(role.id) ? "legend-chip-active" : ""
                      }`}
                      onClick={() => handleFilterClick(role.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="legend-chip-icon">
                        {getRoleIcon(role.role, 20)}
                      </span>
                      <span className="legend-chip-text">{role.role}</span>
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </aside>

          <section className="admin-main">
            <Card className="admin-users-card">
              <Card.Body>
                <div className="admin-users-header">
                  <div>
                    <h2 className="users-title">Team directory</h2>
                    <p className="users-count">
                      Showing{" "}
                      <Badge bg="secondary" className="count-badge">
                        {filteredUsers.length}
                      </Badge>{" "}
                      municipality user
                      {filteredUsers.length === 1 ? "" : "s"} for the selected
                      filters.
                    </p>
                  </div>
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="admin-empty-state">
                    <i className="bi bi-inbox empty-icon" />
                    <p className="empty-message">No users match this filter.</p>
                    <p className="empty-hint">Try another email or role.</p>
                  </div>
                ) : (
                  <div className="user-list">
                    {filteredUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        availableRoles={visibleRoles}
                        onOpenRoleModal={handleOpenRoleModal}
                      />
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </section>
        </div>
      </Container>
      <SetUpUserModal
        isOpen={isSetUpModalOpen}
        onClose={handleCloseSetUpModal}
        onCreateUser={handleCreateUser}
      />
      {selectedUserForRole && (
        <RoleAssignmentModal
          user={selectedUserForRole}
          isOpen={isRoleModalOpen}
          onClose={handleCloseRoleModal}
          onAssignRole={handleAssignRole}
          availableRoles={visibleRoles}
          companies={companies}
        />
      )}
    </div>
  );
}

export default AdminPage;
