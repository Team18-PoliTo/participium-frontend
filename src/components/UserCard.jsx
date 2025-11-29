import { useState } from "react";
import "./styles/UserCard.css";
import RoleAssignmentModal from "./RoleAssignmentModal";
import { getRoleIcon } from "../constants/roleIcons";

function UserCard({ user, onAssignRole, availableRoles }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Trova il roleId dall'array dei ruoli disponibili confrontando con il nome del ruolo
  const currentRoleObj = availableRoles?.find(r => r.role === user.role);
  const currentRoleId = currentRoleObj?.id;
  const isUnassigned = currentRoleId === 0;

  return (
    <>
      <div className="user-card">
        <div className="user-icon">
          {getRoleIcon(user.role, 28)}
        </div>
        <div className="user-info">
          <div className="user-info-main">
            <span className="user-full-name">
              {user.firstName} {user.lastName}
            </span>
            <span
              className={`user-role-pill ${
                !user.role || isUnassigned ? "unassigned" : ""
              }`}
            >
              {user.role || "Unassigned"}
            </span>
          </div>
          <p className="user-email">{user.email}</p>
        </div>
        {isUnassigned && (
          <button className="user-add-btn" onClick={handleOpenModal}>
            <div className="plus-icon"></div>
          </button>
        )}
      </div>

      <RoleAssignmentModal
        user={user}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAssignRole={onAssignRole}
        availableRoles={availableRoles}
      />
    </>
  );
}

export default UserCard;
