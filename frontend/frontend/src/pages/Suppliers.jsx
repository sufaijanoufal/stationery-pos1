import {useState, useEffect} from 'react';
import "../css/Suppliers.css";
import { apiFetch } from '../utils/api';


const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
    const[showForm,setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: ""
    });

   const fetchSuppliers = async () => {
    try {
        const response = await apiFetch('/api/suppliers', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch suppliers");
        }

        return data.data || [];

    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return null;
    }
};

useEffect(() => {
    let cancelled = false;

    const loadSuppliers = async () => {
        const result = await fetchSuppliers();

        if (!cancelled && result !== null) {
            setSuppliers(result);
        }
    };

    loadSuppliers();

    return () => {
        cancelled = true;
    };
}, []);

const totalPages = Math.ceil(suppliers.length / itemsPerPage);

const safeCurrentPage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
);

const startIndex = (safeCurrentPage - 1) * itemsPerPage;

const paginatedSuppliers = suppliers.slice(
    startIndex,
    startIndex + itemsPerPage
);

    const handleSaveSupplier = async () => {
        try {
            const response = await apiFetch('/api/suppliers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to save supplier");
            }

            // Clear the form data
            setFormData({
                name: "",
                phone: "",
                email: "",
                address: ""
            });

            // Fetch updated supplier list
            const updatedSuppliers = await fetchSuppliers();

if (updatedSuppliers !== null) {
    setSuppliers(updatedSuppliers);
    setCurrentPage(1);
}
            setShowForm(false); // Hide the form after saving
        } catch (error) {
            console.error("Error saving supplier:", error);
        }
    };  

    const handleUpdateSupplier = async () => {
        try {
            const response = await apiFetch(`/api/suppliers/${editingSupplier._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update supplier");
            }
            alert("Supplier updated successfully!");
            // Clear the form data
            setFormData({
                name: "",
                phone: "",
                email: "",
                address: ""
            });

            // Fetch updated supplier list
            const updatedSuppliers = await fetchSuppliers();

if (updatedSuppliers !== null) {
    setSuppliers(updatedSuppliers);
    setCurrentPage(1);
}
            setEditingSupplier(null); // Clear the editing supplier state
            setShowForm(false); // Hide the form after updating
        } catch (error) {
            console.error("Error updating supplier:", error);
        }
    };
const handleDeleteSupplier = async (id) => {
    try {
        const response = await apiFetch(`/api/suppliers/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete supplier");
        }
    alert("Supplier deleted successfully!");
        // Fetch updated supplier list
       const updatedSuppliers = await fetchSuppliers();

if (updatedSuppliers !== null) {
    setSuppliers(updatedSuppliers);
    setCurrentPage(1);
}
    } catch (error) {
        console.error("Error deleting supplier:", error);
        alert(error.message);
    }
};

    return (
  <div className="suppliers-page">
    <div className="suppliers-header">
      <h2>Suppliers</h2>

      <button
        type="button"
        onClick={() => {
          setEditingSupplier(null);
          setFormData({
            name: "",
            phone: "",
            email: "",
            address: "",
          });
          setShowForm(true);
        }}
      >
        Add Supplier
      </button>
    </div>

    {showForm && (
      <div className="supplier-modal-overlay">
        <div className="supplier-modal">
          <div className="supplier-modal-header">
            <h3>
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </h3>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingSupplier(null);
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  address: "",
                });
              }}
            >
              ×
            </button>
          </div>

          <form className="supplier-form">
            <div>
              <label htmlFor="name">Name:</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label htmlFor="phone">Phone:</label>
              <input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label htmlFor="address">Address:</label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            <button
              type="button"
              onClick={
                editingSupplier
                  ? handleUpdateSupplier
                  : handleSaveSupplier
              }
            >
              {editingSupplier ? "Update Supplier" : "Save Supplier"}
            </button>
          </form>
        </div>
      </div>
    )}

    <div className="suppliers-table-container">
      <table className="suppliers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan="5">No suppliers found.</td>
            </tr>
          ) : (
           paginatedSuppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td>{supplier.name}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.email}</td>
                <td>{supplier.address}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSupplier(supplier);
                      setFormData({
                        name: supplier.name || "",
                        phone: supplier.phone || "",
                        email: supplier.email || "",
                        address: supplier.address || "",
                      });
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSupplier(supplier._id)}
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
    
    {suppliers.length > 0 && (
      <div className="pagination">
        <span>
          Showing {startIndex + 1}–
          {Math.min(startIndex + itemsPerPage, suppliers.length)}
          {" "}of {suppliers.length} suppliers
        </span>

        <div className="pagination-buttons">
          <button
            type="button"
            disabled={safeCurrentPage === 1}
onClick={() => setCurrentPage(safeCurrentPage - 1)}
          >
            Previous
          </button>

          <span>
            Page {safeCurrentPage} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
           disabled={safeCurrentPage >= totalPages}
onClick={() => setCurrentPage(safeCurrentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    )}

  </div>
);
}
export default Suppliers;