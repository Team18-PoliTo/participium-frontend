import PropTypes from "prop-types";
import "./styles/UserCard.css";
import { getRoleIcon } from "../constants/roleIcons";

function UserCard({ user, availableRoles, onOpenRoleModal }) {
  const currentRoleObj = availableRoles?.find((r) => r.role === user.role);
  const currentRoleId = currentRoleObj?.id;
  const isUnassigned = currentRoleId === 0;

  return (
    <div className="user-card">
      <div className="user-icon">{getRoleIcon(user.role, 28)}</div>
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
        <button className="user-add-btn" onClick={() => onOpenRoleModal(user)}>
          <div className="plus-icon"></div>
        </button>
      )}
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string,
  }).isRequired,
  availableRoles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      role: PropTypes.string.isRequired,
    })
  ),
  onOpenRoleModal: PropTypes.func.isRequired,
};

export default UserCard;
