import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap } from '../types';

// allow using process.env in browser build without @types/node
declare const process: any;

// Read API key securely from environment variable
const API_KEY=import.meta.env.VITE_GEMINI_API_KEY;


if (!API_KEY) {
  throw new Error("REACT_APP_GEMINI_API_KEY environment variable not found.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    careerPath: { type: Type.STRING },
    introduction: { type: Type.STRING },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phase: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['name', 'description'],
            },
          },
        },
        required: ['phase', 'title', 'description', 'skills'],
      },
    },
    courses: {
      type: Type.ARRAY,
      description: "A list of recommended courses for this career path.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the course." },
          platform: { type: Type.STRING, description: "The platform offering the course (e.g., Coursera, Udemy, freeCodeCamp)." },
          description: { type: Type.STRING, description: "A brief description of what the course covers." },
          icon: { type: Type.STRING, description: "An icon name that best represents the course. Choose from: HTML, CSS, JavaScript, React, Python, Database, Backend, Career." },
          link: { type: Type.STRING, description: "A valid, direct URL to the course page." },
          isFree: { type: Type.BOOLEAN, description: "Whether the course is free (true) or paid (false)." }
        },
        required: ['name', 'platform', 'description', 'icon', 'link', 'isFree']
      }
    },
    conclusion: { type: Type.STRING },
  },
  required: ['careerPath', 'introduction', 'phases', 'conclusion', 'courses'],
};


export const generateRoadmap = async (careerPath: string): Promise<Roadmap> => {
  const prompt = `
    Generate a detailed, step-by-step career roadmap for an aspiring ${careerPath}.
    The roadmap should be structured into logical phases, starting from absolute fundamentals and progressing to advanced, job-ready skills.

    For each phase, provide:
    - A clear title.
    - A brief description of its goal.
    - A list of key skills, technologies, or concepts to learn.

    For each skill, provide:
    - A concise description explaining its importance in the context of the career path.
    - Where appropriate, include a small, simple code snippet using Markdown format (e.g., \`\`\`javascript\nconsole.log('Hello');\n\`\`\`) to illustrate the concept.

    Additionally, generate a list of 8-10 recommended online courses relevant to this roadmap. Include a mix of FREE and PAID courses. For each course, provide:
    1. The course name.
    2. The platform (e.g., freeCodeCamp, Coursera, Udemy, YouTube, Khan Academy).
    3. A brief description of what the course covers.
    4. A relevant icon name from the following list: 'HTML', 'CSS', 'JavaScript', 'React', 'Python', 'Database', 'Backend', 'Career'.
    5. A valid, direct URL to access the course.
    6. isFree: true for free courses, false for paid courses.

    Please include at least 4-5 FREE courses (from platforms like freeCodeCamp, YouTube, Khan Academy, etc.) and 3-5 PAID courses (from Udemy, Coursera, etc.).

    Ensure the output is comprehensive and practical for a beginner.
  `;

  const systemInstruction = "You are a senior career advisor in the tech industry. Your task is to generate comprehensive, structured career roadmaps for aspiring tech professionals. Respond only with the requested JSON object based on the provided schema.";

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: roadmapSchema,
      temperature: 0.7,
    },
  });

  const jsonText = (response.text?.trim()) ?? '';
  try {
    const roadmapData = JSON.parse(jsonText);
    return roadmapData;
  } catch(e) {
    console.error("Failed to parse JSON response:", jsonText);
    throw new Error("The AI returned an invalid response format.");
  }
};

// Chat message interface
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Generate chat response for technical questions
export const generateChatResponse = async (
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  const systemInstruction = `You are a helpful technical assistant for the Smart Career Pathfinder platform. 
    Your role is to answer technical questions related to:
    - Programming languages (JavaScript, Python, React, etc.)
    - Web development (frontend, backend, full-stack)
    - Data science and AI/ML concepts
    - Career guidance in tech
    - Learning resources and best practices
    
    Provide clear, concise, and accurate answers. When appropriate, include code examples using markdown code blocks.
    Be encouraging and supportive, especially for beginners. If you don't know something, admit it rather than guessing.`;

  // Build conversation context
  const conversationContext = conversationHistory
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = conversationHistory.length > 0
    ? `${conversationContext}\n\nUser: ${message}\nAssistant:`
    : `User: ${message}\nAssistant:`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    return response.text?.trim() || 'Sorry, I could not generate a response. Please try again.';
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Failed to get response from the AI. Please try again later.');
  }
};