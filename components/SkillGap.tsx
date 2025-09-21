


import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { analyzeSkillGap } from '../services/geminiService';
import Spinner from './Spinner';
// Fix: Import SkillGapData from the centralized types file.
import { SkillGapData } from '../types';

const commonJobRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full-Stack Developer',
    'Data Scientist',
    'Data Analyst',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
    'Cybersecurity Analyst',
    'Marketing Manager'
];

const SkillGap: React.FC = () => {
    const { profile } = useAppContext();
    const [desiredRole, setDesiredRole] = useState('');
    const [customDesiredRole, setCustomDesiredRole] = useState('');
    const [analysis, setAnalysis] = useState<SkillGapData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        const roleToAnalyze = desiredRole === 'Other' ? customDesiredRole : desiredRole;

        if (!profile.skills.length || !roleToAnalyze) {
            setError('Please complete your profile skills and select/enter a desired role.');
            return;
        }
        setLoading(true);
        setError('');
        setAnalysis(null);
        try {
            // Fix: The 'data' variable is now correctly typed as SkillGapData, resolving the error on the next line.
            const data = await analyzeSkillGap(profile.skills, roleToAnalyze);
            setAnalysis(data);
        } catch (err) {
            setError('Failed to analyze skill gap. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const inputClasses = "w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition";
    const finalRoleSelected = desiredRole === 'Other' ? customDesiredRole : desiredRole;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Skill Gap Analysis & Learning Plan</h1>
            <p className="text-text-secondary mb-6">Discover what skills you need for your dream job and how to get them.</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg space-y-4">
                <div>
                    <label htmlFor="desiredRole" className="block text-sm font-medium text-text-secondary mb-2">Desired Job Role</label>
                     <select
                        id="desiredRole"
                        value={desiredRole}
                        onChange={(e) => setDesiredRole(e.target.value)}
                        className={inputClasses}
                    >
                        <option value="" disabled>Select a role</option>
                        {commonJobRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                    {desiredRole === 'Other' && (
                        <input
                            type="text"
                            value={customDesiredRole}
                            onChange={(e) => setCustomDesiredRole(e.target.value)}
                            className={`${inputClasses} mt-2`}
                            placeholder="Please specify the job role"
                        />
                    )}
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !profile.skills.length || !finalRoleSelected}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? <Spinner /> : 'Analyze My Skills'}
                </button>
                 {!profile.skills.length && <p className="text-yellow-400 text-center">Please add skills to your profile first.</p>}
            </div>

            {error && <p className="text-red-500 mt-4">{error}</p>}
            
            {analysis && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                    <div className="bg-surface p-6 rounded-xl">
                        <h2 className="text-2xl font-bold mb-4">Your Skill Gap</h2>
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg text-primary mb-2">Missing Skills (Click to learn!)</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.missingSkills.map((skill, i) => (
                                    <a
                                        key={i}
                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-red-500/40 hover:text-red-200 transition-colors"
                                    >
                                        {skill}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-primary mb-2">Skills You Have</h3>
                             <div className="flex flex-wrap gap-2">
                                {profile.skills.filter(s => analysis.requiredSkills.includes(s)).map((skill, i) => (
                                    <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface p-6 rounded-xl">
                        <h2 className="text-2xl font-bold mb-4">Your Personalized Learning Plan</h2>
                        <div className="space-y-6">
                            {analysis.learningPlan.map((item, index) => (
                                <div key={item.step} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold flex-shrink-0">{item.step}</div>
                                        {index < analysis.learningPlan.length - 1 && <div className="flex-grow w-px bg-border my-2"></div>}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{item.action}</h3>
                                        <p className="text-text-secondary mt-1 text-sm">Suggested Resources:</p>
                                        <ul className="list-disc list-inside text-text-secondary pl-4 mt-1 text-sm">
                                            {item.resources.map((res, i) => <li key={i}>{res}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillGap;
