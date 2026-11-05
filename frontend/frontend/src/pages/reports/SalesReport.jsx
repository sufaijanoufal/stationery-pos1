import { useState } from "react";
import "../../css/Reports.css";
import * as XLSX from "xlsx";
import { apiFetch } from "../../utils/api";

const Reports = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [salesReport, setSalesReport] = useState(null);


  const fetchSalesReport = async () => {
    if(!fromDate || !toDate){
      alert("Please select both dates");
      return;
    }

    if(fromDate > toDate) {
      alert("From Date cannot be after To Date");
      return;
    }
    try{
    const response = await apiFetch(
  `/api/sales/report?from=${fromDate}&to=${toDate}`,
  {
    headers: {
       Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);

      const data = await response.json();

      if(!response.ok) {
        throw new Error(data.message || "Failed to fetch sales report");
      }

      setSalesReport(data.data);
    }catch(error){
      console.error("Error fetching sales report:",error);
      alert(error.message);
    }
  };

  return (
    <div className="reports-page">
      <h2>Sales Report</h2>

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
      <button type="button" onClick={fetchSalesReport}>
        Generate Report
      </button>




<button
  type="button"
  onClick={() => {
    if (!salesReport || !salesReport.sales.length) {
      alert("Please generate a report with sales data first.");
      return;
    }

    const headers = ["Invoice", "Date", "Total Amount"];

    const rows = salesReport.sales.map((sale) => [
      sale.invoiceNumber || "",
      sale.saleDate
        ? new Date(sale.saleDate).toLocaleDateString("en-GB")
        : "",
      Number(sale.totalAmount || 0).toFixed(2),
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `sales-report-${fromDate}-to-${toDate}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }}
>
  Export CSV
</button>


<button
  type="button"
  onClick={() => {
    if (!salesReport || !salesReport.sales.length) {
      alert("Please generate a report with sales data first.");
      return;
    }

    const rows = salesReport.sales.map((sale) => ({
      Invoice: sale.invoiceNumber || "",
      Date: sale.saleDate
        ? new Date(sale.saleDate).toLocaleDateString("en-GB")
        : "",
      "Total Amount": Number(sale.totalAmount || 0),
    }));

    
const worksheet = XLSX.utils.aoa_to_sheet([
  ["SALES REPORT"],
  [`Period: ${fromDate} to ${toDate}`],
  [],
]);

XLSX.utils.sheet_add_json(worksheet, rows, {
  origin: "A4",
});

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

    XLSX.writeFile(
      workbook,
      `sales-report-${fromDate}-to-${toDate}.xlsx`
    );
  }}
>
  Export Excel
</button>

      {salesReport && (
  <div>
    <h3>Sales Report</h3>

    <div className="report-summary">

  <div className="report-card">
    <span>Total Sales</span>
    <strong>₹{salesReport.totalSales}</strong>
  </div>

  <div className="report-card">
    <span>Total Transactions</span>
    <strong>{salesReport.sales.length}</strong>
  </div>

  <div className="report-card">
    <span>Total Items Sold</span>
    <strong>
      {salesReport.sales.reduce(
        (total, sale) =>
          total +
          sale.items.reduce(
            (itemTotal, item) => itemTotal + item.quantity,
            0
          ),
        0
      )}
    </strong>
  </div>

</div>
<h3>Staff-wise Sales</h3>

<div className="reports-table-container">
  <table className="reports-table">
    <thead>
      <tr>
        <th>Staff Name</th>
        <th>Role</th>
        <th>Total Bills</th>
        
        <th>Cash</th>
    <th>GPay</th>
    <th>Total Sales</th>
      </tr>
    </thead>
    <tbody>
      {!salesReport.staffSales ||
      salesReport.staffSales.length === 0 ? (
        <tr>
          <td colSpan="4">No staff sales found.</td>
        </tr>
      ) : (
        salesReport.staffSales.map((staff) => (
          <tr key={staff.staffId}>
            <td>{staff.staffName}</td>
            <td>{staff.role}</td>
            <td>{staff.totalTransactions}</td>
            
<td>₹{Number(staff.cashSales || 0).toFixed(2)}</td>
<td>₹{Number(staff.gpaySales || 0).toFixed(2)}</td>
<td>₹{Number(staff.totalSales || 0).toFixed(2)}</td>
           
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>
<div className="reports-table-container">
    <table border="1" className="reports-table">
      <thead>
        <tr>
          <th>Invoice</th>
          <th>Date</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        {salesReport.sales.length === 0 ? (
          <tr>
            <td colSpan="6">
              No sales found for this date range.
            </td>
          </tr>
        ) : (
          salesReport.sales.map((sale) => (
            <tr key={sale._id}>
              <td>{sale.invoiceNumber}</td>

              <td>
                {new Date(sale.saleDate).toLocaleDateString()}
              </td>

              <td>₹{sale.totalAmount}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    </div>
  </div>
)}
    </div>
  );
};

export default Reports;