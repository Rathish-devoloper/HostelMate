import "./Sidebar.css";

function Sidebar() {
  const goToSection = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    const navbarHeight = 70;
    const sectionPosition =
      section.getBoundingClientRect().top +
      window.scrollY -
      navbarHeight;

    window.scrollTo({
      top: sectionPosition,
      behavior: "smooth",
    });
  };

  const goToDashboard = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        HostelMate
      </div>

      <nav className="sidebar-menu">

        <button
          className="sidebar-link"
          onClick={goToDashboard}
        >
          🏠 Dashboard
        </button>

        <button
          className="sidebar-link"
          onClick={() => goToSection("students")}
        >
          👨‍🎓 Students
        </button>

        <button
          className="sidebar-link"
          onClick={() => goToSection("rooms")}
        >
          🚪 Rooms
        </button>

        <button
          className="sidebar-link"
          onClick={() => goToSection("complaints")}
        >
          📝 Complaints
        </button>

        <button
          className="sidebar-link"
          onClick={() => goToSection("notices")}
        >
          📢 Notices
        </button>

        <button
          className="sidebar-link"
          onClick={() => goToSection("food-menu")}
        >
          🍽️ Food Menu
        </button>

        <button
          className="sidebar-link"
          onClick={() => goToSection("payments")}
        >
          💳 Payments
        </button>

      </nav>
    </aside>
  );
}

export default Sidebar;