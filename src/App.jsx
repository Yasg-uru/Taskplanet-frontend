import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const App = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userResponse = await axios.get(
          "https://taskplanet-backend.vercel.app/user/users"
        );
        const user = userResponse.data.users;
        setUsers(user);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const leaderboardResponse = await axios.get(
          "https://taskplanet-backend.vercel.app/user/leaderboard"
        );
        const Leaders = leaderboardResponse.data.leaders;
        setLeaderboard(Leaders);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    const fetchData = async () => {
      await fetchUsers();
      await fetchLeaderboard();
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const socket = io("https://taskplanet-backend.vercel.app");

    socket.on("leaderboard-update", () => {
      fetchLeaderboard(); // Updating leaderboard on socket event
    });

    return () => socket.disconnect();
  }, []);

  const handleClaim = async () => {
    if (selectedUserId) {
      try {
        const response = await axios.post(
          `https://taskplanet-backend.vercel.app/user/claim`,
          {
            userId: selectedUserId,
          }
        );
        const { user, points } = response.data;
        setMessage(`${user.name} received ${points} points!`);
        fetchLeaderboard();
      } catch (error) {
        console.error("Error claiming points:", error);
      }
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const leaderboardResponse = await axios.get(
        "https://taskplanet-backend.vercel.app/user/leaderboard"
      );
      const Leaders = leaderboardResponse.data.leaders;
      setLeaderboard(Leaders);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  if (loading) {
    return <p className="text-center text-lg text-gray-500">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
          TaskPlanet Leaderboard
        </h1>
        <div className="mb-6">
          <label
            htmlFor="user-select"
            className="block text-xl font-semibold text-gray-700"
          >
            Select a User
          </label>
          <select
            id="user-select"
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full mt-2 p-2 bg-gray-100 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-400"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleClaim}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Claim Points
        </button>
        {message && (
          <p className="mt-4 text-center text-lg text-green-600">{message}</p>
        )}

        <h2 className="text-2xl font-bold mt-8 mb-4 text-indigo-600 text-center">
          Leaderboard
        </h2>
        <ul className="space-y-4">
          {leaderboard.map((user, index) => (
            <li
              key={user._id}
              className="flex justify-between bg-indigo-100 p-4 rounded-lg shadow-sm text-gray-800"
            >
              <span>
                <strong>
                  {index + 1}. {user.name}
                </strong>
              </span>
              <span className="font-semibold">{user.points} points</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
