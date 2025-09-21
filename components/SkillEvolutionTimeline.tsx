import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateSkillEvolutionTimeline } from '../services/geminiService';
import Spinner from './Spinner';
import { SkillEvolutionData } from '../types';

const proficiencyStyles: { [key: string]: string } = {
    'Novice': 'bg-gray-500/20 text-gray-300',
    'Intermediate': 'bg-sky-500/20 text-sky-300',
    'Advanced': 'bg-violet-500/20 text-violet-300',
    'Expert': 'bg-amber-500/20 text-amber-300',
};

const SkillEvolutionTimeline: React.FC = () => {
    const { profile } = useAppContext();
    const [timelineData, setTimelineData] = useState<SkillEvolutionData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!profile.skills.length) {
            setError('Please add skills to your profile first.');
            return;
        }
        setLoading(true);
        setError('');
        setTimelineData([]);
        try {
            const data = await generateSkillEvolutionTimeline(profile);
            setTimelineData(data);
        } catch (err) {
            setError('Failed to generate the skill timeline. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Skill Evolution Timeline</h1>
            <p className="text-text-secondary mb-6">Visualize the projected growth and importance of your key skills over the next 5 years.</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg mb-8">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !profile.skills.length}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? <Spinner /> : 'Generate My Skill Timeline'}
                </button>
                {!profile.skills.length && <p className="text-yellow-400 text-center mt-4">Please add skills to your profile to generate a timeline.</p>}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>

            {timelineData.length > 0 && (
                <div className="space-y-8 animate-fade-in">
                    {timelineData.map((skillData) => (
                        <div key={skillData.skill} className="bg-surface p-6 rounded-xl">
                            <h2 className="text-2xl font-bold text-primary mb-6">{skillData.skill}</h2>
                            <div className="relative flex justify-between items-start pt-8">
                                {/* Timeline line */}
                                <div className="absolute top-10 left-12 right-12 h-0.5 bg-border"></div>

                                {skillData.timeline.map((point, index) => (
                                    <div key={index} className="relative flex flex-col items-center w-1/3 px-2">
                                        {/* Timeline node */}
                                        <div className="absolute -top-2 w-4 h-4 bg-primary rounded-full border-4 border-surface z-10"></div>
                                        
                                        <h3 className="font-bold text-lg text-text-primary mb-2">{point.year}</h3>
                                        
                                        <div className="text-center">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${proficiencyStyles[point.projectedProficiency] || 'bg-gray-500/20 text-gray-300'}`}>
                                                {point.projectedProficiency}
                                            </span>
                                            <p className="text-sm text-text-secondary mt-3">{point.reasoning}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SkillEvolutionTimeline;
