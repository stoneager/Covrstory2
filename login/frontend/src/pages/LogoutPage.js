import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Remove token (or any auth data) from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // if you store user info
    
    // ✅ Redirect to login page (/)
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <p className="text-lg font-semibold text-gray-700">
        Logging out...
      </p>
    </div>
  );
};

export default LogoutPage;
