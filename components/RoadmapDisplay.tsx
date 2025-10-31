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
    ExternalLinkIcon
} from './icons';

// Make Prism available on the window object for TypeScript
declare global {
    interface Window {
        Prism: {
            highlightAll: () => void;
        };
    }
}

interface RoadmapDisplayProps {
  roadmap: Roadmap;
  onBack: () => void;
}

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    HTML: HtmlIcon,
    CSS: CssIcon,
    JavaScript: JavaScriptIcon,
    React: ReactIcon,
    Python: PythonIcon,
    Database: DatabaseIcon,
    Backend: CodeIcon, // Re-using CodeIcon for 'Backend'
    Career: CareerIcon,
    Default: CodeIcon // Fallback icon
};

const getIcon = (iconName: string) => {
    return iconMap[iconName.trim()] || iconMap.Default;
};

// A simple utility to escape HTML and convert markdown code snippets to elements Prism can highlight.
const renderMarkdown = (markdown: string | undefined) => {
    if (!markdown) return { __html: '' };
    
    // Basic HTML escaping
    const escapeHtml = (unsafe: string) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // 1. Process code blocks ```lang\ncode\n```
    let html = markdown.replace(/```(\w+)?\n([\s\S]+?)\n```/g, (_match, lang, code) => {
        const language = lang || 'javascript'; // default language
        const escapedCode = escapeHtml(code);
        return `<pre class="line-numbers"><code class="language-${language}">${escapedCode}</code></pre>`;
    });

    // 2. Process inline code `code`
    html = html.replace(/`([^`]+)`/g, (_match, code) => {
        const escapedCode = escapeHtml(code);
        // Using a generic language class for inline snippets
        return `<code class="language-text">${escapedCode}</code>`;
    });
    
    // 3. Process bold text **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    return { __html: html };
};


const SkillItem: React.FC<{ skill: Skill }> = ({ skill }) => (
    <div className="p-4 bg-[var(--background)] rounded-md border border-[var(--card-border)] not-first:mt-3">
        <h4 className="font-semibold text-[var(--primary)]">{skill.name}</h4>
        <div 
            className="text-sm text-[var(--muted-foreground)] mt-1 prose"
            dangerouslySetInnerHTML={renderMarkdown(skill.description)} 
        />
    </div>
);

const CardContent: React.FC<{ phase: Phase }> = ({ phase }) => (
    <>
      <h3 className="mb-3 font-bold text-[var(--foreground)] text-xl">{phase.title}</h3>
      <p className="text-sm leading-snug tracking-wide text-[var(--muted-foreground)] mb-4">{phase.description}</p>
      <div>
        {phase.skills.map(skill => (
          <SkillItem key={skill.name} skill={skill} />
        ))}
      </div>
    </>
);

const PhaseCard: React.FC<{ phase: Phase, isOdd: boolean }> = ({ phase, isOdd }) => (
    <div className="relative mb-8 md:flex md:justify-between md:items-center w-full">
        {/* Mobile Layout */}
        <div className="md:hidden flex items-start w-full">
            <div className="z-20 flex-shrink-0 w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center absolute left-0 top-0 -translate-x-1/2">
                <h1 className="font-bold text-lg text-white">{phase.phase}</h1>
            </div>
            <div className="bg-[var(--card-background)] rounded-lg shadow-xl px-6 py-4 border border-[var(--card-border)] w-full ml-10">
                <CardContent phase={phase} />
            </div>
        </div>

        {/* Desktop Layout */}
        <div className={`hidden md:flex w-full items-center ${isOdd ? 'flex-row-reverse' : ''}`}>
            {/* Spacer */}
            <div className="w-[calc(50%-3rem)]"></div>

            {/* Dot */}
            <div className="z-20 flex-shrink-0 w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <h1 className="font-bold text-lg text-white">{phase.phase}</h1>
            </div>

            {/* Card */}
            <div className={`bg-[var(--card-background)] rounded-lg shadow-xl px-6 py-4 border border-[var(--card-border)] w-[calc(50%-3rem)]`}>
                <CardContent phase={phase} />
            </div>
        </div>
    </div>
);


const CourseItem: React.FC<{ course: Course; isExpanded: boolean; onClick: () => void }> = ({ course, isExpanded, onClick }) => {
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
                    <ChevronDownIcon className={`w-5 h-5 text-[var(--muted-foreground)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
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


const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ roadmap, onBack }) => {
  const [expandedCourseIndex, setExpandedCourseIndex] = useState<number | null>(null);

  useEffect(() => {
    // Run Prism highlighting after the component has rendered with the new roadmap data.
    // Use a timeout to ensure the DOM is fully updated before Prism runs.
    if (roadmap) {
        const timer = setTimeout(() => {
            if(window.Prism) {
                window.Prism.highlightAll();
            }
        }, 0);
        return () => clearTimeout(timer);
    }
  }, [roadmap]);

  const handleToggleCourse = (index: number) => {
    setExpandedCourseIndex(expandedCourseIndex === index ? null : index);
  };

  return (
    <div className="fade-in">
        <button
            onClick={onBack}
            className="flex items-center gap-2 mb-8 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
        >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Choose a different path</span>
        </button>

        <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] mb-2">{roadmap.careerPath}</h2>
            <p className="max-w-3xl mx-auto text-[var(--muted-foreground)]">{roadmap.introduction}</p>
        </div>

        <div className="relative wrap overflow-hidden p-2 sm:p-10">
            <div className="absolute border-opacity-20 border-[var(--card-border)] h-full border-2 left-6 md:left-1/2"></div>
            {roadmap.phases.map((phase, index) => (
                <PhaseCard key={phase.phase} phase={phase} isOdd={index % 2 !== 0} />
            ))}
        </div>
        
        {roadmap.courses && roadmap.courses.length > 0 && (
          <div className="mt-16 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-center text-[var(--foreground)] mb-8">Recommended Courses</h3>
              <div className="space-y-3">
                  {roadmap.courses.map((course, index) => (
                      <CourseItem 
                          key={index} 
                          course={course}
                          isExpanded={expandedCourseIndex === index}
                          onClick={() => handleToggleCourse(index)}
                      />
                  ))}
              </div>
          </div>
        )}

        <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">Conclusion & Next Steps</h3>
            <p className="max-w-3xl mx-auto text-[var(--muted-foreground)] leading-relaxed">{roadmap.conclusion}</p>
        </div>

        <style>{`
            .fade-in {
                animation: fadeIn 0.5s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .prose code {
                color: var(--primary);
                background-color: var(--card-background);
                padding: 0.125rem 0.25rem;
                border-radius: 0.25rem;
                font-size: 0.9em;
            }
            .prose strong {
                color: var(--foreground);
            }
        `}</style>
    </div>
  );
};

export default RoadmapDisplay;