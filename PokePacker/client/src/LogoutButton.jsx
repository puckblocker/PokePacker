
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("packer_token");
    localStorage.removeItem("packer_type");
    localStorage.removeItem("packer_id");
    localStorage.removeItem("packer_status");

    navigate("/visitor/login");
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;
