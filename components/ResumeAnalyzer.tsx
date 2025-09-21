

import React, { useState, useEffect } from 'react';
import { analyzeResume } from '../services/geminiService';
import Spinner from './Spinner';
import * as pdfjsLib from 'pdfjs-dist';
// Fix: Import ResumeAnalysisResult from the centralized types file.
import { ResumeAnalysisResult } from '../types';

const ResumeAnalyzer: React.FC = () => {
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [isReadingFile, setIsReadingFile] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Configure the worker for pdf.js. This is necessary for it to work in the browser.
        // We use a CDN link for the worker script, which is part of the 'pdfjs-dist' package.
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsReadingFile(true);
        setError('');
        setResult(null);
        setResumeText('');

        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (!e.target?.result) {
                    setError('Could not read the PDF file.');
                    setIsReadingFile(false);
                    return;
                }
                try {
                    const pdf = await pdfjsLib.getDocument({ data: e.target.result as ArrayBuffer }).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        fullText += pageText + '\n\n';
                    }
                    setResumeText(fullText.trim());
                } catch (pdfError) {
                    console.error('Error parsing PDF:', pdfError);
                    setError('Failed to parse the PDF. It may be corrupted or an unsupported format.');
                } finally {
                    setIsReadingFile(false);
                }
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                setResumeText(e.target?.result as string);
                setIsReadingFile(false);
            };
            reader.readAsText(file);
        } else {
            setError('Unsupported file type. Please upload a PDF or TXT file.');
            setIsReadingFile(false);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText) {
            setError('Please upload or paste your resume text.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            // Fix: The 'data' variable is now correctly typed as ResumeAnalysisResult, resolving the error on the next line.
            const data = await analyzeResume(resumeText, jobDescription);
            setResult(data);
        } catch (err) {
            setError('Failed to analyze resume. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const textareaClasses = "w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition";

    const scoreColor = (score: number) => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        return 'text-red-400';
    };

    const scoreRingColor = (score: number) => {
        if (score >= 75) return 'stroke-green-400';
        if (score >= 50) return 'stroke-yellow-400';
        return 'stroke-red-400';
    };


    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Resume Analysis</h1>
            <p className="text-text-secondary mb-6">Get AI-powered feedback to improve your resume.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-surface p-6 rounded-xl shadow-lg space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Upload Resume (PDF/TXT) or Paste Text</label>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            accept=".pdf,.txt" 
                            className="mb-2 w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 disabled:opacity-50"
                            disabled={isReadingFile}
                        />
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            rows={10}
                            className={textareaClasses}
                            placeholder="Paste your resume text here..."
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Job Description (Optional)</label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={10}
                            className={textareaClasses}
                            placeholder="Paste the job description here for a match score..."
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || isReadingFile || !resumeText}
                        className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 flex items-center justify-center"
                    >
                        {loading ? <Spinner /> : isReadingFile ? 'Reading File...' : 'Analyze Resume'}
                    </button>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </div>
                
                <div className="bg-surface p-6 rounded-xl shadow-lg animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4">Analysis Report</h2>
                    {result ? (
                        <div className="space-y-4">
                            {result.matchScore != null && (
                                <div className="flex flex-col items-center justify-center bg-background p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold text-primary mb-2">Match Score</h3>
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            <circle className="stroke-current text-border" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                            <circle
                                                className={`stroke-current ${scoreRingColor(result.matchScore)}`}
                                                strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"
                                                strokeDasharray={`${2 * Math.PI * 40}`}
                                                strokeDashoffset={`${(2 * Math.PI * 40) * (1 - result.matchScore / 100)}`}
                                                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                                transform="rotate(-90 50 50)"
                                            ></circle>
                                            <text className={`text-2xl font-bold ${scoreColor(result.matchScore)}`} x="50" y="50" dy="0.3em" textAnchor="middle">
                                                {result.matchScore}%
                                            </text>
                                        </svg>
                                    </div>
                                </div>
                            )}
                             {result.feedback.map((item, index) => (
                                <div key={index} className="bg-background p-4 rounded-lg border-l-4 border-primary">
                                    <h4 className="font-bold text-lg text-text-primary">{item.area}</h4>
                                    <p className="text-text-secondary my-1">{item.comment}</p>
                                    <div className="mt-2 bg-green-500/10 p-3 rounded-md">
                                        <p className="text-sm text-green-300"><span className="font-semibold">Suggestion:</span> {item.suggestion}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary">
                            <p>Your analysis report will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;