import "./ComplaintForm.css";

function ComplaintForm({
  studentName,
  complaint,
  setStudentName,
  setComplaint,
  onSubmit,
}) {
  return (
    <div className="complaint-form">
      <h3>Submit Complaint</h3>

      <input
        type="text"
        placeholder="Student Name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />

      <textarea
        placeholder="Enter your complaint"
        value={complaint}
        onChange={(e) => setComplaint(e.target.value)}
        rows="5"
      />

      <button onClick={onSubmit}>
        Submit Complaint
      </button>
    </div>
  );
}

export default ComplaintForm;