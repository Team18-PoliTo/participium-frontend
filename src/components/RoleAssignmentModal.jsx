import React from "react";
import "./styles/RoleAssignmentModal.css";
import API from "../API/API";
import { getRoleIcon } from "../constants/roleIcons";

function RoleAssignmentModal({ user, isOpen, onClose, onAssignRole, availableRoles }) {
  if (!isOpen) return null;

  const handleRoleSelect = (roleId) => {
    onAssignRole(user.id, roleId);
    onClose();
  };

  return (
    <div className="role-modal-overlay" onClick={onClose}>
      <div className="role-modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#E1EDF4", opacity: 1 }}
      >
        <button className="role-modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="role-modal-title">Assign Role</h2>
        <p className="role-modal-subtitle">
          Select a role for {user.firstName} {user.lastName}
        </p>
        <div className="role-options">
          {availableRoles && availableRoles.filter((role) => role.id > 1).map((role) => (
            <div key={role.id} className="role-option" onClick={() => handleRoleSelect(role.id)} style={{ backgroundColor: "#98C1D9", opacity: 1 }}
            >
              <div className="role-icon">
                {getRoleIcon(role.role, 32)}
              </div>
              <span className="role-name">{role.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoleAssignmentModal;
