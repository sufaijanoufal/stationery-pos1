
import { useState, useEffect } from "react";
import "../css/Users.css";
import { apiFetch } from "../utils/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
 const [showPasswordForm, setShowPasswordForm] = useState(false);

const [passwordData, setPasswordData] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
  });

 const fetchUsers = async () => {
  try {
    const response = await apiFetch("/api/users", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch users");
    }

    return Array.isArray(data.data) ? data.data : [];

  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
};

useEffect(() => {
  let cancelled = false;

  const loadUsers = async () => {
    const result = await fetchUsers();

    if (!cancelled && result !== null) {
      setUsers(result);
    }
  };

  loadUsers();

  return () => {
    cancelled = true;
  };
}, []);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if(!formData.name || !formData.username || !formData.password || !formData.role){
      alert("Please fill all fields");
      return;
    }
    if(formData.password.length < 6){
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await apiFetch("/api/users", {
        method: "POST",
       headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save user");
      }

      setFormData({
        name: "",
        username: "",
        password: "",
        role: "",
      });

      setShowForm(false);

      const updatedUsers = await fetchUsers();

if (updatedUsers !== null) {
  setUsers(updatedUsers);
}
    } catch (error) {
  console.error("Error saving user:", error);
  alert(error.message);
}
  };

  const handleUpdateUser = async () => {
    try {
      const response = await apiFetch(
        `/api/users/${editingUser._id}`,
        {
          method: "PATCH",
         headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},
          body: JSON.stringify({
            name: formData.name,
            username: formData.username,
            role: formData.role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      alert("User updated successfully");

      const updatedUsers = await fetchUsers();

if (updatedUsers !== null) {
  setUsers(updatedUsers);
}

      setFormData({
        name: "",
        username: "",
        password: "",
        role: "",
      });

      setEditingUser(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message);
    }
  };

 
const handleToggleUserStatus = async (user) => {
  const action = user.active === false ? "activate" : "deactivate";

  if (
    !window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    )
  ) {
    return;
  }

  try {
    const response = await apiFetch(`/api/users/${user._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        active: user.active === false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to ${action} user`);
    }

    alert(`User ${action}d successfully`);
    const updatedUsers = await fetchUsers();

if (updatedUsers !== null) {
  setUsers(updatedUsers);
}
  } catch (error) {
    console.error(`Error trying to ${action} user:`, error);
    alert(error.message);
  }
};


const handleDeleteUser = async (user) => {
  if (
    !window.confirm(
      `Permanently delete ${user.name}? This is allowed only if the user has no sales history.`
    )
  ) {
    return;
  }

  try {
    const response = await apiFetch(`/api/users/${user._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete user");
    }

    alert(data.message || "User permanently deleted");
    const updatedUsers = await fetchUsers();

if (updatedUsers !== null) {
  setUsers(updatedUsers);
}
  } catch (error) {
    console.error("Error deleting user:", error);
    alert(error.message);
  }
};

const handleChangePassword = async () => {
  try {
    const loggedInUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    const isAdminChangingAnotherUser =
      loggedInUser?.role === "admin" &&
      loggedInUser?.id !== editingUser?._id &&
      loggedInUser?.id !== editingUser?.id;

    if (
      (!isAdminChangingAnotherUser &&
        !passwordData.currentPassword) ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Please fill all required password fields");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    if (
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      alert("New passwords do not match");
      return;
    }

    const response = await apiFetch(
      `/api/users/${editingUser._id}/change-password`,
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

    if (!response.ok) {
      throw new Error(data.message || "Failed to change password");
    }

    alert("Password updated successfully");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setShowPasswordForm(false);
    setEditingUser(null);
  } catch (error) {
    console.error("Error changing password:", error);
    alert(error.message);
  }
};
  return (
    <div className="users-page">

      <div className="users-header">
        <h2>Users</h2>

        <button
          className="add-user-btn"
          onClick={() => {
            setShowForm(!showForm);

            if (showForm) {
              setEditingUser(null);

              setFormData({
                name: "",
                username: "",
                password: "",
                role: "",
              });
            }
          }}
        >
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      
{showForm && (
  <div
    className="user-modal-overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowForm(false);
        setEditingUser(null);
        setFormData({
          name: "",
          username: "",
          password: "",
          role: "",
        });
      }
    }}
  >
    <div
      className="user-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div className="user-modal-header">
        <h3 id="user-modal-title">
          {editingUser ? "Edit User" : "Add New User"}
        </h3>

        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setEditingUser(null);
            setFormData({
              name: "",
              username: "",
              password: "",
              role: "",
            });
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form
        className="user-form"
        onSubmit={editingUser
          ? (e) => {
              e.preventDefault();
              handleUpdateUser();
            }
          : handleSaveUser}
      >
        <div>
          <label htmlFor="user-name">Name</label>
          <input
            id="user-name"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label htmlFor="user-username">Username</label>
          <input
            id="user-username"
            type="text"
            name="new-user-username"
            autoComplete="off"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        </div>

        {!editingUser && (
          <div>
            <label htmlFor="user-password">Password</label>
            <input
              id="user-password"
              type="password"
              name="new-user-password"
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              minLength={6}
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="user-role">Role</label>
          <select
            id="user-role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            required
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <button type="submit">
          {editingUser ? "Update User" : "Save User"}
        </button>
      </form>
    </div>
  </div>
)}

      

{showPasswordForm && editingUser && (
  <div
    className="user-modal-overlay"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setEditingUser(null);
      }
    }}
  >
    <div
      className="user-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-modal-title"
    >
      <div className="user-modal-header">
        <h3 id="password-modal-title">Change Password</h3>

        <button
          type="button"
          aria-label="Close"
          onClick={() => {
            setShowPasswordForm(false);
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            setEditingUser(null);
          }}
        >
          ×
        </button>
      </div>

      <form
        className="user-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleChangePassword();
        }}
      >
        
{JSON.parse(localStorage.getItem("user") || "null")?.role !== "admin" ||
 editingUser?.id === JSON.parse(localStorage.getItem("user") || "null")?.id ? (
  <div>
    <label htmlFor="current-password">Current Password</label>
    <input
      id="current-password"
      type="password"
      autoComplete="current-password"
      value={passwordData.currentPassword}
      onChange={(e) =>
        setPasswordData({
          ...passwordData,
          currentPassword: e.target.value,
        })
      }
      required
    />
  </div>
) : null}

        <div>
          <label htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                newPassword: e.target.value,
              })
            }
            minLength={6}
            required
          />
        </div>

        <div>
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
            minLength={6}
            required
          />
        </div>

        <button type="submit">Update Password</button>
      </form>
    </div>
  </div>
)}
      <div className="users-table-container">

        <table className="users-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {users.length === 0 ? (

              <tr>
                <td colSpan="4" className="no-users">
                  No users found
                </td>
              </tr>

            ) : (

              users.map((user) => (

                <tr key={user._id}>

                  <td>{user.name}</td>

                  <td>{user.username}</td>

                  <td>
                    <span
                      className={`role-badge role-${user.role}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="user-actions">

                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => {

                        setFormData({
                          name: user.name,
                          username: user.username,
                          password: "",
                          role: user.role,
                        });

                        setEditingUser(user);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>
                      <button
    type="button"
    className="change-password-btn"
   onClick={() => {
  setEditingUser(user);
  setPasswordData({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  setShowPasswordForm(true);
}}
  >
    Change Password
  </button>
                 <button
  type="button"
  className="change-password-btn"
  onClick={() => handleToggleUserStatus(user)}
>
  {user.active === false ? "Activate" : "Deactivate"}
</button>


<button
  type="button"
  className="delete-btn"
  onClick={() => handleDeleteUser(user)}
>
  Delete
</button>


                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Users;
