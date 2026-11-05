import { useEffect, useState } from "react";
import "../../css/Products.css";
import ProductList from "./ProductList";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";


function Products() {
    const navigate =useNavigate();
    const [products,setProducts] = useState([]);
   
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");
    
    
    const [searchTerm ,setSearchTerm] = useState("");
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await apiFetch("/api/products",{
                    headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
                });

                if(!response.ok) {
                    throw new Error("Failed to fetch products",{
                     
                    });
                }
                const data = await response.json();

                setProducts(data.data);

            } catch (err) {
                setError(err.message);
            }finally {
                setLoading(false);
            }
        };
        fetchProducts();
        
    },[]);

    if(loading) {
        return <p>Loading products....</p>
    }
   if(error){
    return <p>Error:{error}</p>;
   }
                 

const handleDelete = async(id) => {
  const confirmDelete =window.confirm("Are you sure want to deactivate this product");

  if(!confirmDelete) return;

  try{
    const response = await apiFetch(`/api/products/${id}`,{
      method: "DELETE",
       headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
    });
    if(!response.ok) {
      throw new Error("Failed to deacativate product");
    }

    setProducts((prevProducts) =>
            prevProducts.filter((product) => product._id !== id)
        );
  } catch(err) {
    setError(err.message);
  }
};



    return (
        <div className="products-page"> 
       
            <h2>Products</h2>
      
            <button onClick={() => navigate("/products/new")}>
                Add Product
            </button>


           
<ProductList 
  products={products}
  searchTerm={searchTerm}
  setSearchTerm={setSearchTerm}
  handleDelete={handleDelete}
  
  />
  
         
    
        </div>
    );
}

export default Products;