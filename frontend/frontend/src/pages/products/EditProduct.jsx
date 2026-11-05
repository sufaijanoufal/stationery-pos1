import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "./ProductForm";
import { apiFetch } from "../../utils/api";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "",
    sellingPrice: "",
    minimumStock: "",
    unit: "piece",
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [productResponse, categoriesResponse] = await Promise.all([
          apiFetch(`/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          apiFetch("/api/categories", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!productResponse.ok) {
          throw new Error("Failed to fetch product");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }

        const productData = await productResponse.json();
        const categoriesData = await categoriesResponse.json();

        const product = productData.data;

        setFormData({
          name: product.name,
          barcode: product.barcode,
          category: product.category?._id || product.category,
          sellingPrice: product.sellingPrice,
          minimumStock: product.minimumStock,
          unit: product.unit,
        });

        setCategories(categoriesData.data);
           } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };
     fetchData();
  }, [id]);


  const handleUpdate = async (e) => {
  e.preventDefault();

  try {
    const response = await apiFetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        name: formData.name,
        barcode: formData.barcode,
        category: formData.category,
        sellingPrice: Number(formData.sellingPrice),
        minimumStock: Number(formData.minimumStock),
        unit: formData.unit,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update product");
    }

    navigate("/products");
   } catch (error) {
    console.error(error);
    alert(error.message);
  }
};
  
return (
  <div className="create-product-page">
    <div className="create-product-header">
      <h2>Edit Product</h2>
    </div>

    <ProductForm
      formData={formData}
      setFormData={setFormData}
      categories={categories}
      onSubmit={handleUpdate}
      onCancel={() => navigate("/products")}
      isEditing={true}
    />
  </div>
);

};

export default EditProduct;