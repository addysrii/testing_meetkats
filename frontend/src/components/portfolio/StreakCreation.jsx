import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Calendar, Clock, Target, Tag } from 'lucide-react';
import api from '../../services/api';
import portfolioService from '../../services/portfolioService';

const StreakCreationPage = () => {
  const { streakId } = useParams();
  const isEditMode = !!streakId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streakData, setStreakData] = useState({
    title: '',
    description: '',
    category: '',
    target: 'daily',
    activity: '',
    startDate: new Date().toISOString().split('T')[0],
    reminderTime: '',
    visibility: 'public'
  });
  const [customFrequency, setCustomFrequency] = useState({
    daysPerWeek: 1,
    specificDays: []
  });
const getTodayDate = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); // adjust to local
  return today.toISOString().split('T')[0];
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStreakData({ ...streakData, [name]: value });
  };

  const handleCustomFrequencyChange = (e) => {
    const { name, value } = e.target;
    setCustomFrequency({ ...customFrequency, [name]: value });
  };

  const handleDayToggle = (day) => {
    const currentDays = [...customFrequency.specificDays];
    if (currentDays.includes(day)) {
      setCustomFrequency({
        ...customFrequency,
        specificDays: currentDays.filter(d => d !== day)
      });
    } else {
      setCustomFrequency({
        ...customFrequency,
        specificDays: [...currentDays, day].sort()
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = { ...streakData };

      if (formData.target === 'custom') {
        formData.customFrequency = customFrequency;
      }

      let response;
      if (isEditMode) {
        response = await portfolioService.updateStreak(streakId, formData);
      } else {
        response = await portfolioService.createStreak(formData);
      }

      navigate(`/portfolio`);
    } catch (err) {
      console.error('Error submitting streak:', err);
      setError(err.response?.data?.error || 'Error saving streak. Please try again.');
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    const loadStreakForEdit = async () => {
      if (!isEditMode) return;

      try {
        setLoading(true);
        const data = await portfolioService.getStreak(streakId);

        setStreakData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          target: data.target || 'daily',
          activity: data.activity || '',
          startDate: data.startDate?.slice(0, 10) || new Date().toISOString().split('T')[0],
          reminderTime: data.reminderTime || '',
          visibility: data.visibility || 'public',
        });

        if (data.target === 'custom' && data.customFrequency) {
          setCustomFrequency({
            daysPerWeek: data.customFrequency.daysPerWeek || 1,
            specificDays: data.customFrequency.specificDays || []
          });
        }
      } catch (err) {
        console.error('Failed to load streak:', err);
        setError('Failed to load streak data for editing.');
      } finally {
        setLoading(false);
      }
    };

    loadStreakForEdit();
  }, [isEditMode, streakId]);


  return (
    <div className="flex-1 overflow-auto bg-gray-100 min-h-screen">
      <div className="md:pt-0 pt-16">
        <main className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-4 md:p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEditMode ? 'Edit Streak' : 'Start New Streak'}
                </h1>
                <p className="text-gray-500">
                  {isEditMode ? 'Update your habit streak' : 'Track your daily habits and build consistency'}
                </p>

              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate('/portfolio')}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Info Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Streak Information</h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Streak Title *
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={streakData.title}
                        onChange={handleChange}
                        placeholder="e.g. Daily Coding, Workout Routine"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={streakData.description}
                        onChange={handleChange}
                        placeholder="Describe your streak and what you want to achieve"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={streakData.category}
                          onChange={handleChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="">Select Category</option>
                          <option value="fitness">Fitness & Health</option>
                          <option value="learning">Learning & Education</option>
                          <option value="productivity">Productivity</option>
                          <option value="coding">Coding & Development</option>
                          <option value="reading">Reading</option>
                          <option value="writing">Writing</option>
                          <option value="meditation">Meditation & Mindfulness</option>
                          <option value="art">Art & Creativity</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-700">
                          Frequency Target *
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Target className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="target"
                            name="target"
                            required
                            value={streakData.target}
                            onChange={handleChange}
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Custom Frequency Options */}
                    {streakData.target === 'custom' && (
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Frequency Settings</h4>

                        <div className="mb-4">
                          <label htmlFor="daysPerWeek" className="block text-sm font-medium text-gray-700">
                            Days per week
                          </label>
                          <input
                            id="daysPerWeek"
                            name="daysPerWeek"
                            type="number"
                            min="1"
                            max="7"
                            value={customFrequency.daysPerWeek}
                            onChange={handleCustomFrequencyChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>

                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-2">
                            Specific days of the week
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleDayToggle(idx)}
                                className={`px-3 py-1 text-sm rounded-full ${customFrequency.specificDays.includes(idx)
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                              >
                                {day.substring(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="activity" className="block text-sm font-medium text-gray-700">
                        Activity *
                      </label>
                      <input
                        id="activity"
                        name="activity"
                        type="text"
                        required
                        value={streakData.activity}
                        onChange={handleChange}
                        placeholder="e.g. Code for 1 hour, Read 20 pages"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>

                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                          Start Date
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="startDate"
                            name="startDate"
                            type="date"
                            min={getTodayDate()}
                            value={streakData.startDate}
                            onChange={handleChange}
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700">
                          Daily Reminder Time
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="reminderTime"
                            name="reminderTime"
                            type="time"
                            value={streakData.reminderTime}
                            onChange={handleChange}
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                        Visibility
                      </label>
                      <select
                        id="visibility"
                        name="visibility"
                        value={streakData.visibility}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="public">Public (Everyone can see)</option>
                        <option value="connections">Connections Only</option>
                        <option value="private">Private (Only you)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/portfolio')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin ..."></svg>
                    {isEditMode ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Update Streak' : 'Start Streak'}
                  </>
                )}

              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default StreakCreationPage;