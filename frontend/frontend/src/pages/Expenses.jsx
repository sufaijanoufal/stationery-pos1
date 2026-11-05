
import { useEffect, useState } from "react";
import "../css/Expenses.css";
import { apiFetch } from "../utils/api";

const categories = [
  "Electricity",
  "Rent",
  "Salary",
  "Internet",
  "Maintenance",
  "Transport",
  "Other",
];

const getToday = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const initialForm = {
  category: "Electricity",
  amount: "",
  expenseDate: getToday(),
  note: "",
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchExpenses = async () => {
    try {
      const response = await apiFetch(
        "/api/expenses"
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch expenses");
      }

      setExpenses(data.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      alert(error.message || "Failed to fetch expenses");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const date = new Date(expense.expenseDate);
    const dateKey = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return (
      (!dateFrom || dateKey >= dateFrom) &&
      (!dateTo || dateKey <= dateTo) &&
      (!categoryFilter || expense.category === categoryFilter)
    );
  });

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedExpenses = filteredExpenses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalExpenses = filteredExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const resetForm = () => {
    setFormData({ ...initialForm, expenseDate: getToday() });
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();

    try {
      const isEditing = Boolean(editingExpense);

      const response = await apiFetch(
        isEditing
          ? `/api/expenses/${editingExpense._id}`
          : "/api/expenses",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            amount: Number(formData.amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save expense");
      }

      alert(isEditing ? "Expense updated successfully" : "Expense added successfully");

      resetForm();
      await fetchExpenses();
      setCurrentPage(1);
    } catch (error) {
      console.error("Error saving expense:", error);
      alert(error.message || "Failed to save expense");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const response = await apiFetch(
        `/api/expenses/${id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete expense");
      }

      alert("Expense deleted successfully");
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert(error.message || "Failed to delete expense");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN");

  return (
    <div className="categories-container expenses-container">
      <div className="categories-header">
        <h1>Expenses</h1>

        <button
          type="button"
          onClick={() => {
            setEditingExpense(null);
            setFormData({ ...initialForm, expenseDate: getToday() });
            setShowForm(true);
          }}
        >
          Add Expense
        </button>
      </div>

      {showForm && (
        <div
          className="category-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) resetForm();
          }}
        >
          <div
            className="category-modal expense-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-modal-title"
          >
            <div className="category-modal-header">
              <h3 id="expense-modal-title">
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </h3>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="category-form expense-form" onSubmit={handleSaveExpense}>
              <div>
                <label htmlFor="expense-category">Category:</label>
                <select
                  id="expense-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="expense-amount">Amount (₹):</label>
                <input
                  id="expense-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="expense-date">Date:</label>
                <input
                  id="expense-date"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expenseDate: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="expense-note">Note:</label>
                <input
                  id="expense-note"
                  type="text"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Optional description"
                />
              </div>

              <button type="submit">
                {editingExpense ? "Update Expense" : "Save Expense"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="expense-summary">
        <span>Total Expenses (filtered)</span>
        <strong>
          ₹{totalExpenses.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </strong>
      </div>

      <div className="expense-filters">
        <div>
          <label htmlFor="date-from">From Date</label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div>
          <label htmlFor="date-to">To Date</label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div>
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setDateFrom("");
            setDateTo("");
            setCategoryFilter("");
            setCurrentPage(1);
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="categories-table-container">
        <table className="categories-table expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Note</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="5">No expenses found.</td>
              </tr>
            ) : (
              paginatedExpenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{formatDate(expense.expenseDate)}</td>
                  <td>{expense.category}</td>
                  <td>{expense.note || "—"}</td>
                  <td>
                    ₹{Number(expense.amount).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExpense(expense);
                        setFormData({
                          category: expense.category,
                          amount: String(expense.amount),
                          expenseDate: new Date(expense.expenseDate)
                            .toISOString()
                            .slice(0, 10),
                          note: expense.note || "",
                        });
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense._id)}
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

      {filteredExpenses.length > 0 && (
        <div className="pagination">
          <span>
            Showing {startIndex + 1}–
            {Math.min(startIndex + itemsPerPage, filteredExpenses.length)}
            {" "}of {filteredExpenses.length} expenses
          </span>

          <div className="pagination-buttons">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
