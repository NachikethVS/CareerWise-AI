

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateCareerQuests } from '../services/geminiService';
import Spinner from './Spinner';
// Fix: Import Quest and QuestDifficulty from the centralized types file.
import { Quest, QuestDifficulty } from '../types';

const categoryStyles: { [key: string]: { border: string, tag: string } } = {
    'Skill Development': { border: 'border-sky-500', tag: 'bg-sky-500/20 text-sky-300' },
    'Portfolio Building': { border: 'border-emerald-500', tag: 'bg-emerald-500/20 text-emerald-300' },
    'Networking': { border: 'border-amber-500', tag: 'bg-amber-500/20 text-amber-300' },
    'Job Readiness': { border: 'border-violet-500', tag: 'bg-violet-500/20 text-violet-300' },
};
const defaultStyle = { border: 'border-border', tag: 'bg-primary/20 text-primary' };
const getCategoryStyle = (category: string) => categoryStyles[category] || defaultStyle;

const difficultyStyles: { [key: string]: string } = {
    'Beginner': 'bg-green-500/20 text-green-300',
    'Intermediate': 'bg-yellow-500/20 text-yellow-300',
    'Advanced': 'bg-red-500/20 text-red-300',
};

type DifficultyFilter = 'All' | QuestDifficulty;
const difficulties: DifficultyFilter[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CareerQuest: React.FC = () => {
    const { profile } = useAppContext();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [completedQuests, setCompletedQuests] = useState<string[]>([]);
    const [xp, setXp] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');

    useEffect(() => {
        try {
            const savedXp = localStorage.getItem('careerQuestXp');
            const savedCompleted = localStorage.getItem('careerQuestCompleted');
            if (savedXp) setXp(JSON.parse(savedXp));
            if (savedCompleted) setCompletedQuests(JSON.parse(savedCompleted));
        } catch (err) {
            console.error("Failed to load quest data from localStorage", err);
        }
    }, []);

    const handleGenerateQuests = async () => {
        if (!profile.name) {
            setError('Please complete your profile to generate quests.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Fix: The 'newQuests' variable is now correctly typed as Quest[], resolving the error on the next line.
            const newQuests = await generateCareerQuests(profile);
            setQuests(newQuests);
        } catch (err) {
            setError('Failed to generate new quests. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteQuest = (questId: string, xpValue: number) => {
        const newCompletedQuests = [...completedQuests, questId];
        const newXp = xp + xpValue;

        setCompletedQuests(newCompletedQuests);
        setXp(newXp);

        try {
            localStorage.setItem('careerQuestCompleted', JSON.stringify(newCompletedQuests));
            localStorage.setItem('careerQuestXp', JSON.stringify(newXp));
        } catch (err) {
            console.error("Failed to save quest data to localStorage", err);
        }
    };

    const activeQuests = quests
        .filter(q => !completedQuests.includes(q.id))
        .filter(q => difficultyFilter === 'All' || q.difficulty === difficultyFilter);
        
    const questsDone = quests.filter(q => completedQuests.includes(q.id));

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Career Quest Mode</h1>
            <p className="text-text-secondary mb-6">Gamify your career journey, complete quests, and earn XP!</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg mb-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-primary">Your Progress</h2>
                        <p className="text-3xl font-bold">{xp} <span className="text-lg text-text-secondary">XP</span></p>
                    </div>
                    <button
                        onClick={handleGenerateQuests}
                        disabled={loading || !profile.name}
                        className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 flex items-center justify-center"
                    >
                        {loading ? <Spinner /> : 'Generate New Quests'}
                    </button>
                </div>
                 {!profile.name && <p className="text-yellow-400 text-center mt-4">Please complete your user profile to generate personalized quests.</p>}
                 {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <h3 className="text-2xl font-bold">Active Quests</h3>
                         <div className="flex items-center bg-background rounded-full p-1 text-sm self-start">
                            {difficulties.map(level => (
                                <button
                                    key={level}
                                    onClick={() => setDifficultyFilter(level)}
                                    className={`px-3 py-1 rounded-full transition-colors text-xs sm:text-sm ${difficultyFilter === level ? 'bg-primary text-white' : 'text-text-secondary hover:bg-border'}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {activeQuests.length > 0 ? activeQuests.map(quest => (
                            <div key={quest.id} className={`bg-surface p-5 rounded-lg transition-shadow hover:shadow-xl border-l-4 ${getCategoryStyle(quest.category).border}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center flex-wrap gap-2">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryStyle(quest.category).tag}`}>{quest.category}</span>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyStyles[quest.difficulty]}`}>{quest.difficulty}</span>
                                        </div>
                                        <h4 className="font-bold text-lg mt-2">{quest.title}</h4>
                                        <p className="text-sm text-text-secondary mt-1">{quest.description}</p>
                                    </div>
                                    <div className="text-right ml-4 flex-shrink-0">
                                        <p className="font-bold text-green-400 text-lg">{quest.xp} XP</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleCompleteQuest(quest.id, quest.xp)}
                                    className="w-full mt-4 bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-500 transition text-sm"
                                >
                                    Mark as Complete
                                </button>
                            </div>
                        )) : (
                            <p className="text-text-secondary">No active quests match your filter. Generate some quests or change the difficulty filter!</p>
                        )}
                    </div>
                </div>
                 <div>
                    <h3 className="text-2xl font-bold mb-4">Completed Quests</h3>
                    <div className="space-y-3">
                        {questsDone.length > 0 ? questsDone.map(quest => (
                             <div key={quest.id} className="bg-surface/50 p-4 rounded-lg opacity-60">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold text-text-secondary line-through">{quest.title}</h4>
                                        <p className="text-xs text-text-secondary">{quest.category}</p>
                                    </div>
                                    <p className="font-bold text-green-400/50">+{quest.xp} XP</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-text-secondary">You haven't completed any quests yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerQuest;
