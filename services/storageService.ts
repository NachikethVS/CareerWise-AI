import { UserProfile } from '../types';

const DB_NAME = 'CareerWiseDB';
const DB_VERSION = 1;
const STORE_NAME = 'userProfile';
const PROFILE_KEY = 'currentUser';

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const saveUserProfileToDB = async (profile: UserProfile): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const profileWithId = { ...profile, id: PROFILE_KEY };
    store.put(profileWithId);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getUserProfileFromDB = async (): Promise<UserProfile | null> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(PROFILE_KEY);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            const result = request.result;
            if (result) {
                // remove id before returning
                const { id, ...profileData } = result;
                resolve(profileData as UserProfile);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(request.error);
    });
};

export const deleteUserProfileFromDB = async (): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(PROFILE_KEY);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};
