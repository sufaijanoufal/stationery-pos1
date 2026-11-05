import {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import { apiFetch } from "../utils/api";

function Dashboard({user}) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch data for the dashboard when the component mounts
      const fetchDashboard = async () => {
        try {
            const response = await apiFetch("/api/dashboard",{
               headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
            });
           
            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data");
            }

            const data = await response.json();
            setDashboard(data.data);
        }catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
      };
      fetchDashboard();
    },[]);

    if(loading) {
        return <div>Loading...</div>;
    }
    if(error) {
        return <div>Error: {error}</div>;
    }

  return (
  <div className="dashboard">
    <h2>Dashboard</h2>

   <div className="create-sale-section">
  <button
    className="create-sale-btn"
    onClick={() => navigate("/sales/new")}
  >
    + CREATE NEW SALE
  </button>
</div>

<div className="dashboard-cards">
      <div className="dashboard-card">
        <h3>Today's Sales</h3>
        <p>₹{dashboard.todaySales}</p>
      </div>

      <div className="dashboard-card">
        <h3>Today's Transactions</h3>
        <p>{dashboard.todaySalesCount}</p>
      </div>

      <div className="dashboard-card">
        <h3>Today's Purchases</h3>
        <p>₹{dashboard.todayPurchases}</p>
      </div>

      <div className="dashboard-card">
        <h3>Total Products</h3>
        <p>{dashboard.totalProducts}</p>
      </div>

      <div className="dashboard-card">
        <h3>Low Stock Products</h3>
        <p>{dashboard.lowStockProducts}</p>

        <div className="low-stock-list">
          <h3>Low stock products</h3>

          {dashboard.lowStockProductList.length === 0 ? (
            <p>No low stock products</p>
          ) : (
            <ul>
              {dashboard.lowStockProductList.map((product) => (
                <li key={product._id}>
                  {product.name} - Stock: {product.currentStock} / Minimum Stock{" "}
                  {product.minimumStock}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
{user?.role === "admin" && (
  
<>
      <div className="dashboard-card">
        <h3>This Month's Sales</h3>
        <p>₹{dashboard.thisMonthSales}</p>
      </div>

      <div className="dashboard-card">
        <h3>This Month's Purchases</h3>
        <p>₹{dashboard.thisMonthPurchases}</p>
      </div>
</>
)}
    </div>
  </div>
);

}

export default Dashboard;
