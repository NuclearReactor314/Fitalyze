import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./index.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function App() {
  const [activities, setActivities] = useState([]);
  const client_id = import.meta.env.VITE_CLIENT_ID;
  const client_secret = import.meta.env.VITE_CLIENT_SECRET;
  const redirect_uri = window.location.origin;

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code && !localStorage.getItem("access_token")) {
      axios
        .post("https://www.strava.com/oauth/token", {
          client_id,
          client_secret,
          code,
          grant_type: "authorization_code",
        })
        .then((res) => {
          localStorage.setItem("access_token", res.data.access_token);
          window.location.href = redirect_uri;
        });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios
        .get("https://www.strava.com/api/v3/athlete/activities", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setActivities(res.data));
    }
  }, []);

  const chartData = {
    labels: activities.map((a) => new Date(a.start_date).toLocaleDateString()),
    datasets: [
      {
        label: "Distance (km)",
        data: activities.map((a) => (a.distance / 1000).toFixed(2)),
        borderColor: "#3b82f6",
        backgroundColor: "#93c5fd",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Fitalyze: Strava Activity Visualizer</h1>
      {!localStorage.getItem("access_token") ? (
        <button
          onClick={() => {
            window.location.href = `https://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&approval_prompt=force&scope=activity:read_all`;
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Connect with Strava
        </button>
      ) : (
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Recent Activities</h2>
          {activities.length === 0 ? (
            <p>Loading...</p>
          ) : (
            <Line data={chartData} />
          )}
        </div>
      )}
    </main>
  );
}
