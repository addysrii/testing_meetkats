import React, { useEffect, useState } from "react";
import { fetchQuizResults } from "../../supabase/quizApi";

const QuizLeaderboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchQuizResults();
        setResults(data || []);
      } catch (err) {
        setError("Failed to fetch leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    getResults();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 bg-gradient-to-br from-green-200 via-green-100 via-60% to-white">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Quiz Leaderboard
        </h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-500">No quiz attempts yet.</div>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr>
                <th className="py-2 px-2">Rank</th>
                <th className="py-2 px-2">Name</th>
                <th className="py-2 px-2">Email</th>
                <th className="py-2 px-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((entry, idx) => (
                <tr key={entry.id || idx} className="border-t">
                  <td className="py-2 px-2 font-semibold">{idx + 1}</td>
                  <td className="py-2 px-2">{entry.name}</td>
                  <td className="py-2 px-2 text-xs text-gray-500">
                    {entry.email}
                  </td>
                  <td className="py-2 px-2">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default QuizLeaderboard;
