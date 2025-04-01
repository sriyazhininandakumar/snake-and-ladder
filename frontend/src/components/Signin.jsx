import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (data.token) {
      localStorage.setItem("userid", data.userId);
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      console.log("Stored userid:", localStorage.getItem("userid"));
      console.log("Stored username:", localStorage.getItem("username"));

      navigate(`/start-game`);
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="bg-black p-8 rounded-lg shadow-lg w-96 border bg-black border-white">
        <h2 className="text-2xl font-semibold text-green-600 text-center mb-4">
          Sign In
        </h2>
        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2  border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2  border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-black"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-600 transition"
          >
            Sign In
          </button>
        </form>
        <p className="text-center mt-4 text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-green-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
