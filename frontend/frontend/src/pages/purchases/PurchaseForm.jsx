
import { useEffect, useRef } from "react";


const PurchaseForm = ({
  formData,
  setFormData,
  suppliers,
  products,
  handleSubmit,
  removeItem,
  isEditing,
  onCancel,
}) => {
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    if (!isEditing && !formData.purchaseDate) {
      setFormData((previous) => ({
        ...previous,
        purchaseDate: new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }),
      }));
    }
  }, [isEditing, formData.purchaseDate, setFormData]);

  return (
    
    <form onSubmit={handleSubmit}>
      <div className="purchase-basic-info">
        <div className="purchase-form-field">
          <label>Supplier</label>

          <select
            value={formData.supplier}
            onChange={(e) =>
              setFormData({
                ...formData,
                supplier: e.target.value,
              })
            }
          >
            <option value="">Select Supplier</option>

            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="purchase-form-field">
          <label>Invoice Number</label>

          <input
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                invoiceNumber: e.target.value,
              })
            }
          />
        </div>

        <div className="purchase-form-field">
          <label>Purchase Date</label>

          <input
            type="date"
            required
            value={formData.purchaseDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchaseDate: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div>
        <h3>Purchase Items</h3>
          

<div className="purchase-field">
  <label>Scan Product Barcode</label>
  <input
    type="text"
    ref={barcodeInputRef}
    placeholder="Scan barcode here..."
    autoFocus
    onKeyDown={(e) => {
      if (e.key !== "Enter") return;

      e.preventDefault();

      const barcode = e.currentTarget.value.trim();
      if (!barcode) return;

      const matchedProduct = products.find(
        (product) => String(product.barcode).trim() === barcode
      );

      if (!matchedProduct) {
        alert("Product not found for barcode: " + barcode);
        e.currentTarget.value = "";
        return;
      }

      const updatedItems = [...formData.items];

      const existingIndex = updatedItems.findIndex(
        (item) => item.product === matchedProduct._id
      );

      if (existingIndex !== -1) {
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity:
            Number(updatedItems[existingIndex].quantity || 0) + 1,
        };
      } else {
        const emptyIndex = updatedItems.findIndex(
          (item) => !item.product
        );

        const targetIndex =
          emptyIndex !== -1 ? emptyIndex : updatedItems.length;

        updatedItems[targetIndex] = {
          product: matchedProduct._id,
          productName: matchedProduct.name,
          quantity: 1,
          purchasePrice: matchedProduct.purchasePrice ?? "",
        };
      }

      setFormData({
        ...formData,
        items: updatedItems,
      });

      
e.currentTarget.value = "";

setTimeout(() => {
  barcodeInputRef.current?.focus();
}, 0);

    }}
  />
</div>


        {formData.items.map((item, index) => (
          <div className="purchase-item" key={index}>
            <div className="purchase-field product-field">
              <label>Product</label>

              <select
                value={item.product}
                onChange={(e) => {
                  const updatedItems = [...formData.items];

                  updatedItems[index].product = e.target.value;

                  setFormData({
                    ...formData,
                    items: updatedItems,
                  });
                }}
              >
                <option value="">Select Product</option>

                {item.product &&
                  !products.some(
                    (product) => product._id === item.product
                  ) && (
                    <option value={item.product}>
                      {item.productName}
                    </option>
                  )}

                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="purchase-field">
              <label>Quantity</label>

              <input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const updatedItems = [...formData.items];

                  updatedItems[index].quantity = e.target.value;

                  setFormData({
                    ...formData,
                    items: updatedItems,
                  });
                }}
              />
            </div>

            <div className="purchase-field">
              <label>Purchase Price</label>

              <input
                type="number"
                 min="0"
                step="0.01"
                required
                value={item.purchasePrice}
                onChange={(e) => {
                  const updatedItems = [...formData.items];

                  updatedItems[index].purchasePrice = e.target.value;

                  setFormData({
                    ...formData,
                    items: updatedItems,
                  });
                }}
              />
            </div>

            <div className="purchase-item-total">
              <label>Total</label>

              <p>
                {(
                  Number(item.quantity || 0) *
                  Number(item.purchasePrice || 0)
                ).toFixed(2)}
              </p>
            </div>

            <div className="purchase-item-buttons">
              {index === formData.items.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      items: [
                        ...formData.items,
                        {
                          product: "",
                          quantity: "",
                          purchasePrice: "",
                        },
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
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="purchase-grand-total">
        <h3>
          Grand Total: Rs
          {formData.items
            .reduce(
              (total, item) =>
                total +
                Number(item.quantity || 0) *
                  Number(item.purchasePrice || 0),
              0
            )
            .toFixed(2)}
        </h3>
      </div>

    
<div className="purchase-form-actions">
  <button type="submit" className="purchase-save-btn">
    {isEditing ? "Update Purchase" : "Save Purchase"}
  </button>

  <button
    type="button"
    className="purchase-cancel-btn"
    onClick={onCancel}
  >
    Cancel
  </button>
</div>

    </form>
  );
};

export default PurchaseForm;