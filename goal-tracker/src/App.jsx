import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const today = new Date().toDateString();

  // Initialize data from localStorage
  const [data, setData] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("goalsData"));
    if (saved) {
      // Reset addictions if it's a new day
      if (saved.lastUpdate !== today) {
        const resetAddictions = saved.addictions?.map(a => ({
          ...a,
          avoided: false
        })) || [];
        const updatedData = { ...saved, addictions: resetAddictions, lastUpdate: today };
        localStorage.setItem("goalsData", JSON.stringify(updatedData));
        return updatedData;
      }
      return saved;
    }
    // If no data exists
    return { date: today, goals: [], streak: 0, addictions: [], lastUpdate: today };
  });

  // State hooks
  const [goals, setGoals] = useState(data.goals);
  const [streak, setStreak] = useState(data.streak);
  const [newGoal, setNewGoal] = useState("");

  const [addictions, setAddictions] = useState(data.addictions || []);
  const [newAddiction, setNewAddiction] = useState("");

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Update localStorage and streak when goals or addictions change
  useEffect(() => {
    const allCompleted = goals.length > 0 && goals.every((g) => g.completed);

    if (allCompleted && !data.markedComplete) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      const updatedData = { ...data, streak: newStreak, markedComplete: true, addictions, lastUpdate: today };
      setData(updatedData);
      localStorage.setItem("goalsData", JSON.stringify(updatedData));

      // Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🎉 Congrats!", {
          body: "You completed all your goals today! Keep your streak going! 🔥",
          icon: "/favicon.ico",
        });
      }
    } else {
      const updatedData = { ...data, goals, streak, markedComplete: data.markedComplete || false, addictions, lastUpdate: today };
      setData(updatedData);
      localStorage.setItem("goalsData", JSON.stringify(updatedData));
    }
  }, [goals, streak, addictions]);

  // Goal functions
  function addGoal() {
    if (!newGoal.trim()) return;
    setGoals([...goals, { id: Date.now(), text: newGoal, completed: false }]);
    setNewGoal("");
  }

  function toggleGoal(id) {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  }

  function deleteGoal(id) {
    setGoals(goals.filter((goal) => goal.id !== id));
  }

  // Addiction functions
  function addAddiction() {
    if (!newAddiction.trim()) return;
    const newItem = { id: Date.now(), name: newAddiction, avoided: false, daysAvoided: 0 };
    const updated = [...addictions, newItem];
    setAddictions(updated);
    setNewAddiction("");
  }

  function toggleAddiction(id) {
    const updated = addictions.map((item) => {
      if (item.id === id) {
        const avoidedToday = !item.avoided;
        return {
          ...item,
          avoided: avoidedToday,
          daysAvoided: avoidedToday ? item.daysAvoided + 1 : item.daysAvoided
        };
      }
      return item;
    });
    setAddictions(updated);
  }

  // Progress calculation
  const completed = goals.filter((g) => g.completed).length;
  const progress = goals.length > 0 ? (completed / goals.length) * 100 : 0;

  return (
    <div className="app">
      <h1>🎯 Daily Goals</h1>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${progress}%`,
            backgroundColor:
              progress === 100
                ? "#4caf50" // Green
                : progress >= 50
                ? "#ffc107" // Yellow
                : "#f44336", // Red
          }}
        ></div>
      </div>

      {/* Add new goal */}
      <div className="input-section">
        <input
          type="text"
          placeholder="Add a new goal..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
        />
        <button onClick={addGoal}>Add</button>
      </div>

      {/* Goals list */}
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

      <hr />

      {/* Addictions Section */}
      <h2>🚫 Track Addictions</h2>
      <ul>
        {addictions.map((item) => (
          <li key={item.id} className={item.avoided ? "avoided" : ""}>
            <span>{item.name}</span>
            <button onClick={() => toggleAddiction(item.id)}>
              {item.avoided ? "❌ Failed" : "✅ Avoided"}
            </button>
            <span>Days avoided: {item.daysAvoided}</span>
          </li>
        ))}
      </ul>

      {/* Add new addiction */}
      <div className="input-section">
        <input
          type="text"
          placeholder="Add new addiction..."
          value={newAddiction}
          onChange={(e) => setNewAddiction(e.target.value)}
        />
        <button onClick={addAddiction}>Add</button>
      </div>
    </div>
  );
}

export default App;
