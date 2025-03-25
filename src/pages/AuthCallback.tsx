import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");

    if (authCode) {
      fetch("http://localhost:8000/auth/callback/?code=" + authCode)
        .then((res) => res.json())
        .then((data) => {
          if (data.user_info) {
            localStorage.setItem("user", JSON.stringify(data.user_info));
            navigate("/dashboard"); // Redirect after successful login
          } else {
            console.error("Authentication failed", data);
          }
        })
        .catch((err) => console.error("Error:", err))
        .finally(() => setLoading(false));
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {loading ? (
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <div className="absolute w-full h-full border-4 border-transparent border-t-[#eb6f2d] rounded-full"></div>
          <div className="absolute w-3/4 h-3/4 border-4 border-transparent border-t-[#f89b5a] rounded-full"></div>
          <div className="absolute w-1/2 h-1/2 border-4 border-transparent border-t-[#ffcc99] rounded-full"></div>
        </motion.div>
      ) : (
        <p className="text-lg text-gray-700">Redirecting...</p>
      )}
    </div>
  );
};

export default AuthCallback;
