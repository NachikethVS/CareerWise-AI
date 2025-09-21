import React, { useState, useRef, useEffect } from 'react';
import { createInterviewChat } from '../services/geminiService';
import { SendIcon } from './icons';
import Spinner from './Spinner';
import type { Chat } from '@google/genai';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const commonJobRoles = [
    'Frontend Developer',
    'Backend Developer',
    'Full-Stack Developer',
    'Data Scientist',
    'Data Analyst',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
    'Cybersecurity Analyst',
    'Marketing Manager'
];

const MockInterview: React.FC = () => {
    const [jobRole, setJobRole] = useState('');
    const [customJobRole, setCustomJobRole] = useState('');
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startInterview = async () => {
        const roleToPractice = jobRole === 'Other' ? customJobRole : jobRole;

        if (!roleToPractice) {
            setError('Please select or enter a job role to start.');
            return;
        }
        setLoading(true);
        setError('');
        
        try {
            chatRef.current = createInterviewChat(roleToPractice);
            setInterviewStarted(true);
            setMessages([{ sender: 'ai', text: '' }]); // Placeholder for first message

            const stream = await chatRef.current.sendMessageStream({ message: "Start the interview." });

            let accumulatedText = '';
            for await (const chunk of stream) {
                if (chunk.text) {
                    accumulatedText += chunk.text;
                    setMessages([{ sender: 'ai', text: accumulatedText }]);
                }
            }
        } catch (err) {
            setError('Failed to start interview. Please try again.');
            console.error(err);
            setInterviewStarted(false);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!userInput.trim() || !chatRef.current || loading) return;

        const currentInput = userInput;
        const userMessage: Message = { sender: 'user', text: currentInput };
        setMessages(prev => [...prev, userMessage, { sender: 'ai', text: '' }]);
        setUserInput('');
        setLoading(true);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: currentInput });
            
            let accumulatedText = '';
            for await (const chunk of stream) {
                if (chunk.text) {
                    accumulatedText += chunk.text;
                    setMessages(prev => {
                        const updatedMessages = [...prev];
                        updatedMessages[updatedMessages.length - 1] = { sender: 'ai', text: accumulatedText };
                        return updatedMessages;
                    });
                }
            }
        } catch (err) {
            setError('Failed to get response. Please try again.');
            setMessages(prev => prev.slice(0, -1)); // Remove AI placeholder on error
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const inputClasses = "w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition";
    const finalRoleSelected = jobRole === 'Other' ? customJobRole : jobRole;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">AI Mock Interview Simulator</h1>
            <p className="text-text-secondary mb-6">Practice your interview skills for any job role.</p>

            {!interviewStarted ? (
                <div className="bg-surface p-6 rounded-xl shadow-lg space-y-4">
                    <div>
                        <label htmlFor="jobRole" className="block text-sm font-medium text-text-secondary mb-2">Job Role to Practice</label>
                        <select
                            id="jobRole"
                            value={jobRole}
                            onChange={(e) => setJobRole(e.target.value)}
                            className={inputClasses}
                        >
                            <option value="" disabled>Select a role</option>
                            {commonJobRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                            <option value="Other">Other</option>
                        </select>
                        {jobRole === 'Other' && (
                             <input
                                type="text"
                                value={customJobRole}
                                onChange={(e) => setCustomJobRole(e.target.value)}
                                className={`${inputClasses} mt-2`}
                                placeholder="Please specify the job role"
                            />
                        )}
                    </div>
                    <button
                        onClick={startInterview}
                        disabled={loading || !finalRoleSelected}
                        className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition disabled:bg-gray-500 flex items-center justify-center"
                    >
                        {loading ? <Spinner /> : 'Start Interview'}
                    </button>
                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </div>
            ) : (
                <div className="bg-surface p-6 rounded-xl shadow-lg animate-fade-in">
                    <div className="h-[60vh] overflow-y-auto mb-4 p-4 space-y-4 bg-background rounded-lg">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-lg' : 'bg-border text-text-primary rounded-bl-lg'}`}>
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text || '...'}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type your answer..."
                            className="flex-1 p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition"
                            disabled={loading}
                        />
                        <button onClick={sendMessage} disabled={loading} className="bg-primary text-white p-3 rounded-lg hover:bg-primary-focus disabled:bg-gray-500">
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </div>
                     {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default MockInterview;