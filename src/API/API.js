const SERVER_URL = ""; //empty string to use proxy configured in vite.config.js

const registerCitizen = async (credentials) => {
  try {
    const response = await fetch(`${SERVER_URL}api/citizens/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: credentials.email,
        username: credentials.username,
        firstName: credentials.name,
        lastName: credentials.surname,
        password: credentials.password,
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      const citizen = responseData.user;
      return citizen;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Password must have at least 6 characters"
      );
    } else if (response.status === 409) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Email or username already in use");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Registration failed"
      );
    }
  } catch (error) {
    throw error;
  }
};

const loginCitizen = async (credentials) => {
  try {
    const response = await fetch(`${SERVER_URL}api/auth/citizens/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      const token = {
        accessToken: responseData.access_token,
        tokenType: responseData.token_type,
      };
      localStorage.setItem("authToken", JSON.stringify(token.accessToken));
      return token;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Email and password are required");
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Invalid email or password");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Login failed");
    }
  } catch (error) {
    throw error;
  }
};

const loginInternalUser = async (credentials) => {
  try {
    const response = await fetch(`${SERVER_URL}api/auth/internal/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });
    if (response.ok) {
      const responseData = await response.json();
      const token = {
        accessToken: responseData.access_token,
        tokenType: responseData.token_type,
      };
      localStorage.setItem("authToken", JSON.stringify(token.accessToken));
      return token;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Email and password are required");
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Invalid email or password");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Login failed");
    }
  } catch (error) {
    throw error;
  }
};

const getUserInfo = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Failed to fetch user info"
      );
    }
  } catch (error) {
    throw error;
  }
};

const logoutUser = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (response.ok) {
      localStorage.removeItem("authToken");
      return true;
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Logout failed");
    }
  } catch (error) {
    throw error;
  }
};

const getAllInternalUsers = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/admin/internal-users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          errorData.message ||
          "Failed to retrieve internal users"
      );
    }
  } catch (error) {
    throw error;
  }
};

const registerInternalUser = async (credentials) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/admin/internal-users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        firstName: credentials.name,
        lastName: credentials.surname,
        email: credentials.email,
        password: credentials.password,
      }),
    });
    if (response.ok) {
      const user = await response.json();
      return user;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Validation error");
    } else if (response.status === 409) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Email already in use");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Registration failed"
      );
    }
  } catch (error) {
    throw error;
  }
};

const updateInternalUserRole = async (id, name, surname, email, role) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(
      `${SERVER_URL}api/admin/internal-users/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          newEmail: email,
          newFirstName: name,
          newLastName: surname,
          newRoleId: role,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Invalid ID or validation error");
    } else if (response.status === 409) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Email already in use");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || "Update failed");
    }
  } catch (error) {
    throw error;
  }
};

const getAllRoles = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/admin/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Could not fetch roles");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Failed to fetch roles"
      );
    }
  } catch (error) {
    throw error;
  }
};

const addNewReport = async (reportData) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    // Build request body, only including fields that exist
    const requestBody = {
      title: reportData.title,
      description: reportData.description,
      categoryId: reportData.categoryId,
      location: reportData.location,
      photoIds: reportData.photoIds,
    };

    const response = await fetch(`${SERVER_URL}api/citizens/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Validation error");
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unauthorized");
    } else if (response.status === 403) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Forbidden");
    } else if (response.status === 413) {
      throw new Error("Files are too large. Please upload smaller files.");
    } else {
      // Try to parse JSON, but handle cases where server returns HTML
      try {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to create report"
        );
      } catch (jsonError) {
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }
    }
  } catch (error) {
    throw error;
  }
};

const judgeReport = async (reportId, status, categoryId, explanation) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));
    const response = await fetch(
      `${SERVER_URL}api/internal/reports/${reportId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          status: status,
          categoryId: categoryId,
          explanation: explanation,
        }),
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Failed to judge report"
      );
    }
  } catch (error) {
    throw error;
  }
};

const getAllCategories = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data.slice(0, 8);
    }
  } catch (error) {
    throw error;
  }
};

const uploadFile = async (formData) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "File validation failed");
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unauthorized");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Failed to upload file"
      );
    }
  } catch (error) {
    throw error;
  }
};

const deleteTempFile = async (fileId) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/files/temp/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (response.ok) {
      return true;
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Failed to delete file"
      );
    }
  } catch (error) {
    throw error;
  }
};

const getAllReportsIsPending = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));
    const response = await fetch(`${SERVER_URL}api/internal/reports`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error retrieving reports");
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unauthorized");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message);
    }
  } catch (error) {
    throw error;
  }
};

const getReportDetails = async (reportId) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));
    const response = await fetch(
      `${SERVER_URL}api/internal/reports/${reportId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Failed to fetch report details"
      );
    }
  } catch (error) {
    throw error;
  }
};

const getCitizenReports = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));
    const response = await fetch(
      `${SERVER_URL}api/citizens/reports/myReports`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unauthorized");
    } else if (response.status === 403) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Forbidden");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          errorData.message ||
          "Failed to fetch citizen reports"
      );
    }
  } catch (error) {
    throw error;
  }
};

const getReportsByMapArea = async (bounds) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));
    const response = await fetch(`${SERVER_URL}api/citizens/reports/map`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        corners: bounds,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          errorData.message ||
          "Failed to fetch reports by map area"
      );
    }
  } catch (error) {
    throw error;
  }
};

const getReportMapDetails = async (reportId) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));
    const response = await fetch(
      `${SERVER_URL}api/citizens/reports/getById/${reportId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Failed to fetch report details"
      );
    }
  } catch (error) {
    throw error;
  }
};

const getReportsAssignedToMe = async () => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));
    const response = await fetch(`${SERVER_URL}api/internal/reports/assigned`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unauthorized");
    } else if (response.status === 403) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Forbidden");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error ||
          errorData.message ||
          "Failed to fetch internal user assigned reports"
      );
    }
  } catch (error) {
    throw error;
  }
};

const updateCitizenProfile = async (profileData) => {
  try {
    const token = JSON.parse(localStorage.getItem("authToken"));

    const response = await fetch(`${SERVER_URL}api/citizens/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      const data = await response.json();
      return data.profile || data;
    } else if (response.status === 401) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unauthorized");
    } else if (response.status === 403) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Forbidden");
    } else {
      const errorData = await response.json();
      throw new Error(
        errorData.error || errorData.message || "Failed to update profile"
      );
    }
  } catch (error) {
    throw error;
  }
};

const API = {
  registerCitizen,
  loginCitizen,
  getAllInternalUsers,
  registerInternalUser,
  getUserInfo,
  logoutUser,
  loginInternalUser,
  updateInternalUserRole,
  getAllRoles,
  addNewReport,
  judgeReport,
  getAllCategories,
  uploadFile,
  deleteTempFile,
  getAllReportsIsPending,
  getReportDetails,
  getCitizenReports,
  getReportsByMapArea,
  getReportMapDetails,
  getReportsAssignedToMe,
  updateCitizenProfile,
};

export default API;
