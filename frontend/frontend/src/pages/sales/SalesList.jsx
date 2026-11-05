
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Sales.css";
import { apiFetch } from "../../utils/api";

const SalesList = ({ user }) => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [productName, setProductName] = useState("");
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
const [filteredSales, setFilteredSales] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const salesPerPage = 10;


  const fetchSales = async () => {
    try {
      const response = await apiFetch("/api/sales", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }

      const data = await response.json();
      setSales(data.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [productName, dateFrom, dateTo]);

useEffect(() => {
  const filtered = [...sales]
    .sort(
      (a, b) =>
           new Date(b.createdAt || b.saleDate) -
    new Date(a.createdAt || a.saleDate)
    )
    .filter((sale) => {

    const matchesProduct =
      !productName.trim() ||
      sale.items.some((item) =>
        item.product?.name
          ?.toLowerCase()
          .includes(productName.trim().toLowerCase())
      );

    const saleDate = new Date(sale.saleDate);

const saleDateIST = new Date(
  saleDate.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  })
);

const saleDay = new Date(
  saleDateIST.getFullYear(),
  saleDateIST.getMonth(),
  saleDateIST.getDate()
);

const fromDate = dateFrom
  ? new Date(`${dateFrom}T00:00:00`)
  : null;

const toDate = dateTo
  ? new Date(`${dateTo}T00:00:00`)
  : null;

const matchesFrom = !fromDate || saleDay >= fromDate;
const matchesTo = !toDate || saleDay <= toDate;

return matchesProduct && matchesFrom && matchesTo;
  });

  setFilteredSales(filtered);
}, [sales, productName, dateFrom, dateTo]);
const totalPages = Math.ceil(filteredSales.length / salesPerPage);

const startIndex = (currentPage - 1) * salesPerPage;

const paginatedSales = filteredSales.slice(
  startIndex,
  startIndex + salesPerPage
);
  const handleDeleteSale = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) {
      return;
    }

    try {
      const response = await apiFetch(`/api/sales/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete sale");
      }

      alert("Sale deleted successfully");
      setSelectedSale(null);
      fetchSales();
    } catch (error) {
      console.error("Error deleting sale:", error);
      alert(error.message);
    }
  };

  return (
    <div className="sales-page">
      <div className="sales-header">
        <h2>Sales</h2>

        <button
          type="button"
          onClick={() => navigate("/sales/new")}
        >
          Create New Bill
        </button>
      </div>

      

      <div className="sales-table-container">
      

<div className="sales-filters">
  <div>
    <label htmlFor="productName">Product Name</label>
    <input
      id="productName"
      type="text"
      placeholder="Search product..."
      value={productName}
      onChange={(e) => setProductName(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="dateFrom">Date From</label>
    <input
      id="dateFrom"
      type="date"
      value={dateFrom}
      max={dateTo || undefined}
      onChange={(e) => setDateFrom(e.target.value)}
    />
  </div>

  <div>
    <label htmlFor="dateTo">Date To</label>
    <input
      id="dateTo"
      type="date"
      value={dateTo}
      min={dateFrom || undefined}
      onChange={(e) => setDateTo(e.target.value)}
    />
  </div>

  <button
    type="button"
    onClick={() => {
      setProductName("");
      setDateFrom("");
      setDateTo("");
    }}
  >
    Clear Filters
  </button>
</div>





  <table className="sales-table">
    <thead>
      <tr>
        <th>Invoice</th>
        <th>Date</th>
        <th>Sold By</th>
        <th>Payment Method</th>
        <th>Items</th>
        <th>Total</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {paginatedSales.length === 0 ? (
        <tr>
          <td colSpan="6">No matching sales found.</td>
        </tr>
      ) : (
        paginatedSales.map((sale) => (
          <tr key={sale._id}>
            <td>{sale.invoiceNumber}</td>

            <td>
  {new Date(sale.createdAt || sale.saleDate).toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
})}
</td>

            <td>
              {sale.soldBy?.name || "Unassigned"}
              {sale.soldBy?.role === "admin" ? " (Admin)" : ""}
            </td>
           <td>{sale.paymentMethod || "Cash"}</td>
            <td>{sale.items.length}</td>

            <td>₹{sale.totalAmount}</td>

            <td>
              <button
                type="button"
                onClick={() => setSelectedSale(sale)}
              >
                View
              </button>

              {user?.role === "admin" && (
                <button
                  type="button"
                  onClick={() => handleDeleteSale(sale._id)}
                >
                  Clear Sale
                </button>
              )}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
  <div className="sales-pagination">
  <span>
    Showing {filteredSales.length === 0 ? 0 : startIndex + 1}
    {"–"}
    {Math.min(startIndex + salesPerPage, filteredSales.length)}
    {" of "}
    {filteredSales.length} sales
  </span>

  <div>
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
</div>

      {selectedSale && (
        <div className="sale-modal-overlay">
          <div className="sale-modal">
            <h2>Sale Details</h2>

            <p>
              <strong>Invoice:</strong> {selectedSale.invoiceNumber}
            </p>
<p>
  <strong>Payment Method:</strong>{" "}
  {selectedSale.paymentMethod || "Cash"}
</p>
            <p>
  <strong>Date & Time:</strong>{" "}
  {new Date(
    selectedSale.createdAt || selectedSale.saleDate
  ).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}
</p>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Selling Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {selectedSale.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product?.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.sellingPrice}</td>
                    <td>₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            



            <h3 className="sale-modal-total">
              Grand Total: ₹{selectedSale.totalAmount}
            </h3>

            <div className="sale-modal-buttons">
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesList;
