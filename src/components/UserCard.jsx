import "./styles/UserCard.css";
import { getRoleIcon } from "../constants/roleIcons";

function UserCard({ user, availableRoles, onOpenRoleModal }) {

  // Trova il roleId dall'array dei ruoli disponibili confrontando con il nome del ruolo
  const currentRoleObj = availableRoles?.find(r => r.role === user.role);
  const currentRoleId = currentRoleObj?.id;
  const isUnassigned = currentRoleId === 0;

  return (
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
        <button className="user-add-btn" onClick={() => onOpenRoleModal(user)}>
          <div className="plus-icon"></div>
        </button>
      )}
    </div>
  );
}

export default UserCard;
