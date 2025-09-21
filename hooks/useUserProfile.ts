import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { saveUserProfileToDB, getUserProfileFromDB, deleteUserProfileFromDB } from '../services/storageService';

const emptyProfile: UserProfile = {
    name: '',
    status: '',
    fieldOfStudy: '',
    yearOfStudy: '',
    yearsOfExperience: '',
    skills: [],
    interests: [],
    careerAspirations: '',
    profilePicture: '',
};

export const useUserProfile = () => {
    const [profile, setProfile] = useState<UserProfile>(emptyProfile);
    const [isInitialized, setInitialized] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const storedProfile = await getUserProfileFromDB();
                if (storedProfile) {
                    setProfile(storedProfile);
                }
            } catch (error) {
                console.error("Failed to load user profile from IndexedDB", error);
                setProfile(emptyProfile);
            } finally {
                setInitialized(true);
            }
        };
        loadProfile();
    }, []);

    const saveProfile = useCallback(async (newProfile: UserProfile) => {
        try {
            await saveUserProfileToDB(newProfile);
            setProfile(newProfile);
        } catch (error) {
            console.error("Failed to save user profile to IndexedDB", error);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await deleteUserProfileFromDB();
            setProfile(emptyProfile);
        } catch (error) {
            console.error("Failed to clear user profile from IndexedDB", error);
        }
    }, []);
    
    return { profile, saveProfile, isInitialized, logout };
};
