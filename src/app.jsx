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
  // 直接写死在代码里的配置（开发测试用）
  const client_id = "129566";
  const client_secret = "24202e2054ac02c10eb6e6730bb050813338b3d1";
  const redirect_uri = "http://localhost:5173";

  const [activities, setActivities] = useState([]);

  // 处理 Strava OAuth 回调，拿 code 换 token
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    // 如果有 code 且本地没 token，调用换 token接口
    if (code && !localStorage.getItem("access_token")) {
      axios
        .post("https://www.strava.com/oauth/token", {
          client_id,
          client_secret,
          code,
          grant_type: "authorization_code",
          redirect_uri, // 记得带上这个
        })
        .then((res) => {
          localStorage.setItem("access_token", res.data.access_token);
          // 跳转去除 url 上的 code，防止重复请求
          window.history.replaceState({}, "", redirect_uri);
          window.location.reload();
        })
        .catch((err) => {
          console.error("Token exchange failed:", err);
          alert("Strava 授权失败，请检查客户端配置。");
        });
    }
  }, []);

  // 有 token 时拉取活动数据
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios
        .get("https://www.strava.com/api/v3/athlete/activities", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setActivities(res.data))
        .catch((err) => {
          console.error("拉取活动失败:", err);
          alert("拉取 Strava 活动失败，可能是 Token 失效。请重新连接。");
          localStorage.removeItem("access_token");
        });
    }
  }, []);

  // 点击登录按钮，跳转到 Strava 授权页面
  const handleConnect = () => {
    const authUrl =
      `https://www.strava.com/oauth/authorize?` +
      `client_id=${encodeURIComponent(client_id)}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&approval_prompt=force` +
      `&scope=activity:read_all`;
    window.location.href = authUrl;
  };

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
          onClick={handleConnect}
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