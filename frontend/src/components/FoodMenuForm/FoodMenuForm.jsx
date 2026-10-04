import "./FoodMenuForm.css";

function FoodMenuForm({
  day,
  breakfast,
  lunch,
  dinner,
  setDay,
  setBreakfast,
  setLunch,
  setDinner,
  onSubmit,
}) {
  return (
    <div className="food-menu-form">
      <h3>Add Food Menu</h3>

      <input
        type="text"
        placeholder="Day"
        value={day}
        onChange={(e) => setDay(e.target.value)}
      />

      <input
        type="text"
        placeholder="Breakfast"
        value={breakfast}
        onChange={(e) => setBreakfast(e.target.value)}
      />

      <input
        type="text"
        placeholder="Lunch"
        value={lunch}
        onChange={(e) => setLunch(e.target.value)}
      />

      <input
        type="text"
        placeholder="Dinner"
        value={dinner}
        onChange={(e) => setDinner(e.target.value)}
      />

      <button onClick={onSubmit}>
        Add Food Menu
      </button>
    </div>
  );
}

export default FoodMenuForm;