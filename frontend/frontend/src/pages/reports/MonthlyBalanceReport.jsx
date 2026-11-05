
import { useState } from "react";
import "../../css/Reports.css";
import { apiFetch } from "../../utils/api";

const MonthlyBalanceReport = () => {
  const today = new Date();

  const [month, setMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  );

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!month) {
      alert("Please select a month");
      return;
    }

    const [year, selectedMonth] = month.split("-");
    const fromDate = `${year}-${selectedMonth}-01`;

    const lastDay = new Date(
      Number(year),
      Number(selectedMonth),
      0
    ).getDate();

    const toDate = `${year}-${selectedMonth}-${String(lastDay).padStart(2, "0")}`;

    setLoading(true);

    try {
      const [salesResponse, purchasesResponse, expensesResponse] =
        await Promise.all([
          apiFetch(
            `/api/sales/report?from=${fromDate}&to=${toDate}`
          ),
          apiFetch(
            `/api/purchases/report?from=${fromDate}&to=${toDate}`
          ),
          apiFetch("/api/expenses"),
        ]);

      const [salesData, purchasesData, expensesData] = await Promise.all([
        salesResponse.json(),
        purchasesResponse.json(),
        expensesResponse.json(),
      ]);

      if (!salesResponse.ok) {
        throw new Error(salesData.message || "Failed to fetch sales");
      }

      if (!purchasesResponse.ok) {
        throw new Error(purchasesData.message || "Failed to fetch purchases");
      }

      if (!expensesResponse.ok) {
        throw new Error(expensesData.message || "Failed to fetch expenses");
      }

      const monthExpenses = (expensesData.data || []).filter((expense) => {
        const date = new Date(expense.expenseDate);
        const expenseMonth = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        return expenseMonth === month;
      });

      const totalSales = Number(salesData.data.totalSales || 0);
      const totalPurchases = Number(purchasesData.data.totalPurchases || 0);

      const totalExpenses = monthExpenses.reduce(
        (total, expense) => total + Number(expense.amount || 0),
        0
      );

      setReport({
        totalSales,
        totalPurchases,
        totalExpenses,
        monthlyBalance: totalSales - totalPurchases - totalExpenses,
        salesCount: (salesData.data.sales || []).length,
        purchaseCount: (purchasesData.data.purchases || []).length,
        expenseCount: monthExpenses.length,
      });
    } catch (error) {
      console.error("Error generating monthly balance report:", error);
      alert(error.message || "Failed to generate monthly report");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) =>
    Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="reports-page">
      <h2>Monthly Balance Report</h2>

      <div className="report-filters">
        <div>
          <label htmlFor="report-month">Select Month</label>
          <input
            id="report-month"
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setReport(null);
            }}
          />
        </div>
      </div>

      <button type="button" onClick={generateReport} disabled={loading}>
        {loading ? "Generating..." : "Generate Report"}
      </button>

      {report && (
        <>
          <h3>
            Summary for{" "}
            {new Date(`${month}-01T12:00:00`).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <div className="report-summary">
            <div className="report-card">
              <span>Total Sales</span>
              <strong>₹{formatAmount(report.totalSales)}</strong>
              <small>{report.salesCount} sales bills</small>
            </div>

            <div className="report-card">
              <span>Total Purchases</span>
              <strong>₹{formatAmount(report.totalPurchases)}</strong>
              <small>{report.purchaseCount} purchase bills</small>
            </div>

            <div className="report-card">
              <span>Total Expenses</span>
              <strong>₹{formatAmount(report.totalExpenses)}</strong>
              <small>{report.expenseCount} expense records</small>
            </div>

            <div className="report-card">
              <span>Monthly Balance</span>
              <strong>₹{formatAmount(report.monthlyBalance)}</strong>
              <small>
                {report.monthlyBalance < 0 ? "Negative balance" : "Sales − purchases − expenses"}
              </small>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyBalanceReport;
