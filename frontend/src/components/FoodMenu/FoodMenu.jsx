import "./FoodMenu.css";

function FoodMenu({
  foodMenus,
  onDelete,
}) {
  return (
    <div className="food-menu-list">
      {foodMenus.length === 0 ? (
        <p className="no-food-menu">
          No food menu found.
        </p>
      ) : (
        foodMenus.map((menu) => (
          <div
            className="food-menu-card"
            key={menu._id}
          >
            <h3>🍽️ {menu.day}</h3>

            <p>
              <strong>Breakfast:</strong>{" "}
              {menu.breakfast}
            </p>

            <p>
              <strong>Lunch:</strong>{" "}
              {menu.lunch}
            </p>

            <p>
              <strong>Dinner:</strong>{" "}
              {menu.dinner}
            </p>

            <button
              className="delete-food-button"
              onClick={() => onDelete(menu._id)}
            >
              Delete Menu
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default FoodMenu;