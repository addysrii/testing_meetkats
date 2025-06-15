import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Globe, Github, Youtube, Star, Calendar, Award, TrendingUp } from 'lucide-react';
import portfolioService from '../services/portfolioService';
import Loader from '../components/common/Loader';
import { ToastProvider } from '../components/common/Toast';
const PortfolioPage = () => {
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('projects');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // Fetch portfolio data
  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get user info
      const user = await portfolioService.getUserInfo();
      setUserInfo(user);
      
      // Then fetch all data in parallel with error handling
      const [projectsData, achievementsData, streaksData] = await Promise.all([
        portfolioService.getProjects(user.id),
        portfolioService.getAchievements(user.id),
        portfolioService.getUserStreaks(user.id, { limit: 10 }).then(data => data.items || [])
      ]);
      
      setProjects(projectsData);
      setAchievements(achievementsData);
      setStreaks(streaksData);
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError('Failed to load portfolio data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Delete handlers with loading state and error handling
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setActionLoading(true);
        await portfolioService.deleteProject(projectId);
        setProjects(projects.filter(project => project.id !== projectId));
        toast.success('Project deleted successfully');
      } catch (err) {
        console.error('Error deleting project:', err);
        toast.error('Failed to delete project. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteAchievement = async (achievementId) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        setActionLoading(true);
        await portfolioService.deleteAchievement(achievementId);
        setAchievements(achievements.filter(achievement => achievement.id !== achievementId));
        toast.success('Achievement deleted successfully');
      } catch (err) {
        console.error('Error deleting achievement:', err);
        toast.error('Failed to delete achievement. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };
  
  const handleDeleteStreak = async (streakId) => {
    if (window.confirm('Are you sure you want to delete this streak?')) {
      try {
        setActionLoading(true);
        await portfolioService.deleteStreak(streakId);
        setStreaks(streaks.filter(streak => streak.id !== streakId));
        toast.success('Streak deleted successfully');
      } catch (err) {
        console.error('Error deleting streak:', err);
        toast.error('Failed to delete streak. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Navigation handler with consistent routing
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Render loading state
  if (loading) {
    return <Loader message="Loading your portfolio..." />;
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white rounded-xl shadow-md p-6 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Portfolio</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchPortfolio}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-100">
      <div className="md:pt-0 pt-16">
        <main className="max-w-7xl mx-auto p-4 md:p-6">
          {/* Loading overlay for actions */}
          {actionLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <Loader size="small" message="Processing..." />
              </div>
            </div>
          )}
          
          {/* Dashboard Header - Calendar View Style */}
          <div className="bg-white rounded-xl shadow-md mb-6 p-4 md:p-6 border-l-4 border-orange-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Portfolio</h1>
                <p className="text-gray-500">Showcase your projects, achievements, and progress streaks</p>
              </div>
              
              <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-wrap gap-2">
                <button 
                  onClick={() => handleNavigation('/portfolio/streaks/new')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  disabled={actionLoading}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> New Streak
                </button>
                <button 
                  onClick={() => handleNavigation('/portfolio/projects/new')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={actionLoading}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> New Project
                </button>
                <button 
                  onClick={() => handleNavigation('/portfolio/achievements/new')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                  disabled={actionLoading}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> New Achievement
                </button>
              </div>
            </div>
          </div>

          {/* Content Tabs Navigation */}
          <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden border-b">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveSection('projects')}
                className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                  activeSection === 'projects'
                    ? 'text-blue-600 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
                disabled={actionLoading}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveSection('achievements')}
                className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                  activeSection === 'achievements'
                    ? 'text-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-500 hover:text-purple-500'
                }`}
                disabled={actionLoading}
              >
                Achievements
              </button>
              <button
                onClick={() => setActiveSection('streaks')}
                className={`flex-1 text-center py-4 px-4 font-medium text-sm focus:outline-none transition-colors duration-200 ${
                  activeSection === 'streaks'
                    ? 'text-green-600 border-b-2 border-green-500'
                    : 'text-gray-500 hover:text-green-500'
                }`}
                disabled={actionLoading}
              >
                Streaks
              </button>
            </div>
          </div>

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="mb-8">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        {project.images && project.images[0] ? (
                          <img 
                            src={project.images[0]} 
                            alt={project.title} 
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigation(`/portfolio/projects/edit/${project.id}`);
                            }}
                            className="p-2 bg-white rounded-full text-gray-600 hover:text-blue-600 shadow-sm"
                            disabled={actionLoading}
                            aria-label="Edit project"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                            className="p-2 bg-white rounded-full text-gray-600 hover:text-red-600 shadow-sm"
                            disabled={actionLoading}
                            aria-label="Delete project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800">{project.title}</h3>
                            <p className="text-sm text-gray-500">{project.category}</p>
                          </div>
                          {project.status && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              project.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : project.status === 'in-progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-700 mt-2 line-clamp-3">{project.description}</p>
                        
                        {/* Project links */}
                        {project.links && project.links.length > 0 && (
                          <div className="mt-3 flex space-x-2">
                            {project.links.map((link, index) => {
                              let Icon;
                              if (link.url.includes('github.com')) Icon = Github;
                              else if (link.url.includes('youtube.com')) Icon = Youtube;
                              else Icon = Globe;
                              
                              return (
                                <a 
                                  key={index}
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-gray-600 hover:text-blue-600"
                                  aria-label={`Visit ${link.title || 'project link'}`}
                                >
                                  <Icon className="h-5 w-5" />
                                </a>
                              );
                            })}
                          </div>
                        )}
                        
                        <button 
                          onClick={() => handleNavigation(`/portfolio/projects/${project.id}`)}
                          className="mt-3 text-blue-600 hover:underline text-sm"
                          disabled={actionLoading}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-blue-100 items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h3>
                  <p className="text-gray-600 mb-6">Showcase your work by adding projects to your portfolio.</p>
                  <button 
                    onClick={() => handleNavigation('/portfolio/projects/new')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={actionLoading}
                  >
                    Add Your First Project
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Achievements Section */}
          {activeSection === 'achievements' && (
            <div className="mb-8">
              {achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex items-start">
                          {achievement.image ? (
                            <img src={achievement.image} alt="" className="h-16 w-16 object-contain rounded-lg" />
                          ) : (
                            <div className="h-16 w-16 bg-purple-100 text-purple-800 flex items-center justify-center rounded-lg">
                              <Award className="h-8 w-8" />
                            </div>
                          )}
                          
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <h3 className="text-lg font-medium text-gray-800">{achievement.title}</h3>
                              
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => handleNavigation(`/portfolio/achievements/edit/${achievement.id}`)}
                                  className="text-gray-500 hover:text-purple-600"
                                  disabled={actionLoading}
                                  aria-label="Edit achievement"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAchievement(achievement.id)}
                                  className="text-gray-500 hover:text-red-600"
                                  disabled={actionLoading}
                                  aria-label="Delete achievement"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                              {achievement.issuer}
                              {achievement.dateAchieved && 
                                ` • ${new Date(achievement.dateAchieved).toLocaleDateString()}`}
                            </p>
                            
                            {achievement.expirationDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                Expires: {new Date(achievement.expirationDate).toLocaleDateString()}
                              </p>
                            )}
                            
                            {achievement.verificationUrl && (
                              <a 
                                href={achievement.verificationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 text-purple-600 hover:underline text-sm inline-block"
                              >
                                Verify Credential
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-purple-100 items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Achievements Yet</h3>
                  <p className="text-gray-600 mb-6">Highlight your accomplishments and certifications.</p>
                  <button 
                    onClick={() => handleNavigation('/portfolio/achievements/new')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    disabled={actionLoading}
                  >
                    Add Your First Achievement
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Streaks Section */}
          {activeSection === 'streaks' && (
            <div>
              {streaks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streaks.map((streak) => (
                    <div key={streak.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="p-4">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            <div className="flex h-14 w-14 mr-4 rounded-lg bg-green-100 items-center justify-center">
                              <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-800">{streak.title}</h3>
                              <p className="text-sm text-gray-500">{streak.activity}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleNavigation(`/portfolio/streaks/edit/${streak.id}`)}
                              className="text-gray-500 hover:text-green-600"
                              disabled={actionLoading}
                              aria-label="Edit streak"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStreak(streak.id)}
                              className="text-gray-500 hover:text-red-600"
                              disabled={actionLoading}
                              aria-label="Delete streak"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="p-2 rounded-md bg-green-100 text-green-800">
                              <Calendar className="h-4 w-4" />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              Started: {new Date(streak.startDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {streak.currentStreak} day streak
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            {streak.longestStreak > 0 ? (
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{width: `${(streak.currentStreak / streak.longestStreak) * 100}%`}}
                              ></div>
                            ) : (
                              <div className="bg-green-500 h-2 rounded-full w-0"></div>
                            )}
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-gray-500">
                            <span>Goal: {streak.target}</span>
                            <span>Longest: {streak.longestStreak} days</span>
                          </div>
                        </div>
                        
                        <Link
                          to={`/portfolio/streaks/${streak.id}`}
                          className="mt-4 block w-full py-2 px-4 bg-green-600 text-white text-center rounded-lg hover:bg-green-700"
                        >
                          Check In
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-green-100 items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Streaks Yet</h3>
                  <p className="text-gray-600 mb-6">Track your daily habits and consistency with streaks.</p>
                  <button 
                    onClick={() => handleNavigation('/portfolio/streaks/new')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    disabled={actionLoading}
                  >
                    Start Your First Streak
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <footer className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-4 mt-8 rounded-lg">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm">Share your portfolio with your network to showcase your professional growth.</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PortfolioPage;