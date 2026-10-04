import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    axios
      .post("http://localhost:5000/auth/register", {
        name,
        email,
        password,
        role: "student",
      })
      .then((response) => {
        alert(
          response.data.message ||
            "Registration successful"
        );

        navigate("/login");
      })
      .catch((error) => {
        console.log(error);

        alert(
          error.response?.data?.message ||
            "Registration failed"
        );
      });
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>🏠 HostelMate</h1>

        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button onClick={handleRegister}>
          Register
        </button>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;