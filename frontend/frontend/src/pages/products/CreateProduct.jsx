import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "./ProductForm";
import "../../css/Products.css";
import { apiFetch } from "../../utils/api";

const CreateProduct = () => {
    
    const navigate = useNavigate();

    const [formData,setFormData] = useState({
         name: "",
    barcode: "",
    category: "",
    sellingPrice: "",
    currentStock: "",
    minimumStock: "",
    unit: "piece",
    });

    const [categories,setCategories] = useState([]);
    const [error, setError] = useState("");
    useEffect(() => {
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await apiFetch("/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
  console.log("Categories response:", response.status, data);
      setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  fetchCategories();
}, []);


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await apiFetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        ...formData,
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        minimumStock: Number(formData.minimumStock),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to create product");
      return;
    }

    navigate("/products");
  } catch (err) {
    setError(err.message || "Unable to create product");
  }
};


return (
  <div className="create-product-page">
     <div className="create-product-header">
      <h2>Create Product</h2>
    </div>
{error && (
  <p className="error-message" role="alert">
    {error}
  </p>
)}
    <ProductForm
      formData={formData}
      setFormData={setFormData}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/products")}
      isEditing={false}
    />
  </div>
);

};

export default CreateProduct;