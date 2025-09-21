

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateProjectIdeas } from '../services/geminiService';
import Spinner from './Spinner';
import { ProjectIcon } from './icons';
// Fix: Import ProjectIdea from the centralized types file.
import { ProjectIdea } from '../types';

const ProjectIdeas: React.FC = () => {
    const { profile } = useAppContext();
    const [projects, setProjects] = useState<ProjectIdea[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!profile.name) {
            setError('Please complete your profile first.');
            return;
        }
        setLoading(true);
        setError('');
        setProjects([]);
        try {
            // Fix: The 'data' variable is now correctly typed as ProjectIdea[], resolving the error on the next line.
            const data = await generateProjectIdeas(profile);
            setProjects(data);
        } catch (err) {
            setError('Failed to generate project ideas. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Project Portfolio Suggestions</h1>
            <p className="text-text-secondary mb-6">Get AI-generated project ideas to showcase your skills and impress recruiters.</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg mb-8">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !profile.name}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 flex items-center justify-center"
                >
                    {loading ? <Spinner /> : 'Generate Project Ideas'}
                </button>
                {!profile.name && <p className="text-yellow-400 text-center mt-4">Please complete your user profile to get tailored project ideas.</p>}
                 {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>

            {projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {projects.map((project, index) => (
                        <div key={index} className="bg-surface p-6 rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-bold text-primary flex-1 pr-2">{project.title}</h2>
                                <ProjectIcon className="w-6 h-6 text-primary/50 flex-shrink-0" />
                            </div>
                            <p className="text-text-secondary flex-grow mb-4">{project.description}</p>
                            <div>
                                <h3 className="font-semibold mb-2 text-text-primary">Skills Showcased:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.skillsShowcased.map((skill, i) => (
                                        <span key={i} className="bg-background text-primary px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectIdeas;
