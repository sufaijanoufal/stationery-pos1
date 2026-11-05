
const ProductForm = ({
  formData,
  setFormData,
  categories,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  return (
    <form className="product-form-container" 
    
  onSubmit={onSubmit}>
      <div className="add-product-form">
        <label htmlFor="category">Category:</label>

        <select
          value={formData.category?._id || formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value,
            })
          }
          required
        >
          <option value="">Select Category</option>

         {(categories || []).map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="add-product-form">
        <label htmlFor="name">Product Name:</label>

        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({
              ...formData,
              name: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="add-product-form">
        <label htmlFor="barcode">Barcode:</label>

        <input
          type="text"
          value={formData.barcode}
          onChange={(e) =>
            setFormData({
              ...formData,
              barcode: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="add-product-form">
        <label htmlFor="sellingPrice">Selling Price:</label>

        <input
          type="number"
           min="0"
                step="0.01"
                required
          value={formData.sellingPrice}
          onChange={(e) =>
            setFormData({
              ...formData,
              sellingPrice: e.target.value,
            })
          }
        
        />
      </div>

      {!isEditing && (
        <div className="add-product-form">
          <label htmlFor="currentStock">Opening Stock:</label>

          <input
            type="number"
            value={formData.currentStock}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentStock: e.target.value,
              })
            }
            required
          />
        </div>
      )}

      <div className="add-product-form">
        <label htmlFor="minimumStock">Minimum Stock:</label>

        <input
          type="number"
          value={formData.minimumStock}
          onChange={(e) =>
            setFormData({
              ...formData,
              minimumStock: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="add-product-form">
        <label htmlFor="unit">Unit:</label>

        <input
          type="text"
          value={formData.unit}
          onChange={(e) =>
            setFormData({
              ...formData,
              unit: e.target.value,
            })
          }
          required
        />
      </div>

     <div className="form-buttons">
  <button type="submit">
    {isEditing ? "Update" : "Create"}
  </button>

  <button type="button" onClick={onCancel}>
    Cancel
  </button>
</div>
    </form>
  );
};

export default ProductForm;