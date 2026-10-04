import axios from "axios";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login/login";
import Register from "./pages/Register/Register";

import StudentForm from "./components/StudentForm/StudentForm";
import StudentList from "./components/StudentList/StudentList";

import RoomForm from "./components/RoomForm/RoomForm";
import RoomList from "./components/RoomList/RoomList";

import ComplaintForm from "./components/ComplaintForm/ComplaintForm";
import ComplaintList from "./components/ComplaintList/ComplaintList";

import NoticeForm from "./components/NoticeForm/NoticeForm";
import NoticeList from "./components/NoticeList/NoticeList";

import FoodMenuForm from "./components/FoodMenuForm/FoodMenuForm";
import FoodMenu from "./components/FoodMenu/FoodMenu";

import PaymentForm from "./components/PaymentForm/PaymentForm";
import PaymentList from "./components/PaymentList/PaymentList";

import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const getUser = () => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.log("User error:", error);
      return null;
    }
  };

  const user = getUser();

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [foodMenus, setFoodMenus] = useState([]);
  const [payments, setPayments] = useState([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [editingStudent, setEditingStudent] = useState(null);

  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const [studentName, setStudentName] = useState("");
  const [complaint, setComplaint] = useState("");

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  const [day, setDay] = useState("");
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");

  const [paymentStudentName, setPaymentStudentName] =
    useState("");

  const [amount, setAmount] = useState("");

  const [paymentDate, setPaymentDate] = useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("Paid");

  useEffect(() => {
    const token = getToken();

    if (token) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common[
        "Authorization"
      ];
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/students`,
        getHeaders()
      );

      setStudents(response.data);
    } catch (error) {
      console.log("Fetch students:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to load students",
        "error"
      );
    }
  };

  const handleStudentSubmit = async () => {
    if (!isAdmin) {
      showMessage(
        "Only admin can manage students.",
        "error"
      );
      return;
    }

    if (
      !name ||
      !email ||
      !phone ||
      !roomNumber
    ) {
      showMessage(
        "Please fill all student fields",
        "error"
      );
      return;
    }

    try {
      if (editingStudent) {
        const response = await axios.put(
          `${API_URL}/students/${editingStudent._id}`,
          {
            name,
            email,
            phone,
            roomNumber,
          },
          getHeaders()
        );

        setStudents(
          students.map((student) =>
            student._id === editingStudent._id
              ? response.data
              : student
          )
        );

        showMessage(
          "Student updated successfully!"
        );
      } else {
        const response = await axios.post(
          `${API_URL}/students`,
          {
            name,
            email,
            phone,
            roomNumber,
          },
          getHeaders()
        );

        setStudents([
          ...students,
          response.data,
        ]);

        showMessage(
          "Student added successfully!"
        );
      }

      setName("");
      setEmail("");
      setPhone("");
      setRoomNumber("");
      setEditingStudent(null);
    } catch (error) {
      console.log(
        "Student save error:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to save student",
        "error"
      );
    }
  };

  const editStudent = (student) => {
    if (!isAdmin) {
      showMessage(
        "Only admin can edit students.",
        "error"
      );
      return;
    }

    setEditingStudent(student);

    setName(student.name || "");
    setEmail(student.email || "");
    setPhone(student.phone || "");
    setRoomNumber(student.roomNumber || "");

    document
      .getElementById("students")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const deleteStudent = async (id) => {
    if (!isAdmin) {
      showMessage(
        "Only admin can delete students.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/students/${id}`,
        getHeaders()
      );

      setStudents(
        students.filter(
          (student) => student._id !== id
        )
      );

      showMessage(
        "Student deleted successfully!"
      );
    } catch (error) {
      console.log(
        "Delete student:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to delete student",
        "error"
      );
    }
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    setName("");
    setEmail("");
    setPhone("");
    setRoomNumber("");
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/rooms`,
        getHeaders()
      );

      setRooms(response.data);
    } catch (error) {
      console.log("Fetch rooms:", error);

      showMessage(
        "Failed to load rooms",
        "error"
      );
    }
  };

  const addRoom = async () => {
    if (!isAdmin) {
      showMessage(
        "Only admin can add rooms.",
        "error"
      );
      return;
    }

    if (!newRoomNumber || !capacity) {
      showMessage(
        "Please enter room number and capacity",
        "error"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/rooms`,
        {
          roomNumber: newRoomNumber,
          capacity: Number(capacity),
        },
        getHeaders()
      );

      setRooms([
        ...rooms,
        response.data,
      ]);

      setNewRoomNumber("");
      setCapacity("");

      showMessage(
        "Room added successfully!"
      );
    } catch (error) {
      console.log("Add room:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to add room",
        "error"
      );
    }
  };

  const fetchComplaints = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/complaints`,
        getHeaders()
      );

      setComplaints(response.data);
    } catch (error) {
      console.log(
        "Fetch complaints:",
        error
      );

      showMessage(
        "Failed to load complaints",
        "error"
      );
    }
  };

  const submitComplaint = async () => {
    if (!isAdmin && !isStudent) {
      showMessage(
        "You are not authorized to submit complaints.",
        "error"
      );
      return;
    }

    if (!studentName || !complaint) {
      showMessage(
        "Please enter student name and complaint",
        "error"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/complaints`,
        {
          studentName,
          complaint,
        },
        getHeaders()
      );

      setComplaints([
        response.data,
        ...complaints,
      ]);

      setStudentName("");
      setComplaint("");

      showMessage(
        "Complaint submitted successfully!"
      );
    } catch (error) {
      console.log(
        "Add complaint:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to submit complaint",
        "error"
      );
    }
  };

  const updateComplaintStatus = async (
    id,
    status
  ) => {
    if (!isAdmin) {
      showMessage(
        "Only admin can update complaint status.",
        "error"
      );
      return;
    }

    try {
      const response = await axios.put(
        `${API_URL}/complaints/${id}`,
        {
          status,
        },
        getHeaders()
      );

      setComplaints(
        complaints.map((item) =>
          item._id === id
            ? response.data
            : item
        )
      );

      showMessage(
        "Complaint status updated!"
      );
    } catch (error) {
      console.log(
        "Update complaint:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to update complaint",
        "error"
      );
    }
  };

  const deleteComplaint = async (id) => {
    if (!isAdmin) {
      showMessage(
        "Only admin can delete complaints.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      "Delete this complaint?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/complaints/${id}`,
        getHeaders()
      );

      setComplaints(
        complaints.filter(
          (item) => item._id !== id
        )
      );

      showMessage(
        "Complaint deleted successfully!"
      );
    } catch (error) {
      console.log(
        "Delete complaint:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to delete complaint",
        "error"
      );
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/notices`,
        getHeaders()
      );

      setNotices(response.data);
    } catch (error) {
      console.log("Fetch notices:", error);

      showMessage(
        "Failed to load notices",
        "error"
      );
    }
  };

  const addNotice = async () => {
    if (!isAdmin) {
      showMessage(
        "Only admin can add notices.",
        "error"
      );
      return;
    }

    if (!noticeTitle || !noticeMessage) {
      showMessage(
        "Please enter notice title and message",
        "error"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/notices`,
        {
          title: noticeTitle,
          message: noticeMessage,
        },
        getHeaders()
      );

      setNotices([
        response.data,
        ...notices,
      ]);

      setNoticeTitle("");
      setNoticeMessage("");

      showMessage(
        "Notice added successfully!"
      );
    } catch (error) {
      console.log("Add notice:", error);

      showMessage(
        error.response?.data?.message ||
          "Failed to add notice",
        "error"
      );
    }
  };

  const deleteNotice = async (id) => {
    if (!isAdmin) {
      showMessage(
        "Only admin can delete notices.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      "Delete this notice?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/notices/${id}`,
        getHeaders()
      );

      setNotices(
        notices.filter(
          (notice) => notice._id !== id
        )
      );

      showMessage(
        "Notice deleted successfully!"
      );
    } catch (error) {
      console.log(
        "Delete notice:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to delete notice",
        "error"
      );
    }
  };

  const fetchFoodMenus = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/food-menu`,
        getHeaders()
      );

      setFoodMenus(response.data);
    } catch (error) {
      console.log(
        "Fetch food menu:",
        error
      );

      showMessage(
        "Failed to load food menu",
        "error"
      );
    }
  };

  const addFoodMenu = async () => {
    if (!isAdmin) {
      showMessage(
        "Only admin can manage food menu.",
        "error"
      );
      return;
    }

    if (
      !day ||
      !breakfast ||
      !lunch ||
      !dinner
    ) {
      showMessage(
        "Please fill all food menu fields",
        "error"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/food-menu`,
        {
          day,
          breakfast,
          lunch,
          dinner,
        },
        getHeaders()
      );

      setFoodMenus([
        response.data,
        ...foodMenus,
      ]);

      setDay("");
      setBreakfast("");
      setLunch("");
      setDinner("");

      showMessage(
        "Food menu added successfully!"
      );
    } catch (error) {
      console.log(
        "Add food menu:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to add food menu",
        "error"
      );
    }
  };

  const deleteFoodMenu = async (id) => {
    if (!isAdmin) {
      showMessage(
        "Only admin can delete food menu.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      "Delete this food menu?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/food-menu/${id}`,
        getHeaders()
      );

      setFoodMenus(
        foodMenus.filter(
          (menu) => menu._id !== id
        )
      );

      showMessage(
        "Food menu deleted successfully!"
      );
    } catch (error) {
      console.log(
        "Delete food menu:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to delete food menu",
        "error"
      );
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/payments`,
        getHeaders()
      );

      setPayments(response.data);
    } catch (error) {
      console.log(
        "Fetch payments:",
        error
      );

      showMessage(
        "Failed to load payments",
        "error"
      );
    }
  };

  const addPayment = async () => {
    if (!isAdmin) {
      showMessage(
        "Only admin can manage payments.",
        "error"
      );
      return;
    }

    if (
      !paymentStudentName ||
      !amount ||
      !paymentDate ||
      !paymentStatus
    ) {
      showMessage(
        "Please fill all payment fields",
        "error"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/payments`,
        {
          studentName: paymentStudentName,
          amount: Number(amount),
          paymentDate,
          status: paymentStatus,
        },
        getHeaders()
      );

      setPayments([
        response.data,
        ...payments,
      ]);

      setPaymentStudentName("");
      setAmount("");
      setPaymentDate("");
      setPaymentStatus("Paid");

      showMessage(
        "Payment added successfully!"
      );
    } catch (error) {
      console.log(
        "Add payment:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to add payment",
        "error"
      );
    }
  };

  const deletePayment = async (id) => {
    if (!isAdmin) {
      showMessage(
        "Only admin can delete payments.",
        "error"
      );
      return;
    }

    const confirmed = window.confirm(
      "Delete this payment?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/payments/${id}`,
        getHeaders()
      );

      setPayments(
        payments.filter(
          (payment) =>
            payment._id !== id
        )
      );

      showMessage(
        "Payment deleted successfully!"
      );
    } catch (error) {
      console.log(
        "Delete payment:",
        error
      );

      showMessage(
        error.response?.data?.message ||
          "Failed to delete payment",
        "error"
      );
    }
  };

  useEffect(() => {
    const token = getToken();

    if (!token) return;

    fetchStudents();
    fetchRooms();
    fetchComplaints();
    fetchNotices();
    fetchFoodMenus();
    fetchPayments();
  }, []);

  const renderDashboard = () => {
    const displayName =
      user?.name || "User";

    const displayRole =
      isAdmin
        ? "Administrator"
        : "Student";

    return (
      <div className="dashboard-page">

        <Navbar />

        <div className="app-layout">

          <Sidebar />

          <main className="main-content">

            {message && (
              <div
                className={`app-message ${messageType}`}
              >
                {messageType === "success"
                  ? "✓ "
                  : "⚠ "}

                {message}
              </div>
            )}

            <section
              id="dashboard"
              className="app-header"
            >
              <div>

                <div className="header-badge">
                  🏠 HostelMate
                </div>

                <h1>
                  Welcome back,{" "}
                  {displayName} 👋
                </h1>

                <p>
                  Smart Hostel Management
                  System
                </p>

              </div>

              <div className="header-user">

                <div className="user-avatar">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <strong>
                    {displayName}
                  </strong>

                  <span>
                    {displayRole}
                  </span>

                </div>

              </div>

            </section>

            <section className="dashboard-summary">

              <div className="summary-card">

                <div className="summary-icon">
                  👨‍🎓
                </div>

                <div>
                  <span>
                    Students
                  </span>

                  <strong>
                    {students.length}
                  </strong>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-icon">
                  🚪
                </div>

                <div>
                  <span>
                    Rooms
                  </span>

                  <strong>
                    {rooms.length}
                  </strong>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-icon">
                  📝
                </div>

                <div>
                  <span>
                    Complaints
                  </span>

                  <strong>
                    {complaints.length}
                  </strong>
                </div>

              </div>

              <div className="summary-card">

                <div className="summary-icon">
                  💳
                </div>

                <div>
                  <span>
                    Payments
                  </span>

                  <strong>
                    {payments.length}
                  </strong>
                </div>

              </div>

            </section>

            <section
              id="students"
              className="app-section"
            >

              <div className="section-heading">

                <div>

                  <span>
                    MANAGEMENT
                  </span>

                  <h2>
                    👨‍🎓 Student Management
                  </h2>

                  <p>
                    {isAdmin
                      ? "Add and manage hostel students."
                      : "Student management is available to administrators."
                    }
                  </p>

                </div>

              </div>

              {isAdmin ? (
                <>
                  <StudentForm
                    name={name}
                    email={email}
                    phone={phone}
                    roomNumber={roomNumber}
                    setName={setName}
                    setEmail={setEmail}
                    setPhone={setPhone}
                    setRoomNumber={
                      setRoomNumber
                    }
                    editingStudent={
                      editingStudent
                    }
                    onSubmit={
                      handleStudentSubmit
                    }
                    onCancel={cancelEdit}
                  />

                  <StudentList
                    students={students}
                    onEdit={editStudent}
                    onDelete={
                      deleteStudent
                    }
                  />
                </>
              ) : (
                <div className="student-info-card">

                  <div className="info-icon">
                    👨‍🎓
                  </div>

                  <div>

                    <h3>
                      Student Account
                    </h3>

                    <p>
                      You are logged in as a
                      student. Student
                      management is handled by
                      the administrator.
                    </p>

                  </div>

                </div>
              )}

            </section>

            <hr className="app-divider" />

            <section
              id="rooms"
              className="app-section"
            >

              <div className="section-heading">

                <div>

                  <span>
                    HOSTEL
                  </span>

                  <h2>
                    🚪 Room Management
                  </h2>

                  <p>
                    {isAdmin
                      ? "Add and manage hostel rooms."
                      : "View available hostel rooms."
                    }
                  </p>

                </div>

              </div>

              {isAdmin && (
                <RoomForm
                  newRoomNumber={
                    newRoomNumber
                  }
                  capacity={capacity}
                  setNewRoomNumber={
                    setNewRoomNumber
                  }
                  setCapacity={
                    setCapacity
                  }
                  onSubmit={addRoom}
                />
              )}

              <RoomList
                rooms={rooms}
              />

            </section>

            <hr className="app-divider" />

            <section
              id="complaints"
              className="app-section"
            >

              <div className="section-heading">

                <div>

                  <span>
                    SUPPORT
                  </span>

                  <h2>
                    📝 Complaints
                  </h2>

                  <p>
                    {isAdmin
                      ? "Manage hostel complaints."
                      : "Submit and view your hostel complaint."
                    }
                  </p>

                </div>

              </div>

              <ComplaintForm
                studentName={
                  studentName
                }
                complaint={complaint}
                setStudentName={
                  setStudentName
                }
                setComplaint={
                  setComplaint
                }
                onSubmit={
                  submitComplaint
                }
              />

              <ComplaintList
                complaints={complaints}

                onUpdateStatus={
                  isAdmin
                    ? updateComplaintStatus
                    : undefined
                }

                onDelete={
                  isAdmin
                    ? deleteComplaint
                    : undefined
                }
              />

            </section>

            <hr className="app-divider" />

            <section
              id="notices"
              className="app-section"
            >

              <div className="section-heading">

                <div>

                  <span>
                    ANNOUNCEMENTS
                  </span>

                  <h2>
                    📢 Hostel Notices
                  </h2>

                  <p>
                    {isAdmin
                      ? "Publish important announcements."
                      : "View important hostel announcements."
                    }
                  </p>

                </div>

              </div>

              {isAdmin && (
                <NoticeForm
                  title={noticeTitle}
                  message={
                    noticeMessage
                  }
                  setTitle={
                    setNoticeTitle
                  }
                  setMessage={
                    setNoticeMessage
                  }
                  onSubmit={
                    addNotice
                  }
                />
              )}

              <NoticeList
                notices={notices}

                onDelete={
                  isAdmin
                    ? deleteNotice
                    : undefined
                }
              />

            </section>

            <hr className="app-divider" />

            <section
              id="food-menu"
              className="app-section"
            >

              <div className="section-heading">

                <div>

                  <span>
                    DINING
                  </span>

                  <h2>
                    🍽️ Food Menu
                  </h2>

                  <p>
                    {isAdmin
                      ? "Manage daily hostel food."
                      : "View the daily hostel food menu."
                    }
                  </p>

                </div>

              </div>

              {isAdmin && (
                <FoodMenuForm
                  day={day}
                  breakfast={
                    breakfast
                  }
                  lunch={lunch}
                  dinner={dinner}
                  setDay={setDay}
                  setBreakfast={
                    setBreakfast
                  }
                  setLunch={
                    setLunch
                  }
                  setDinner={
                    setDinner
                  }
                  onSubmit={
                    addFoodMenu
                  }
                />
              )}

              <FoodMenu
                foodMenus={foodMenus}

                onDelete={
                  isAdmin
                    ? deleteFoodMenu
                    : undefined
                }
              />

            </section>

            <hr className="app-divider" />

            <section
              id="payments"
              className="app-section"
            >

              <div className="section-heading">

                <div>

                  <span>
                    FINANCE
                  </span>

                  <h2>
                    💳 Payments
                  </h2>

                  <p>
                    {isAdmin
                      ? "Manage hostel payment records."
                      : "View your hostel payment records."
                    }
                  </p>

                </div>

              </div>

              {isAdmin && (
                <PaymentForm
                  studentName={
                    paymentStudentName
                  }
                  amount={amount}
                  paymentDate={
                    paymentDate
                  }
                  status={
                    paymentStatus
                  }
                  setStudentName={
                    setPaymentStudentName
                  }
                  setAmount={
                    setAmount
                  }
                  setPaymentDate={
                    setPaymentDate
                  }
                  setStatus={
                    setPaymentStatus
                  }
                  onSubmit={
                    addPayment
                  }
                />
              )}

              <PaymentList
                payments={payments}

                onDelete={
                  isAdmin
                    ? deletePayment
                    : undefined
                }
              />

            </section>

            <footer className="app-footer">

              <h3>
                🏠 HostelMate
              </h3>

              <p>
                Smart Hostel Management
                System
              </p>

              <small>
                © 2026 HostelMate • Created by
                Rathish
              </small>

            </footer>

          </main>

        </div>

      </div>
    );
  };

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                "admin",
                "student",
              ]}
            >
              {renderDashboard()}
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;