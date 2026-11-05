
import { useState } from "react";
import "../../css/Reports.css";
import * as XLSX from "xlsx";
import { apiFetch } from "../../utils/api";


const PurchaseReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [purchaseReport, setPurchaseReport] = useState(null);

const supplierTotals = {};

purchaseReport?.purchases.forEach((purchase) => {
  const supplierName = purchase.supplier?.name || "Unknown Supplier";

  supplierTotals[supplierName] =
    (supplierTotals[supplierName] || 0) +
    Number(purchase.totalAmount || 0);
});

  const fetchPurchaseReport = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both dates");
      return;
    }

    if (fromDate > toDate) {
      alert("From Date cannot be after To Date");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await apiFetch(
        `/api/purchases/report?from=${fromDate}&to=${toDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch purchase report");
      }

      setPurchaseReport(data.data);
    } catch (error) {
      console.error("Error fetching purchase report:", error);
      alert(error.message);
    }
  };

  
return (
  <div className="reports-page">
    <h2>Purchase Report</h2>

    <div className="report-filters">
      <div>
        <label>From Date</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>

      <div>
        <label>To Date</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>
    </div>

    <button type="button" onClick={fetchPurchaseReport}>
      Generate Report
    </button>

<button
  type="button"
  onClick={() => {
    if (!purchaseReport || !purchaseReport.purchases.length) {
      alert("Please generate a report with purchase data first.");
      return;
    }

    const headers = [
      "Invoice",
      "Date",
      "Supplier",
      "Total Amount",
    ];

    const rows = purchaseReport.purchases.map((purchase) => [
      purchase.invoiceNumber || "",
      purchase.purchaseDate
        ? new Date(purchase.purchaseDate).toLocaleDateString("en-GB")
        : "",
      purchase.supplier?.name || "Unknown Supplier",
      Number(purchase.totalAmount || 0).toFixed(2),
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `purchase-report-${fromDate}-to-${toDate}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }}
>
  Export CSV
</button>


<button
  type="button"
  onClick={() => {
    if (!purchaseReport || !purchaseReport.purchases.length) {
      alert("Please generate a report with purchase data first.");
      return;
    }

    const rows = purchaseReport.purchases.map((purchase) => ({
      Invoice: purchase.invoiceNumber || "",
      Date: purchase.purchaseDate
        ? new Date(purchase.purchaseDate).toLocaleDateString("en-GB")
        : "",
      Supplier: purchase.supplier?.name || "Unknown Supplier",
      "Total Amount": Number(purchase.totalAmount || 0),
    }));

    
const worksheet = XLSX.utils.aoa_to_sheet([
  ["PURCHASE REPORT"],
  [`Period: ${fromDate} to ${toDate}`],
  [],
]);

XLSX.utils.sheet_add_json(worksheet, rows, {
  origin: "A4",
});

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Purchase Report"
    );

    XLSX.writeFile(
      workbook,
      `purchase-report-${fromDate}-to-${toDate}.xlsx`
    );
  }}
>
  Export Excel
</button>

    {purchaseReport && (
      <>
        <div className="report-summary">
          <div className="report-card">
            <span>Total Purchases</span>
            <strong>
              ₹{Number(purchaseReport.totalPurchases || 0).toFixed(2)}
            </strong>
          </div>

          <div className="report-card">
            <span>Total Purchase Bills</span>
            <strong>{purchaseReport.purchases.length}</strong>
          </div>
        </div>

        <h3>Supplier-wise Totals</h3>

        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Total Purchases</th>
              </tr>
            </thead>

            <tbody>
              {Object.entries(supplierTotals).length === 0 ? (
                <tr>
                  <td colSpan="2">No purchases found.</td>
                </tr>
              ) : (
                Object.entries(supplierTotals).map(([name, total]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>₹{total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
<h3>Purchase History</h3>

<div className="reports-table-container">
  <table className="reports-table">
    <thead>
      <tr>
        <th>Invoice</th>
        <th>Date</th>
        <th>Supplier</th>
        <th>Total Amount</th>
      </tr>
    </thead>

    <tbody>
      {purchaseReport.purchases.length === 0 ? (
        <tr>
          <td colSpan="4">
            No purchases found for this date range.
          </td>
        </tr>
      ) : (
        purchaseReport.purchases.map((purchase) => (
          <tr key={purchase._id}>
            <td>{purchase.invoiceNumber || "-"}</td>

            <td>
              {new Date(purchase.purchaseDate).toLocaleDateString()}
            </td>

            <td>
              {purchase.supplier?.name || "Unknown Supplier"}
            </td>

            <td>
              ₹{Number(purchase.totalAmount || 0).toFixed(2)}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      </>
    )}
  </div>
);
};

export default PurchaseReport;
