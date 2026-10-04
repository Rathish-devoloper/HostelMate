import "./StudentList.css";

function StudentList({ students, onEdit, onDelete }) {
  return (
    <div className="student-list">
      {students.length === 0 ? (
        <p className="no-students">No students found.</p>
      ) : (
        students.map((student) => (
          <div className="student-card" key={student._id}>
            <h3>{student.name}</h3>

            <p>
              <strong>Email:</strong> {student.email}
            </p>

            <p>
              <strong>Phone:</strong> {student.phone}
            </p>

            <p>
              <strong>Room:</strong> {student.roomNumber}
            </p>

            <div className="student-card-buttons">
              <button
                className="edit-button"
                onClick={() => onEdit(student)}
              >
                Edit
              </button>

              <button
                className="delete-button"
                onClick={() => onDelete(student._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default StudentList;