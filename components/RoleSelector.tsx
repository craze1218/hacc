import React, { useState, useEffect } from 'react';
import { Roadmap, Phase, Course, Skill } from '../types';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  CodeIcon,
  DatabaseIcon,
  HtmlIcon,
  CssIcon,
  JavaScriptIcon,
  ReactIcon,
  PythonIcon,
  CareerIcon,
  ExternalLinkIcon,
  MonitorIcon,
  ServerIcon,
  BarChartIcon,
  BrainIcon,
  LayersIcon,
} from './icons';

interface RoleSelectorProps {
  onSelectRole: (role: string) => Promise<void>;
  onBack: () => void;
  roadmap?: Roadmap;
}

// Icon map for skill/course icons
const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  HTML: HtmlIcon,
  CSS: CssIcon,
  JavaScript: JavaScriptIcon,
  React: ReactIcon,
  Python: PythonIcon,
  Database: DatabaseIcon,
  Backend: CodeIcon,
  Career: CareerIcon,
  Default: CodeIcon,
};

// Helper to get icon component by name
const getIcon = (iconName: string) => iconMap[iconName.trim()] || iconMap.Default;

// Functions to render skill, phase, and courses (unchanged for brevity)
const SkillItem: React.FC<{ skill: Skill }> = ({ skill }) => (
  <div className="p-4 bg-[var(--background)] rounded-md border border-[var(--card-border)] not-first:mt-3">
    <h4 className="font-semibold text-[var(--primary)]">{skill.name}</h4>
    <div
      className="text-sm text-[var(--muted-foreground)] mt-1 prose"
      dangerouslySetInnerHTML={{ __html: skill.description || '' }}
    />
  </div>
);

const CardContent: React.FC<{ phase: Phase }> = ({ phase }) => (
  <>
    <h3 className="mb-3 font-bold text-[var(--foreground)] text-xl">{phase.title}</h3>
    <p className="text-sm leading-snug tracking-wide text-[var(--muted-foreground)] mb-4">{phase.description}</p>
    <div>
      {phase.skills.map((skill: Skill) => (
        <SkillItem key={skill.name} skill={skill} />
      ))}
    </div>
  </>
);

const PhaseCard: React.FC<{ phase: Phase; isOdd: boolean }> = ({ phase, isOdd }) => (
  <div className="relative mb-8 md:flex md:justify-between md:items-center w-full">
    <div className="md:hidden flex items-start w-full">
      <div className="z-20 flex-shrink-0 w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center absolute left-0 top-0 -translate-x-1/2">
        <h1 className="font-bold text-lg text-white">{phase.phase}</h1>
      </div>
      <div className="bg-[var(--card-background)] rounded-lg shadow-xl px-6 py-4 border border-[var(--card-border)] w-full ml-10">
        <CardContent phase={phase} />
      </div>
    </div>
    <div className={`hidden md:flex w-full items-center ${isOdd ? 'flex-row-reverse' : ''}`}>
      <div className="w-[calc(50%-3rem)]"></div>
      <div className="z-20 flex-shrink-0 w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center">
        <h1 className="font-bold text-lg text-white">{phase.phase}</h1>
      </div>
      <div className={`bg-[var(--card-background)] rounded-lg shadow-xl px-6 py-4 border border-[var(--card-border)] w-[calc(50%-3rem)]`}>
        <CardContent phase={phase} />
      </div>
    </div>
  </div>
);

const CourseItem: React.FC<{ course: Course; isExpanded: boolean; onClick: () => void }> = ({
  course, isExpanded, onClick,
}) => {
  const Icon = getIcon(course.icon);
  return (
    <div className="rounded-md bg-[var(--card-background)] border border-[var(--card-border)] overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--card-border)] transition-colors duration-200"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <Icon className="w-6 h-6 text-[var(--muted-foreground)] flex-shrink-0" />
          <span className="font-semibold text-[var(--foreground)]">{course.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--muted-foreground)] hidden sm:block">{course.platform}</span>
          <ChevronDownIcon
            className={`w-5 h-5 text-[var(--muted-foreground)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-4 border-t border-[var(--card-border)]">
            <p className="text-[var(--card-foreground)] mb-4">{course.description}</p>
            <span className="text-sm text-[var(--muted-foreground)] mb-4 block sm:hidden">{course.platform}</span>
            <a
              href={course.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--primary)] bg-[var(--background)] rounded-md hover:bg-[var(--card-border)] transition-colors"
            >
              View Course
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Role configuration with icons
const roleConfig = [
  { name: 'Frontend Developer', icon: MonitorIcon, color: 'from-blue-500 to-cyan-500' },
  { name: 'Backend Developer', icon: ServerIcon, color: 'from-green-500 to-emerald-500' },
  { name: 'Full Stack Developer', icon: LayersIcon, color: 'from-orange-500 to-amber-500' },
  { name: 'Data Scientist', icon: BarChartIcon, color: 'from-purple-500 to-pink-500' },
  { name: 'AI Engineer', icon: BrainIcon, color: 'from-indigo-500 to-violet-500' },
];

// ----------- Main RoleSelector Component -----------
const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole, onBack, roadmap }) => {
  const [expandedCourseIndex, setExpandedCourseIndex] = useState<number | null>(null);

  // Support browser back button to navigate home
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      void e;
      if (roadmap) onBack();
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
    // Only depend on roadmap and onBack
  }, [roadmap, onBack]);

  const handleToggleCourse = (index: number) => setExpandedCourseIndex(expandedCourseIndex === index ? null : index);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {roadmap && (
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
      )}

      {!roadmap && (
        <div className="text-center mb-6">
          <span>Please select a role to see the roadmap.</span>
        </div>
      )}

      {roadmap ? (
        <>
          <h2 className="text-3xl font-bold mb-6 text-center text-[var(--foreground)]">{roadmap.careerPath}</h2>
          <div className="mb-10">
            {roadmap.phases.map((phase: Phase, index: number) => (
              <PhaseCard key={phase.phase} phase={phase} isOdd={index % 2 !== 0} />
            ))}
          </div>
          {roadmap.courses && roadmap.courses.length > 0 && (
            <div className="space-y-3">
              {roadmap.courses.map((course: Course, index: number) => (
                <CourseItem
                  key={index}
                  course={course}
                  isExpanded={expandedCourseIndex === index}
                  onClick={() => handleToggleCourse(index)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {roleConfig.map((role) => {
            const IconComponent = role.icon;
            return (
              <button
                key={role.name}
                onClick={() => {
                  onSelectRole(role.name);
                  window.history.pushState({}, '', '#roadmap');
                }}
                className="group relative overflow-hidden bg-[var(--card-background)] border border-[var(--card-border)] rounded-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-left"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role.color}`}></div>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-4 rounded-full bg-gradient-to-br ${role.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--foreground)] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--gradient-from)] group-hover:to-[var(--gradient-to)] transition-all duration-300">
                    {role.name}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Click to explore career path
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!roadmap && (
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-[var(--card-background)] border border-[var(--card-border)] rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 text-center">About Smart Career Pathfinder</h2>
            
            <div className="space-y-6 text-[var(--card-foreground)]">
              <div>
                <h3 className="text-xl font-semibold text-[var(--primary)] mb-3">What is Smart Career Pathfinder?</h3>
                <p className="leading-relaxed">
                  Smart Career Pathfinder is an AI-powered platform that helps you discover and navigate your ideal career path in technology. 
                  Whether you're just starting out or looking to transition into a new tech role, our intelligent system generates personalized 
                  learning roadmaps tailored to your chosen career direction. Using advanced AI technology, we create comprehensive guides that 
                  break down complex career paths into manageable phases, complete with essential skills, recommended courses, and actionable steps.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[var(--primary)] mb-3">How to Use This Website</h3>
                <ol className="list-decimal list-inside space-y-3 leading-relaxed">
                  <li>
                    <strong className="text-[var(--foreground)]">Choose Your Career Path:</strong> Browse through the available career roles 
                    (Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, or AI Engineer) and click on the one that 
                    interests you most.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Wait for AI Generation:</strong> Our AI system will analyze your selected 
                    career path and generate a comprehensive roadmap. This process typically takes a few seconds to a minute. Please be patient 
                    while the roadmap is being created.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Explore Your Roadmap:</strong> Once generated, you'll see a detailed roadmap 
                    organized into phases. Each phase includes:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Essential skills you need to learn</li>
                      <li>Detailed descriptions of each skill</li>
                      <li>Recommended courses from various learning platforms</li>
                      <li>Links to external resources</li>
                    </ul>
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Save Your Roadmap:</strong> If you're logged in, you can save your generated 
                    roadmaps for future reference. Access them anytime from the "My Roadmaps" section in the header.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Track Your Progress:</strong> Use the roadmap as a guide to track your learning 
                    journey. Click on course links to explore external resources, and work through each phase systematically.
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Ask Technical Questions:</strong> Need help with programming concepts or career advice? 
                    Click the chatbot button (message icon) in the bottom-right corner to get instant answers to your technical questions. Our AI assistant 
                    can help with coding problems, explain complex topics, provide learning resources, and offer career guidance.
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[var(--primary)] mb-3">Technical Assistant Chatbot</h3>
                <p className="leading-relaxed mb-3">
                  Our intelligent chatbot is your personal technical assistant available 24/7. Accessible via the floating message button in the bottom-right 
                  corner, it's designed to help you with a wide range of technical questions and learning needs.
                </p>
                <ul className="list-disc list-inside space-y-2 leading-relaxed">
                  <li>
                    <strong className="text-[var(--foreground)]">Programming Help:</strong> Get explanations for programming concepts, syntax, and best practices 
                    in languages like JavaScript, Python, React, and more
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Career Guidance:</strong> Receive advice on tech career paths, interview preparation, and skill development
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Learning Resources:</strong> Ask for recommendations on courses, tutorials, and learning materials
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Code Examples:</strong> Request code snippets and examples to better understand concepts
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Problem Solving:</strong> Get help debugging code, troubleshooting issues, and finding solutions
                  </li>
                  <li>
                    <strong className="text-[var(--foreground)]">Contextual Conversations:</strong> The chatbot remembers your conversation history, providing 
                    personalized and context-aware responses
                  </li>
                </ul>
                <p className="leading-relaxed mt-3 text-sm text-[var(--muted-foreground)]">
                  Simply click the chatbot icon, type your question, and receive detailed, helpful responses. You can minimize, close, or clear the chat 
                  conversation at any time. The chatbot supports markdown formatting for code blocks and provides clear, beginner-friendly explanations.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[var(--primary)] mb-3">Key Features</h3>
                <ul className="list-disc list-inside space-y-2 leading-relaxed">
                  <li><strong className="text-[var(--foreground)]">AI-Powered Generation:</strong> Each roadmap is uniquely generated using advanced AI technology</li>
                  <li><strong className="text-[var(--foreground)]">Structured Learning Paths:</strong> Clear phases that break down complex career goals into achievable steps</li>
                  <li><strong className="text-[var(--foreground)]">Comprehensive Resources:</strong> Curated list of courses and learning materials from trusted platforms</li>
                  <li><strong className="text-[var(--foreground)]">AI Technical Assistant:</strong> 24/7 chatbot support for instant answers to programming questions and career guidance</li>
                  <li><strong className="text-[var(--foreground)]">Save & Access Anytime:</strong> Save multiple roadmaps and revisit them whenever you need guidance</li>
                  <li><strong className="text-[var(--foreground)]">User-Friendly Interface:</strong> Clean, modern design with dark/light theme support for comfortable browsing</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--card-border)]">
                <p className="text-sm text-[var(--muted-foreground)] italic">
                  <strong className="text-[var(--foreground)]">Note:</strong> Roadmap generation may take up to a minute during peak usage times. 
                  If you encounter any issues, please try again later or refresh the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelector;
