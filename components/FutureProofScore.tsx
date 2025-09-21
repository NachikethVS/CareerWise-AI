import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getFutureProofScore } from '../services/geminiService';
import Spinner from './Spinner';
// Fix: Import FutureProofScoreData from the centralized types file.
import { FutureProofScoreData } from '../types';

const FutureProofScore: React.FC = () => {
    const { profile } = useAppContext();
    const [analysis, setAnalysis] = useState<FutureProofScoreData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!profile.skills.length) {
            setError('Please add skills to your profile first.');
            return;
        }
        setLoading(true);
        setError('');
        setAnalysis(null);
        try {
            // Fix: The 'data' variable is now correctly typed as FutureProofScoreData, resolving the error on the next line.
            const data = await getFutureProofScore(profile);
            setAnalysis(data);
        } catch (err) {
            setError('Failed to calculate score. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const scoreColor = (score: number) => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const scoreRingColor = (score: number) => {
        if (score >= 75) return 'stroke-green-400';
        if (score >= 50) return 'stroke-yellow-400';
        return 'stroke-red-400';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Future-Proof Score</h1>
            <p className="text-text-secondary mb-6">Analyze how your current skillset aligns with future industry trends.</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg">
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !profile.skills.length}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? <Spinner /> : 'Calculate My Score'}
                </button>
                {!profile.skills.length && <p className="text-yellow-400 text-center mt-4">Please add skills to your profile to calculate your score.</p>}
            </div>

            {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

            {analysis && (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                    <div className="lg:col-span-1 bg-surface p-6 rounded-xl flex flex-col items-center justify-center">
                        <h2 className="text-xl font-bold text-text-primary mb-4">Your Score</h2>
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                    className="stroke-current text-border"
                                    strokeWidth="10"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                ></circle>
                                <circle
                                    className={`stroke-current ${scoreRingColor(analysis.score)}`}
                                    strokeWidth="10"
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${(2 * Math.PI * 40) * (1 - analysis.score / 100)}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                    transform="rotate(-90 50 50)"
                                ></circle>
                                <text
                                    className={`text-3xl font-bold ${scoreColor(analysis.score)}`}
                                    x="50"
                                    y="50"
                                    dy="0.3em"
                                    textAnchor="middle"
                                >
                                    {analysis.score}
                                </text>
                            </svg>
                        </div>
                         <p className="text-text-secondary text-center mt-4">{analysis.summary}</p>
                    </div>

                    <div className="lg:col-span-2 bg-surface p-6 rounded-xl space-y-6">
                        <div>
                           <h3 className="font-semibold text-lg text-green-400 mb-3">Future-Proof Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.futureProofSkills.map((skill, i) => (
                                    <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                           <h3 className="font-semibold text-lg text-yellow-400 mb-3">At-Risk Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.atRiskSkills.length > 0 ? analysis.atRiskSkills.map((skill, i) => (
                                    <span key={i} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                )) : <p className="text-text-secondary text-sm">None of your core skills seem to be at immediate risk. Keep learning!</p>}
                            </div>
                        </div>
                        <div>
                           <h3 className="font-semibold text-lg text-primary mb-3">Recommended Emerging Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {analysis.recommendedSkills.map((skill, i) => (
                                    <span key={i} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FutureProofScore;
