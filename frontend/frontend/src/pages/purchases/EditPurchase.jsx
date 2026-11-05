import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PurchaseForm from "./PurchaseForm";
import { apiFetch } from "../../utils/api";

const EditPurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    supplier: "",
    invoiceNumber: "",
    purchaseDate: "",
    items: [
      {
        product: "",
        productName: "",
        quantity: "",
        purchasePrice: "",
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [purchaseResponse, suppliersResponse, productsResponse] =
          await Promise.all([
            fetch(`/api/purchases/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

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

        if (
          !purchaseResponse.ok ||
          !suppliersResponse.ok ||
          !productsResponse.ok
        ) {
          throw new Error("Failed to fetch purchase data");
        }

        const purchaseData = await purchaseResponse.json();
        const suppliersData = await suppliersResponse.json();
        const productsData = await productsResponse.json();

        const purchase = purchaseData.data;

        setSuppliers(suppliersData.data);
        setProducts(productsData.data);

        setFormData({
          supplier: purchase.supplier?._id || "",
          invoiceNumber: purchase.invoiceNumber || "",
          purchaseDate: purchase.purchaseDate
            ? purchase.purchaseDate.split("T")[0]
            : "",
          items: purchase.items.map((item) => ({
            product: item.product?._id || "",
            productName: item.product?.name || "",
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
          })),
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching purchase:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const removeItem = (index) => {
    const updatedItems = formData.items.filter(
      (_, itemIndex) => itemIndex !== index
    );

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplier) {
      alert("Please select a supplier");
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

    try {
      const token = localStorage.getItem("token");

      const response = await apiFetch(`/api/purchases/${id}`, {
        method: "PATCH",
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
        const errorData = await response.json();

        throw new Error(
          errorData.message || "Failed to update purchase"
        );
      }

      navigate("/purchases");
    } catch (error) {
      console.error("Error updating purchase:", error);
      alert(error.message);
    }
  };

  const handleCancel = () => {
    navigate("/purchases");
  };

  if (loading) {
    return <p>Loading Purchase...</p>;
  }

  return (
  <div className="create-purchase-page">
    <div className="create-product-header">
      <h2>Edit Purchase</h2>
    </div>

    <PurchaseForm
      formData={formData}
      setFormData={setFormData}
      suppliers={suppliers}
      products={products}
      handleSubmit={handleSubmit}
      removeItem={removeItem}
      isEditing={true}
      onCancel={handleCancel}
    />
  </div>
);
};

export default EditPurchase;