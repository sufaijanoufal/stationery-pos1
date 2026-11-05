
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Purchases.css";
import PurchaseList from "./PurchaseList";
import { apiFetch } from "../../utils/api";


function Purchases() {
    const navigate = useNavigate();
    const [purchases,setPurchases] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");
    
    const [selectedPurchase,setSelectedPurchase] = useState(null);
   
   

    useEffect(() => {
        const fetchPurchases = async() => {
            try{
             
                const response = await apiFetch("/api/purchases",{
                  headers: {
                     Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });

                if(!response.ok) {
                    throw new Error("Failed to fetch purchases")
                }

                const data = await response.json();

                setPurchases(data.data);

                
            } catch(err) {
                setError(err.message)
            }finally {
                setLoading(false)
            }
        };
        fetchPurchases();

       
    },[]);
    if(loading) {
        return <p>Loading Purchases...</p>
    }
    if(error) {
        return <p>Error:{error}</p>
    }

    const viewPurchase = async (id) => {
     
  try {
    const response = await apiFetch(
      `/api/purchases/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch purchase");
    }

    const data = await response.json();

    setSelectedPurchase(data.data);
 } catch (error) {
  console.error("Error fetching purchase:", error);
  alert(error.message || "Failed to load purchase");
}
};


    const deletePurchase = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure want to delete this purchase?"
        );

        if(!confirmDelete) return;

        try{
           const response = await apiFetch(
      `/api/purchases/${id}`,
      {
        method: "DELETE",
         headers: {
  
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},
        
      }
    );
    if(!response.ok) {
        throw new Error("Failed to delete Purchase");
    }
     const purchasesResponse = await apiFetch(
      "/api/purchases",{
         headers: {
  
  Authorization: `Bearer ${localStorage.getItem("token")}`,
},
      }
    );

    const data = await purchasesResponse.json();
    setPurchases(data.data);
       } catch (error) {
    alert(error.message || "Failed to delete purchase");
}
    };

   
return (
  <div className="purchases-page">

    <div className="purchases-header">
      <h2>Purchases</h2>

      <button
        type="button"
        onClick={() => navigate("/purchases/new")}
      >
        Add Purchase
      </button>
    </div>

    <PurchaseList
      purchases={purchases}
      viewPurchase={viewPurchase}
      deletePurchase={deletePurchase}
    />

   {selectedPurchase && (
  <div
    className="purchase-modal-overlay"
    onClick={() => setSelectedPurchase(null)}
  >
    <div
      className="purchase-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Purchase Details</h3>

      <p>
        <strong>Invoice Number:</strong>{" "}
        {selectedPurchase.invoiceNumber}
      </p>

      <p>
        <strong>Supplier:</strong>{" "}
        {selectedPurchase.supplier?.name || "-"}
      </p>

      <p>
        <strong>Purchase Date:</strong>{" "}
        {selectedPurchase.purchaseDate?.split("T")[0] || "-"}
      </p>

      <p>
        <strong>Total Amount:</strong>{" "}
        {selectedPurchase.totalAmount}
      </p>

      <h4>Items</h4>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Cost</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {selectedPurchase.items?.map((item, index) => (
            <tr key={item._id || index}>
              <td>{item.product?.name || "-"}</td>
              <td>{item.quantity}</td>
              <td>{item.unitCost ?? item.purchasePrice ?? "-"}</td>
              <td>{item.total ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={() => setSelectedPurchase(null)}
      >
        Close
      </button>
    </div>
  </div>
)}
  </div>
);
}


export default Purchases;