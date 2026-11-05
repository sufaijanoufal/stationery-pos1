import { useEffect, useState ,useRef } from "react";
import { useNavigate } from "react-router-dom";
import PurchaseForm from "./PurchaseForm";
import { apiFetch } from "../../utils/api";

const CreatePurchase = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    supplier: "",
    invoiceNumber: "",
        purchaseDate: new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    }),
    items: [
      {
        product: "",
        quantity: "",
        purchasePrice: "",
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [suppliersResponse, productsResponse] = await Promise.all([
          apiFetch("/api/suppliers", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          apiFetch("/api/products", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const suppliersData = await suppliersResponse.json();
        const productsData = await productsResponse.json();

        setSuppliers(suppliersData.data);
        setProducts(productsData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const removeItem = (index) => {
    const updatedItems = formData.items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

   const savingRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (savingRef.current) return; // already saving - ignore a second click

    if (!formData.supplier) {
      alert("Please select a supplier");
      return;
    }

    if (!formData.purchaseDate) {
      alert("Please select the purchase date");
      return;
    }

    if (
      formData.items.some(
        (item) =>
          !item.product ||
          !item.quantity ||
          Number(item.quantity) <= 0 ||
          item.purchasePrice === "" ||
          Number(item.purchasePrice) < 0
      )
    ) {
      alert(
        "Please enter valid product, quantity, and purchase price for all items"
      );
      return;
    }

    savingRef.current = true;

    try {
      const token = localStorage.getItem("token");
     
      const response = await apiFetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplier: formData.supplier,
          invoiceNumber: formData.invoiceNumber,
          purchaseDate: formData.purchaseDate,
          items: formData.items.map((item) => ({
            product: item.product,
            quantity: Number(item.quantity),
            purchasePrice: Number(item.purchasePrice),
            total:
              Number(item.quantity) * Number(item.purchasePrice),
          })),
          totalAmount: formData.items.reduce(
            (total, item) =>
              total +
              Number(item.quantity || 0) *
                Number(item.purchasePrice || 0),
            0
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create purchase");
      }

      navigate("/purchases");
        } catch (error) {
      console.error("Error creating purchase:", error);
      alert(error.message);
    } finally {
      savingRef.current = false;
    }
  };

  const handleCancel = () => {
    navigate("/purchases");
  };

return (
  <div className="create-purchase-page">
    <div className="create-product-header">
      <h2>Create Purchase</h2>
    </div>

    <PurchaseForm
      formData={formData}
      setFormData={setFormData}
      suppliers={suppliers}
      products={products}
      handleSubmit={handleSubmit}
      removeItem={removeItem}
      isEditing={false}
      onCancel={handleCancel}
    />
  </div>
);
};

export default CreatePurchase;