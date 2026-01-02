import PropTypes from "prop-types";
import "../styles/UserCard.css";
import { getRoleIcon } from "../../constants/roleIcons";

function UserCard({ user, onOpenRoleModal, onClick }) {
  const hasRoles = user.roles && user.roles.length > 0;
  const isMultiRole = hasRoles && user.roles.length > 1;

  // Decides which icon to show
  let iconName = "Unassigned";
  if (isMultiRole) {
    iconName = "Multiple";
  } else if (hasRoles) {
    iconName = user.roles[0].name;
  }

  // Render role pill content
  const renderRolePill = () => {
    if (!hasRoles) {
      return <span className="user-role-pill unassigned">Unassigned</span>;
    }
    if (isMultiRole) {
      return <span className="user-role-pill">{user.roles.length} ROLES</span>;
    }
    return <span className="user-role-pill">{user.roles[0].name}</span>;
  };

  return (
    <div className="user-card">
      <button className="user-card-main-action" onClick={onClick} type="button">
        <div className="user-icon">{getRoleIcon(iconName, 28)}</div>
        <div className="user-info">
          <div className="user-info-main">
            <span className="user-full-name">
              {user.firstName} {user.lastName}
            </span>
            <div className="user-roles-container">{renderRolePill()}</div>
          </div>
          <p className="user-email">{user.email}</p>
        </div>
      </button>
      {/* Show add button to allow adding roles */}
      <button
        className="user-add-btn"
        type="button"
        style={{ padding: 0 }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenRoleModal(user);
        }}
      >
        <div className="plus-icon"></div>
      </button>
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
  }).isRequired,
  onOpenRoleModal: PropTypes.func.isRequired,
  onClick: PropTypes.func,
};

export default UserCard;
