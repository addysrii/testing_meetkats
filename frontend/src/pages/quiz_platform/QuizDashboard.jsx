import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';
import { CreateNewQuiz,DeleteQuiz,ToggleActive,getQuizDetails } from "../../supabase/quizApi";
import { useNavigate} from "react-router-dom";
const QuizDashboard = () => {
    const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const fetchData = async ()=>{
    try {
      const data = await getQuizDetails();
      setQuizzes(data);
    }catch(error) {
      alert("Error Occured");
      navigate("./dashboard");
    }
  }
  useEffect(() => {
    fetchData();
  },[])

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    Name: '',
    Start_time: '',
    End_time: '',
    Duration: '',
    Active: true
  });

  const toggleQuizActive = async (id,stat) => {
    try {
        const data=await ToggleActive(id,!stat);
    } catch (error) {
        alert("Error Occured");
    }
    setQuizzes(prev => prev.map(quiz => 
      quiz.id === id ? { ...quiz, Active: !quiz.Active } : quiz
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCreateQuiz = async () => {
    if (!newQuiz.Name || !newQuiz.Start_time || !newQuiz.End_time || !newQuiz.Duration) {
      return;
    }
    try {
        const data = await CreateNewQuiz(newQuiz.Name,newQuiz.Active,newQuiz.Start_time,newQuiz.End_time,newQuiz.Duration);
        setQuizzes(prev => [data, ...prev]);
    } catch (error) {
        alert("Error Occured");
        navigate("./dashboard");
    }
    setNewQuiz({
      Name: '',
      Start_time: '',
      End_time: '',
      Duration: '',
      Active: true
    });
    setShowCreateForm(false);
  };

  const deleteQuiz = async(id) => {
    try {
        await DeleteQuiz(id);
        setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
        alert("Quiz Deleted")
    } catch (error) {
        alert("Error Occured");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-green-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                Quiz Dashboard
              </h1>
              <p className="text-green-600/70 mt-1">Manage your quizzes with ease</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-green-200 hover:shadow-green-300 transform transition-all duration-200 hover:scale-105 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus size={20} />
              Create Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-lg shadow-green-100/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 text-sm font-medium">Total Quizzes</p>
                <p className="text-2xl font-bold text-green-800">{quizzes.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Edit3 className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-lg shadow-green-100/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 text-sm font-medium">Active Quizzes</p>
                <p className="text-2xl font-bold text-green-800">{quizzes.filter(q => q.Active).length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Eye className="text-emerald-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-lg shadow-green-100/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600/70 text-sm font-medium">Inactive Quizzes</p>
                <p className="text-2xl font-bold text-green-800">{quizzes.filter(q => !q.Active).length}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <EyeOff className="text-slate-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-lg shadow-green-100/50 hover:shadow-xl hover:shadow-green-200/50 transform transition-all duration-300 hover:scale-105 hover:bg-white/80"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Quiz Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800 group-hover:text-green-900 transition-colors duration-200 line-clamp-2 cursor-pointer" onClick={() => navigate(`/quiz/edit/${quiz.id}`)}>
                  {quiz.Name}
                </h3>
                <button
                  onClick={() => deleteQuiz(quiz.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all duration-200 p-1 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Date and Time Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-green-600/80">
                  <Calendar size={16} />
                  <div className="text-sm">
                    <p className="font-medium">Start: {formatDate(quiz.Start_time)} at {formatTime(quiz.Start_time)}</p>
                    <p className="text-green-500/70">End: {formatDate(quiz.End_time)} at {formatTime(quiz.End_time)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-green-600/80">
                  <Clock size={16} />
                  <span className="text-sm font-medium">Duration: {quiz.Duration}</span>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-green-100">
                <span className="text-sm font-medium text-green-700">
                  Status: <span className={quiz.Active ? 'text-green-600' : 'text-slate-500'}>
                    {quiz.Active ? 'Active' : 'Inactive'}
                  </span>
                </span>
                
                <button
                  onClick={() => toggleQuizActive(quiz.id,quiz.Active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    quiz.Active ? 'bg-green-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      quiz.Active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Quiz Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Create New Quiz</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Quiz Name</label>
                <input
                  type="text"
                  required
                  value={newQuiz.Name}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, Name: e.target.value }))}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter quiz name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newQuiz.Start_time}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, Start_time: e.target.value }))}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={newQuiz.End_time}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, End_time: e.target.value }))}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Duration</label>
                <input
                  type="text"
                  required
                  value={newQuiz.Duration}
                  onChange={(e) => setNewQuiz(prev => ({ ...prev, Duration: e.target.value }))}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 60 minutes"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 text-sm font-medium text-green-700">
                  <input
                    type="checkbox"
                    checked={newQuiz.Active}
                    onChange={(e) => setNewQuiz(prev => ({ ...prev, Active: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  Active
                </label>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-6 py-3 border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateQuiz}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-green-200"
                >
                  Create Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDashboard;