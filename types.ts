export interface UserProfile {
    name: string;
    status: 'Student' | 'Professional' | '';
    fieldOfStudy: string;
    yearOfStudy: string | '';
    yearsOfExperience: string | '';
    skills: string[];
    interests: string[];
    careerAspirations: string;
    profilePicture?: string;
}

export interface FocusReport {
    id: string;
    date: string;
    duration: number; // in seconds
    focusScore: number;
    distractions: number;
    distractionSeconds: number;
}

export interface SkillMapAnalysis {
    companyName: string;
    requiredSkills: string[];
    matchedSkills: string[];
    missingSkills: string[];
    analysisSummary: string;
}

// Fix: Add centralized types for API responses
export interface RoadmapData {
    recommendedRoles: string[];
    industryTrends: string;
    timeline: {
        timeframe: string;
        milestone: string;
        description: string;
    }[];
}

export interface SkillGapData {
    requiredSkills: string[];
    missingSkills: string[];
    learningPlan: {
        step: number;
        action: string;
        resources: string[];
    }[];
}

export interface ResumeAnalysisResult {
    matchScore?: number;
    feedback: {
        area: string;
        comment: string;
        suggestion: string;
    }[];
}

export interface ProjectIdea {
    title: string;
    description: string;
    skillsShowcased: string[];
}

export interface NetworkingData {
    influencers: string[];
    communities: string[];
    events: string[];
    connectionTemplate: string;
}

export type QuestDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Quest {
    id: string;
    category: string;
    title: string;
    description: string;
    xp: number;
    difficulty: QuestDifficulty;
}

export interface FutureProofScoreData {
    score: number;
    summary: string;
    futureProofSkills: string[];
    atRiskSkills: string[];
    recommendedSkills: string[];
}

export interface SkillEvolutionData {
    skill: string;
    timeline: {
        year: string; // e.g., "Year 1", "Year 3", "Year 5"
        projectedProficiency: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
        reasoning: string;
    }[];
}

export interface PitchAnalysisResult {
    transcript: string;
    contentClarity: {
        feedback: string;
        suggestions: string[];
    };
    vocalDelivery: {
        feedback: string;
        suggestions: string[];
    };
    visualPresence: {
        feedback: string;
        suggestions: string[];
    };
}

export interface LearningResource {
    title: string;
    link: string;
    summary: string;
}

export interface LearningHubData {
    articles: LearningResource[];
    videos: LearningResource[];
    courses: LearningResource[];
}


export enum View {
    DASHBOARD = 'Dashboard',
    PROFILE = 'User Profile',
    ROADMAP = 'Career Roadmap',
    SKILL_GAP = 'Skill Gap Analysis',
    MOCK_INTERVIEW = 'Mock Interview',
    RESUME_ANALYZER = 'Resume Analyzer',
    PROJECT_IDEAS = 'Project Ideas',
    NETWORKING = 'Networking',
    FOCUS_REPORTS = 'Focus Reports',
    CAREER_QUEST = 'Career Quest Mode',
    COMPANY_SKILL_MAPS = 'Company Skill Maps',
    FUTURE_PROOF_SCORE = 'Future-Proof Score',
    SKILL_EVOLUTION_TIMELINE = 'Skill Evolution Timeline',
    LIVE_PITCH_PRACTICE = 'Live Pitch Practice',
    LEARNING_HUB = 'Learning Hub',
}