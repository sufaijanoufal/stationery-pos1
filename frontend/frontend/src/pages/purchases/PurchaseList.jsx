import { useState  } from "react";
import { useNavigate } from "react-router-dom";


const PurchaseList = ({
  purchases,
  viewPurchase,
  deletePurchase,
}) => {
    const navigate = useNavigate();
    const [searchTerm,setSearchTerm] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    const filteredPurchases = [...purchases]
  .sort(
    (a, b) =>
      new Date(b.purchaseDate) - new Date(a.purchaseDate)
  )
  .filter((purchase) => {
      const search = searchTerm.toLowerCase();

      const invoiceNumber =
        purchase.invoiceNumber?.toLowerCase() || "";

      const supplierName =
        purchase.supplier?.name?.toLowerCase() || "";

      const productNames =
        purchase.items
          ?.map((item) => item.product?.name?.toLowerCase() || "")
          .join(" ") || "";

      const matchesSearch =
        invoiceNumber.includes(search) ||
        supplierName.includes(search) ||
        productNames.includes(search);

      const purchaseDate = purchase.purchaseDate
        ? purchase.purchaseDate.split("T")[0]
        : "";

      const matchesFromDate =
        !fromDate || purchaseDate >= fromDate;

      const matchesToDate =
        !toDate || purchaseDate <= toDate;

      return (
        matchesSearch &&
        matchesFromDate &&
        matchesToDate
      );
    });

   
  const totalPages = Math.ceil(
  filteredPurchases.length / itemsPerPage
);

const safeCurrentPage = Math.min(
  currentPage,
  Math.max(totalPages, 1)
);

const startIndex = (safeCurrentPage - 1) * itemsPerPage;

const paginatedPurchases = filteredPurchases.slice(
  startIndex,
  startIndex + itemsPerPage
);

return (
  <div className="purchases-table-container">
    <div className="purchase-filters">
      <input
        type="text"
        placeholder="Search invoice, supplier or product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <label>
        From:
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </label>

      <label>
        To:
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </label>

      <button
        type="button"
        onClick={() => {
          setSearchTerm("");
          setFromDate("");
          setToDate("");
        }}
      >
        Clear
      </button>
    </div>

    <table className="purchases-table">
      <thead>
        <tr>
          <th>Invoice Number</th>
          <th>Supplier</th>
          <th>Purchase Date</th>
          <th>Total Amount</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {filteredPurchases.length === 0 ? (
          <tr>
            <td colSpan="5" style={{ textAlign: "center" }}>
              No purchases found
            </td>
          </tr>
        ) : (
          paginatedPurchases.map((purchase) => (
            <tr key={purchase._id}>
              <td>{purchase.invoiceNumber}</td>
              <td>{purchase.supplier?.name || "-"}</td>
              <td>
                {purchase.purchaseDate
                  ? purchase.purchaseDate.split("T")[0]
                  : "-"}
              </td>
              <td>{purchase.totalAmount}</td>
              <td>
                <button
                  type="button"
                  onClick={() => viewPurchase(purchase._id)}
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/purchases/${purchase._id}/edit`)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deletePurchase(purchase._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>

    {filteredPurchases.length > 0 && (
      <div className="pagination">
        <span>
          Showing {startIndex + 1}–
          {Math.min(
            startIndex + itemsPerPage,
            filteredPurchases.length
          )}{" "}
          of {filteredPurchases.length} purchases
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

export default PurchaseList;