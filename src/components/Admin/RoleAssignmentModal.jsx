import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../styles/RoleAssignmentModal.css";
import { getRoleIcon } from "../../constants/roleIcons";
import { useState, useEffect } from "react";
import { allowedOfficerRoles } from "../../constants/allowedOfficerRoles";

const isTechnicalRole = (roleName) => {
  return allowedOfficerRoles.includes(roleName);
};

const isExternalMaintainer = (role) => {
  return (
    role.id === 28 || role.role.toLowerCase().includes("external maintainer")
  );
};

const getUpdatedTechnicalRoles = (prevIds, roleId, availableRoles) => {
  // If the previous selection contained non-technical roles, clear them
  const hasNonTech = prevIds.some((id) => {
    const r = availableRoles.find((ar) => ar.id === id);
    return r && (!isTechnicalRole(r.role) || isExternalMaintainer(r));
  });

  if (hasNonTech) {
    return [roleId];
  }

  // Toggle selection
  if (prevIds.includes(roleId)) {
    return prevIds.filter((id) => id !== roleId);
  } else {
    return [...prevIds, roleId];
  }
};

function RoleAssignmentModal({
  user,
  isOpen,
  onClose,
  onAssignRole,
  onRemoveRoles,
  availableRoles,
  companies,
}) {
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [step, setStep] = useState("role");

  useEffect(() => {
    if (isOpen && user?.roles) {
      const currentRoleIds = user.roles.map((role) => role.id);
      setSelectedRoleIds(currentRoleIds);
    }
  }, [isOpen, user]);

  const isUserUnsigned = () => {
    return (
      user.roles?.length === 1 &&
      (user.roles[0].name?.toLowerCase() === "unsigned" ||
        user.roles[0].name?.toLowerCase() === "unassigned")
    );
  };

  const handleRoleSelect = (role) => {
    const isTech = isTechnicalRole(role.role);
    const isExternal = isExternalMaintainer(role);
    const isAdminOrPRO = !isTech && !isExternal;

    if (isExternal || isAdminOrPRO) {
      if (selectedRoleIds.includes(role.id)) {
        // Toggle off if already selected
        setSelectedRoleIds([]);
      } else {
        // External Maintainer, Admin or PRO are exclusive single selections
        // Clear any existing selections since they're mutually exclusive
        setSelectedRoleIds([role.id]);
      }
    } else {
      // Technical roles: Multi-select logic
      setSelectedRoleIds((prevIds) =>
        getUpdatedTechnicalRoles(prevIds, role.id, availableRoles)
      );
    }
  };

  const handleConfirmRoles = () => {
    // Check if External Maintainer is selected
    const hasExternal = selectedRoleIds.some((id) => {
      const role = availableRoles.find((r) => r.id === id);
      return role && isExternalMaintainer(role);
    });

    if (hasExternal) {
      setStep("company");
    } else {
      // If no roles selected, send [0]
      const rolesToAssign =
        selectedRoleIds.length === 0 ? [0] : selectedRoleIds;
      onAssignRole(user.id, rolesToAssign);
      resetAndClose();
    }
  };

  const handleRemoveAllRoles = () => {
    // Trova il ruolo "unsigned" negli availableRoles
    const unsignedRole = availableRoles.find(
      (role) =>
        role.role?.toLowerCase() === "unsigned" ||
        role.role?.toLowerCase() === "unassigned"
    );

    if (unsignedRole) {
      // Assegna il ruolo unsigned
      onAssignRole(user.id, [unsignedRole.id]);
    } else {
      // Se non trova il ruolo unsigned, rimuovi tutti i ruoli
      onRemoveRoles(user.id);
    }
    resetAndClose();
  };

  const handleCompanySelect = (companyId) => {
    if (selectedRoleIds.length > 0) {
      // For external maintainer, we typically only have 1 role ID selected here
      onAssignRole(user.id, selectedRoleIds, companyId);
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setStep("role");
    setSelectedRoleIds([]);
    onClose();
  };

  const handleBack = () => {
    setStep("role");
    setSelectedRoleIds([]);
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
          <h2 className="role-modal-title">
            {isUserUnsigned() ? "Assign Role" : "Manage Roles"}
          </h2>
          <p className="role-modal-subtitle">
            {isUserUnsigned()
              ? `Select role for ${user.firstName} ${user.lastName}`
              : `Update or reset roles for ${user.firstName} ${user.lastName}`}
          </p>
          <div className="role-options">
            {availableRoles
              ?.filter((role) => role.id > 1)
              ?.map((role) => {
                const isSelected = selectedRoleIds.includes(role.id);
                const isExternal = isExternalMaintainer(role);

                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`role-option ${
                      isExternal ? "role-option-highlighted" : ""
                    } ${isSelected ? "selected-role" : ""}`}
                    onClick={() => handleRoleSelect(role)}
                    style={
                      isSelected
                        ? {
                            borderColor: "#0d6efd",
                            backgroundColor: "rgba(13, 110, 253, 0.1)",
                          }
                        : {}
                    }
                  >
                    <div className="role-icon">
                      {getRoleIcon(role.role, 28)}
                    </div>
                    <span className="role-name">{role.role}</span>
                    {isSelected && (
                      <i
                        className="bi bi-check-circle-fill ms-auto text-primary"
                        style={{ fontSize: "1.2rem" }}
                      ></i>
                    )}
                  </button>
                );
              })}
          </div>
          <div className="mt-4 d-flex justify-content-end gap-2">
            {isUserUnsigned() ? (
              // Se l'utente ha ruolo unsigned, mostra solo Add Role
              <button
                className="role-modal-btn role-modal-btn-primary"
                onClick={handleConfirmRoles}
              >
                <i className="bi bi-plus-circle"></i>Add Role
              </button>
            ) : (
              // Se l'utente ha ruoli assegnati (non unsigned), mostra Save e Reset All
              <>
                <button
                  className="role-modal-btn role-modal-btn-secondary"
                  onClick={handleRemoveAllRoles}
                >
                  <i className="bi bi-arrow-counterclockwise"> </i>Reset All
                </button>
                <button
                  className="role-modal-btn role-modal-btn-primary"
                  onClick={handleConfirmRoles}
                >
                  <i className="bi bi-check-circle"></i>Save
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="d-flex align-items-center mb-3">
            <button
              className="btn btn-link text-decoration-none p-0 me-3"
              onClick={handleBack}
              style={{ fontSize: "1.2rem", color: "#333" }}
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
                  <i
                    className="bi bi-building"
                    style={{ fontSize: "28px" }}
                  ></i>
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
    roles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      })
    ),
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAssignRole: PropTypes.func.isRequired,
  onRemoveRoles: PropTypes.func.isRequired,
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
