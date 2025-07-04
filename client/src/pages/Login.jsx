import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/authSlice";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navy";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    dispatch(loginUser(formData)).then((res) => {
      if (!res.error && res.payload && res.payload.token) {
        localStorage.setItem("token", res.payload.token);
        navigate("/");
      }
    });
  };

  return (
    <div
      style={{
        backgroundImage: "url('/snooker.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        width: "100vw",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      className="text-white"
    >
       <button
  onClick={() => navigate("/")}
  className="fixed top-2 left-4 bg-green-800 px-4 py-2 rounded text-white hover:bg-green-700 shadow-lg z-50"
>
  ← Back
</button>

      <div className="flex justify-center items-center min-h-screen px-4 pt-12 md:pt-0">
        <form
          onSubmit={handleSubmit}
          className="bg-black bg-opacity-80 p-10 rounded-2xl shadow-xl w-full max-w-md border border-green-700"
        >
          <h2 className="text-4xl font-bold text-green-400 mb-8 text-center drop-shadow-lg">
            Login to Snooker Scorer
          </h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 mb-5 rounded-md border border-green-600 bg-transparent text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 mb-5 rounded-md border border-green-600 bg-transparent text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-md transition duration-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-6 text-center text-sm text-green-200">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-green-400 font-semibold cursor-pointer hover:underline"
            >
              Register here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
