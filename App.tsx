import React, { useState } from 'react';
import { AppContextProvider } from './context/AppContext';
import { View } from './types';
import Dashboard from './components/Dashboard';
import UserProfile from './components/UserProfile';
import Roadmap from './components/Roadmap';
import SkillGap from './components/SkillGap';
import MockInterview from './components/MockInterview';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ProjectIdeas from './components/ProjectIdeas';
import Networking from './components/Networking';
import Header from './components/Header';
import FocusReports from './components/FocusReports';
import CareerQuest from './components/CareerQuest';
import CompanySkillMaps from './components/CompanySkillMaps';
import FutureProofScore from './components/FutureProofScore';
import SkillEvolutionTimeline from './components/SkillEvolutionTimeline';
import LivePitchPractice from './components/LivePitchPractice';
import LearningHub from './components/LearningHub';

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.DASHBOARD);

    const renderView = () => {
        switch (view) {
            case View.DASHBOARD:
                return <Dashboard setView={setView} />;
            case View.PROFILE:
                return <UserProfile setView={setView} />;
            case View.ROADMAP:
                return <Roadmap />;
            case View.SKILL_GAP:
                return <SkillGap />;
            case View.MOCK_INTERVIEW:
                return <MockInterview />;
            case View.RESUME_ANALYZER:
                return <ResumeAnalyzer />;
            case View.PROJECT_IDEAS:
                return <ProjectIdeas />;
            case View.NETWORKING:
                return <Networking />;
            case View.FOCUS_REPORTS:
                return <FocusReports />;
            case View.CAREER_QUEST:
                return <CareerQuest />;
            case View.COMPANY_SKILL_MAPS:
                return <CompanySkillMaps />;
            case View.FUTURE_PROOF_SCORE:
                return <FutureProofScore />;
            case View.SKILL_EVOLUTION_TIMELINE:
                return <SkillEvolutionTimeline />;
            case View.LIVE_PITCH_PRACTICE:
                return <LivePitchPractice />;
            case View.LEARNING_HUB:
                return <LearningHub />;
            default:
                return <Dashboard setView={setView} />;
        }
    };

    return (
        <AppContextProvider>
            <div className="flex h-screen bg-background text-text-primary">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header setView={setView} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6 md:p-8">
                        <div className="animate-fade-in">
                            {renderView()}
                        </div>
                    </main>
                </div>
            </div>
        </AppContextProvider>
    );
};

export default App;