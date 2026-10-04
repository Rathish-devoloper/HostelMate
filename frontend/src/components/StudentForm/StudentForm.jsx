import "./StudentForm.css";

function StudentForm({
  name,
  email,
  phone,
  roomNumber,
  setName,
  setEmail,
  setPhone,
  setRoomNumber,
  editingStudent,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="student-form">
      <h3>
        {editingStudent ? "Edit Student" : "Add Student"}
      </h3>

      <input
        type="text"
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        type="text"
        placeholder="Room Number"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
      />

      <div className="student-form-buttons">
        <button onClick={onSubmit}>
          {editingStudent ? "Update Student" : "Add Student"}
        </button>

        {editingStudent && (
          <button
            className="cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default StudentForm;