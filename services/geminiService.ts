// Fix: Import centralized types for API responses
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { UserProfile, SkillMapAnalysis, RoadmapData, SkillGapData, ResumeAnalysisResult, ProjectIdea, NetworkingData, Quest, FutureProofScoreData, SkillEvolutionData, PitchAnalysisResult, LearningHubData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const parseJsonResponse = <T>(responseText: string, functionName: string): T => {
    try {
        // The API can sometimes return JSON wrapped in markdown, or with leading/trailing text.
        // First, look for a markdown block.
        const markdownMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        
        let jsonString: string | null = null;

        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1];
        } else {
            // If no markdown, find the first '{' or '[' and the last corresponding '}' or ']'
            const firstBracket = responseText.indexOf('{');
            const firstSquare = responseText.indexOf('[');
            
            let start = -1;

            if (firstBracket === -1 && firstSquare === -1) {
                // If no JSON object or array found, maybe it's a plain string that can be parsed
                // This is a last resort.
                return JSON.parse(responseText);
            }

            if (firstBracket === -1) {
                start = firstSquare;
            } else if (firstSquare === -1) {
                start = firstBracket;
            } else {
                start = Math.min(firstBracket, firstSquare);
            }
            
            const charStart = responseText[start];
            const charEnd = charStart === '{' ? '}' : ']';
            
            const end = responseText.lastIndexOf(charEnd);

            if (end === -1 || end < start) {
                 throw new Error("Mismatched JSON brackets.");
            }
            
            jsonString = responseText.substring(start, end + 1);
        }

        return JSON.parse(jsonString.trim());

    } catch (e) {
        console.error(`Failed to parse JSON response from AI in ${functionName}:`, responseText);
        console.error("Original parsing error:", e);
        throw new Error(`Failed to get a valid response from the AI. The format was incorrect.`);
    }
}

// Fix: Add explicit return type Promise<RoadmapData>
export const generateCareerRoadmap = async (profile: UserProfile): Promise<RoadmapData> => {
    const prompt = `Based on the following user profile, generate a detailed, long-term career roadmap.
    Profile:
    - Name: ${profile.name}
    - Status: ${profile.status}
    - Field of Study/Expertise: ${profile.fieldOfStudy}
    - Skills: ${profile.skills.join(', ')}
    - Interests: ${profile.interests.join(', ')}
    - Career Aspirations: ${profile.careerAspirations}
    
    The roadmap should include recommended job roles, an analysis of relevant industry trends, and a suggested timeline with key milestones.
    Structure the output as a JSON object.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    recommendedRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
                    industryTrends: { type: Type.STRING },
                    timeline: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                timeframe: { type: Type.STRING },
                                milestone: { type: Type.STRING },
                                description: { type: Type.STRING },
                            }
                        }
                    }
                }
            }
        }
    });
    // Fix: Use generic type with parseJsonResponse
    return parseJsonResponse<RoadmapData>(response.text, 'generateCareerRoadmap');
};

// Fix: Add explicit return type Promise<SkillGapData>
export const analyzeSkillGap = async (currentSkills: string[], desiredRole: string): Promise<SkillGapData> => {
    const prompt = `Analyze the skill gap for a professional wanting to become a "${desiredRole}".
    Their current skills are: ${currentSkills.join(', ')}.
    
    Provide a personalized, step-by-step learning plan. Include suggestions for online courses or tutorials.
    Structure the output as a JSON object.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    learningPlan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                step: { type: Type.INTEGER },
                                action: { type: Type.STRING },
                                resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        }
                    }
                }
            }
        }
    });
    // Fix: Use generic type with parseJsonResponse
    return parseJsonResponse<SkillGapData>(response.text, 'analyzeSkillGap');
};


// Fix: Add explicit return type Promise<ResumeAnalysisResult>
export const analyzeResume = async (resumeText: string, jobDescription?: string): Promise<ResumeAnalysisResult> => {
    const prompt = `Analyze the following resume.
    Resume Text: "${resumeText}"
    ${jobDescription ? `Job Description: "${jobDescription}"` : ''}

    Provide a percentage match score (if a job description is provided) and a detailed report with actionable feedback on formatting, keywords, and content.
    Structure the output as a JSON object.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    matchScore: { type: Type.NUMBER, description: "Only if job description is present" },
                    feedback: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                area: { type: Type.STRING },
                                comment: { type: Type.STRING },
                                suggestion: { type: Type.STRING },
                            }
                        }
                    }
                }
            }
        }
    });
    // Fix: Use generic type with parseJsonResponse
    return parseJsonResponse<ResumeAnalysisResult>(response.text, 'analyzeResume');
};

// Fix: Add explicit return type Promise<ProjectIdea[]>
export const generateProjectIdeas = async (profile: UserProfile): Promise<ProjectIdea[]> => {
    const prompt = `Based on the user's skills (${profile.skills.join(', ')}) and desired career path (${profile.careerAspirations}), generate 3 practical and impressive project ideas.
    For each suggestion, include a project title, a clear description, and a list of key skills the project would showcase.
    Structure the output as a JSON object.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        skillsShowcased: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        }
    });
    // Fix: Use generic type with parseJsonResponse
    return parseJsonResponse<ProjectIdea[]>(response.text, 'generateProjectIdeas');
};

// Fix: Add explicit return type Promise<NetworkingData>
export const getNetworkingRecommendations = async (profile: UserProfile): Promise<NetworkingData> => {
    const prompt = `Based on the user's interests (${profile.interests.join(', ')}) and career aspirations (${profile.careerAspirations}), provide networking recommendations.
    Suggest influential people to follow, relevant online communities to join, and industry events to attend.
    Also, provide a pre-written, customizable template for a professional connection request message (e.g., for LinkedIn).
    Structure the output as a JSON object.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    influencers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    communities: { type: Type.ARRAY, items: { type: Type.STRING } },
                    events: { type: Type.ARRAY, items: { type: Type.STRING } },
                    connectionTemplate: { type: Type.STRING }
                }
            }
        }
    });
    // Fix: Use generic type with parseJsonResponse
    return parseJsonResponse<NetworkingData>(response.text, 'getNetworkingRecommendations');
};

export const createInterviewChat = (jobRole: string): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an expert interviewer conducting a mock interview for a ${jobRole} position. Ask relevant technical and behavioral questions one by one. After each user answer, provide brief, constructive feedback before asking the next question. Start the interview now with your first question.`
        },
    });
};

// Fix: Add explicit return type Promise<Quest[]>
export const generateCareerQuests = async (profile: UserProfile): Promise<Quest[]> => {
    const userLevel = profile.status === 'Student' && profile.yearOfStudy
        ? `a student in their ${profile.yearOfStudy}`
        : profile.status === 'Professional' && profile.yearsOfExperience
        ? `a professional with ${profile.yearsOfExperience} of experience`
        : 'an aspiring professional';

    const prompt = `Based on the user's profile, who is ${userLevel}, generate a list of 5-7 actionable "quests" for their career development. Tailor the difficulty of the quests to their experience level.
    
    User Profile:
    - Skills: ${profile.skills.join(', ')}
    - Aspirations: ${profile.careerAspirations}

    Each quest should be a clear, completable task.
    Categorize quests into areas like 'Skill Development', 'Portfolio Building', 'Networking', and 'Job Readiness'.
    For each quest, provide a title, a short description, an XP (Experience Points) value between 50 and 250, and a difficulty level ('Beginner', 'Intermediate', or 'Advanced').
    Structure the output as a JSON object.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique ID for the quest, e.g., 'skill-python-1'" },
                        category: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        xp: { type: Type.INTEGER },
                        difficulty: { type: Type.STRING, description: "The difficulty of the quest: 'Beginner', 'Intermediate', or 'Advanced'." }
                    }
                }
            }
        }
    });
    // Fix: Use generic type with parseJsonResponse
    return parseJsonResponse<Quest[]>(response.text, 'generateCareerQuests');
};

export interface SkillMapResult {
    analysis: SkillMapAnalysis;
    sources: any[];
}

export const generateCompanySkillMap = async (profile: UserProfile, companyName: string): Promise<SkillMapResult> => {
    const prompt = `Act as an expert career analyst. Use your search tool to find the top 10 most in-demand technical and soft skills for software engineering and related roles at "${companyName}" based on their recent job postings and company culture.
    Then, compare these required skills against the user's current skills provided below.
    User's Skills: ${profile.skills.join(', ')}

    Provide a summary of your findings.
    
    Respond ONLY with a single, valid JSON object. Do not include any text, markdown formatting, or explanations before or after the JSON object.
    The JSON object must have the following structure:
    {
      "companyName": "${companyName}",
      "requiredSkills": ["skill1", "skill2", ...],
      "matchedSkills": ["skill1", "skill2", ...],
      "missingSkills": ["skill1", "skill2", ...],
      "analysisSummary": "A brief summary of how the user's skills align with the company's needs and suggestions for improvement."
    }`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const analysis = parseJsonResponse<SkillMapAnalysis>(response.text, 'generateCompanySkillMap');
    return { analysis, sources };
};

// Fix: Add explicit return type Promise<FutureProofScoreData>
export const getFutureProofScore = async (profile: UserProfile): Promise<FutureProofScoreData> => {
    const prompt = `Act as a senior career analyst and futurist. Analyze the user's profile to determine how "future-proof" their skillset is for achieving their stated career aspirations, considering projected industry trends for the next 5-10 years.
    
    **Crucially, the score and analysis must heavily weigh the user's 'careerAspirations'. The primary goal is to assess their readiness for their desired career path, not just general future trends.**
    
    User's Profile:
    - Field of Study/Expertise: ${profile.fieldOfStudy}
    - Skills: ${profile.skills.join(', ')}
    - Career Aspirations: ${profile.careerAspirations}

    Provide a "Future-Proof Score" from 0 to 100, where 100 means their skillset is perfectly aligned with the future requirements of their aspired career.
    
    Provide a detailed analysis including:
    1.  A summary explaining the score, focusing on how their skills align with their career goals.
    2.  A list of their skills that are highly relevant and future-proof for their chosen career path.
    3.  A list of skills that might be less relevant or at risk within their aspired field.
    4.  A list of recommended emerging skills they should learn specifically to advance towards their career aspirations.

    Structure the output as a single JSON object.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.INTEGER, description: "A score from 0 to 100." },
                    summary: { type: Type.STRING, description: "A detailed summary explaining the score." },
                    futureProofSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "User's skills that are in high demand for the future." },
                    atRiskSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "User's skills that may become less relevant." },
                    recommendedSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Emerging skills the user should learn." }
                }
            }
        }
    });
    // Fix: Use generic type with parseJsonResponse
    return parseJsonResponse<FutureProofScoreData>(response.text, 'getFutureProofScore');
};

export const generateCareerSuggestions = async (profile: UserProfile): Promise<string[]> => {
    const prompt = `Based on the following user profile, generate 3-5 tailored career path suggestions. The suggestions should be concise, actionable, and directly related to their skills, interests, and especially their career aspirations.

    User Profile:
    - Skills: ${profile.skills.join(', ')}
    - Interests: ${profile.interests.join(', ')}
    - Career Aspirations: ${profile.careerAspirations}

    Return the suggestions as a JSON object with a single key "suggestions" containing an array of strings.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING, description: "A single career path suggestion." }
                    }
                }
            }
        }
    });
    const result = parseJsonResponse<{ suggestions: string[] }>(response.text, 'generateCareerSuggestions');
    return result.suggestions;
};

export const generateSkillEvolutionTimeline = async (profile: UserProfile): Promise<SkillEvolutionData[]> => {
    const prompt = `Act as a career development expert and futurist. Analyze the user's top 3-5 most important skills based on their profile and career aspirations. For each of these key skills, project its evolution and importance over the next 5 years.

    User Profile:
    - Field of Study/Expertise: ${profile.fieldOfStudy}
    - Skills: ${profile.skills.join(', ')}
    - Career Aspirations: ${profile.careerAspirations}

    For each skill, provide a timeline with projections for "Year 1", "Year 3", and "Year 5". The projection should include the expected proficiency level ('Novice', 'Intermediate', 'Advanced', 'Expert') the user should aim for and a brief reasoning for its importance at that stage.

    Structure the output as a JSON array of objects.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        skill: { type: Type.STRING, description: "The skill being analyzed." },
                        timeline: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    year: { type: Type.STRING, description: "The projected year, e.g., 'Year 1'" },
                                    projectedProficiency: { type: Type.STRING, description: "'Novice', 'Intermediate', 'Advanced', or 'Expert'" },
                                    reasoning: { type: Type.STRING, description: "Why this proficiency is important at this stage." },
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    return parseJsonResponse<SkillEvolutionData[]>(response.text, 'generateSkillEvolutionTimeline');
};

export const analyzePitchVideo = async (videoBase64: string, mimeType: string): Promise<PitchAnalysisResult> => {
    const prompt = `As an expert communication coach, analyze this video of a person delivering an elevator pitch. Provide a detailed, constructive analysis focusing on three key areas:
    
    1.  **Content & Clarity**: Transcribe the speech. Evaluate the clarity, conciseness, and impact of the message. Is it compelling? Does it clearly state who they are, what they do, and what they want?
    2.  **Vocal Delivery**: Assess their tone, pace, and volume. Do they sound confident, nervous, or monotone? Is the pacing effective?
    3.  **Visual Presence**: Analyze their body language, eye contact (with the camera), posture, and any gestures. Do they appear engaged and professional?
    
    For each area, provide specific feedback and a list of actionable suggestions for improvement. Structure your response as a single, valid JSON object.`;

    const videoPart = {
        inlineData: {
            data: videoBase64,
            mimeType: mimeType,
        },
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [videoPart, { text: prompt }] },
    });

    return parseJsonResponse<PitchAnalysisResult>(response.text, 'analyzePitchVideo');
};

export interface LearningHubResult {
    resources: LearningHubData;
    sources: any[];
}

export const getLearningResources = async (profile: UserProfile, skill: string): Promise<LearningHubResult> => {
    const prompt = `Act as an expert learning and development advisor. Use your search tool to find the best, most reputable, and up-to-date learning resources for the skill: "${skill}".

    The user's profile is:
    - Status: ${profile.status}
    ${profile.status === 'Student' ? `- Year of Study: ${profile.yearOfStudy}` : `- Years of Experience: ${profile.yearsOfExperience}`}
    - Interests: ${profile.interests.join(', ')}

    Tailor your recommendations to be appropriate for the user's experience level. For example, recommend beginner-friendly resources if they are a student, or more advanced content for an experienced professional.

    Find 2-3 resources for each of the following categories:
    1.  Top Articles (from blogs, publications, official documentation)
    2.  Recommended Videos (from platforms like YouTube, Vimeo, etc.)
    3.  Suggested Courses (from platforms like Coursera, Udemy, edX, or free course providers)

    For each resource, provide a title, a direct link, and a brief, one-sentence summary explaining why it's a valuable resource for this user learning this skill.

    Respond ONLY with a single, valid JSON object. Do not include any text, markdown formatting, or explanations before or after the JSON object.
    The JSON object must have the following structure:
    {
      "articles": [ { "title": "...", "link": "...", "summary": "..." }, ... ],
      "videos": [ { "title": "...", "link": "...", "summary": "..." }, ... ],
      "courses": [ { "title": "...", "link": "...", "summary": "..." }, ... ]
    }`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const resources = parseJsonResponse<LearningHubData>(response.text, 'getLearningResources');
    return { resources, sources };
};