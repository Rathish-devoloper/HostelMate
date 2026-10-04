import "./PaymentList.css";

function PaymentList({
  payments,
  onDelete,
}) {
  return (
    <div className="payment-list">
      {payments.length === 0 ? (
        <p className="no-payments">
          No payments found.
        </p>
      ) : (
        payments.map((payment) => (
          <div
            className="payment-card"
            key={payment._id}
          >
            <h3>💳 {payment.studentName}</h3>

            <p>
              <strong>Amount:</strong> ₹{payment.amount}
            </p>

            <p>
              <strong>Payment Date:</strong>{" "}
              {payment.paymentDate
                ? new Date(
                    payment.paymentDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`payment-status ${payment.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {payment.status}
              </span>
            </p>

            <button
              className="delete-payment-button"
              onClick={() => onDelete(payment._id)}
            >
              Delete Payment
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default PaymentList;