import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SavedRoadmap } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeftIcon } from './icons';
import Toast from './Toast';

const SavedRoadmaps: React.FC = () => {
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const allSavedRoadmaps = JSON.parse(localStorage.getItem('savedRoadmaps') || '[]');
      const userRoadmaps = allSavedRoadmaps.filter((r: SavedRoadmap) => r.userId === user.id);
      setSavedRoadmaps(userRoadmaps);
    }
  }, [user]);

  const handleDelete = (id: string, careerPath: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the "${careerPath}" roadmap?`);
    
    if (!confirmed) return;

    const allSavedRoadmaps = JSON.parse(localStorage.getItem('savedRoadmaps') || '[]');
    const filtered = allSavedRoadmaps.filter((r: SavedRoadmap) => r.id !== id);
    localStorage.setItem('savedRoadmaps', JSON.stringify(filtered));
    setSavedRoadmaps(filtered.filter((r: SavedRoadmap) => r.userId === user?.id));
    
    setToastMessage(`"${careerPath}" roadmap deleted successfully 🗑️`);
    setShowToast(true);
  };

  const handleView = (savedRoadmap: SavedRoadmap) => {
    // Update last viewed
    const allSavedRoadmaps = JSON.parse(localStorage.getItem('savedRoadmaps') || '[]');
    const updated = allSavedRoadmaps.map((r: SavedRoadmap) => 
      r.id === savedRoadmap.id ? { ...r, lastViewed: new Date().toISOString() } : r
    );
    localStorage.setItem('savedRoadmaps', JSON.stringify(updated));
    
    // Navigate with roadmap data
    navigate('/', { state: { roadmap: savedRoadmap.roadmap } });
  };

  return (
    <div className="min-h-screen text-[var(--foreground)] font-sans p-4 sm:p-6 lg:p-8">
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] mb-2">
          My Saved Roadmaps
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          {savedRoadmaps.length} saved {savedRoadmaps.length === 1 ? 'roadmap' : 'roadmaps'}
        </p>

        {savedRoadmaps.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                No saved roadmaps yet
              </h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Generate a career roadmap and click "Save Roadmap" to save it for later!
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-all"
              >
                Generate Roadmap
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRoadmaps.map((saved) => (
              <div
                key={saved.id}
                className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-xl p-6 hover:shadow-xl transition-all duration-300 group"
              >
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--gradient-from)] group-hover:to-[var(--gradient-to)] transition-all">
                  {saved.roadmap.careerPath}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">
                  <strong>Phases:</strong> {saved.roadmap.phases.length}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mb-1">
                  <strong>Courses:</strong> {saved.roadmap.courses.length}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">
                  Saved: {new Date(saved.savedAt).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(saved)}
                    className="flex-1 bg-[var(--primary)] text-white py-2 px-4 rounded-lg hover:opacity-90 transition-all text-sm font-semibold"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(saved.id, saved.roadmap.careerPath)}
                    className="bg-red-500/20 text-red-600 dark:text-red-400 py-2 px-4 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedRoadmaps;

