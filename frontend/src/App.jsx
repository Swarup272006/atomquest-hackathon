import dashboardImage from "./assets/dashboard.png";

import { useState, useEffect } from "react";
import axios from "axios";

import {
  Target,
  Users,
  CheckCircle,
  BarChart3,
  Plus
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function App() {

  const [formData, setFormData] = useState({
    employee_id: 1,
    title: "",
    description: "",
    uom_type: "numeric",
    target_value: "",
    weightage: ""
  });

  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] =
  useState(false);

const [loginData, setLoginData] =
  useState({
    email: "",
    password: ""
  });
  const [goals, setGoals] = useState([]);
  const [progressData, setProgressData] = useState({});

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleLoginChange = (e) => {

  setLoginData({
    ...loginData,
    [e.target.name]: e.target.value
  });
};

  // =========================================
  // HANDLE PROGRESS INPUT
  // =========================================

  const handleProgressChange = (
    goalId,
    field,
    value
  ) => {

    setProgressData({
      ...progressData,
      [goalId]: {
        ...progressData[goalId],
        [field]: value
      }
    });
  };

  // =========================================
  // FETCH GOALS
  // =========================================

  const fetchGoals = async () => {

    try {

      const response = await axios.get(
        "https://atomquest-backend-suur.onrender.comhttps://atomquest-backend-suur.onrender.com/get-goals/1"
      );

      setGoals(response.data);

    } catch (error) {

      console.log(error);
    }
  };

  // =========================================
  // APPROVE GOAL
  // =========================================

  const approveGoal = async (goalId) => {

    try {

      await axios.put(
        `https://atomquest-backend-suur.onrender.com/approve-goal/${goalId}`,
        {
          manager_id: 2
        }
      );

      fetchGoals();

    } catch (error) {

      console.log(error);
    }
  };

  // =========================================
  // UPDATE PROGRESS
  // =========================================

  const updateProgress = async (goalId) => {

    try {

      const data = progressData[goalId];

      await axios.post(
        "https://atomquest-backend-suur.onrender.com/update-progress",
        {
          goal_id: goalId,
          employee_id: 1,
          quarter: "Q1",
          achievement: Number(data?.achievement || 0),
          progress_status: data?.progress_status || "On Track",
          comment: data?.comment || ""
        }
      );

      alert("Progress Updated!");

    } catch (error) {

      console.log(error);
    }
  };
// login 
  const login = async () => {

  try {

    const response = await axios.post(
      "https://atomquest-backend-suur.onrender.com/login",
      loginData
    );

    if (response.data.user) {

      setIsLoggedIn(true);
    }

  } catch (error) {

    alert("Invalid credentials");
  }
};

  // =========================================
  // CREATE GOAL
  // =========================================

  const createGoal = async () => {

    try {

      const response = await axios.post(
        "https://atomquest-backend-suur.onrender.com/create-goal",
        {
          ...formData,
          target_value: Number(formData.target_value),
          weightage: Number(formData.weightage)
        }
      );

      setMessage(response.data.message);

      fetchGoals();

      setFormData({
        employee_id: 1,
        title: "",
        description: "",
        uom_type: "numeric",
        target_value: "",
        weightage: ""
      });

    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  // =========================================
  // INITIAL FETCH
  // =========================================
  const totalGoals = goals.length;

const approvedGoals = goals.filter(
  (goal) => goal.status === "approved"
).length;

const pendingGoals =
  totalGoals - approvedGoals;

const completionRate =
  totalGoals > 0
    ? Math.round(
        (approvedGoals / totalGoals) * 100
      )
    : 0;

    const chartData = [
  {
    name: "Approved",
    value: approvedGoals
  },
  {
    name: "Pending",
    value: pendingGoals
  }
];

  useEffect(() => {
    fetchGoals();
  }, []);

  if (!isLoggedIn) {

  return (

    <div style={styles.loginContainer}>

      <div style={styles.loginCard}>

        <h1 style={styles.loginTitle}>
          AtomQuest Login
        </h1>

        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleLoginChange}
        />

        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleLoginChange}
        />

        <button
          style={styles.button}
          onClick={login}
        >
          Login
        </button>

      </div>

    </div>
  );
}

  return (
    

    <div style={styles.container}>

      {/* SIDEBAR */}

      <div style={styles.sidebar}>

        <h2 style={styles.logo}>AtomQuest</h2>

        <div style={styles.menu}>

          <div style={styles.menuItem}>
            <Target size={20} />
            <span>Goals</span>
          </div>

          <div style={styles.menuItem}>
            <Users size={20} />
            <span>Employees</span>
          </div>

          <div style={styles.menuItem}>
            <CheckCircle size={20} />
            <span>Approvals</span>
          </div>

          <div style={styles.menuItem}>
            <BarChart3 size={20} />
            <span>Analytics</span>
          </div>

        </div>

      </div>

      {/* MAIN */}

      <div style={styles.main}>

        <div style={styles.topSection}>

          {/* LEFT */}

          <div style={styles.leftSection}>

            <h1 style={styles.heading}>
              Welcome back, Swarup 👋
            </h1>

            <p style={styles.subheading}>
              Create and manage employee goals efficiently.
            </p>

            {/* FORM */}

            <div style={styles.formCard}>

              <div style={styles.formHeader}>
                <Plus />
                <h2>Create Goal</h2>
              </div>

              <input
                style={styles.input}
                type="text"
                name="title"
                placeholder="Goal Title"
                value={formData.title}
                onChange={handleChange}
              />

              <textarea
                style={styles.textarea}
                name="description"
                placeholder="Goal Description"
                value={formData.description}
                onChange={handleChange}
              />

              <select
                style={styles.input}
                name="uom_type"
                value={formData.uom_type}
                onChange={handleChange}
              >
                <option value="numeric">Numeric</option>
                <option value="percentage">Percentage</option>
                <option value="timeline">Timeline</option>
                <option value="zero-based">Zero Based</option>
              </select>

              <input
                style={styles.input}
                type="number"
                name="target_value"
                placeholder="Target Value"
                value={formData.target_value}
                onChange={handleChange}
              />

              <input
                style={styles.input}
                type="number"
                name="weightage"
                placeholder="Weightage"
                value={formData.weightage}
                onChange={handleChange}
              />

              <button
                style={styles.button}
                onClick={createGoal}
              >
                Create Goal
              </button>

              {message && (
                <p style={styles.message}>
                  {message}
                </p>
              )}

            </div>

          </div>

          {/* RIGHT IMAGE */}

          <div style={styles.rightSection}>

            <img
              src={dashboardImage}
              alt="dashboard"
              style={styles.image}
            />

          </div>

        </div>
        {/* ANALYTICS */}

<div style={styles.analyticsGrid}>

  <div style={styles.analyticsCard}>
    <h3>Total Goals</h3>
    <p style={styles.analyticsNumber}>
      {totalGoals}
    </p>
  </div>
  <div style={{
  ...styles.chartCard,
  width: "100%",
  minHeight: "420px"
}}>

  <h2>Goal Analytics</h2>

  <div
  style={{
    width: "100%",
    height: "350px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}
>

    <ResponsiveContainer>

      <PieChart>

       <Pie
  data={chartData}
  dataKey="value"
  cx="50%"
  cy="50%"
  innerRadius={50}
  outerRadius={80}
  paddingAngle={5}
>

          <Cell fill="#22c55e" />
          <Cell fill="#facc15" />

        </Pie>

        <Tooltip />

      </PieChart>

    </ResponsiveContainer>

  </div>

</div>

  <div style={styles.analyticsCard}>
    <h3>Approved Goals</h3>
    <p style={styles.analyticsNumber}>
      {approvedGoals}
    </p>
  </div>

  <div style={styles.analyticsCard}>
    <h3>Pending Goals</h3>
    <p style={styles.analyticsNumber}>
      {pendingGoals}
    </p>
  </div>

  <div style={styles.analyticsCard}>
    <h3>Completion Rate</h3>
    <p style={styles.analyticsNumber}>
      {completionRate}%
    </p>
  </div>

</div>
        {/* GOALS */}

        <div style={styles.goalSection}>

          <h2>Your Goals</h2>

          <div style={styles.goalGrid}>

            {goals.map((goal) => (

              <div key={goal.id} style={styles.goalCard}>

                <h3>{goal.title}</h3>

                <p style={styles.goalDescription}>
                  {goal.description}
                </p>

                <div style={styles.goalFooter}>

                  <span>
                    {goal.weightage}% Weightage
                  </span>

                  <span
  style={{
    ...styles.statusBadge,

    background:
      goal.status === "approved"
        ? "rgba(34,197,94,0.2)"
        : "rgba(250,204,21,0.2)",

    color:
      goal.status === "approved"
        ? "#22c55e"
        : "#facc15"
  }}
>
  {goal.status}
</span>

                </div>

                {
                  goal.status !== "approved" && (

                    <button
                      style={styles.approveButton}
                      onClick={() => approveGoal(goal.id)}
                    >
                      Approve Goal
                    </button>

                  )
                }

                <div style={styles.progressBarContainer}>

  <div
    style={{
      ...styles.progressBarFill,

      width: `${
        progressData[goal.id]?.achievement || 0
      }%`,

      background:
        (progressData[goal.id]?.achievement || 0) >= 80
          ? "#22c55e"
          : "#38bdf8"
    }}
  />

</div>

<p style={styles.progressText}>
  Progress:
  {" "}
  {progressData[goal.id]?.achievement || 0}%
</p>

                {/* PROGRESS SECTION */}

                <div style={styles.progressSection}>

                  <input
                    style={styles.smallInput}
                    type="number"
                    placeholder="Achievement %"
                    onChange={(e) =>
                      handleProgressChange(
                        goal.id,
                        "achievement",
                        e.target.value
                      )
                    }
                  />

                  <select
                    style={styles.smallInput}
                    onChange={(e) =>
                      handleProgressChange(
                        goal.id,
                        "progress_status",
                        e.target.value
                      )
                    }
                  >
                    <option>On Track</option>
                    <option>Delayed</option>
                    <option>Completed</option>
                  </select>

                  <input
                    style={styles.smallInput}
                    type="text"
                    placeholder="Comment"
                    onChange={(e) =>
                      handleProgressChange(
                        goal.id,
                        "comment",
                        e.target.value
                      )
                    }
                  />

                  <button
                    style={styles.progressButton}
                    onClick={() => updateProgress(goal.id)}
                  >
                    Update Progress
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

const styles = {

  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    fontFamily: "Inter, sans-serif"
  },

  sidebar: {
    width: "250px",
    background: "#111827",
    padding: "30px 20px",
    borderRight: "1px solid rgba(255,255,255,0.08)"
  },

  logo: {
    marginBottom: "50px",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#38bdf8"
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.05)",
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: "40px"
  },

  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap"
  },

  leftSection: {
    flex: 1,
    minWidth: "400px"
  },

  rightSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center"
  },

  heading: {
    fontSize: "30px",
    fontWeight: "600",
    marginBottom: "6px"
  },

  subheading: {
    color: "#94a3b8",
    marginBottom: "24px",
    fontSize: "15px",
    lineHeight: "1.5"
  },

  formCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    maxWidth: "600px"
  },

  formHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px"
  },

  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#1e293b",
    color: "white",
    fontSize: "16px"
  },

  textarea: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#1e293b",
    color: "white",
    minHeight: "100px",
    fontSize: "16px"
  },

  button: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#38bdf8",
    color: "#0f172a",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer"
  },

  message: {
    color: "#38bdf8"
  },

  image: {
    width: "100%",
    maxWidth: "500px",
    opacity: 0.95
  },

  goalSection: {
    marginTop: "60px"
  },

  goalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },

  goalCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "20px"
  },

  goalDescription: {
    color: "#94a3b8",
    marginTop: "10px",
    lineHeight: "1.5"
  },

  goalFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    fontSize: "14px"
  },

  approveButton: {
    marginTop: "15px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  progressSection: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  smallInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#1e293b",
    color: "white"
  },

  progressButton: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  analyticsGrid: {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "50px"
},

analyticsCard: {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "18px",
  padding: "25px"
},

analyticsNumber: {
  fontSize: "36px",
  fontWeight: "bold",
  marginTop: "10px",
  color: "#38bdf8"
},
progressBarContainer: {
  width: "100%",
  height: "12px",
  background: "#1e293b",
  borderRadius: "20px",
  overflow: "hidden",
  marginTop: "20px"
},

progressBarFill: {
  height: "100%",
  borderRadius: "20px",
  transition: "0.4s ease"
},

progressText: {
  marginTop: "8px",
  fontSize: "14px",
  color: "#94a3b8"
},
chartCard: {
  marginTop: "40px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "30px",
  overflow: "hidden"
},
statusBadge: {
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "capitalize"
},
loginContainer: {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0f172a"
},

loginCard: {
  width: "400px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "20px",
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
},

loginTitle: {
  textAlign: "center",
  marginBottom: "10px",
  fontSize: "32px"
},
};

export default App;