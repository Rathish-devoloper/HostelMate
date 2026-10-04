import "./NoticeForm.css";

function NoticeForm({
  title,
  message,
  setTitle,
  setMessage,
  onSubmit,
}) {
  return (
    <div className="notice-form">
      <h3>Add Notice</h3>

      <input
        type="text"
        placeholder="Notice Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Enter notice message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows="5"
      />

      <button onClick={onSubmit}>
        Add Notice
      </button>
    </div>
  );
}

export default NoticeForm;