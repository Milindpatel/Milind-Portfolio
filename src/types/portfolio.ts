export interface Contact {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  location?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
  tech?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  period?: string;
  score?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  summary: string;
  contact: Contact;
  experience: Experience[];
  skills: SkillGroup[];
  education: Education[];
  certifications: string[];
  projects: Project[];
  lastUpdated: string;
}
