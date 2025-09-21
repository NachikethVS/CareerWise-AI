
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LogoIcon, CameraIcon, MinimizeIcon, MaximizeIcon, LogoutIcon, ProfileIcon, SearchIcon } from './icons';
import { FocusReport, View } from '../types';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
    setView: (view: View) => void;
}

declare const faceapi: any;

type SessionState = 'idle' | 'configuring' | 'running' | 'finished';

const FocusModeWidget: React.FC = () => {
    const [sessionState, setSessionState] = useState<SessionState>('idle');
    const [seconds, setSeconds] = useState(0);
    const [focusScore, setFocusScore] = useState(100);
    const [isDistracted, setIsDistracted] = useState(false);
    const [distractions, setDistractions] = useState(0);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading AI models...');
    const [distractionSeconds, setDistractionSeconds] = useState(0);
    const [timer, setTimer] = useState(0);
    const [customDuration, setCustomDuration] = useState('');
    const [lastReport, setLastReport] = useState<FocusReport | null>(null);
    const [isPreviewMinimized, setIsPreviewMinimized] = useState(false);


    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const intervalRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const distractionCooldownRef = useRef(false);
    const sessionStatsRef = useRef({ seconds, distractionSeconds, distractions });

    useEffect(() => {
        sessionStatsRef.current = { seconds, distractionSeconds, distractions };
    });

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/faceapi/';
            try {
                setLoadingMessage('Loading AI models...');
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
            } catch (error) {
                console.error("Failed to load face-api models:", error);
                setLoadingMessage('Error loading AI models. Please try again.');
            }
        };
        if (sessionState === 'configuring' && !modelsLoaded) {
            loadModels();
        }
    }, [sessionState, modelsLoaded]);

    const stopSessionCleanup = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (canvasRef.current) {
            canvasRef.current.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, []);

    const handleEndSession = useCallback(() => {
        const currentStats = sessionStatsRef.current;
        const finalScore = currentStats.seconds > 0
            ? Math.max(0, Math.round(((currentStats.seconds - currentStats.distractionSeconds) / currentStats.seconds) * 100))
            : 100;

        const newReport: FocusReport = {
            id: new Date().toISOString(),
            date: new Date().toLocaleString(),
            duration: currentStats.seconds,
            focusScore: finalScore,
            distractions: currentStats.distractions,
            distractionSeconds: currentStats.distractionSeconds,
        };

        try {
            const existingReports: FocusReport[] = JSON.parse(localStorage.getItem('focusReports') || '[]');
            localStorage.setItem('focusReports', JSON.stringify([newReport, ...existingReports]));
        } catch (error) {
            console.error("Failed to save focus report:", error);
            alert("Could not save your focus report. Your browser's storage might be full or private browsing mode might be active.");
        }

        setLastReport(newReport);
        stopSessionCleanup();
        setSessionState('finished');
    }, [stopSessionCleanup]);

    useEffect(() => {
        if (sessionState === 'running' && timer <= 0 && seconds > 0) {
            handleEndSession();
        }
    }, [timer, sessionState, seconds, handleEndSession]);
    
    useEffect(() => {
        if (sessionState === 'running') {
            const score = seconds > 0 
                ? Math.max(0, Math.round(((seconds - distractionSeconds) / seconds) * 100))
                : 100;
            setFocusScore(score);
        }
    }, [seconds, distractionSeconds, sessionState]);

    useEffect(() => {
        if (sessionState !== 'running') {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = window.setInterval(async () => {
            let faceDetected = false;
            if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
                const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
                if (detections) {
                    faceDetected = true;
                }
            }

            if (faceDetected) {
                setIsDistracted(false);
                distractionCooldownRef.current = false;
            } else {
                if (!distractionCooldownRef.current) {
                    setDistractions(d => d + 1);
                    distractionCooldownRef.current = true;
                }
                setIsDistracted(true);
                setDistractionSeconds(d => d + 1);
            }
            setSeconds(s => s + 1);
            setTimer(t => Math.max(0, t - 1));
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [sessionState]);

    const startSession = async (durationInSeconds: number) => {
        if (sessionState === 'running' || !modelsLoaded || durationInSeconds <= 0) return;
        setTimer(durationInSeconds);
        setSeconds(0);
        setFocusScore(100);
        setDistractions(0);
        setDistractionSeconds(0);
        setIsDistracted(false);
        setIsPreviewMinimized(false);
        distractionCooldownRef.current = false;
        setCustomDuration('');
        setLastReport(null);

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
            setSessionState('running');
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please grant permission in your browser settings.");
        }
    };
    
    useEffect(() => {
        if (sessionState === 'running' && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [sessionState]);

    useEffect(() => {
      return () => stopSessionCleanup();
    }, [stopSessionCleanup]);

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const closeModal = () => {
        setSessionState('idle');
    };

    const renderConfiguration = () => (
        <>
            <h2 className="text-3xl font-bold mb-4 text-primary">Focus Mode</h2>
            <p className="text-text-secondary mb-6">Select a duration to start a timed session and track your focus.</p>
            {!modelsLoaded ? (
                <div className="flex items-center justify-center space-x-2 text-lg h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>{loadingMessage}</span>
                </div>
            ) : (
            <div className="space-y-4 animate-fade-in">
                <div className="flex justify-center gap-4">
                    {[10, 25, 45].map(min => (
                        <button key={min} onClick={() => startSession(min * 60)} className="bg-background text-text-primary font-bold py-3 px-6 rounded-lg hover:bg-border transition-transform transform hover:scale-105 w-24">
                            {min} min
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                    <hr className="flex-grow border-border" />
                    <span>OR</span>
                    <hr className="flex-grow border-border" />
                </div>
                <div className="flex items-stretch gap-2">
                    <input
                        type="number"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        placeholder="Custom minutes"
                        className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition text-center"
                    />
                    <button 
                        onClick={() => {
                            const mins = parseInt(customDuration);
                            if (mins > 0) startSession(mins * 60);
                            else alert("Please enter a valid number of minutes.");
                        }}
                        className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition">
                        Start
                    </button>
                </div>
            </div>
            )}
        </>
    );

    const renderReport = () => {
        if (!lastReport) return null;

        const focusedSeconds = lastReport.duration - lastReport.distractionSeconds;
        const distractedPercent = lastReport.duration > 0 ? ((lastReport.distractionSeconds / lastReport.duration) * 100).toFixed(0) : '0';
        const focusedPercent = 100 - parseInt(distractedPercent);

        return (
            <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-4 text-primary">Session Report</h2>
                <div className="space-y-4 text-left bg-background p-6 rounded-lg mb-6">
                    <div className="flex justify-between items-center text-lg">
                        <span className="text-text-secondary">Focus Score</span>
                        <span className="font-bold text-2xl text-primary">{lastReport.focusScore}%</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-4">
                        <div className="bg-primary h-4 rounded-full" style={{ width: `${lastReport.focusScore}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-green-400">Focused: {focusedPercent}%</span>
                        <span className="text-yellow-400">Distracted: {distractedPercent}%</span>
                    </div>
                    <hr className="border-border" />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Total Duration</span>
                            <span className="font-semibold">{formatTime(lastReport.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Time Focused</span>
                            <span className="font-semibold text-green-400">{formatTime(focusedSeconds)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Time Distracted</span>
                            <span className="font-semibold text-yellow-400">{formatTime(lastReport.distractionSeconds)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-text-secondary">Distraction Alerts</span>
                            <span className="font-semibold">{lastReport.distractions}</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setSessionState('configuring')} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition">
                    Start New Session
                </button>
            </div>
        );
    };

    return (
        <>
            <button onClick={() => setSessionState('configuring')} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface transition-colors">
                <CameraIcon className={`w-6 h-6 ${sessionState === 'running' ? 'text-green-400 animate-pulse' : 'text-primary'}`} />
                <span className="font-semibold text-text-primary">Focus Mode</span>
            </button>
            
            {sessionState === 'running' && (
                <div className={`fixed top-4 right-4 z-50 bg-surface rounded-xl shadow-2xl p-3 animate-fade-in transition-all duration-300 ${isPreviewMinimized ? 'w-48' : 'w-72'}`}>
                    <div className="flex justify-between items-center mb-2 text-sm">
                        <h3 className="font-bold text-primary">Focus Session</h3>
                        <div className="flex items-center">
                            <button onClick={() => setIsPreviewMinimized(!isPreviewMinimized)} className="p-1 text-text-secondary hover:text-white">
                                {isPreviewMinimized ? <MaximizeIcon className="w-4 h-4" /> : <MinimizeIcon className="w-4 h-4" />}
                            </button>
                            <button onClick={handleEndSession} className="text-xs bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded ml-2">End</button>
                        </div>
                    </div>
                    
                    {/* Video container is always in the DOM during a session. When minimized, it's positioned absolutely off-screen to keep it active. */}
                    <div className={`bg-background rounded-md overflow-hidden ${isPreviewMinimized ? 'absolute w-px h-px -left-full' : 'relative mb-2 aspect-video'}`}>
                        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-all duration-300 border-2 ${isDistracted ? 'border-yellow-400' : 'border-transparent'}`} />
                        <canvas ref={canvasRef} className="absolute top-0 left-0" />
                    </div>

                    {/* Conditionally render the correct stats view */}
                    {isPreviewMinimized ? (
                        <div> {/* Minimized View */}
                            <div className="flex items-center justify-between bg-background p-2 rounded">
                                <div className="text-text-secondary text-sm">Time Left:</div>
                                <div className="font-bold text-lg">{formatTime(timer)}</div>
                            </div>
                        </div>
                    ) : (
                        <div> {/* Maximized View */}
                            <div className="grid grid-cols-2 gap-2 text-center text-xs">
                                <div className="bg-background p-2 rounded">
                                    <div className="text-text-secondary">TIME LEFT</div>
                                    <div className="font-bold text-lg">{formatTime(timer)}</div>
                                </div>
                                <div className="bg-background p-2 rounded">
                                    <div className="text-text-secondary">SCORE</div>
                                    <div className="font-bold text-lg">{focusScore}%</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
             
            {(sessionState === 'configuring' || sessionState === 'finished') && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" onClick={closeModal}>
                    <div className="bg-surface p-8 rounded-2xl shadow-2xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-2xl font-light text-text-secondary hover:text-white transition-colors">&times;</button>
                        {sessionState === 'configuring' ? renderConfiguration() : renderReport()}
                    </div>
                </div>
            )}
        </>
    );
};


const Header: React.FC<HeaderProps> = ({ setView }) => {
    const { profile, logout } = useAppContext();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() : '';
    const getFirstName = (name: string) => name ? name.split(' ')[0] : '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="flex items-center h-20 px-6 bg-surface border-b border-border flex-shrink-0 gap-4">
            {/* Left Side */}
            <div className="flex items-center space-x-3 cursor-pointer group flex-shrink-0" onClick={() => setView(View.DASHBOARD)}>
                <LogoIcon className="w-8 h-8 text-primary group-hover:text-primary-focus transition-colors" />
                <span className="text-xl font-bold text-text-primary group-hover:text-white transition-colors hidden lg:block">CareerWise AI</span>
            </div>

            {/* Center Search Bar */}
            <div className="flex-1 flex justify-center min-w-0 px-4">
                <div className="relative w-full max-w-lg">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tools & features..."
                        className="w-full bg-background border border-border rounded-full py-2.5 pl-10 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                    />
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4 flex-shrink-0">
                <FocusModeWidget />
                {profile.name && (
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3 p-1 pr-3 rounded-lg hover:bg-background cursor-pointer transition-colors w-full text-left">
                           {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                           ) : (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                                    {getInitial(profile.name)}
                                </div>
                           )}
                            <span className="font-semibold text-text-primary hidden sm:block">{getFirstName(profile.name)}</span>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-surface rounded-lg shadow-xl border border-border z-50 animate-fade-in py-1">
                                <a
                                    onClick={() => { setView(View.PROFILE); setDropdownOpen(false); }}
                                    className="flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-border hover:text-white cursor-pointer"
                                >
                                    <ProfileIcon className="w-5 h-5 mr-3" />
                                    <span>My Profile</span>
                                </a>
                                <a
                                    onClick={async () => { await logout(); setDropdownOpen(false); }}
                                    className="flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-border hover:text-white cursor-pointer"
                                >
                                    <LogoutIcon className="w-5 h-5 mr-3" />
                                    <span>Logout</span>
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
