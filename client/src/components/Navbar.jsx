import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!user?.token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
<nav className="w-full bg-transparent text-green-300 px-6 py-4 shadow-md fixed top-0 z-50">
      <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-2">
        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-3xl sm:text-4xl font-bold cursor-pointer text-green-400 hover:text-green-300 transition"
        >
          Snooker Scorer 🎱
        </h1>

        {/* Buttons */}
        <div className="flex gap-4 text-lg mt-2 sm:mt-0">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-md shadow-md transition"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-green-400 hover:text-green-300 font-medium transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-green-400 hover:text-green-300 font-medium transition"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
