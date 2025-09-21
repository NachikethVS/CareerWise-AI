import React, { createContext, useContext, ReactNode } from 'react';
import { UserProfile } from '../types';
import { useUserProfile } from '../hooks/useUserProfile';

interface AppContextType {
    profile: UserProfile;
    saveProfile: (newProfile: UserProfile) => Promise<void>;
    isInitialized: boolean;
    logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { profile, saveProfile, isInitialized, logout } = useUserProfile();

    return (
        <AppContext.Provider value={{ profile, saveProfile, isInitialized, logout }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};
