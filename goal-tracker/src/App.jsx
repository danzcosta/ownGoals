import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const todayString = new Date().toDateString();

  // Load data from localStorage or create default
  const [data, setData] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("goalsData"));
    if (saved) return saved;
    return {
      date: todayString,
      goals: [],
      streak: 0,
      longestStreak: 0,
      addictions: [],
    };
  });

  const [goals, setGoals] = useState(data.goals || []);
  const [addictions, setAddictions] = useState(data.addictions || []);
  const [streak, setStreak] = useState(data.streak || 0);
  const [longestStreak, setLongestStreak] = useState(data.longestStreak || 0);
  const [newGoal, setNewGoal] = useState("");
  const [newAddiction, setNewAddiction] = useState("");
  const [today, setToday] = useState(data.date || todayString);

  // Reset data when new day starts
  useEffect(() => {
    if (today !== todayString) {
      const updatedAddictions = addictions.map((a) => {
        if (!a.failedToday) {
          return {
            ...a,
            daysAvoided: a.daysAvoided + 1,
            failedToday: false,
          };
        }
        return { ...a, failedToday: false };
      });

      const newData = {
        ...data,
        date: todayString,
        goals: [],
        addictions: updatedAddictions,
      };

      setGoals([]);
      setAddictions(updatedAddictions);
      setToday(todayString);
      saveData(newData);
    }
  }, [today, todayString]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveData({
      date: today,
      goals,
      streak,
      longestStreak,
      addictions,
    });
  }, [goals, streak, longestStreak, addictions, today]);

  function saveData(updated) {
    localStorage.setItem("goalsData", JSON.stringify(updated));
  }

  // Add Goal
  function addGoal() {
    if (!newGoal.trim()) return;
    const newList = [...goals, { id: Date.now(), text: newGoal, completed: false }];
    setGoals(newList);
    setNewGoal("");
  }

  // Toggle Goal Complete
  function toggleGoal(id) {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  }

  // Delete Goal
  function deleteGoal(id) {
    setGoals(goals.filter((goal) => goal.id !== id));
  }

  // Add Addiction
  function addAddiction() {
    if (!newAddiction.trim()) return;
    const newItem = {
      id: Date.now(),
      name: newAddiction,
      daysAvoided: 0,
      failedToday: false,
    };
    setAddictions([...addictions, newItem]);
    setNewAddiction("");
  }

  // Mark Addiction as Failed
  function failAddiction(id) {
    const updated = addictions.map((a) => {
      if (a.id === id && !a.failedToday) {
        return { ...a, daysAvoided: 0, failedToday: true };
      }
      return a;
    });
    setAddictions(updated);
  }

  // Test: simulate next day
  function nextDay() {
    const nextDate = new Date(today);
    nextDate.setDate(nextDate.getDate() + 1);
    const newDay = nextDate.toDateString();
    setToday(newDay);
  }

  // Progress bar
  const completed = goals.filter((g) => g.completed).length;
  const progress = goals.length > 0 ? (completed / goals.length) * 100 : 0;

  return (
    <div className="app">
      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h1>🎯 Daily Goals</h1>
        <p>
          📅 {today} <br />
          🔥 <strong>Streak:</strong> {streak} days
          <br />
          🏆 <strong>Longest streak:</strong> {longestStreak} days
        </p>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${progress}%`,
            backgroundColor:
              progress === 100
                ? "#4caf50"
                : progress >= 50
                ? "#ffc107"
                : "#f44336",
          }}
        ></div>
      </div>

      {/* Add New Goal */}
      <div className="input-section">
        <input
          type="text"
          placeholder="Add a new goal..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
        />
        <button onClick={addGoal}>Add</button>
      </div>

      {/* Goals List */}
      <ul>
        {goals.map((goal) => (
          <li key={goal.id} className={goal.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={goal.completed}
              onChange={() => toggleGoal(goal.id)}
            />
            <span>{goal.text}</span>
            <button onClick={() => deleteGoal(goal.id)}>❌</button>
          </li>
        ))}
      </ul>

      <hr style={{ margin: "30px 0", borderColor: "#555" }} />

      {/* ADDICTIONS SECTION */}
      <h2>🚫 Track Addictions</h2>
      <ul>
        {addictions.map((a) => (
          <li key={a.id}>
            <span>{a.name}</span>
            <button
              onClick={() => failAddiction(a.id)}
              disabled={a.failedToday}
              style={{
                background: a.failedToday ? "#666" : "#f44336",
              }}
            >
              {a.failedToday ? "❌ Failed Today" : "Fail"}
            </button>
            <span>Days avoided: {a.daysAvoided}</span>
          </li>
        ))}
      </ul>

      {/* Add New Addiction */}
      <div className="input-section">
        <input
          type="text"
          placeholder="Add new addiction..."
          value={newAddiction}
          onChange={(e) => setNewAddiction(e.target.value)}
        />
        <button onClick={addAddiction}>Add</button>
      </div>

      {/* Test Button */}
      <button onClick={nextDay}>⏭️ Next Day (Test)</button>
    </div>
  );
}

export default App;
