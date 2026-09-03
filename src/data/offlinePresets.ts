import { CVData, defaultSectionOrder, studentSectionOrder } from '../types';

export interface CareerPreset {
  id: string;
  name: string;
  roleTitle: string;
  type: 'professional' | 'student';
  badge: string;
  summary: string;
  data: Partial<CVData>;
}

export const offlinePresets: CareerPreset[] = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    roleTitle: 'Full-Stack Software Engineer',
    type: 'professional',
    badge: 'Tech & Engineering',
    summary: 'High-impact full stack developer with modern web apps, cloud microservices, and clean architecture experience.',
    data: {
      fullName: 'Alex Morgan',
      title: 'Senior Full-Stack Software Engineer',
      summary: 'Results-driven software engineer with 5+ years of experience designing, developing, and deploying scalable distributed web systems. Proficient in TypeScript, React, Node.js, and cloud architectures, driving 35% latency reduction and leading cross-functional sprint teams.',
      contact: {
        email: 'alex.morgan.dev@example.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alexmorgan-dev',
        portfolio: 'github.com/alexmorgan-code',
      },
      skills: [
        {
          id: 'sk-1',
          category: 'Languages & Frameworks',
          items: ['TypeScript', 'JavaScript (ES6+)', 'React 19', 'Next.js', 'Node.js', 'Python', 'Tailwind CSS', 'GraphQL'],
        },
        {
          id: 'sk-2',
          category: 'Cloud & DevOps',
          items: ['Docker', 'Kubernetes', 'AWS (Lambda, S3, CloudFront)', 'CI/CD Pipelines', 'Terraform', 'PostgreSQL', 'Redis'],
        },
        {
          id: 'sk-3',
          category: 'Methodologies & Testing',
          items: ['System Design', 'RESTful APIs', 'Jest / Vitest', 'TDD', 'Agile / Scrum', 'Microservices'],
        },
      ],
      experience: [
        {
          id: 'exp-1',
          company: 'Nexus Cloud Technologies',
          role: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          startDate: '2022-03',
          endDate: 'Present',
          current: true,
          description: 'Spearheaded the redesign of core customer checkout pipeline, migrating legacy monolith services to event-driven serverless architecture. Reduced checkout failure rates by 42% and supported 2M+ monthly active transactions.',
        },
        {
          id: 'exp-2',
          company: 'Vertex Digital Solutions',
          role: 'Full-Stack Developer',
          location: 'Austin, TX',
          startDate: '2019-06',
          endDate: '2022-02',
          current: false,
          description: 'Engineered real-time collaboration dashboards using React, WebSockets, and Node.js. Optimized database query performance and indexing, achieving 60% faster page render times for enterprise clients.',
        },
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science in Computer Science',
          fieldOfStudy: 'Computer Science & Distributed Systems',
          location: 'Berkeley, CA',
          startDate: '2015-09',
          endDate: '2019-05',
          gpa: '3.82',
          honors: 'Dean\'s Honor List, Magna Cum Laude',
        },
      ],
      projects: [
        {
          id: 'proj-1',
          title: 'HyperMetrics — Real-Time API Telemetry',
          role: 'Lead Architect & Creator',
          link: 'https://github.com/alexmorgan/hyper-metrics',
          startDate: '2023-01',
          endDate: '2023-08',
          description: 'Constructed an open-source lightweight distributed telemetry dashboard capturing sub-millisecond p99 latency metrics across 50+ microservices.',
        },
        {
          id: 'proj-2',
          title: 'CanvasFlow — Interactive Workflow Visualizer',
          role: 'Frontend Developer',
          link: 'https://github.com/alexmorgan/canvas-flow',
          startDate: '2022-05',
          endDate: '2022-11',
          description: 'Built an interactive visual graph editor enabling non-technical teams to compose automated event triggers with 60fps canvas performance.',
        },
      ],
      certifications: [
        {
          id: 'cert-1',
          name: 'AWS Certified Solutions Architect – Associate',
          issuer: 'Amazon Web Services',
          date: '2023-04',
          credentialId: 'AWS-CSA-892110',
        },
      ],
      achievements: [
        {
          id: 'ach-1',
          title: 'First Place — Global Cloud Hackathon 2023',
          issuer: 'Cloud Innovation Summit',
          date: '2023-11',
          description: 'Developed an automated offline-first edge syncing engine selected #1 among 300+ international engineering teams.',
        },
      ],
      languages: [
        { id: 'lang-1', language: 'English', proficiency: 'Native / Bilingual' },
        { id: 'lang-2', language: 'Spanish', proficiency: 'Professional Working' },
      ],
      sectionOrder: defaultSectionOrder,
      userType: 'professional',
      templateId: 'modern-clean',
    },
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    roleTitle: 'Senior Technical Product Manager',
    type: 'professional',
    badge: 'Product & Strategy',
    summary: 'Data-driven Product Manager specializing in SaaS roadmap execution, customer discovery, and conversion optimization.',
    data: {
      fullName: 'Sarah Jenkins',
      title: 'Senior Product Manager',
      summary: 'Product leader with 6+ years of track record taking B2B and consumer SaaS products from zero-to-one and scaling user adoption. Expert in roadmapping, metrics tracking (PLG), user research, and cross-functional alignment between design, engineering, and sales.',
      contact: {
        email: 'sarah.jenkins.pm@example.com',
        phone: '+1 (555) 345-6789',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/sarahjenkins-pm',
        portfolio: 'sarahjenkins.productportfolio.io',
      },
      skills: [
        {
          id: 'sk-pm-1',
          category: 'Product Strategy',
          items: ['Product-Led Growth (PLG)', '0-to-1 Product Delivery', 'Customer Journey Mapping', 'A/B Testing & Experimentation', 'User Discovery', 'Competitive Moats'],
        },
        {
          id: 'sk-pm-2',
          category: 'Analytics & Tools',
          items: ['Mixpanel', 'Amplitude', 'SQL Data Analysis', 'Jira / Confluence', 'Figma', 'Tableau', 'Google Analytics'],
        },
      ],
      experience: [
        {
          id: 'exp-pm-1',
          company: 'Acuity SaaS Enterprise',
          role: 'Lead Product Manager',
          location: 'New York, NY',
          startDate: '2021-08',
          endDate: 'Present',
          current: true,
          description: 'Drove product vision for enterprise analytics platform. Improved quarterly onboarding funnel conversion from 18% to 34% by designing interactive workflow templates and reduced customer churn by 22%.',
        },
        {
          id: 'exp-pm-2',
          company: 'PulseMobile Tech',
          role: 'Product Manager',
          location: 'Boston, MA',
          startDate: '2018-06',
          endDate: '2021-07',
          current: false,
          description: 'Managed squad of 8 engineers and 2 product designers. Shipped new team collaboration features that grew monthly active users (MAU) from 120k to 450k within 18 months.',
        },
      ],
      education: [
        {
          id: 'edu-pm-1',
          institution: 'New York University, Stern School of Business',
          degree: 'Bachelor of Science in Business Management & Information Systems',
          fieldOfStudy: 'Product Management & Analytics',
          location: 'New York, NY',
          startDate: '2014-09',
          endDate: '2018-05',
          gpa: '3.78',
        },
      ],
      projects: [
        {
          id: 'proj-pm-1',
          title: 'Enterprise Growth Experimentation Engine',
          role: 'Product Lead',
          link: '',
          startDate: '2022-02',
          endDate: '2022-10',
          description: 'Formulated and ran 40+ iterative growth experiments leading to $1.8M ARR expansion in annual seat license upgrades.',
        },
      ],
      certifications: [
        {
          id: 'cert-pm-1',
          name: 'Certified Scrum Product Owner (CSPO)',
          issuer: 'Scrum Alliance',
          date: '2021-02',
        },
      ],
      achievements: [
        {
          id: 'ach-pm-1',
          title: 'Product Innovation Award 2022',
          issuer: 'Acuity SaaS Enterprise',
          date: '2022-12',
          description: 'Recognized for top quarterly customer satisfaction score across 6 core product verticals.',
        },
      ],
      languages: [
        { id: 'lang-pm-1', language: 'English', proficiency: 'Native' },
        { id: 'lang-pm-2', language: 'French', proficiency: 'Conversational' },
      ],
      sectionOrder: defaultSectionOrder,
      userType: 'professional',
      templateId: 'minimalist-executive',
    },
  },
  {
    id: 'student-intern',
    name: 'Student / Graduate Fresher',
    roleTitle: 'Computer Science Undergraduate & Aspiring Engineer',
    type: 'student',
    badge: 'Entry-Level & College',
    summary: 'Tailored for university students, recent graduates, or interns prioritizing coursework, campus leadership, and academic projects.',
    data: {
      fullName: 'David Lin',
      title: 'Computer Science Undergraduate & Software Intern',
      summary: 'Ambitious, honors Computer Science senior with strong foundational knowledge in algorithms, data structures, and web technologies. Experienced in collaborative campus software projects, open-source contributions, and hackathons. Seeking full-time software engineering graduate opportunities.',
      contact: {
        email: 'david.lin.cs@university.edu',
        phone: '+1 (555) 456-7890',
        location: 'Seattle, WA',
        linkedin: 'linkedin.com/in/davidlin-cs',
        portfolio: 'github.com/davidlin-stem',
      },
      education: [
        {
          id: 'edu-st-1',
          institution: 'University of Washington',
          degree: 'Bachelor of Science in Computer Science',
          fieldOfStudy: 'Software Systems & Machine Learning',
          location: 'Seattle, WA',
          startDate: '2022-09',
          endDate: '2026-06',
          gpa: '3.91',
          honors: 'Dean\'s List (All Semesters), Association for Computing Machinery (ACM) Member',
        },
      ],
      projects: [
        {
          id: 'proj-st-1',
          title: 'CampusStudy — Peer Collaboration Hub',
          role: 'Full-Stack Developer (Academic Capstone)',
          link: 'https://github.com/davidlin-stem/campus-study',
          startDate: '2024-09',
          endDate: '2025-01',
          description: 'Built a responsive web application for 1,200+ university students to form study groups and share course summaries with local caching support.',
        },
        {
          id: 'proj-st-2',
          title: 'Algorithmic Trading Backtester',
          role: 'Independent Researcher',
          link: 'https://github.com/davidlin-stem/algo-backtester',
          startDate: '2024-02',
          endDate: '2024-05',
          description: 'Developed high-throughput Python engine evaluating moving average crossover strategies against 10 years of historical equities data.',
        },
      ],
      skills: [
        {
          id: 'sk-st-1',
          category: 'Programming & Web',
          items: ['Python', 'Java', 'C++', 'JavaScript / TypeScript', 'React', 'HTML5/CSS3', 'Git / GitHub', 'SQL'],
        },
        {
          id: 'sk-st-2',
          category: 'Core Competencies',
          items: ['Data Structures & Algorithms', 'Object-Oriented Design', 'Database Fundamentals', 'Linux/Unix Shell', 'REST APIs'],
        },
      ],
      experience: [
        {
          id: 'exp-st-1',
          company: 'Krypton Software Labs',
          role: 'Software Engineering Intern',
          location: 'Seattle, WA',
          startDate: '2024-06',
          endDate: '2024-08',
          current: false,
          description: 'Contributed to internal automated unit-testing suites for client customer portals. Authored 85+ end-to-end integration tests, boosting test coverage from 68% to 89%.',
        },
        {
          id: 'exp-st-2',
          company: 'University of Washington CSE Dept.',
          role: 'Undergraduate Teaching Assistant (CS 143)',
          location: 'Seattle, WA',
          startDate: '2023-09',
          endDate: '2024-05',
          current: false,
          description: 'Conducted weekly lab review sessions and office hours for 60+ students covering recursive backtracking, binary search trees, and dynamic arrays.',
        },
      ],
      extracurriculars: [
        {
          id: 'extra-st-1',
          activityName: 'President & Workshop Coordinator',
          organization: 'University Hackers Club',
          role: 'Executive Officer',
          startDate: '2023-09',
          endDate: 'Present',
          description: 'Organized 12 interactive workshops on git workflows, web dev basics, and resume prep for over 250 student attendees.',
        },
      ],
      certifications: [
        {
          id: 'cert-st-1',
          name: 'Meta Front-End Developer Professional Certificate',
          issuer: 'Coursera / Meta',
          date: '2023-12',
        },
      ],
      achievements: [
        {
          id: 'ach-st-1',
          title: 'Top 5 Finalist — DubHacks 2024',
          issuer: 'DubHacks University Hackathon',
          date: '2024-10',
          description: 'Constructed an offline-ready accessibility reader for dyslexic learners within 24 hours.',
        },
      ],
      languages: [
        { id: 'lang-st-1', language: 'English', proficiency: 'Native' },
        { id: 'lang-st-2', language: 'Mandarin Chinese', proficiency: 'Fluent' },
      ],
      sectionOrder: studentSectionOrder,
      userType: 'student',
      templateId: 'academic-clean',
    },
  },
  {
    id: 'marketing-strategist',
    name: 'Marketing Specialist',
    roleTitle: 'Growth Marketing & Brand Specialist',
    type: 'professional',
    badge: 'Marketing & Growth',
    summary: 'Specialized in customer acquisition, digital campaigns, content SEO, and brand storytelling across digital channels.',
    data: {
      fullName: 'Maya Patel',
      title: 'Senior Growth & Brand Marketer',
      summary: 'Dynamic digital marketing specialist with 5+ years driving multi-channel growth campaigns, brand awareness, and organic funnel acquisition. Proven history growing brand audience by 140% YoY and managing $500k+ annual performance budgets.',
      contact: {
        email: 'maya.patel.growth@example.com',
        phone: '+1 (555) 678-9012',
        location: 'Chicago, IL',
        linkedin: 'linkedin.com/in/mayapatel-marketing',
        portfolio: 'mayapatel.creativeshowcase.com',
      },
      skills: [
        {
          id: 'sk-mkt-1',
          category: 'Acquisition & Digital',
          items: ['SEO / SEM', 'Google Ads', 'Meta Ad Manager', 'Email Automation (Klaviyo, HubSpot)', 'Content Marketing', 'Conversion Rate Optimization (CRO)'],
        },
        {
          id: 'sk-mkt-2',
          category: 'Analytics & Creative',
          items: ['Google Analytics 4', 'A/B Testing', 'Canva & Figma', 'Copywriting', 'Brand Guidelines', 'Social Media Strategy'],
        },
      ],
      experience: [
        {
          id: 'exp-mkt-1',
          company: 'Elevation Media Agency',
          role: 'Senior Growth Marketing Manager',
          location: 'Chicago, IL',
          startDate: '2022-01',
          endDate: 'Present',
          current: true,
          description: 'Orchestrated paid search and programmatic social campaigns across 12 high-growth brands. Reduced blended customer acquisition cost (CAC) by 28% while accelerating return on ad spend (ROAS) to 4.2x.',
        },
        {
          id: 'exp-mkt-2',
          company: 'BrightWave Retail',
          role: 'Digital Marketing Specialist',
          location: 'Minneapolis, MN',
          startDate: '2019-04',
          endDate: '2021-12',
          current: false,
          description: 'Managed editorial calendar and organic blog publications generating 350k+ monthly impressions. Spearheaded automated welcome email sequences improving retention by 19%.',
        },
      ],
      education: [
        {
          id: 'edu-mkt-1',
          institution: 'Northwestern University',
          degree: 'Bachelor of Arts in Communications & Integrated Marketing',
          fieldOfStudy: 'Digital Media & Strategic Communications',
          location: 'Evanston, IL',
          startDate: '2015-09',
          endDate: '2019-06',
          gpa: '3.75',
        },
      ],
      projects: [
        {
          id: 'proj-mkt-1',
          title: 'Direct-to-Consumer Rebrand & Product Launch',
          role: 'Campaign Lead',
          link: '',
          startDate: '2023-03',
          endDate: '2023-09',
          description: 'Designed comprehensive omni-channel launch strategy resulting in $420k revenue in the first 30 days post-launch.',
        },
      ],
      certifications: [
        {
          id: 'cert-mkt-1',
          name: 'Google Analytics 4 Certification',
          issuer: 'Google Digital Academy',
          date: '2023-05',
        },
        {
          id: 'cert-mkt-2',
          name: 'HubSpot Inbound Marketing Certified',
          issuer: 'HubSpot Academy',
          date: '2022-08',
        },
      ],
      achievements: [
        {
          id: 'ach-mkt-1',
          title: 'Marketer of the Year 2023',
          issuer: 'Elevation Media Agency',
          date: '2023-12',
          description: 'Awarded for highest portfolio revenue retention and campaign efficiency.',
        },
      ],
      languages: [
        { id: 'lang-mkt-1', language: 'English', proficiency: 'Native' },
        { id: 'lang-mkt-2', language: 'Hindi', proficiency: 'Fluent' },
      ],
      sectionOrder: defaultSectionOrder,
      userType: 'professional',
      templateId: 'creative-split',
    },
  },
];
