import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/products/Products";
import CreateProduct from "./pages/products/CreateProduct";
import EditProduct from "./pages/products/EditProduct";
import Purchases from "./pages/purchases/Purchases";
import CreatePurchase from "./pages/purchases/CreatePurchase";
import EditPurchase from "./pages/purchases/EditPurchase";
import SalesList from "./pages/sales/SalesList";
import CreateSale from "./pages/sales/CreateSale";
import SalesReport from "./pages/reports/SalesReport";
import PurchaseReport from "./pages/reports/PurchaseReport";
import ProductSalesReport from "./pages/reports/ProductSalesReport";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import Login from "./pages/Login";
import MyAccount from "./pages/MyAccount";
import Expenses from "./pages/Expenses";
import MonthlyBalanceReport from "./pages/reports/MonthlyBalanceReport";

import "./css/App.css";


function AppContent({ user, setUser, handleLogout }) {
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({
  Products: location.pathname.startsWith("/products") ||
            location.pathname === "/categories",
  Purchases: location.pathname.startsWith("/purchases") ||
             location.pathname === "/suppliers",
  Reports: location.pathname.startsWith("/reports"),
});

const toggleMenu = (menu) => {
  setOpenMenus((prev) => ({
    ...prev,
    [menu]: !prev[menu],
  }));
};



  return (
    <div className="app">

      <header className="app-header">
        <div>
          <h1>Stationery POS</h1>
          {user && <span>Welcome, {user.name}</span>}
        </div>
      </header>

      <div className="app-body">

        <nav className="sidebar">

          <Link
            className={location.pathname === "/dashboard" ? "active" : ""}
            to="/dashboard"
          >
            Dashboard
          </Link>

          <Link
            className={location.pathname === "/sales" ? "active" : ""}
            to="/sales"
          >
            Sales
          </Link>

          {user.role === "admin" && (
            <>
            <div className="sidebar-menu">
  <button
    type="button"
    className="sidebar-title"
    onClick={() => toggleMenu("Products")}
    aria-expanded={openMenus.Products}
  >
    <span>Products</span>
    <span>{openMenus.Products ? "−" : "+"}</span>
  </button>

  {openMenus.Products && (
    <div className="sidebar-submenu">
      <Link
        className={location.pathname === "/products" ? "active" : ""}
        to="/products"
      >
        Product List
      </Link>

      <Link
        className={location.pathname === "/products/new" ? "active" : ""}
        to="/products/new"
      >
        Create Product
      </Link>

      <Link
        className={location.pathname === "/categories" ? "active" : ""}
        to="/categories"
      >
        Categories
      </Link>
    </div>
  )}
</div>

         
<div className="sidebar-menu">
  <button
    type="button"
    className="sidebar-title"
    onClick={() => toggleMenu("Purchases")}
    aria-expanded={openMenus.Purchases}
  >
    <span>Purchases</span>
    <span>{openMenus.Purchases ? "−" : "+"}</span>
  </button>

  {openMenus.Purchases && (
    <div className="sidebar-submenu">
      <Link
        className={location.pathname === "/purchases" ? "active" : ""}
        to="/purchases"
      >
        Purchase List
      </Link>

      <Link
        className={location.pathname === "/purchases/new" ? "active" : ""}
        to="/purchases/new"
      >
        Create Purchase
      </Link>

      <Link
        className={location.pathname === "/suppliers" ? "active" : ""}
        to="/suppliers"
      >
        Suppliers
      </Link>
    </div>
  )}
</div>

<div className="sidebar-menu">
  <button
    type="button"
    className="sidebar-title"
    onClick={() => toggleMenu("Reports")}
    aria-expanded={openMenus.Reports}
  >
    <span>Reports</span>
    <span>{openMenus.Reports ? "−" : "+"}</span>
  </button>

  {openMenus.Reports && (
    <div className="sidebar-submenu">
      <Link
        className={location.pathname === "/reports" ? "active" : ""}
        to="/reports"
      >
        Sales Report
      </Link>

      <Link
        className={location.pathname === "/reports/purchases" ? "active" : ""}
        to="/reports/purchases"
      >
        Purchase Report
      </Link>

      <Link
        className={location.pathname === "/reports/products" ? "active" : ""}
        to="/reports/products"
      >
        Product Sales Report
      </Link>

      <Link
        className={
          location.pathname === "/reports/monthly-balance" ? "active" : ""
        }
        to="/reports/monthly-balance"
      >
        Monthly Balance Report
      </Link>
    </div>
  )}
</div>



 
<Link
  className={location.pathname === "/expenses" ? "active" : ""}
  to="/expenses"
>
  Expenses
</Link>
         
<div className="sidebar-menu">
  <div className="sidebar-title">Reports</div>

  <Link
    className={location.pathname === "/reports" ? "active" : ""}
    to="/reports"
  >
    Sales Report
  </Link>

  <Link
    className={location.pathname === "/reports/purchases" ? "active" : ""}
    to="/reports/purchases"
  >
    Purchase Report
  </Link>
   <Link
    className={location.pathname === "/reports/products" ? "active" : ""}
    to="/reports/products"
  >
    Product Sales Report
  </Link>
  <Link
  className={
    location.pathname === "/reports/monthly-balance" ? "active" : ""
  }
  to="/reports/monthly-balance"
>
  Monthly Balance Report
</Link>
</div>

              <Link
                className={location.pathname === "/users" ? "active" : ""}
                to="/users"
              >
                Users
              </Link>
            </>
          )}

          <Link
            className={location.pathname === "/my-account" ? "active" : ""}
            to="/my-account"
          >
            My Account
          </Link>

          <button onClick={handleLogout}>
            Logout
          </button>

        </nav>

        <main className="main-content">

          <Routes>

            <Route
              path="/dashboard"
              element={<Dashboard user={user} />}
            />
<Route
  path="/sales"
  element={<SalesList user={user} />}
/>

<Route
  path="/sales/new"
  element={<CreateSale />}
/>
            <Route
              path="/products"
              element={<Products />}
            />
            <Route
  path="/products/new"
  element={<CreateProduct />}
/>
<Route
  path="/products/:id/edit"
  element={<EditProduct />}
/>

            <Route path="/purchases" element={<Purchases />} />
<Route path="/purchases/new" element={<CreatePurchase />} />
<Route path="/purchases/:id/edit" element={<EditPurchase />} />

           <Route
  path="/reports"
  element={
    user?.role === "admin"
      ? <SalesReport />
      : <Navigate to="/dashboard" replace />
  }
/>
<Route
  path="/reports/purchases"
  element={
    user?.role === "admin"
      ? <PurchaseReport />
      : <Navigate to="/dashboard" replace />
  }
/>

<Route
  path="/reports/products"
  element={
    user?.role === "admin"
      ? <ProductSalesReport />
      : <Navigate to="/dashboard" replace />
  }
/>
<Route
  path="/reports/monthly-balance"
  element={
    user?.role === "admin"
      ? <MonthlyBalanceReport />
      : <Navigate to="/dashboard" replace />
  }
/>

<Route
  path="/expenses"
  element={
    user?.role === "admin"
      ? <Expenses />
      : <Navigate to="/dashboard" replace />
  }
/>

            <Route
              path="/suppliers"
              element={<Suppliers />}
            />

            <Route
              path="/categories"
              element={<Categories />}
            />

            <Route
              path="/users"
              element={<Users />}
            />

            <Route
              path="/my-account"
              element={
                <MyAccount
                  user={user}
                 setUser={setUser}
                />
              }
            />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
           

          </Routes>

        </main>

      </div>
    </div>
  );
}


function App() {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };

  if (!token || !user) {
    return (
      <Login
        onLogin={(loggedInUser) => {
          localStorage.setItem("user", JSON.stringify(loggedInUser));
          setUser(loggedInUser);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <AppContent
        user={user}
        setUser={setUser}
        handleLogout={handleLogout}
      />
    </BrowserRouter>
  );
}

export default App;