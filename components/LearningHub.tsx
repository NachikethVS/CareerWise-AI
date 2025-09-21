
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getLearningResources, LearningHubResult } from '../services/geminiService';
import Spinner from './Spinner';
import { LearningResource } from '../types';
import { ArrowUpRightIcon, ChevronDownIcon, ArticleIcon, VideoIcon, CourseIcon } from './icons';

const ResourceCard: React.FC<{ resource: LearningResource, icon: React.ReactNode }> = ({ resource, icon }) => (
    <a href={resource.link} target="_blank" rel="noopener noreferrer" className="group block bg-background p-5 rounded-lg border border-border hover:border-primary hover:-translate-y-0.5 transform transition-all duration-300 relative">
        <div className="flex items-start gap-4">
            <div className="text-primary mt-1 flex-shrink-0">{icon}</div>
            <div className="flex-1">
                <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">{resource.title}</h4>
                <p className="text-sm text-text-secondary mt-1">{resource.summary}</p>
            </div>
            <ArrowUpRightIcon className="w-4 h-4 text-text-secondary transition-all opacity-0 group-hover:opacity-100 group-hover:text-primary absolute top-4 right-4" />
        </div>
    </a>
);

type ResourceTab = 'articles' | 'videos' | 'courses';

const LearningHub: React.FC = () => {
    const { profile } = useAppContext();
    const [skill, setSkill] = useState('');
    const [result, setResult] = useState<LearningHubResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<ResourceTab>('articles');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (result) {
            if (result.resources.articles?.length > 0) {
                setActiveTab('articles');
            } else if (result.resources.videos?.length > 0) {
                setActiveTab('videos');
            } else if (result.resources.courses?.length > 0) {
                setActiveTab('courses');
            }
        }
    }, [result]);

    const staticSuggestions = [
        'React', 'JavaScript', 'Python', 'SQL', 'Data Analysis', 'Project Management',
        'UI/UX Design', 'Node.js', 'AWS', 'Public Speaking', 'Leadership', 'Digital Marketing'
    ];

    const suggestedSkills = Array.from(new Set([
        ...profile.skills,
        ...profile.interests,
        ...staticSuggestions
    ])).filter(Boolean);

    const filteredSuggestions = skill
        ? suggestedSkills.filter(s => 
            s.toLowerCase().includes(skill.toLowerCase()) && s.toLowerCase() !== skill.toLowerCase()
          )
        : suggestedSkills;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSkill(e.target.value);
        if (!isDropdownOpen) {
            setIsDropdownOpen(true);
        }
    };

    const handleFindResources = async (skillToSearch?: string) => {
        const searchSkill = skillToSearch || skill;
        if (!searchSkill) {
            setError('Please enter a skill to search for.');
            return;
        }
        if (!profile.name) {
            setError('Please complete your profile first for personalized results.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await getLearningResources(profile, searchSkill);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Failed to find learning resources. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAndSearch = (selectedSkill: string) => {
        setSkill(selectedSkill);
        setIsDropdownOpen(false);
        handleFindResources(selectedSkill);
    };

    const iconClass = "w-6 h-6";

    const renderResources = () => {
        if (!result) return null;

        const tabs: { id: ResourceTab, label: string, data: LearningResource[] | undefined, icon: React.ReactNode }[] = [
            { id: 'articles', label: 'Articles', data: result.resources.articles, icon: <ArticleIcon className={iconClass} /> },
            { id: 'videos', label: 'Videos', data: result.resources.videos, icon: <VideoIcon className={iconClass} /> },
            { id: 'courses', label: 'Courses', data: result.resources.courses, icon: <CourseIcon className={iconClass} /> },
        ];
        
        const activeTabInfo = tabs.find(tab => tab.id === activeTab);
        const activeTabData = activeTabInfo?.data || [];
        const activeTabIcon = activeTabInfo?.icon;
        
        const noResults = !tabs.some(tab => tab.data && tab.data.length > 0);

        if (noResults) {
            return (
                <div className="bg-surface p-8 rounded-xl text-center">
                    <h3 className="text-xl font-bold">No Resources Found</h3>
                    <p className="text-text-secondary mt-2">We couldn't find any learning resources for "{skill}". Try searching for a different skill.</p>
                </div>
            )
        }

        return (
            <div className="bg-surface p-6 rounded-xl">
                <div className="border-b border-border mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map(tab => (
                            (tab.data && tab.data.length > 0) && (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-text-secondary hover:text-white hover:border-gray-500'
                                        }`}
                                    aria-current={activeTab === tab.id ? 'page' : undefined}
                                >
                                    {tab.label} <span className="bg-background text-xs font-semibold px-2 py-0.5 rounded-full ml-1">{tab.data.length}</span>
                                </button>
                            )
                        ))}
                    </nav>
                </div>

                <div className="space-y-3">
                    {activeTabData.length > 0 && activeTabIcon ? (
                        activeTabData.map((res, i) => <ResourceCard key={i} resource={res} icon={activeTabIcon} />)
                    ) : (
                        <p className="text-text-secondary text-center py-8">Select a category to view resources.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">AI Learning Hub</h1>
            <p className="text-text-secondary mb-6">Get curated learning resources for any skill, tailored to your profile.</p>

            <div className="bg-surface p-6 rounded-xl shadow-lg space-y-4 mb-8">
                <div className="relative" ref={dropdownRef}>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={skill}
                                onChange={handleInputChange}
                                onFocus={() => setIsDropdownOpen(true)}
                                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleFindResources()}
                                placeholder="e.g., Python, Data Structures, Public Speaking..."
                                className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                            />
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                title="Show suggestions"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-white transition-colors"
                                aria-haspopup="true"
                                aria-expanded={isDropdownOpen}
                            >
                                <ChevronDownIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => handleFindResources()}
                            disabled={loading || !profile.name || !skill}
                            className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <Spinner /> : 'Find Resources'}
                        </button>
                    </div>
                    {isDropdownOpen && (
                        <div className="absolute z-10 top-full mt-2 w-full bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in">
                            <ul className="p-1" role="listbox">
                                {filteredSuggestions.length > 0 ? (
                                    filteredSuggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        onClick={() => handleSelectAndSearch(s)}
                                        className="px-3 py-2 text-sm text-text-secondary hover:bg-border hover:text-white cursor-pointer rounded-md"
                                        role="option"
                                        aria-selected={false}
                                    >
                                        {s}
                                    </li>
                                ))) : (
                                    skill ? (
                                        <li className="px-3 py-2 text-sm text-text-secondary italic">No matching skills found.</li>
                                    ) : (
                                        <li className="px-3 py-2 text-sm text-text-secondary italic">No suggestions available.</li>
                                    )
                                )
                                }
                            </ul>
                        </div>
                    )}
                </div>
                 {!profile.name && <p className="text-yellow-400 text-center text-sm">Please complete your user profile to get personalized results.</p>}
                 {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            </div>
            
            {loading && (
                <div className="flex justify-center items-center p-8">
                    <Spinner />
                </div>
            )}

            {result && (
                 <div className="animate-fade-in">
                    {renderResources()}
                    
                    {result.sources && result.sources.length > 0 && (
                        <div className="bg-surface p-6 rounded-xl mt-8">
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

export default LearningHub;
