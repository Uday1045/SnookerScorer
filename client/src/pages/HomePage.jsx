import { useState, useEffect } from "react";
import { useNavigate,useLocation } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const location=useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(!!user?.token);
  }, [location]);

  const handleModeSelect = (mode) => {
    if (mode === "multiplayer") {
      navigate("/multiplayerPage");
    } else if (mode === "tournament") {
      navigate("/tournamentPage");
    }
  };
const handlehistory = () => {
    navigate("/history");
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
        position: "relative",
        top: 0,
        left: 0,
      }}
      className="text-white"
    >
      {/* ✅ Navbar is removed from here */}

      {/* Title Section */}
      <div className="text-center pt-28 sm:pt-36 pb-8 px-4">

        <h1 className="text-4xl sm:text-6xl font-extrabold text-black drop-shadow-lg leading-tight">
          Snooker Scorer 🎱
        </h1>
        <p className="text-lg font-bold sm:text-2xl text-black mt-3">
          Select your game mode
        </p>
      </div>

      {/* Game Modes */}
      <div className="flex justify-center items-center px-4 pb-16">
        <div className="flex flex-col gap-6 w-full max-w-xs sm:grid sm:grid-cols-2 sm:gap-10 sm:max-w-3xl">
          {/* Multiplayer Mode */}
          <div
            onClick={() => handleModeSelect("multiplayer")}
            className="bg-green-800 hover:bg-green-700 cursor-pointer px-6 py-5 rounded-2xl text-center transform transition hover:scale-105 shadow-lg"
          >
            <div className="text-5xl mb-2">🎱</div>
            <h2 className="text-lg sm:text-xl font-bold mb-1">Multiplayer</h2>
            <p className="text-green-300 text-sm sm:text-base">
              Pot balls. Track scores. Claim victory.
            </p>
          </div>

          {/* Tournament Mode */}
          <div
            onClick={() => handleModeSelect("tournament")}
            className="bg-green-800 hover:bg-green-700 cursor-pointer px-6 py-5 rounded-2xl text-center transform transition hover:scale-105 shadow-lg"
          >
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="text-lg sm:text-xl font-bold mb-1">Tournament</h2>
            <p className="text-green-300 text-sm sm:text-base">
              Compete in a mini-tournament and crown the champion.
            </p>
          </div>
        </div>
      </div>
      {isLoggedIn && (
      <div className="flex justify-center pb-12 px-4">
        <button
          onClick={handlehistory}
          className="bg-black bg-opacity-50 hover:bg-opacity-60 text-green-300 hover:text-green-200 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 border border-green-400"
        >
          📜 View Match History
        </button>
   
      </div>
        )}
    </div>
  );
}
