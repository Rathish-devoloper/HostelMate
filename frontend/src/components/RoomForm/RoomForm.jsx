import "./RoomForm.css";

function RoomForm({
  newRoomNumber,
  capacity,
  setNewRoomNumber,
  setCapacity,
  onSubmit,
}) {
  return (
    <div className="room-form">
      <h3>Add Room</h3>

      <input
        type="text"
        placeholder="Room Number"
        value={newRoomNumber}
        onChange={(e) => setNewRoomNumber(e.target.value)}
      />

      <input
        type="number"
        placeholder="Room Capacity"
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
      />

      <button onClick={onSubmit}>
        Add Room
      </button>
    </div>
  );
}

export default RoomForm;