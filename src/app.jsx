import { useEffect, useState } from "react";
import axios from "axios";

// 这里写入你的 Strava app 信息：
const client_id = "129566";
const client_secret = "24202e2054ac02c10eb6e6730bb050813338b3d1";
const redirect_uri = "http://localhost:5173"; // 本地测试地址

export default function App() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code && !localStorage.getItem("access_token")) {
      axios
        .post("https://www.strava.com/oauth/token", {
          client_id,
          client_secret,
          code,
          grant_type: "authorization_code",
          redirect_uri,
        })
        .then((res) => {
          localStorage.setItem("access_token", res.data.access_token);
          window.history.replaceState({}, "", redirect_uri);
          window.location.reload();
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

  const handleConnect = () => {
    const authUrl =
      `https://www.strava.com/oauth/authorize?` +
      `client_id=${client_id}&response_type=code` +
      `&redirect_uri=${redirect_uri}&approval_prompt=force&scope=activity:read_all`;
    window.location.href = authUrl;
  };

  return (
    <div>
      <h1>Fitalyze</h1>
      {!localStorage.getItem("access_token") ? (
        <button onClick={handleConnect}>Connect with Strava</button>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id}>{activity.name} - {(activity.distance / 1000).toFixed(2)} km</li>
          ))}
        </ul>
      )}
    </div>
  );
}
如果你用 .env，也可以写成：

env
Copy
Edit
VITE_CLIENT_ID=129566
VITE_CLIENT_SECRET=24202e2054ac02c10eb6e6730bb050813338b3d1
VITE_REDIRECT_URI=http://localhost:5173