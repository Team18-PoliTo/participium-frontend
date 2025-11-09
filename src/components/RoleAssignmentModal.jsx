import React from "react";
import "./styles/RoleAssignmentModal.css";

import proIcon from "../resources/Immagine2.png";
import adminIcon from "../resources/Immagine3.png";
import techIcon from "../resources/Immagine4.png";

const roles = [
  {
    id: "pro",
    name: "Municipal Public Relations Officer",
    icon: proIcon,
  },
  {
    id: "admin",
    name: "Municipal Administrator",
    icon: adminIcon,
  },
  {
    id: "tech",
    name: "Technical Office Staff Member",
    icon: techIcon,
  },
];

function RoleAssignmentModal({ user, isOpen, onClose, onAssignRole }) {
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
          Select a role for {user.name} {user.surname}
        </p>
        <div className="role-options">
          {roles.map((role) => (
            <div key={role.id} className="role-option" onClick={() => handleRoleSelect(role.id)} style={{ backgroundColor: "#98C1D9", opacity: 1 }}
            >
              <img src={role.icon} alt={role.name} className="role-icon" />
              <span className="role-name">{role.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoleAssignmentModal;
