
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { View } from '../types';
import Card from './Card';
import { 
    InterviewIcon, 
    NetworkIcon, 
    ProjectIcon, 
    QuestIcon, 
    ResumeIcon, 
    RoadmapIcon, 
    SkillGapIcon,
    ArrowUpRightIcon,
    CompanySkillMapsIcon,
    FutureProofScoreIcon,
    SkillEvolutionTimelineIcon,
    LivePitchPracticeIcon,
    LearningHubIcon,
    BrainIcon,
    InterestIcon,
    ExperienceIcon,
    HeroBannerIcon,
    GrowthChartIcon,
    InterviewChatIcon,
    SkillBrainIcon,
} from './icons';

interface DashboardProps {
    setView: (view: View) => void;
}

const bannerItems = [
    {
        title: "Unlock Your Career Potential",
        description: "Let our AI build a personalized roadmap to guide you toward your professional goals.",
        icon: <HeroBannerIcon className="w-32 h-32 md:w-40 md:h-40" />,
        gradient: "from-primary/20 to-surface/70"
    },
    {
        title: "Chart Your Professional Growth",
        description: "Analyze your skillset against future trends and discover your 'Future-Proof' score.",
        icon: <GrowthChartIcon className="w-32 h-32 md:w-40 md:h-40" />,
        gradient: "from-emerald-500/20 to-surface/70"
    },
    {
        title: "Ace Your Next Interview",
        description: "Practice with our AI interviewer and get instant feedback on your performance.",
        icon: <InterviewChatIcon className="w-32 h-32 md:w-40 md:h-40" />,
        gradient: "from-blue-500/20 to-surface/70"
    },
    {
        title: "Master In-Demand Skills",
        description: "Explore the Learning Hub to find curated articles, videos, and courses for any skill.",
        icon: <SkillBrainIcon className="w-32 h-32 md:w-40 md:h-40" />,
        gradient: "from-pink-500/20 to-surface/70"
    }
];


const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
    const { profile, isInitialized } = useAppContext();
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBannerIndex(prevIndex => (prevIndex + 1) % bannerItems.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, []);

    if (!isInitialized) {
        return <div className="text-center p-10">Loading...</div>;
    }

    if (!profile.name) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                <h1 className="text-4xl font-bold mb-4 text-text-primary">Welcome to CareerWise AI</h1>
                <p className="text-lg mb-8 text-text-secondary">Your personal AI career advisor.</p>
                <button
                    onClick={() => setView(View.PROFILE)}
                    className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-transform transform hover:scale-105"
                >
                    Create Your Profile to Get Started
                </button>
            </div>
        );
    }
    
    const summaryItems = [
        { title: 'Top Skill', value: profile.skills[0] || 'Not Set', icon: <BrainIcon className="w-10 h-10"/>, color: "text-sky-400" },
        { title: 'Primary Interest', value: profile.interests[0] || 'Not Set', icon: <InterestIcon className="w-10 h-10"/>, color: "text-amber-400" },
        { title: 'Experience', value: profile.status === 'Student' ? profile.yearOfStudy || 'Student' : profile.yearsOfExperience || 'Professional', icon: <ExperienceIcon className="w-10 h-10"/>, color: "text-emerald-400" },
    ];

    const featureCards = [
        { view: View.ROADMAP, title: "Career Roadmap", description: "Generate a personalized career plan.", icon: <RoadmapIcon className="w-8 h-8"/> },
        { view: View.SKILL_GAP, title: "Skill Gap Analysis", description: "Identify and bridge your skill gaps.", icon: <SkillGapIcon className="w-8 h-8"/> },
        { view: View.LEARNING_HUB, title: "Learning Hub", description: "Find curated learning resources for any skill.", icon: <LearningHubIcon className="w-8 h-8"/> },
        { view: View.MOCK_INTERVIEW, title: "Mock Interview", description: "Practice with an AI interviewer.", icon: <InterviewIcon className="w-8 h-8"/> },
        { view: View.LIVE_PITCH_PRACTICE, title: "Live Pitch Practice", description: "Get AI feedback on your elevator pitch.", icon: <LivePitchPracticeIcon className="w-8 h-8"/> },
        { view: View.RESUME_ANALYZER, title: "Resume Analyzer", description: "Get feedback on your resume.", icon: <ResumeIcon className="w-8 h-8"/> },
        { view: View.PROJECT_IDEAS, title: "Project Ideas", description: "Discover projects to build your portfolio.", icon: <ProjectIcon className="w-8 h-8"/> },
        { view: View.NETWORKING, title: "Networking", description: "Find connections and communities.", icon: <NetworkIcon className="w-8 h-8"/> },
        { view: View.CAREER_QUEST, title: "Career Quest Mode", description: "Gamify your learning journey.", icon: <QuestIcon className="w-8 h-8"/> },
        { view: View.COMPANY_SKILL_MAPS, title: "Company Skill Maps", description: "Map skills for your dream company.", icon: <CompanySkillMapsIcon className="w-8 h-8"/> },
        { view: View.FUTURE_PROOF_SCORE, title: "Future-Proof Score", description: "Analyze your skills against industry trends.", icon: <FutureProofScoreIcon className="w-8 h-8"/> },
        { view: View.SKILL_EVOLUTION_TIMELINE, title: "Skill Evolution Timeline", description: "Visualize your skill growth and projections.", icon: <SkillEvolutionTimelineIcon className="w-8 h-8"/> },
    ];

    const currentBanner = bannerItems[currentBannerIndex];

    return (
        <div className="space-y-8 animate-slide-in-up">
            {/* Grid for Banner and Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                
                {/* Hero Banner */}
                <div className={`lg:col-span-6 bg-surface/70 backdrop-blur p-8 rounded-xl shadow-lg border border-slate-700/50 bg-gradient-to-br ${currentBanner.gradient} flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500`}>
                    <div className="text-center md:text-left">
                        <h1 key={`title-${currentBannerIndex}`} className="text-3xl md:text-4xl font-bold text-text-primary animate-text-fade-in">
                            {currentBanner.title}
                        </h1>
                        <p key={`desc-${currentBannerIndex}`} className="text-lg text-text-secondary mt-2 mb-6 max-w-2xl animate-text-fade-in" style={{ animationDelay: '0.1s' }}>
                            {currentBanner.description}
                        </p>
                        <button
                            onClick={() => setView(View.ROADMAP)}
                            className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-transform transform hover:scale-105"
                        >
                            Generate My Roadmap
                        </button>
                    </div>
                    <div key={`icon-${currentBannerIndex}`} className="flex-shrink-0 hidden md:block animate-text-fade-in">
                        {currentBanner.icon}
                    </div>
                </div>

                {/* Summary Cards */}
                {summaryItems.map((item) => (
                    <Card key={item.title} className="lg:col-span-2 flex items-center gap-4 p-4">
                        <div className={`p-3 bg-surface rounded-full ${item.color}`}>
                           {item.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-text-secondary">{item.title}</h3>
                            <p className="text-xl font-bold text-text-primary truncate" title={item.value}>{item.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Explore Your Tools</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featureCards.map(feature => (
                        <Card key={feature.view} onClick={() => setView(feature.view)}>
                            <div className="flex h-full flex-col">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-primary/20 text-primary p-3 rounded-full">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary">{feature.title}</h3>
                                </div>
                                <p className="text-sm text-text-secondary mt-3 flex-grow">{feature.description}</p>
                                <ArrowUpRightIcon className="absolute top-6 right-6 w-5 h-5 text-text-secondary transition-all opacity-0 group-hover:opacity-100 group-hover:text-primary" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;