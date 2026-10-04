import "./NoticeList.css";

function NoticeList({
  notices,
  onDelete,
}) {
  return (
    <div className="notice-list">
      {notices.length === 0 ? (
        <p className="no-notices">
          No notices found.
        </p>
      ) : (
        notices.map((notice) => (
          <div
            className="notice-card"
            key={notice._id}
          >
            <h3>📢 {notice.title}</h3>

            <p>
              {notice.message}
            </p>

            <p className="notice-date">
              <strong>Posted:</strong>{" "}
              {notice.createdAt
                ? new Date(
                    notice.createdAt
                  ).toLocaleDateString()
                : "N/A"}
            </p>

            <button
              className="delete-notice-button"
              onClick={() => onDelete(notice._id)}
            >
              Delete Notice
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default NoticeList;