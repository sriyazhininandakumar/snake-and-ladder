import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (data.userId) {
      setNotification({ type: "success", message: "User created successfully!" });
      setTimeout(() => {
        setNotification(null);
        navigate("/");
      }, 2000);
    } else {
      setNotification({ type: "error", message: "Sign up failed. Try again." });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-black">
     
      

      <div className="bg-black-900 shadow-lg rounded-lg p-8 w-96 border border-white relative z-10">
        
        {notification && (
          <div
            className={`absolute top-[-50px] left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {notification.message}
          </div>
        )}

        <h2 className="text-2xl font-semibold text-center text-green-400 mb-6">Sign Up</h2>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-400 text-center mt-4">
          Already have an account? <Link to="/" className="text-green-600 hover:underline">Sign In</Link>
        </p>
      </div>

    
      <div className="absolute inset-0 bg-[url('/snake-pattern.png')] opacity-10"></div>

     
      <style>
        {`
          @keyframes wiggle {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(3deg); }
          }
          .animate-wiggle {
            animation: wiggle 2s infinite alternate;
          }
        `}
      </style>
    </div>
  );
};

export default SignUp;
