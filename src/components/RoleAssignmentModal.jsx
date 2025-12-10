import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "./styles/RoleAssignmentModal.css";
import { getRoleIcon } from "../constants/roleIcons";
import { useState } from "react";

function RoleAssignmentModal({ user, isOpen, onClose, onAssignRole, availableRoles, companies, }) {

  const[selectedRoleId, setSelectedRoleId] = useState(null);
  const [step, setStep] = useState("role");

  const handleRoleSelect = (roleId) => {
    if (roleId === 28) {
      setSelectedRoleId(roleId);
      setStep("company");
    } else {
      onAssignRole(user.id, roleId);
      resetAndClose();
    }
  };

  const handleCompanySelect = (companyId) => {
    if (selectedRoleId) {
      onAssignRole(user.id, selectedRoleId, companyId);
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setStep("role");
    setSelectedRoleId(null);
    onClose();
  };

  const handleBack = () => {
    setStep("role");
    setSelectedRoleId(null);
  };

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

{step === "role" ? (
        <>
          <h2 className="role-modal-title">Assign Role</h2>
          <p className="role-modal-subtitle">
            Select a role for {user.firstName} {user.lastName}
          </p>
          <div className="role-options">
            {availableRoles?.filter((role) => role.id > 1)?.map((role) => (
              <button
                key={role.id}
                type="button"
                className="role-option"
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="role-icon">{getRoleIcon(role.role, 28)}</div>
                <span className="role-name">{role.role}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="d-flex align-items-center mb-3">
             <button 
                className="btn btn-link text-decoration-none p-0 me-3" 
                onClick={handleBack}
                style={{ fontSize: '1.2rem', color: '#333' }}
             >
                <i className="bi bi-arrow-left"></i>
             </button>
             <h2 className="role-modal-title mb-0">Select Company</h2>
          </div>
          <p className="role-modal-subtitle">
            Assign a company for External Maintainer
          </p>
          <div className="role-options">
            {companies?.map((company) => (
              <button
                key={company.id}
                type="button"
                className="role-option"
                onClick={() => handleCompanySelect(company.id)}
              >
                <div className="role-icon">
                  <i className="bi bi-building" style={{ fontSize: "28px" }}></i>
                </div>
                <span className="role-name">{company.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
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
  companies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
};

export default RoleAssignmentModal;