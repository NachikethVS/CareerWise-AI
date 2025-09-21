import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getNetworkingRecommendations } from '../services/geminiService';
import Spinner from './Spinner';
import { NetworkingData } from '../types';
import { ProfileIcon, NetworkIcon, EventIcon } from './icons';

const Networking: React.FC = () => {
    const { profile } = useAppContext();
    const [recommendations, setRecommendations] = useState<NetworkingData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!profile.name) {
            setError('Please complete your profile first.');
            return;
        }
        setLoading(true);
        setError('');
        setRecommendations(null);
        try {
            const data = await getNetworkingRecommendations(profile);
            setRecommendations(data);
        } catch (err) {
            setError('Failed to get recommendations. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!recommendations) return;
        navigator.clipboard.writeText(recommendations.connectionTemplate.replace("[Your Name]", profile.name));
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Networking Recommendations</h1>
            <p className="text-text-secondary mb-6">Discover people, communities, and events to grow your professional network.</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg mb-8">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !profile.name}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 flex items-center justify-center"
                >
                    {loading ? <Spinner /> : 'Get Recommendations'}
                </button>
                {!profile.name && <p className="text-yellow-400 text-center mt-4">Please complete your user profile for personalized recommendations.</p>}
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
            </div>

            {recommendations && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                    <div className="space-y-6">
                        <div className="bg-surface p-6 rounded-xl">
                            <h2 className="text-xl font-bold mb-3 text-primary flex items-center gap-3">
                                <ProfileIcon className="w-6 h-6" />
                                Influencers to Follow
                            </h2>
                            <ul className="space-y-2">
                                {recommendations.influencers.map((p, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                                        <span className="text-text-secondary">{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-surface p-6 rounded-xl">
                            <h2 className="text-xl font-bold mb-3 text-primary flex items-center gap-3">
                                <NetworkIcon className="w-6 h-6" />
                                Communities to Join
                            </h2>
                            <ul className="space-y-2">
                                {recommendations.communities.map((c, i) => (
                                     <li key={i} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                                        <span className="text-text-secondary">{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-surface p-6 rounded-xl">
                            <h2 className="text-xl font-bold mb-3 text-primary flex items-center gap-3">
                                <EventIcon className="w-6 h-6" />
                                Events to Attend
                            </h2>
                            <ul className="space-y-2">
                                {recommendations.events.map((e, i) => (
                                     <li key={i} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                                        <span className="text-text-secondary">{e}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="bg-surface p-6 rounded-xl">
                        <h2 className="text-xl font-bold mb-3 text-primary">Connection Request Template</h2>
                        <textarea
                            readOnly
                            value={recommendations.connectionTemplate.replace("[Your Name]", profile.name)}
                            className="w-full h-64 p-3 bg-background border border-border rounded-lg"
                        />
                         <button 
                            onClick={handleCopy}
                            className="mt-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-500 transition w-full">
                            {isCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Networking;