import "./Navbar.css";

function Navbar() {
  const handleLogout = () => {
    // Remove login information
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Go back to login page
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="navbar-logo">
          🏠 HostelMate
        </div>

        <div className="navbar-menu">
          <a href="#students">Students</a>
          <a href="#rooms">Rooms</a>
          <a href="#complaints">Complaints</a>
          <a href="#notices">Notices</a>
          <a href="#payments">Payments</a>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;