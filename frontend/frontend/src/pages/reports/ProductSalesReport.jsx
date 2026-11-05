
import { useState } from "react";
import "../../css/Reports.css";

import * as XLSX from "xlsx";
import { apiFetch } from "../../utils/api";


const ProductSalesReport = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [productReport, setProductReport] = useState(null);


  
const productTotals = {};

productReport?.sales.forEach((sale) => {
  sale.items.forEach((item) => {
    const productId = item.product?._id || item.product;
    const productName = item.product?.name || "Unknown Product";
    const quantity = Number(item.quantity || 0);

    // Prefer the stored line total when available.
    const salesValue =
      item.total != null
        ? Number(item.total)
        : quantity * Number(item.sellingPrice ?? item.price ?? 0);

    if (!productTotals[productId]) {
      productTotals[productId] = {
        productName,
        quantitySold: 0,
        salesValue: 0,
      };
    }

    productTotals[productId].quantitySold += quantity;
    productTotals[productId].salesValue += salesValue;
  });
});

const sortedProducts = Object.values(productTotals).sort(
  (a, b) => b.quantitySold - a.quantitySold
);

  const fetchProductReport = async () => {
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
        `/api/sales/report?from=${fromDate}&to=${toDate}`,
        {
          headers: {
             Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch product sales report");
      }

      setProductReport(data.data);
    } catch (error) {
      console.error("Error fetching product sales report:", error);
      alert(error.message);
    }
  };

  return (
    <div className="reports-page">
      <h2>Product Sales Report</h2>

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

      <button type="button" onClick={fetchProductReport}>
        Generate Report
      </button>


<button
  type="button"
  onClick={() => {
    if (!productReport || !sortedProducts.length) {
      alert("Please generate a report with product sales data first.");
      return;
    }

    const headers = [
      "Rank",
      "Product Name",
      "Quantity Sold",
      "Sales Value",
    ];

    const rows = sortedProducts.map((product, index) => [
      index + 1,
      product.productName,
      product.quantitySold,
      Number(product.salesValue || 0).toFixed(2),
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
    link.download = `product-sales-report-${fromDate}-to-${toDate}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }}
>
  Export CSV
</button>

 
<button
  type="button"
  onClick={() => {
    if (!productReport || !sortedProducts.length) {
      alert("Please generate a report with product sales data first.");
      return;
    }

    const rows = sortedProducts.map((product, index) => ({
      Rank: index + 1,
      "Product Name": product.productName,
      "Quantity Sold": product.quantitySold,
      "Sales Value": Number(product.salesValue || 0),
    }));

    
const worksheet = XLSX.utils.aoa_to_sheet([
  ["PRODUCT SALES REPORT"],
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
      "Product Sales"
    );

    XLSX.writeFile(
      workbook,
      `product-sales-report-${fromDate}-to-${toDate}.xlsx`
    );
  }}
>
  Export Excel
</button>
     
{productReport && (
  <>
    <div className="report-summary">
      <div className="report-card">
        <span>Products Sold</span>
        <strong>{sortedProducts.length}</strong>
      </div>

      <div className="report-card">
        <span>Total Items Sold</span>
        <strong>
          {sortedProducts.reduce(
            (total, product) => total + product.quantitySold,
            0
          )}
        </strong>
      </div>

      <div className="report-card">
        <span>Total Sales Value</span>
        <strong>
          ₹
          {sortedProducts
            .reduce((total, product) => total + product.salesValue, 0)
            .toFixed(2)}
        </strong>
      </div>
    </div>

    <h3>Product-wise Sales</h3>

    <div className="reports-table-container">
      <table className="reports-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Product Name</th>
            <th>Quantity Sold</th>
            <th>Sales Value</th>
          </tr>
        </thead>

        <tbody>
          {sortedProducts.length === 0 ? (
            <tr>
              <td colSpan="4">No product sales found for this date range.</td>
            </tr>
          ) : (
            sortedProducts.map((product, index) => (
              <tr key={`${product.productName}-${index}`}>
                <td>{index + 1}</td>
                <td>{product.productName}</td>
                <td>{product.quantitySold}</td>
                <td>₹{product.salesValue.toFixed(2)}</td>
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

export default ProductSalesReport;
