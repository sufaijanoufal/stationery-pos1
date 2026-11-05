
import { useEffect, useState ,useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Sales.css";
import { apiFetch } from "../../utils/api";

const CreateSale = () => {
  const navigate = useNavigate();

 const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
});

  const [products, setProducts] = useState([]);
  const [quantityErrors, setQuantityErrors] = useState({});
  const [barcode, setBarcode] = useState("");
const [scanMessage, setScanMessage] = useState("");
const [isScanning, setIsScanning] = useState(false);
const [productSearch, setProductSearch] = useState({});
const [activeProductIndex, setActiveProductIndex] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    saleDate: today,
    paymentMethod: "Cash",
    items: [
      {
        product: "",
        quantity: "",
      },
    ],
  });
const barcodeInputRef = useRef(null);
const savingRef = useRef(false);
const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetchProducts();
      barcodeInputRef.current?.focus();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "/api/products",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert(error.message);
    }
  };
const handleBarcodeScan = async (e) => {
  e.preventDefault();

  const scannedBarcode = barcode.trim();

  if (!scannedBarcode || isScanning) return;

  setIsScanning(true);
  setScanMessage("");

  try {
    const response = await apiFetch(
      `/api/products/barcode/${encodeURIComponent(scannedBarcode)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Product not found");
    }

    const product = data.data.product;

    setProducts((previous) => {
      const exists = previous.some((p) => p._id === product._id);
      return exists ? previous : [...previous, product];
    });

    setFormData((previous) => {
      const existingIndex = previous.items.findIndex(
        (item) => item.product === product._id
      );

      const updatedItems = [...previous.items];

      if (existingIndex !== -1) {
        const currentQuantity = Number(
          updatedItems[existingIndex].quantity || 0
        );

        if (currentQuantity + 1 > product.currentStock) {
          setScanMessage(
            `Only ${product.currentStock} available for ${product.name}.`
          );
          return previous;
        }

        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: currentQuantity + 1,
        };
      } else {
        const emptyIndex = updatedItems.findIndex(
          (item) => !item.product
        );

        if (emptyIndex !== -1) {
          updatedItems[emptyIndex] = {
            product: product._id,
            quantity: "1",
          };
        } else {
          updatedItems.push({
            product: product._id,
            quantity: "1",
          });
        }
      }

      return { ...previous, items: updatedItems };
    });

    setQuantityErrors({});
    setProductSearch({});
    setBarcode("");
    setScanMessage(`Added: ${product.name}`);
  } catch (error) {
    setScanMessage(error.message);
    setBarcode("");
  }finally {
  setIsScanning(false);

  setTimeout(() => {
    barcodeInputRef.current?.focus();
  }, 100);
}
};
  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalidItem = formData.items.some(
      (item) =>
        !item.product ||
        !item.quantity ||
        Number(item.quantity) < 1
    );

    if (invalidItem) {
      alert("Please select a product and enter a valid quantity.");
      return;
    }

    if (Object.values(quantityErrors).some((error) => error)) {
      alert("Please correct the quantity errors before saving.");
      return;
    }
       
    if (savingRef.current) return; // already saving - ignore a second click
    savingRef.current = true;
    setSaving(true);

   

    try {
      const response = await apiFetch(
        "/api/sales",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
       body: JSON.stringify({
  saleDate: formData.saleDate,
  paymentMethod: formData.paymentMethod,
  items: formData.items.map((item) => ({
    product: item.product,
    quantity: Number(item.quantity),
  })),
}),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create sale");
      }

      alert("Sale created successfully");

      navigate("/sales");
       } catch (error) {
      console.error("Error creating sale:", error);
      alert(error.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/sales");
  };

  const grandTotal = formData.items.reduce((total, item) => {
    const product = products.find(
      (product) => product._id === item.product
    );

    if (!product) return total;

    return (
      total +
      Number(item.quantity || 0) *
        Number(product.sellingPrice || 0)
    );
  }, 0);

  return (
    <div className="sales-page create-sale-page">
      <div className="create-product-header">
        <h2>Create Sale</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="barcode-scan-section">
  <label htmlFor="barcode">Scan Product Barcode</label>

  <input
  ref={barcodeInputRef}
    id="barcode"
    type="text"
    value={barcode}
    onChange={(e) => setBarcode(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        handleBarcodeScan(e);
      }
    }}
    placeholder="Scan barcode here..."
    autoFocus
    disabled={isScanning}
  />

  {scanMessage && (
    <p role="status">{scanMessage}</p>
  )}
</div>
        <div className="sale-basic-info">
       <div>
  <label>Bill Number</label>
  <input
    type="text"
    value="Auto-generated on saving"
    readOnly
  />
</div>

          <div>
            <label>Sale Date</label>
            <input
              type="date"
              value={formData.saleDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  saleDate: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
  <label>Payment Method</label>
  <select
    value={formData.paymentMethod}
    onChange={(e) =>
      setFormData({
        ...formData,
        paymentMethod: e.target.value,
      })
    }
    required
  >
    <option value="Cash">Cash</option>
    <option value="GPay">GPay</option>
  </select>
</div>
        </div>

        <h3>Sale Items</h3>

        {formData.items.map((item, index) => (
          <div className="sale-item" key={index}>
         
<div className="sale-field product-search-field">
  <label>Product</label>

  <input
    type="text"
    value={
      productSearch[index] ??
      products.find((p) => p._id === item.product)?.name ??
      ""
    }
    placeholder="Type product name..."
    onFocus={() => setActiveProductIndex(index)}
    onChange={(e) => {
      setProductSearch((previous) => ({
        ...previous,
        [index]: e.target.value,
      }));
      setActiveProductIndex(index);

      const updatedItems = [...formData.items];
      updatedItems[index] = {
        ...updatedItems[index],
        product: "",
        quantity: "",
      };

      setFormData({ ...formData, items: updatedItems });
      setQuantityErrors((previous) => ({
        ...previous,
        [index]: "",
      }));
    }}
  />

  {activeProductIndex === index &&
    productSearch[index]?.trim() && (
      <div className="product-search-results">
        {products
          .filter((product) => {
            const alreadySelected = formData.items.some(
              (selected, selectedIndex) =>
                selectedIndex !== index &&
                selected.product === product._id
            );

            return (
              !alreadySelected &&
              product.name
                .toLowerCase()
                .includes(productSearch[index].trim().toLowerCase())
            );
          })
          .slice(0, 10)
          .map((product) => (
            <button
              key={product._id}
              type="button"
              className="product-search-option"
              onClick={() => {
                const updatedItems = [...formData.items];
                updatedItems[index] = {
                  ...updatedItems[index],
                  product: product._id,
                  quantity: "1",
                };

                setFormData({
                  ...formData,
                  items: updatedItems,
                });

                setProductSearch((previous) => ({
                  ...previous,
                  [index]: product.name,
                }));

                setQuantityErrors((previous) => ({
                  ...previous,
                  [index]: "",
                }));

                setActiveProductIndex(null);
              }}
            >
              <strong>{product.name}</strong>
              <span>
                ₹{Number(product.sellingPrice).toFixed(2)}
                {" · "}Stock: {product.currentStock}
              </span>
            </button>
          ))}

        {products.filter((product) =>
          product.name
            .toLowerCase()
            .includes((productSearch[index] || "").trim().toLowerCase())
        ).length === 0 && (
          <p className="product-search-empty">
            No matching products found
          </p>
        )}
      </div>
    )}
</div>


            <div className="sale-field">
              <label>Quantity</label>

              <input
                type="number"
                min="1"
                required
                value={item.quantity}
                onChange={(e) => {
                  const quantity = e.target.value;
                  const selectedProduct = products.find(
                    (product) => product._id === item.product
                  );

                  if (
                    selectedProduct &&
                    Number(quantity) > selectedProduct.currentStock
                  ) {
                    setQuantityErrors((previous) => ({
                      ...previous,
                      [index]: `Only ${selectedProduct.currentStock} available in stock`,
                    }));
                    return;
                  }

                  setQuantityErrors((previous) => ({
                    ...previous,
                    [index]: "",
                  }));

                  const updatedItems = [...formData.items];
                  updatedItems[index] = {
                    ...updatedItems[index],
                    quantity,
                  };

                  setFormData({
                    ...formData,
                    items: updatedItems,
                  });
                }}
              />

              {quantityErrors[index] && (
                <p style={{ color: "red" }}>
                  {quantityErrors[index]}
                </p>
              )}
            </div>

            {item.product &&
              (() => {
                const selectedProduct = products.find(
                  (product) => product._id === item.product
                );

                if (!selectedProduct) return null;

                const itemTotal =
                  Number(item.quantity || 0) *
                  Number(selectedProduct.sellingPrice || 0);

                return (
                  <div className="sale-item-info">
                    <div>
                      <span>Available Stock</span>
                      <strong>
                        {selectedProduct.currentStock}
                      </strong>
                    </div>

                    <div>
                      <span>Selling Price</span>
                      <strong>
                        ₹
                        {Number(
                          selectedProduct.sellingPrice
                        ).toFixed(2)}
                      </strong>
                    </div>

                    <div>
                      <span>Item Total</span>
                      <strong>₹{itemTotal.toFixed(2)}</strong>
                    </div>
                  </div>
                );
              })()}

            <div className="sale-item-buttons">
              {index === formData.items.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      items: [
                        ...formData.items,
                        { product: "", quantity: "" },
                      ],
                    });
                  }}
                >
                  Add Item
                </button>
              )}

                     {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const updatedItems = formData.items.filter(
                      (_, i) => i !== index
                    );

                    setFormData({
                      ...formData,
                      items: updatedItems,
                    });

                    // keep typed product names lined up with their rows
                    setProductSearch((previous) => {
                      const next = {};
                      Object.keys(previous).forEach((key) => {
                        const i = Number(key);
                        if (i < index) next[i] = previous[i];
                        else if (i > index) next[i - 1] = previous[i];
                      });
                      return next;
                    });

                    setQuantityErrors({});
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="sale-grand-total">
          <h3>Grand Total: ₹{grandTotal.toFixed(2)}</h3>
        </div>

               <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Sale"}
        </button>

        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateSale;
