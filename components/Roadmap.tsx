

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateCareerRoadmap } from '../services/geminiService';
import Spinner from './Spinner';
// Fix: Import RoadmapData from the centralized types file.
import { RoadmapData } from '../types';

const Roadmap: React.FC = () => {
    const { profile } = useAppContext();
    const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!profile.name) {
            setError('Please complete your profile first.');
            return;
        }
        setLoading(true);
        setError('');
        setRoadmap(null);
        try {
            // Fix: The 'data' variable is now correctly typed as RoadmapData, resolving the error on the next line.
            const data = await generateCareerRoadmap(profile);
            setRoadmap(data);
        } catch (err) {
            setError('Failed to generate roadmap. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">AI Career Roadmap</h1>
            <p className="text-text-secondary mb-6">Generate a personalized, long-term career plan based on your profile.</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !profile.name}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? <Spinner /> : 'Generate My Roadmap'}
                </button>
                {!profile.name && <p className="text-yellow-400 text-center mt-4">Please complete your user profile to generate a roadmap.</p>}
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
            
            {roadmap && (
                <div className="mt-8 space-y-8 animate-fade-in">
                    <div className="bg-surface p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-primary mb-4">Recommended Roles</h2>
                        <div className="flex flex-wrap gap-2">
                            {roadmap.recommendedRoles.map((role, i) => (
                                <span key={i} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">{role}</span>
                            ))}
                        </div>
                    </div>
                    <div className="bg-surface p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-primary mb-3">Industry Trends Analysis</h2>
                        <p className="text-text-secondary whitespace-pre-wrap">{roadmap.industryTrends}</p>
                    </div>
                     <div className="bg-surface p-6 rounded-xl">
                        <h2 className="text-2xl font-bold text-primary mb-6">Suggested Timeline & Milestones</h2>
                        <div className="relative border-l-2 border-border pl-8">
                            {roadmap.timeline.map((item, i) => (
                                <div key={i} className="mb-8 last:mb-0">
                                    <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] mt-1 border-4 border-surface"></div>
                                    <p className="text-sm text-text-secondary">{item.timeframe}</p>
                                    <h3 className="font-bold text-lg text-text-primary mt-1">{item.milestone}</h3>
                                    <p className="text-text-secondary mt-1">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roadmap;
