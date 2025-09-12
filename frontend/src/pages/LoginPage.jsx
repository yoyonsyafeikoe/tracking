import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api"; // axios instance

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 🔑 hit endpoint login backend
      const res = await API.post("/auth/login", formData);

      if (res.data && res.data.user) {
        const { user, token } = res.data;

        // simpan info login di localStorage
        localStorage.setItem("userId", user.id);
        localStorage.setItem("token", token);

        // redirect sesuai role
        if (user.role === "admin") navigate("/admin");
        if (user.role === "driver") navigate("/driver");
        if (user.role === "guide") navigate("/guide");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 p-4">
      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Sign In</h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Username */}
          <div>
            <input
              type="text"
              name="username"
              placeholder="Email"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-white bg-opacity-30 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md bg-white bg-opacity-30 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="bg-white text-blue-600 font-bold py-3 rounded-md hover:bg-gray-100 transition"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          {/* Register link */}
          <p className="text-white text-center text-sm">
            Don&apos;t have an account?{" "}
            <span className="underline cursor-pointer">Register</span>
          </p>
        </form>
      </div>
    </div>
  );
}
