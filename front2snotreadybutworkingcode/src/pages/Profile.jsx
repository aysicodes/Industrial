import React, { useEffect, useState } from "react";
import { Home, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found!");
        navigate("/register");
        return;
      }

      try {
        const response = await fetch("http://localhost:7070/api/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 403) {
          setError("Access forbidden. Token might be invalid!");
          localStorage.removeItem("token");
          navigate("/register");
          return;
        }

        if (!response.ok) throw new Error("Failed to fetch profile");

        const profileData = await response.json();
        setStudent(profileData);
        setFormData({ email: profileData.email, password: "" });
      } catch (error) {
        console.error("Error loading profile:", error);
        setError(error.message);
        if (error.message.includes("403")) {
          localStorage.removeItem("token");
          navigate("/register");
        }
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:7070/api/delete", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          throw new Error("Failed to delete account");
        }
      } else {
        localStorage.removeItem("token");
        setMessage("Your account has been deleted successfully!");
        setTimeout(() => navigate("/register"), 3000);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!formData.password) {
      setError("Password cannot be empty when updating profile.");
      return;
    }

    try {
      const response = await fetch("http://localhost:7070/api/update", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          throw new Error("Failed to update profile");
        }
      } else {
        const updatedData = await response.json();
        setStudent(updatedData);
        setEditMode(false);
        setMessage("Profile updated successfully!");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Profile</h2>
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        {student ? (
          <div className="profile-content">
            <div className="profile-info">
              <div className="info-group">
                <label>Email:</label>
                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{student.email}</p>
                )}
              </div>
              <div className="info-group">
                <label>Password:</label>
                {editMode ? (
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                ) : (
                  <p>******</p>
                )}
              </div>
            </div>
            <div className="button-group">
              {editMode ? (
                <button className="home-button" onClick={handleSaveChanges}>
                  Save Changes
                </button>
              ) : (
                <button className="home-button" onClick={handleEdit}>
                  Edit Profile
                </button>
              )}
              <button className="logout-button" onClick={handleLogout}>
                <LogOut size={20} /> Logout
              </button>
              <button className="logout-button" onClick={handleDeleteAccount}>
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <p className="loading-spinner">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
