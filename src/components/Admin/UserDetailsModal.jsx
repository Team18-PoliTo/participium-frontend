import PropTypes from "prop-types";
import { Modal, Badge } from "react-bootstrap";
import { getRoleIcon } from "../../constants/roleIcons";
import "../styles/RoleAssignmentModal.css"; // Reuse styling or create new if needed

function UserDetailsModal({ user, isOpen, onClose }) {
  if (!user) return null;

  const hasRoles = user.roles && user.roles.length > 0;
  const isMultiRole = hasRoles && user.roles.length > 1;

  let iconName = "Unassigned";
  if (isMultiRole) {
    iconName = "Multiple";
  } else if (hasRoles) {
    iconName = user.roles[0].name;
  }

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      backdropClassName="role-modal-backdrop"
      dialogClassName="role-modal-dialog"
      contentClassName="role-modal-content"
      animation={false}
    >
      <button className="role-modal-close" onClick={onClose}>
        ×
      </button>

      <h2 className="role-modal-title mb-4">User Details</h2>

      <div className="d-flex align-items-center mb-4">
        <div className="me-3">{getRoleIcon(iconName, 48)}</div>
        <div>
          <h4 className="mb-1 fw-bold">
            {user.firstName} {user.lastName}
          </h4>
          <p className="text-muted mb-0">{user.email}</p>
        </div>
      </div>

      <div className="mb-3">
        <h5 className="fw-bold fs-6 text-uppercase text-secondary mb-3">
          Assigned Roles
        </h5>
        <div className="d-flex flex-wrap gap-2">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge
                key={role.id}
                bg="light"
                text="dark"
                className="d-flex align-items-center px-3 py-2 border"
                style={{ fontSize: "0.9rem", gap: "8px" }}
              >
                {getRoleIcon(role.name, 18)}
                {role.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted fst-italic">No roles assigned</span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-top">
        <div className="d-flex justify-content-between text-muted small">
          <span>ID: {user.id}</span>
          <span>Status: {user.status || "Active"}</span>
        </div>
      </div>
    </Modal>
  );
}

UserDetailsModal.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    status: PropTypes.string,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default UserDetailsModal;
