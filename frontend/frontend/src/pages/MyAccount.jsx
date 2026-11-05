import { useState } from "react";
import "../css/MyAccount.css";
import { apiFetch } from "../utils/api";

const MyAccount = ({user,setUser}) => {
    const [formData,setFormData] = useState({
        name: user?.name || "",
        username: user?.username || "",
    });

    const [passwordData,setPasswordData] = useState({
        currentPassword:"",
        newPassword:"",
        confirmPassword:"",
    });
    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try{
            const response = await apiFetch(
                 `/api/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );
  const data = await response.json();

  if(!response.ok){
    throw new Error(data.message || "Failed to Update profile");
  }

  const updatedUser = {
    ...user,
    name:data.data.name,
    username:data.data.username,
  };

  localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert("Profile updated succesfully");
        } catch (error) {
            console.error("Profile update error");
            alert(error.message);
        }
    };

    const handleChangePassword = async(e) => {
        e.preventDefault();

     try{
        const response = await apiFetch(
             `/api/users/${user.id}/change-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(passwordData),
        }
      );

       const data = await response.json();

       if(!response.ok) {
        throw new Error(data.message || "Failed to change password");
       }

       alert("Password changed successfully");

       setPasswordData({
        currentPassword:"",
        newPassword:"",
        confirmPassword:"",
       });
     } catch (error) {
        console.error("Password change error",error);
        alert(error.message);
     }
    };

    return (
        <div className="my-account">
      <h2>My Account</h2>

      <div className="account-section">
        <h3>Profile</h3>

        <form onSubmit={handleUpdateProfile}>
          <label>Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
          />

          <label>Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({
                ...formData,
                username: e.target.value,
              })
            }
          />

          <label>Role</label>
          <input
            type="text"
            value={user?.role || ""}
            disabled
          />

          <button type="submit">
            Update Profile
          </button>
        </form>
      </div>

      <div className="account-section">
        <h3>Change Password</h3>

        <form onSubmit={handleChangePassword}>
          <label>Current Password</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
          />

          <label>New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
          />

          <button type="submit">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default MyAccount;
    