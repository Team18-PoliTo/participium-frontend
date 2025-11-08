import { useState } from "react";
import "./styles/UserCard.css";
import RoleAssignmentModal from "./RoleAssignmentModal";

import unassignedIcon from "../resources/Immagine1.png";
import proIcon from "../resources/Immagine2.png";
import adminIcon from "../resources/Immagine3.png";
import techIcon from "../resources/Immagine4.png";

const iconMap = {
  unassigned: unassignedIcon,
  pro: proIcon,
  admin: adminIcon,
  tech: techIcon,
};

function UserCard({ user, onAssignRole }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="user-card">
        <img src={iconMap[user.role]} alt={user.role} className="user-icon" />
        <div className="user-info">
          <p>
            <span className="info-label">name:</span> {user.name}
          </p>
          <p>
            <span className="info-label">surname:</span> {user.surname}
          </p>
          <p>
            <span className="info-label">username:</span> {user.username}
          </p>
        </div>
        {user.role === "unassigned" && (
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
      />
    </>
  );
}

export default UserCard;
