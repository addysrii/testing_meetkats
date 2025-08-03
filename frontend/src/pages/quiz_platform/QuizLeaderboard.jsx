import React, { useEffect, useState } from "react";
import { Trophy, Medal, Award, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import {useParams} from 'react-router-dom';
import { fetchQuizResults } from "../../supabase/resultApi";

// const QuizLeaderboard = () => {
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const {quizid} = useParams();
// const getResults = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await fetchQuizResults(quizid);
//         setResults(data || []);
//       } catch (err) {
//         setError("Failed to fetch leaderboard.");
//         console.log(err)
//       } finally {
//         setLoading(false);
//       }
//     };
//   useEffect(() => {
//     getResults();
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-start py-10 bg-gradient-to-br from-green-200 via-green-100 via-60% to-white">
//       <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 animate-fade-in">
//         <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
//           Quiz Leaderboard
//         </h2>
//         {loading ? (
//           <div className="text-center text-gray-500">Loading...</div>
//         ) : error ? (
//           <div className="text-center text-red-500">{error}</div>
//         ) : results.length === 0 ? (
//           <div className="text-center text-gray-500">No quiz attempts yet.</div>
//         ) : (
//           <table className="w-full text-left border">
//             <thead>
//               <tr>
//                 <th className="py-2 px-2">Rank</th>
//                 <th className="py-2 px-2">Name</th>
//                 <th className="py-2 px-2">Email</th>
//                 <th className="py-2 px-2">Correct</th>
//                 <th className="py-2 px-2">Incorrect</th>
//                 <th className="py-2 px-2">Submitted at</th>
//               </tr>
//             </thead>
//             <tbody>
//               {results.map((entry, idx) => (
//                 <tr key={entry.id || idx} className="border-t">
//                   <td className="py-2 px-2 font-semibold">{idx + 1}</td>
//                   <td className="py-2 px-2">{entry.name}</td>
//                   <td className="py-2 px-2 text-gray-500">
//                     {entry.email}
//                   </td>
//                   <td className="py-2 px-2">{entry.correct}</td>
//                   <td className="py-2 px-2">{entry.incorrect}</td>
//                   <td className="py-2 px-2">{entry.submitted_at}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default QuizLeaderboard;

const QuizLeaderboard = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {quizid} = useParams();

  const getResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuizResults(quizid);
      setResults(data || []);
    } catch (err) {
      setError("Failed to fetch leaderboard.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getResults();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-green-600 bg-green-100 rounded-full">#{rank}</span>;
    }
  };

  const getScorePercentage = (correct, incorrect) => {
    const total = correct + incorrect;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-green-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-green-600 font-medium animate-pulse">Loading leaderboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg mb-4">
            <Trophy className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Quiz Leaderboard
            </h1>
          </div>
          <p className="text-green-700/70 font-medium">See how you rank against other participants</p>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-semibold text-lg">{error}</p>
              <button 
                onClick={getResults}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-green-600 font-semibold text-lg">No quiz attempts yet</p>
              <p className="text-green-500/70 mt-2">Be the first to take the quiz!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Stats Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">{results.length} Participants</span>
                  </div>
                  <div className="text-green-100 text-sm">
                    Updated just now
                  </div>
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-green-50 border-b border-green-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-green-800">Rank</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-800">Participant</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-800">Score</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-800">Performance</th>
                      <th className="text-left py-4 px-6 font-semibold text-green-800">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((entry, idx) => {
                      const rank = idx + 1;
                      const percentage = getScorePercentage(entry.correct, entry.incorrect);
                      
                      return (
                        <tr 
                          key={entry.id || idx} 
                          className={`
                            border-b border-green-50 hover:bg-green-25 transition-all duration-200 group
                            ${rank <= 3 ? 'bg-gradient-to-r from-green-25 to-emerald-25' : ''}
                          `}
                          style={{
                            animationDelay: `${idx * 100}ms`,
                            animation: 'fadeInUp 0.5s ease-out forwards'
                          }}
                        >
                          {/* Rank */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {getRankIcon(rank)}
                            </div>
                          </td>

                          {/* Participant Info */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                {entry.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {entry.email}
                              </span>
                            </div>
                          </td>

                          {/* Score */}
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-green-700">
                                  {percentage}%
                                </span>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  percentage >= 80 ? 'bg-green-100 text-green-700' :
                                  percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Good' : 'Needs Work'}
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
                                  style={{ 
                                    width: `${percentage}%`,
                                    animationDelay: `${idx * 200 + 500}ms`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Performance Details */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-green-700">{entry.correct}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700">{entry.incorrect}</span>
                              </div>
                            </div>
                          </td>

                          {/* Submission Time */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{entry.submitted_at}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="text-center mt-6">
            <button 
              onClick={getResults}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm text-green-700 rounded-xl shadow-lg border border-green-100 hover:bg-white hover:shadow-xl transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Leaderboard
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        tr {
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default QuizLeaderboard;