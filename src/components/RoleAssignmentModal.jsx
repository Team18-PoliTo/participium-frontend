import PropTypes from "prop-types";
import "./styles/RoleAssignmentModal.css";
import { getRoleIcon } from "../constants/roleIcons";

function RoleAssignmentModal({ user, isOpen, onClose, onAssignRole, availableRoles }) {
  if (!isOpen) return null;

  const handleRoleSelect = (roleId) => {
    onAssignRole(user.id, roleId);
    onClose();
  };

  return (
    <div className="role-modal-overlay" onClick={onClose}>
      <div className="role-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="role-modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="role-modal-title">Assign Role</h2>
        <p className="role-modal-subtitle">
          Select a role for {user.firstName} {user.lastName}
        </p>
        <div className="role-options">
          {availableRoles && availableRoles.filter((role) => role.id > 1).map((role) => (
            <div key={role.id} className="role-option" onClick={() => handleRoleSelect(role.id)}>
              <div className="role-icon">
                {getRoleIcon(role.role, 28)}
              </div>
              <span className="role-name">{role.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

RoleAssignmentModal.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAssignRole: PropTypes.func.isRequired,
  availableRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      role: PropTypes.string.isRequired,
    })
  ),
};

export default RoleAssignmentModal;
