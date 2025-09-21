import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzePitchVideo } from '../services/geminiService';
import Spinner from './Spinner';
import { PitchAnalysisResult } from '../types';
import { LivePitchPracticeIcon, UploadIcon } from './icons';

type RecordingState = 'idle' | 'permission' | 'recording' | 'processing' | 'results' | 'error';

const LivePitchPractice: React.FC = () => {
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [analysis, setAnalysis] = useState<PitchAnalysisResult | null>(null);
    const [error, setError] = useState('');
    const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const videoChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<number | null>(null);

    const cleanup = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    const requestPermissions = async () => {
        setRecordingState('permission');
        setError('');
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
            }
            startRecording();
        } catch (err) {
            console.error('Error accessing media devices.', err);
            setError('Could not access camera and microphone. Please grant permission and try again.');
            setRecordingState('error');
            cleanup();
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;
        setRecordingState('recording');
        videoChunksRef.current = [];
        
        // Determine a supported MIME type
        const options = { mimeType: 'video/webm; codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm; codecs=vp8';
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                 options.mimeType = 'video/webm';
            }
        }

        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                videoChunksRef.current.push(event.data);
            }
        };
        mediaRecorderRef.current.onstop = handleRecordingStop;
        mediaRecorderRef.current.start();
        setTimer(60);
        timerIntervalRef.current = window.setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    stopRecording();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        cleanup();
    };

    const handleRecordingStop = async () => {
        setRecordingState('processing');
        const fullMimeType = mediaRecorderRef.current?.mimeType || 'video/webm';
        const videoBlob = new Blob(videoChunksRef.current, { type: fullMimeType });
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedVideoUrl(videoUrl);

        const reader = new FileReader();
        reader.readAsDataURL(videoBlob);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            const base64content = base64data.split(',')[1];
            // The Gemini API can be strict about the mimeType format. We strip any codec
            // information (e.g., from 'video/webm;codecs=vp9') to send a more standard type.
            const simpleMimeType = fullMimeType.split(';')[0];
            try {
                const result = await analyzePitchVideo(base64content, simpleMimeType);
                setAnalysis(result);
                setRecordingState('results');
            } catch (err) {
                console.error('Failed to analyze pitch.', err);
                setError('AI analysis failed. The video might be too short or there was a network issue. Please try again.');
                setRecordingState('error');
            }
        };
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            setError('Invalid file type. Please upload a video file.');
            setRecordingState('error');
            return;
        }
        
        setRecordingState('processing');
        setError('');

        const videoUrl = URL.createObjectURL(file);
        setRecordedVideoUrl(videoUrl);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            const base64content = base64data.split(',')[1];
            const simpleMimeType = file.type.split(';')[0];
            
            try {
                const result = await analyzePitchVideo(base64content, simpleMimeType);
                setAnalysis(result);
                setRecordingState('results');
            } catch (err) {
                console.error('Failed to analyze pitch.', err);
                setError('AI analysis failed. The video might be too long or there was a network issue. Please try again.');
                setRecordingState('error');
            }
        };
        reader.onerror = () => {
            console.error("Failed to read file.");
            setError("There was an error reading your video file. Please try again with a different file.");
            setRecordingState('error');
        }
    };
    
    const reset = () => {
        cleanup();
        setAnalysis(null);
        setError('');
        setRecordedVideoUrl(null);
        setTimer(60);
        setRecordingState('idle');
    };

    const renderContent = () => {
        switch (recordingState) {
            case 'idle':
                return (
                    <div className="text-center">
                        <LivePitchPracticeIcon className="w-16 h-16 mx-auto text-primary mb-4" />
                        <h2 className="text-2xl font-bold mb-4">Practice Your Elevator Pitch</h2>
                        <p className="text-text-secondary mb-8 max-w-lg mx-auto">Record a short pitch (up to 60 seconds) or upload an existing video for instant, AI-powered feedback on your content, delivery, and presence.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={requestPermissions} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-focus transition-transform transform hover:scale-105 w-full sm:w-auto">
                                Start Recording
                            </button>
                            <div className="text-text-secondary">or</div>
                            <label className="bg-surface border border-border text-text-primary font-bold py-3 px-8 rounded-lg hover:bg-border cursor-pointer transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
                                <UploadIcon className="w-5 h-5" />
                                Upload Video
                                <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    </div>
                );
            case 'recording':
            case 'permission':
                return (
                    <div className="flex flex-col items-center">
                        <div className="w-full max-w-2xl bg-black rounded-lg shadow-lg relative aspect-video mb-4">
                            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover rounded-lg ${recordingState === 'recording' ? 'animate-pulse-red' : ''}`} />
                            {recordingState === 'recording' && (
                                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 text-white p-2 rounded-lg">
                                    <div className="flex items-center gap-2 text-red-400">
                                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                                        <span className="font-semibold text-sm">REC</span>
                                    </div>
                                    <span className="text-sm font-mono text-white">{`0:${String(timer).padStart(2, '0')}`}</span>
                                </div>
                            )}
                        </div>
                        {recordingState === 'permission' && <p className="text-text-secondary mb-4">Waiting for camera and microphone permission...</p>}
                        <button onClick={stopRecording} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition">
                            Stop Recording
                        </button>
                    </div>
                );
            case 'processing':
                return (
                    <div className="text-center">
                        <Spinner />
                        <h2 className="text-2xl font-bold mt-4 animate-pulse">Analyzing Your Pitch...</h2>
                        <p className="text-text-secondary mt-2">The AI is reviewing your content, vocal delivery, and presence.</p>
                    </div>
                );
            case 'results':
                if (!analysis) return null;
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold mb-6 text-center">Your Pitch Analysis</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                {recordedVideoUrl && (
                                     <video src={recordedVideoUrl} controls className="w-full rounded-lg shadow-lg"></video>
                                )}
                                <div className="bg-surface p-4 rounded-lg">
                                    <h3 className="font-bold text-lg text-primary mb-2">Transcript</h3>
                                    <p className="text-sm text-text-secondary italic">"{analysis.transcript}"</p>
                                </div>
                                <button onClick={reset} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition">
                                    Practice Again
                                </button>
                            </div>
                            <div className="lg:col-span-3 space-y-4">
                                <FeedbackCard title="Content & Clarity" feedback={analysis.contentClarity.feedback} suggestions={analysis.contentClarity.suggestions} />
                                <FeedbackCard title="Vocal Delivery" feedback={analysis.vocalDelivery.feedback} suggestions={analysis.vocalDelivery.suggestions} />
                                <FeedbackCard title="Visual Presence" feedback={analysis.visualPresence.feedback} suggestions={analysis.visualPresence.suggestions} />
                            </div>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">An Error Occurred</h2>
                        <p className="text-text-secondary mb-8">{error}</p>
                        <button onClick={reset} className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-focus transition">
                            Try Again
                        </button>
                    </div>
                );
        }
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Live Pitch Practice</h1>
            <p className="text-text-secondary mb-6">Hone your elevator pitch with real-time AI feedback.</p>
            <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-lg flex items-center justify-center min-h-[60vh]">
                {renderContent()}
            </div>
        </div>
    );
};

interface FeedbackCardProps {
    title: string;
    feedback: string;
    suggestions: string[];
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ title, feedback, suggestions }) => (
    <div className="bg-background p-5 rounded-lg border-l-4 border-primary">
        <h3 className="font-bold text-xl text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary mb-3 text-sm">{feedback}</p>
        <div>
            <h4 className="font-semibold text-text-primary text-sm mb-2">Suggestions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-green-300">
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
        </div>
    </div>
);


export default LivePitchPractice;