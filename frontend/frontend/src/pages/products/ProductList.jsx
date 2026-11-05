import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductList({
  products,
  searchTerm,
  setSearchTerm,
  handleDelete,
}) {

  const navigate = useNavigate();
  
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
  );
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;



const totalPages = Math.ceil(
  filteredProducts.length / itemsPerPage
);

const safeCurrentPage = Math.min(
  currentPage,
  Math.max(totalPages, 1)
);

const startIndex = (safeCurrentPage - 1) * itemsPerPage;

const paginatedProducts = filteredProducts.slice(
  startIndex,
  startIndex + itemsPerPage
);

  const lowStockCount = products.filter(
    (product) => product.currentStock <= product.minimumStock
  ).length;

  return (
    <>
      <p className="low-stock-count">
        Low Stock Products: <strong>{lowStockCount}</strong>
      </p>

      <div className="products-search">
        <input
          type="text"
          placeholder="Search by name or barcode"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Barcode</th>
              <th>Category</th>
              <th>Selling Price</th>
              <th>Stock</th>
              <th>Minimum Stock</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="n0-products">
                  No Products Found
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.barcode}</td>
                  <td>{product.category?.name}</td>
                  <td>{product.sellingPrice}</td>

                  <td>
                    {product.currentStock}

                    {product.currentStock <= product.minimumStock && (
                      <span className="low-stock-warning">
                        ⚠ Low Stock
                      </span>
                    )}
                  </td>

                  <td>{product.minimumStock}</td>
                  <td>{product.unit}</td>

                  <td>
                    <button onClick={() => navigate(`/products/${product._id}/edit`)}>
  Edit
</button>

                    <button
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
{filteredProducts.length > 0 && (
  <div className="pagination">
    <span>
      Showing {startIndex + 1}–
      {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
      {" "}of {filteredProducts.length} products
    </span>

    <div className="pagination-buttons">
      <button
        type="button"
        disabled={safeCurrentPage === 1}
onClick={() => setCurrentPage(safeCurrentPage - 1)}
      >
        Previous
      </button>

      <span>
        Page {safeCurrentPage} of {Math.max(totalPages, 1)}
      </span>

      <button
        type="button"
       disabled={safeCurrentPage >= totalPages}
onClick={() => setCurrentPage(safeCurrentPage + 1)}
      >
        Next
      </button>
    </div>
  </div>
)}

    </>
  );
}

export default ProductList;