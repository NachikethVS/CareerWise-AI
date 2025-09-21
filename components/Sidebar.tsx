
import React from 'react';
import { View } from '../types';
import { DashboardIcon, InterviewIcon, LearningHubIcon, NetworkIcon, ProfileIcon, ProjectIcon, QuestIcon, ReportIcon, ResumeIcon, RoadmapIcon, SkillGapIcon } from './icons';

interface SidebarProps {
    currentView: View;
    setView: (view: View) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: View;
    currentView: View;
    setView: (view: View) => void;
    isSidebarOpen: boolean;
}> = ({ icon, label, currentView, setView, isSidebarOpen }) => {
    const isActive = label === currentView;
    return (
        <li
            onClick={() => setView(label)}
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-border hover:text-white'
            }`}
        >
            {icon}
            <span className={`ml-4 whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
        </li>
    );
};


const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setOpen }) => {
    const iconClass = "w-6 h-6";

    return (
        <aside className={`flex flex-col bg-surface text-white transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
            <nav className="flex-1 px-4 py-4">
                <ul>
                    <NavItem icon={<DashboardIcon className={iconClass} />} label={View.DASHBOARD} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<ProfileIcon className={iconClass} />} label={View.PROFILE} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<RoadmapIcon className={iconClass} />} label={View.ROADMAP} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<SkillGapIcon className={iconClass} />} label={View.SKILL_GAP} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<LearningHubIcon className={iconClass} />} label={View.LEARNING_HUB} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<InterviewIcon className={iconClass} />} label={View.MOCK_INTERVIEW} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<ResumeIcon className={iconClass} />} label={View.RESUME_ANALYZER} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<ProjectIcon className={iconClass} />} label={View.PROJECT_IDEAS} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<NetworkIcon className={iconClass} />} label={View.NETWORKING} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<ReportIcon className={iconClass} />} label={View.FOCUS_REPORTS} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                    <NavItem icon={<QuestIcon className={iconClass} />} label={View.CAREER_QUEST} {...{ currentView, setView, isSidebarOpen: isOpen }} />
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;