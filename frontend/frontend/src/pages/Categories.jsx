
import { useState, useEffect, useCallback } from "react";
import "../css/Categories.css";
import { apiFetch } from "../utils/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

const fetchCategories = useCallback(async () => {
  try {
    const response = await apiFetch("/api/categories", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch categories");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
}, []);

 useEffect(() => {
  let cancelled = false;

  const loadCategories = async () => {
    const result = await fetchCategories();

    if (!cancelled && result !== null) {
      setCategories(result);
    }
  };

  loadCategories();

  return () => {
    cancelled = true;
  };
}, [fetchCategories]);

  
const totalPages = Math.ceil(categories.length / itemsPerPage);

const safeCurrentPage = Math.min(
  currentPage,
  Math.max(totalPages, 1)
);

const startIndex = (safeCurrentPage - 1) * itemsPerPage;

const paginatedCategories = categories.slice(
  startIndex,
  startIndex + itemsPerPage
);



  const resetForm = () => {
    setFormData({ name: "" });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleSaveCategory = async () => {
    try {
      const response = await apiFetch(
        "/api/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save category");
      }

      const updatedCategories = await fetchCategories();

if (updatedCategories !== null) {
  setCategories(updatedCategories);
}
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error.message);
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const response = await apiFetch(
        `api/categories/${editingCategory._id}`,
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

      if (!response.ok) {
        throw new Error(data.message || "Failed to update category");
      }

      alert("Category updated successfully");
     const updatedCategories = await fetchCategories();

if (updatedCategories !== null) {
  setCategories(updatedCategories);
}
      resetForm();
    } catch (error) {
      console.error("Error updating category:", error);
      alert(error.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await apiFetch(
        `api/categories/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      alert("Category deleted successfully");
    const updatedCategories = await fetchCategories();

if (updatedCategories !== null) {
  setCategories(updatedCategories);
}
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error.message);
    }
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>Categories</h1>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: "" });
            setShowForm(true);
          }}
        >
          Add Category
        </button>
      </div>

      {showForm && (
        <div
          className="category-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetForm();
            }
          }}
        >
          <div
            className="category-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
          >
            <div className="category-modal-header">
              <h3 id="category-modal-title">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>

              <button type="button" onClick={resetForm} aria-label="Close">
                ×
              </button>
            </div>

            <form
              className="category-form"
              onSubmit={(e) => {
                e.preventDefault();
                editingCategory
                  ? handleUpdateCategory()
                  : handleSaveCategory();
              }}
            >
              <div>
                <label htmlFor="category-name">Name:</label>
                <input
                  id="category-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  autoFocus
                />
              </div>

              <button type="submit">
                {editingCategory ? "Update Category" : "Save Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="categories-table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="2">No categories found.</td>
              </tr>
            ) : (
              paginatedCategories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(category);
                        setFormData({ name: category.name || "" });
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(category._id)}
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
      
      {categories.length > 0 && (
        <div className="pagination">
          <span>
            Showing {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, categories.length)}
            {" "}of {categories.length} categories
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
  
};

export default Categories;