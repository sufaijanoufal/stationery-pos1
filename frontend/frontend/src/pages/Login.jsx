import { useState,useEffect } from "react";
import "../css/Login.css";



const Login = ({onLogin}) => {
    
    const [formData,setFormData] = useState({
        username: "",
        password: "",
    });
   const handleLogin = async (e) => {
    e.preventDefault();

    try{
        const response = await fetch(
             "/api/users/login",
             {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body: JSON.stringify(formData),
             }
        );

        const data = await response.json();

        if(!response.ok) {
            throw new Error (data.message || "Login Failed");
        }
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        alert("Login successful");
        onLogin(data.data); 

    }catch (error){
        console.error("Login error",error);
        alert(error.message);
    }
   };

   
   
   return(
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Stationery POS</h2>
        <p>Login to your account</p>

        <input type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => 
            setFormData({
                ...formData,
                username: e.target.value,
            })
        }
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => 
            setFormData({
                ...formData,
                password:e.target.value,
            })
          }
          />
          <button type="submit">Login</button>
      </form>
    </div>
   );
};

export default Login;