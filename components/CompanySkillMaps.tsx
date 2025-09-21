import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateCompanySkillMap, SkillMapResult } from '../services/geminiService';
import Spinner from './Spinner';
import { SkillMapAnalysis } from '../types';

const commonCompanies = [
    'Google',
    'Microsoft',
    'Apple',
    'Amazon',
    'Meta',
    'Netflix',
    'Salesforce',
    'Nvidia',
    'Adobe',
];

const CompanySkillMaps: React.FC = () => {
    const { profile } = useAppContext();
    const [companyName, setCompanyName] = useState('');
    const [customCompanyName, setCustomCompanyName] = useState('');
    const [result, setResult] = useState<SkillMapResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        const finalCompanyName = companyName === 'Other' ? customCompanyName : companyName;

        if (!finalCompanyName) {
            setError('Please select or enter a company name.');
            return;
        }
        if (!profile.skills || profile.skills.length === 0) {
            setError('Please add skills to your profile first.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const data = await generateCompanySkillMap(profile, finalCompanyName);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Failed to generate skill map. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition";
    const finalCompanyName = companyName === 'Other' ? customCompanyName : companyName;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Company Skill Maps</h1>
            <p className="text-text-secondary mb-6">Analyze the skills needed for your dream company and see how you match up.</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg space-y-4 mb-8">
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-text-secondary mb-2">Target Company Name</label>
                    <select
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={inputClasses}
                    >
                        <option value="" disabled>Select a company</option>
                        {commonCompanies.map(company => (
                            <option key={company} value={company}>{company}</option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                    {companyName === 'Other' && (
                        <input
                            type="text"
                            value={customCompanyName}
                            onChange={(e) => setCustomCompanyName(e.target.value)}
                            className={`${inputClasses} mt-2`}
                            placeholder="Please specify the company name"
                        />
                    )}
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={loading || !profile.skills.length || !finalCompanyName}
                    className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? <Spinner /> : `Analyze ${finalCompanyName || 'Company'}`}
                </button>
                {(!profile.skills || profile.skills.length === 0) && (
                    <p className="text-yellow-400 text-center">Please add skills to your user profile to generate a skill map.</p>
                )}
                 {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </div>

            {result && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-surface p-6 rounded-xl">
                        <h2 className="text-2xl font-bold mb-4">Analysis for <span className="text-primary">{result.analysis.companyName}</span></h2>
                        <p className="text-text-secondary">{result.analysis.analysisSummary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-surface p-6 rounded-xl">
                            <h3 className="font-semibold text-lg text-green-400 mb-3">Your Matched Skills</h3>
                            {result.analysis.matchedSkills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.matchedSkills.map((skill, i) => (
                                        <span key={i} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-secondary">No direct skill matches found. Let's look at the gaps!</p>
                            )}
                        </div>
                        <div className="bg-surface p-6 rounded-xl">
                            <h3 className="font-semibold text-lg text-yellow-400 mb-3">Missing Skills to Develop</h3>
                             {result.analysis.missingSkills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {result.analysis.missingSkills.map((skill, i) => (
                                        <span key={i} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">{skill}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-secondary">Great job! No major skill gaps were identified.</p>
                            )}
                        </div>
                    </div>

                     <div className="bg-surface p-6 rounded-xl">
                        <h3 className="font-semibold text-lg text-primary mb-3">All In-Demand Skills at {result.analysis.companyName}</h3>
                        <div className="flex flex-wrap gap-2">
                            {result.analysis.requiredSkills.map((skill, i) => (
                                <span key={i} className="bg-border text-text-secondary px-3 py-1 rounded-full text-sm">{skill}</span>
                            ))}
                        </div>
                    </div>
                     {result.sources && result.sources.length > 0 && (
                        <div className="bg-surface p-6 rounded-xl">
                            <h3 className="font-semibold text-lg text-text-primary mb-3">Sources from Google Search</h3>
                            <ul className="space-y-2">
                                {result.sources.map((source, i) => (
                                    source.web && (
                                        <li key={i} className="flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm truncate">
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    )
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CompanySkillMaps;