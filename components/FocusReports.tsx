import React, { useState, useEffect } from 'react';
import { FocusReport } from '../types';

const FocusReports: React.FC = () => {
    const [reports, setReports] = useState<FocusReport[]>([]);

    useEffect(() => {
        try {
            const storedReports = localStorage.getItem('focusReports');
            if (storedReports) {
                setReports(JSON.parse(storedReports));
            }
        } catch (error) {
            console.error("Failed to parse focus reports from localStorage", error);
        }
    }, []);
    
    const clearHistory = () => {
        if (window.confirm("Are you sure you want to delete all focus reports? This action cannot be undone.")) {
            localStorage.removeItem('focusReports');
            setReports([]);
        }
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="animate-slide-in-up">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Focus Session History</h1>
                    <p className="text-text-secondary mt-1">Review your past focus session performance.</p>
                </div>
                {reports.length > 0 && (
                     <button 
                        onClick={clearHistory}
                        className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition self-start md:self-center">
                        Clear History
                    </button>
                )}
            </div>

            {reports.length === 0 ? (
                <div className="text-center bg-surface p-8 rounded-xl mt-8">
                    <p className="text-text-secondary text-lg">You have no saved focus reports yet.</p>
                    <p className="text-text-secondary mt-2">Complete a session in 'Focus Mode' to see your history here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map(report => {
                        const focusedSeconds = report.duration - (report.distractionSeconds || 0);
                        return (
                            <div key={report.id} className="bg-surface p-5 rounded-xl shadow-lg flex flex-col space-y-4">
                                <div className="flex justify-between items-center border-b border-border pb-3">
                                    <h3 className="font-bold text-md text-primary">Focus Session</h3>
                                    <p className="text-xs text-text-secondary">{report.date}</p>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-sm text-text-secondary">Focus Score</span>
                                        <span className="font-bold text-xl text-primary">{report.focusScore}%</span>
                                    </div>
                                    <div className="w-full bg-background rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${report.focusScore}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                                    <div className="text-text-secondary">Total Duration</div>
                                    <div className="font-semibold text-right">{formatDuration(report.duration)}</div>
                                    
                                    <div className="text-text-secondary">Time Focused</div>
                                    <div className="font-semibold text-green-400 text-right">{formatDuration(focusedSeconds)}</div>
                                    
                                    <div className="text-text-secondary">Time Distracted</div>
                                    <div className="font-semibold text-yellow-400 text-right">{formatDuration(report.distractionSeconds || 0)}</div>

                                    <div className="text-text-secondary">Distraction Alerts</div>
                                    <div className="font-semibold text-right">{report.distractions}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default FocusReports;