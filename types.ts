export interface Skill {
  name: string;
  description: string;
}

export interface Phase {
  phase: number;
  title: string;
  description:string;
  skills: Skill[];
}

export interface Course {
  name: string;
  platform: string;
  description: string;
  icon: string;
  link: string;
}

export interface Roadmap {
  careerPath: string;
  introduction: string;
  phases: Phase[];
  conclusion: string;
  courses: Course[];
}