import "./ComplaintList.css";

function ComplaintList({
  complaints,
  onUpdateStatus,
}) {
  return (
    <div className="complaint-list">
      {complaints.length === 0 ? (
        <p className="no-complaints">
          No complaints found.
        </p>
      ) : (
        complaints.map((complaint) => (
          <div
            className="complaint-card"
            key={complaint._id}
          >
            <h3>{complaint.studentName}</h3>

            <p>
              <strong>Complaint:</strong>{" "}
              {complaint.complaint}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`complaint-status ${complaint.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {complaint.status}
              </span>
            </p>

            <p>
              <strong>Submitted:</strong>{" "}
              {complaint.createdAt
                ? new Date(
                    complaint.createdAt
                  ).toLocaleDateString()
                : "N/A"}
            </p>

            {complaint.status !== "Resolved" && (
              <button
                className="resolve-button"
                onClick={() =>
                  onUpdateStatus(
                    complaint._id,
                    "Resolved"
                  )
                }
              >
                Mark as Resolved
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default ComplaintList;