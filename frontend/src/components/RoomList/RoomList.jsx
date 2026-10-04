import "./RoomList.css";

function RoomList({ rooms }) {
  return (
    <div className="room-list">
      {rooms.length === 0 ? (
        <p className="no-rooms">No rooms found.</p>
      ) : (
        rooms.map((room) => (
          <div className="room-card" key={room._id}>
            <h3>🚪 Room {room.roomNumber}</h3>

            <p>
              <strong>Capacity:</strong> {room.capacity}
            </p>

            <p>
              <strong>Occupied:</strong> {room.occupied}
            </p>

            <p>
              <strong>Status:</strong> {room.status}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default RoomList;