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
          {getRoleIcon(user.role, 40)}
        </div>
        <div className="user-info">
          <p>
            <span className="info-label">name:</span> {user.firstName}
          </p>
          <p>
            <span className="info-label">surname:</span> {user.lastName}
          </p>
          <p>
            <span className="info-label">email:</span> {user.email}
          </p>
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
