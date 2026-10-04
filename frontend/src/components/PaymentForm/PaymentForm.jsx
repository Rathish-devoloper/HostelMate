import "./PaymentForm.css";

function PaymentForm({
  studentName,
  amount,
  paymentDate,
  status,
  setStudentName,
  setAmount,
  setPaymentDate,
  setStatus,
  onSubmit,
}) {
  return (
    <div className="payment-form">
      <h3>Add Payment</h3>

      <input
        type="text"
        placeholder="Student Name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        type="date"
        value={paymentDate}
        onChange={(e) => setPaymentDate(e.target.value)}
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Paid">Paid</option>
        <option value="Pending">Pending</option>
      </select>

      <button onClick={onSubmit}>
        Add Payment
      </button>
    </div>
  );
}

export default PaymentForm;