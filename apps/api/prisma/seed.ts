import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── 1. Default Admin Author ────────────────────────────────
  console.log('👤 Seeding author...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@123', salt);

  const author = await prisma.author.upsert({
    where: { username: 'anuj' },
    update: {},
    create: {
      username: 'anuj',
      displayName: 'Anuj Yadav',
      email: 'anuj@example.com',
      passwordHash,
      bio: 'Full-Stack Developer & Systems Architect passionate about crafting high-performance, elegant web applications and robust distributed systems.',
      isAdmin: true,
      isEnabled: true,
    },
  });

  // ─── 2. Site Settings ───────────────────────────────────────
  console.log('⚙️ Seeding site settings...');
  const siteSettings = [
    {
      key: 'site_title',
      value: 'Anuj Yadav — Portfolio & Personal Platform',
      group: 'general',
    },
    {
      key: 'site_description',
      value: 'Full-Stack Developer, Open Source Contributor & Engineering Craftsperson.',
      group: 'general',
    },
    {
      key: 'site_url',
      value: 'http://localhost:3000',
      group: 'general',
    },
    {
      key: 'availability_status',
      value: 'available',
      group: 'general',
    },
    {
      key: 'default_seo_title',
      value: 'Anuj Yadav — Full-Stack Engineer & Architect',
      group: 'seo',
    },
    {
      key: 'default_seo_description',
      value: 'Explore the portfolio, projects, writing, and research of Anuj Yadav.',
      group: 'seo',
    },
    {
      key: 'robots_indexing_enabled',
      value: 'true',
      group: 'seo',
    },
    {
      key: 'twitter_handle',
      value: '@anujyadav',
      group: 'social',
    },
    {
      key: 'author_name',
      value: 'Anuj Yadav',
      group: 'general',
    },
    {
      key: 'author_email',
      value: 'anuj@example.com',
      group: 'general',
    },
    {
      key: 'author_job_title',
      value: 'Full-Stack Engineer & Architect',
      group: 'general',
    },
    {
      key: 'analytics_enabled',
      value: 'true',
      group: 'analytics',
    },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, group: setting.group },
      create: setting,
    });
  }

  // ─── 3. Homepage Sections ───────────────────────────────────
  console.log('🏠 Seeding homepage sections...');
  const homepageSections = [
    {
      sectionKey: 'hero',
      title: 'Hero Introduction',
      sortOrder: 0,
      isEnabled: true,
      config: { ctaPrimary: 'View Projects', ctaSecondary: 'Contact Me' },
    },
    {
      sectionKey: 'about',
      title: 'About Summary',
      sortOrder: 1,
      isEnabled: true,
      config: { showBio: true },
    },
    {
      sectionKey: 'skills',
      title: 'Technical Skills Matrix',
      sortOrder: 2,
      isEnabled: true,
      config: { displayMode: 'categorized' },
    },
    {
      sectionKey: 'featured_projects',
      title: 'Featured Works',
      sortOrder: 3,
      isEnabled: true,
      config: { limit: 4 },
    },
    {
      sectionKey: 'experience',
      title: 'Career & Experience',
      sortOrder: 4,
      isEnabled: true,
      config: { limit: 5 },
    },
    {
      sectionKey: 'latest_articles',
      title: 'Latest Writing & Research',
      sortOrder: 5,
      isEnabled: true,
      config: { limit: 3 },
    },
    {
      sectionKey: 'contact',
      title: 'Get In Touch',
      sortOrder: 6,
      isEnabled: true,
      config: { enableQuickForm: true },
    },
  ];

  for (const section of homepageSections) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: section.sectionKey },
      update: {
        title: section.title,
        sortOrder: section.sortOrder,
        isEnabled: section.isEnabled,
        config: section.config,
      },
      create: section,
    });
  }

  // ─── 4. Navigation Items ────────────────────────────────────
  console.log('🧭 Seeding navigation items...');

  // Clear existing nav items for a clean seed of the new rich structure
  await prisma.navItem.deleteMany({});

  // 1. Works & Engineering Dropdown (Parallel columns + Featured Bento Card + Footer Bar)
  const worksDropdown = await prisma.navItem.create({
    data: {
      label: 'Works',
      url: '/works',
      location: 'header',
      itemType: 'dropdown',
      sortOrder: 0,
      config: { layout: 'columns', columns: 2, hotkey: 'W' },
    },
  });

  const worksFeaturedGroup = await prisma.navItem.create({
    data: {
      label: 'Featured Project',
      url: '',
      location: 'header',
      itemType: 'group',
      sortOrder: 0,
      parentId: worksDropdown.id,
    },
  });

  await prisma.navItem.create({
    data: {
      label: 'Portfolio & Headless CMS',
      description: 'Next.js 16, Express REST API, PostgreSQL, and high-accuracy telemetry platform.',
      url: '/works',
      location: 'header',
      itemType: 'link',
      icon: 'sparkles',
      badge: 'Featured',
      sortOrder: 0,
      parentId: worksFeaturedGroup.id,
      config: { isFeaturedCard: true },
    },
  });

  const worksCategoriesGroup = await prisma.navItem.create({
    data: {
      label: 'Categories',
      url: '',
      location: 'header',
      itemType: 'group',
      sortOrder: 1,
      parentId: worksDropdown.id,
    },
  });

  await prisma.navItem.createMany({
    data: [
      {
        label: 'Engineering Case Studies',
        description: 'Architectural deep-dives and full-stack solutions.',
        url: '/works',
        location: 'header',
        itemType: 'link',
        icon: 'folder-git-2',
        sortOrder: 0,
        parentId: worksCategoriesGroup.id,
      },
      {
        label: 'Open Source Contributions',
        description: 'Libraries, developer CLI tools, and packages.',
        url: '/works?category=open-source',
        location: 'header',
        itemType: 'link',
        icon: 'git-branch',
        sortOrder: 1,
        parentId: worksCategoriesGroup.id,
      },
      {
        label: 'Systems & Architecture',
        description: 'Distributed services and high-scale backends.',
        url: '/works?category=backend',
        location: 'header',
        itemType: 'link',
        icon: 'cpu',
        sortOrder: 2,
        parentId: worksCategoriesGroup.id,
      },
    ],
  });

  const worksFooterGroup = await prisma.navItem.create({
    data: {
      label: 'Explore Complete Works Archive →',
      url: '/works',
      location: 'header',
      itemType: 'group',
      sortOrder: 2,
      parentId: worksDropdown.id,
      config: { isFooterBar: true },
    },
  });

  // 2. Writing & Knowledge Dropdown
  const writingDropdown = await prisma.navItem.create({
    data: {
      label: 'Writing',
      url: '/blogs',
      location: 'header',
      itemType: 'dropdown',
      sortOrder: 1,
      config: { layout: 'columns', columns: 2, hotkey: 'B' },
    },
  });

  const writingPubsGroup = await prisma.navItem.create({
    data: {
      label: 'Publications',
      url: '',
      location: 'header',
      itemType: 'group',
      sortOrder: 0,
      parentId: writingDropdown.id,
    },
  });

  await prisma.navItem.createMany({
    data: [
      {
        label: 'Technical Blog',
        description: 'System design, TypeScript, and modern frontend patterns.',
        url: '/blogs',
        location: 'header',
        itemType: 'link',
        icon: 'book-open',
        badge: 'Articles',
        sortOrder: 0,
        parentId: writingPubsGroup.id,
      },
      {
        label: 'Research Papers',
        description: 'Academic whitepapers and technical research.',
        url: '/research',
        location: 'header',
        itemType: 'link',
        icon: 'file-text',
        badge: 'Papers',
        sortOrder: 1,
        parentId: writingPubsGroup.id,
      },
    ],
  });

  const writingExploreGroup = await prisma.navItem.create({
    data: {
      label: 'Live Notes',
      url: '',
      location: 'header',
      itemType: 'group',
      sortOrder: 1,
      parentId: writingDropdown.id,
    },
  });

  await prisma.navItem.createMany({
    data: [
      {
        label: 'What I Am Doing Now',
        description: 'Current focus, active readings, and exploration.',
        url: '/now',
        location: 'header',
        itemType: 'link',
        icon: 'activity',
        sortOrder: 0,
        parentId: writingExploreGroup.id,
      },
      {
        label: 'Tools & Hardware (Uses)',
        description: 'Development environment, gear, and software.',
        url: '/uses',
        location: 'header',
        itemType: 'link',
        icon: 'terminal',
        sortOrder: 1,
        parentId: writingExploreGroup.id,
      },
    ],
  });

  // 3. About Link
  await prisma.navItem.create({
    data: {
      label: 'About',
      url: '/about',
      location: 'header',
      itemType: 'link',
      sortOrder: 2,
      config: { hotkey: 'A' },
    },
  });

  // 4. Timeline Link
  await prisma.navItem.create({
    data: {
      label: 'Timeline',
      url: '/my-timeline',
      location: 'header',
      itemType: 'link',
      sortOrder: 3,
      config: { hotkey: 'T' },
    },
  });

  // 5. Split Action CTA Button ("Get in Touch")
  const ctaButton = await prisma.navItem.create({
    data: {
      label: 'Get in Touch',
      url: '/contact',
      location: 'header',
      itemType: 'button',
      sortOrder: 4,
      config: { buttonVariant: 'primary', hotkey: 'C' },
    },
  });

  await prisma.navItem.createMany({
    data: [
      {
        label: 'Send Direct Message',
        description: 'Send an inquiry through the portfolio contact portal.',
        url: '/contact',
        location: 'header',
        itemType: 'link',
        icon: 'mail',
        sortOrder: 0,
        parentId: ctaButton.id,
      },
      {
        label: 'View Active Resume',
        description: 'Inspect verified professional background and resume.',
        url: '/resume',
        location: 'header',
        itemType: 'link',
        icon: 'file-user',
        sortOrder: 1,
        parentId: ctaButton.id,
      },
      {
        label: 'GitHub Profile',
        description: 'Review open-source code repositories & commits.',
        url: 'https://github.com/AnujYadav-Dev',
        location: 'header',
        itemType: 'link',
        icon: 'github',
        isExternal: true,
        sortOrder: 2,
        parentId: ctaButton.id,
      },
    ],
  });

  // Footer Navigation Items
  await prisma.navItem.createMany({
    data: [
      { label: 'Works', url: '/works', location: 'footer', itemType: 'link', sortOrder: 0 },
      { label: 'Blogs', url: '/blogs', location: 'footer', itemType: 'link', sortOrder: 1 },
      { label: 'Resume', url: '/resume', location: 'footer', itemType: 'link', sortOrder: 2 },
      { label: 'Guestbook', url: '/guestbook', location: 'footer', itemType: 'link', sortOrder: 3 },
      { label: 'Changelog', url: '/changelog', location: 'footer', itemType: 'link', sortOrder: 4 },
    ],
  });


  // ─── 5. Dynamic About Sections ──────────────────────────────
  console.log('📖 Seeding about sections...');
  const aboutSections = [
    {
      slug: 'anuj',
      title: 'About Anuj Yadav',
      icon: 'user',
      sortOrder: 0,
      content:
        '# Anuj Yadav\n\nI am a **Full-Stack Software Engineer** dedicated to building resilient distributed systems and intuitive user interfaces.\n\nWith expertise spanning TypeScript, Next.js, Node.js, Express, and PostgreSQL, I enjoy solving complex architectural challenges and delivering high-value software.',
      seoTitle: 'About Anuj Yadav — Background & Philosophy',
      seoDescription: 'Learn about Anuj Yadav, background, journey, and technical philosophy.',
    },
    {
      slug: 'skills',
      title: 'Technical Skills & Competencies',
      icon: 'cpu',
      sortOrder: 1,
      content:
        '# Technical Skills\n\nDeep domain knowledge in modern web architecture, frontend rendering strategies, API design, and database modeling.',
      seoTitle: 'Technical Skills — Anuj Yadav',
      seoDescription:
        'Comprehensive overview of tools, languages, frameworks, and architecture capabilities.',
    },
    {
      slug: 'timeline',
      title: 'Career & Academic Timeline',
      icon: 'clock',
      sortOrder: 2,
      content:
        '# Career Timeline\n\nA chronological overview of my professional experience, education, key milestones, and notable achievements.',
      seoTitle: 'Timeline & Milestones — Anuj Yadav',
      seoDescription:
        'Explore the chronological journey of education, career milestones, and recognitions.',
    },
    {
      slug: 'experience',
      title: 'Professional Experience',
      icon: 'briefcase',
      sortOrder: 3,
      content:
        '# Professional Experience\n\nTrack record of architecting, implementing, and scaling web systems across diverse engineering teams.',
      seoTitle: 'Work Experience — Anuj Yadav',
      seoDescription:
        'Detailed work history, technical contributions, and leadership achievements.',
    },
    {
      slug: 'education',
      title: 'Education & Certifications',
      icon: 'award',
      sortOrder: 4,
      content:
        '# Education & Credentials\n\nAcademic background in Computer Science and verified professional engineering certifications.',
      seoTitle: 'Education & Credentials — Anuj Yadav',
      seoDescription:
        'Academic degrees, university coursework, awards, and professional credentials.',
    },
  ];

  for (const section of aboutSections) {
    await prisma.aboutSection.upsert({
      where: { slug: section.slug },
      update: section,
      create: section,
    });
  }

  // ─── 6. Email Templates ─────────────────────────────────────
  console.log('✉️ Seeding email templates...');
  const emailTemplates = [
    {
      templateKey: 'contact_auto_reply',
      name: 'Contact Auto-Reply (Visitor)',
      subject: 'Thank you for reaching out, {{name}}!',
      bodyHtml:
        '<p>Hi <strong>{{name}}</strong>,</p><p>Thank you for reaching out via my portfolio. I have received your message regarding "<em>{{subject}}</em>" and will get back to you as soon as possible.</p><br/><p>Best regards,<br/><strong>Anuj Yadav</strong></p>',
      bodyText:
        'Hi {{name}},\n\nThank you for reaching out via my portfolio. I have received your message regarding "{{subject}}" and will get back to you as soon as possible.\n\nBest regards,\nAnuj Yadav',
      variables: ['name', 'subject', 'message'],
      isEnabled: true,
    },
    {
      templateKey: 'contact_admin_notification',
      name: 'Contact Inquiry Alert (Admin)',
      subject: 'New Contact Inquiry from {{name}}: {{subject}}',
      bodyHtml:
        '<p>You have received a new contact inquiry through your portfolio website:</p><ul><li><strong>Sender:</strong> {{name}} (&lt;{{email}}&gt;)</li><li><strong>Subject:</strong> {{subject}}</li><li><strong>IP Address:</strong> {{ipAddress}}</li></ul><hr/><p><strong>Message:</strong></p><p>{{message}}</p>',
      bodyText:
        'You have received a new contact inquiry:\n\nSender: {{name}} ({{email}})\nSubject: {{subject}}\nIP: {{ipAddress}}\n\nMessage:\n{{message}}',
      variables: ['name', 'email', 'subject', 'message', 'ipAddress'],
      isEnabled: true,
    },
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { templateKey: template.templateKey },
      update: template,
      create: template,
    });
  }

  // ─── 7. Skill Categories & Skills ───────────────────────────
  console.log('💻 Seeding skill categories and skills...');
  const skillCategories = [
    {
      name: 'Frontend Development',
      slug: 'frontend',
      description: 'Modern user interface design and client-side engineering.',
      icon: 'layout',
      sortOrder: 0,
      skills: [
        { name: 'React', slug: 'react', icon: 'react', proficiency: 95, sortOrder: 0 },
        { name: 'Next.js', slug: 'nextjs', icon: 'nextjs', proficiency: 92, sortOrder: 1 },
        {
          name: 'TypeScript',
          slug: 'typescript',
          icon: 'typescript',
          proficiency: 90,
          sortOrder: 2,
        },
        {
          name: 'Tailwind CSS',
          slug: 'tailwindcss',
          icon: 'tailwindcss',
          proficiency: 95,
          sortOrder: 3,
        },
        {
          name: 'TanStack Query',
          slug: 'tanstack-query',
          icon: 'query',
          proficiency: 88,
          sortOrder: 4,
        },
      ],
    },
    {
      name: 'Backend & Systems',
      slug: 'backend',
      description: 'Server architecture, API design, and distributed persistence.',
      icon: 'server',
      sortOrder: 1,
      skills: [
        { name: 'Node.js', slug: 'nodejs', icon: 'nodejs', proficiency: 90, sortOrder: 0 },
        { name: 'Express.js', slug: 'express', icon: 'express', proficiency: 92, sortOrder: 1 },
        {
          name: 'PostgreSQL',
          slug: 'postgresql',
          icon: 'postgresql',
          proficiency: 88,
          sortOrder: 2,
        },
        { name: 'Prisma ORM', slug: 'prisma', icon: 'prisma', proficiency: 90, sortOrder: 3 },
        { name: 'REST APIs', slug: 'rest-api', icon: 'api', proficiency: 95, sortOrder: 4 },
      ],
    },
    {
      name: 'DevOps & Tooling',
      slug: 'devops',
      description: 'Continuous delivery, containerization, and developer tooling.',
      icon: 'cloud',
      sortOrder: 2,
      skills: [
        { name: 'Docker', slug: 'docker', icon: 'docker', proficiency: 82, sortOrder: 0 },
        { name: 'Git & GitHub', slug: 'git', icon: 'git', proficiency: 94, sortOrder: 1 },
        { name: 'Linux', slug: 'linux', icon: 'linux', proficiency: 85, sortOrder: 2 },
        { name: 'CI/CD Pipelines', slug: 'cicd', icon: 'workflow', proficiency: 80, sortOrder: 3 },
      ],
    },
  ];

  for (const cat of skillCategories) {
    const category = await prisma.skillCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
    });

    for (const skill of cat.skills) {
      await prisma.skill.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: skill.slug,
          },
        },
        update: {
          name: skill.name,
          icon: skill.icon,
          proficiency: skill.proficiency,
          sortOrder: skill.sortOrder,
        },
        create: {
          categoryId: category.id,
          name: skill.name,
          slug: skill.slug,
          icon: skill.icon,
          proficiency: skill.proficiency,
          sortOrder: skill.sortOrder,
        },
      });
    }
  }

  // ─── 8. Project Categories & Sample Project ─────────────────
  console.log('🚀 Seeding projects...');
  const webAppCategory = await prisma.projectCategory.upsert({
    where: { slug: 'web-applications' },
    update: {},
    create: {
      name: 'Web Applications',
      slug: 'web-applications',
      description: 'End-to-end full-stack web applications and platforms.',
      sortOrder: 0,
    },
  });

  await prisma.project.upsert({
    where: {
      authorId_slug: {
        authorId: author.id,
        slug: 'anuj-portfolio-platform',
      },
    },
    update: {},
    create: {
      authorId: author.id,
      categoryId: webAppCategory.id,
      title: 'Dynamic Developer Portfolio & Headless CMS Platform',
      slug: 'anuj-portfolio-platform',
      shortDescription:
        'An ultra-premium, dynamic portfolio and CMS built with Next.js 16, Express, PostgreSQL, and Prisma.',
      content:
        '# Anuj Portfolio Platform\n\n## Overview\nA comprehensive database-driven developer portfolio that powers dynamic pages, visitor telemetry, content scheduling, and an interactive CMS.\n\n## Architecture\n- **Frontend:** Next.js 16 App Router, Tailwind CSS v4\n- **Backend:** Express REST API with Layered Architecture\n- **Database:** PostgreSQL with 38 normalized tables and Prisma ORM\n\n## Key Features\n1. Dynamic homepage section reordering\n2. Real-time visitor session and outbound link telemetry\n3. Full-featured Markdown/MDX content renderer\n4. Role-based admin portal',
      technologies: [
        'Next.js 16',
        'Express',
        'TypeScript',
        'PostgreSQL',
        'Prisma',
        'Tailwind CSS v4',
      ],
      githubUrl: 'https://github.com/AnujYadav-Dev/anuj-portfolio',
      liveUrl: 'https://anujyadav.dev',
      projectType: 'personal',
      projectStatus: 'in_progress',
      status: 'published',
      isFeatured: true,
      publishedAt: new Date(),
      seoTitle: 'Dynamic Portfolio Platform — Case Study',
      seoDescription: 'Architecture and implementation case study for the Anuj Portfolio & CMS.',
    },
  });

  // ─── 9. Blog Category & Sample Post ─────────────────────────
  console.log('📝 Seeding blog posts...');
  const techCategory = await prisma.blogCategory.upsert({
    where: { slug: 'software-architecture' },
    update: {},
    create: {
      name: 'Software Architecture',
      slug: 'software-architecture',
      description: 'Deep dives into system design, patterns, and clean code.',
      sortOrder: 0,
    },
  });

  await prisma.blogPost.upsert({
    where: {
      authorId_slug: {
        authorId: author.id,
        slug: 'building-a-database-driven-portfolio',
      },
    },
    update: {},
    create: {
      authorId: author.id,
      categoryId: techCategory.id,
      title: 'Building a Database-Driven Dynamic Developer Portfolio',
      slug: 'building-a-database-driven-portfolio',
      excerpt:
        'Why moving away from static markdown portfolios to a normalized database with a dedicated REST API unlocks real-world dynamic content workflows.',
      content:
        '# Building a Database-Driven Portfolio\n\nStatic site generators have long been the default for developer portfolios. However, when you want dynamic homepage section reordering, high-accuracy telemetry, content scheduling, and an interactive admin CMS, a database-driven architecture shines.\n\n## Architectural Layers\n1. **Prisma ORM** for type-safe data access across 38 entities.\n2. **Express REST API** strictly separating routes, controllers, services, and repositories.\n3. **Next.js 16** for lightning-fast server-rendered public pages.\n\nStay tuned for the complete technical breakdown!',
      readingTimeMinutes: 5,
      status: 'published',
      isFeatured: true,
      publishedAt: new Date(),
      seoTitle: 'Building a Database-Driven Portfolio — Anuj Yadav',
      seoDescription: 'Deep dive into architecting a dynamic, database-driven developer portfolio.',
    },
  });

  // ─── 10. Sample Research Paper ──────────────────────────────
  console.log('🔬 Seeding research papers...');
  await prisma.researchPaper.upsert({
    where: {
      authorId_slug: {
        authorId: author.id,
        slug: 'high-performance-modular-monorepo-architectures',
      },
    },
    update: {},
    create: {
      authorId: author.id,
      title: 'High-Performance Modular Monorepo Architectures for TypeScript Web Applications',
      slug: 'high-performance-modular-monorepo-architectures',
      abstract:
        'This whitepaper examines architectural strategies for organizing full-stack TypeScript codebases with zero circular dependencies, shared contracts, and optimal build times.',
      content:
        '# Abstract & Findings\n\nModern web applications benefit substantially from sharing contracts, DTOs, and validation logic between frontend and backend tiers without coupling runtime dependencies.\n\nWe analyze the performance characteristics and boundary isolation of three-tier npm workspace layouts.',
      status: 'published',
      isFeatured: true,
      publishedAt: new Date(),
      seoTitle: 'Modular Monorepo Architectures — Research Paper',
      seoDescription: 'Technical paper on TypeScript monorepo boundary isolation and performance.',
    },
  });

  // ─── 11. Social Links ───────────────────────────────────────
  console.log('🔗 Seeding social links...');
  const socialLinks = [
    {
      platform: 'github',
      label: 'GitHub',
      url: 'https://github.com/AnujYadav-Dev',
      icon: 'github',
      sortOrder: 0,
      isEnabled: true,
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/anujyadav',
      icon: 'linkedin',
      sortOrder: 1,
      isEnabled: true,
    },
    {
      platform: 'x',
      label: 'X (Twitter)',
      url: 'https://x.com/anujyadav',
      icon: 'twitter',
      sortOrder: 2,
      isEnabled: true,
    },
    {
      platform: 'email',
      label: 'Email',
      url: 'mailto:anuj@example.com',
      icon: 'mail',
      sortOrder: 3,
      isEnabled: true,
    },
  ];

  for (const link of socialLinks) {
    const existing = await prisma.socialLink.findFirst({
      where: { platform: link.platform },
    });
    if (existing) {
      await prisma.socialLink.update({
        where: { id: existing.id },
        data: link,
      });
    } else {
      await prisma.socialLink.create({
        data: link,
      });
    }
  }

  // ─── 12. Dynamic Pages (/now, /uses, /stack) ────────────────
  console.log('📄 Seeding dynamic pages...');
  const pages = [
    {
      slug: 'now',
      title: 'What I Am Doing Now',
      content:
        '# What I Am Doing Now\n\n*Updated August 2025*\n\n- Building this dynamic portfolio platform.\n- Deep diving into Next.js 16 and React 19 server patterns.\n- Exploring distributed systems design and PostgreSQL optimizations.',
      status: 'published' as const,
      isNavVisible: true,
      sortOrder: 0,
      seoTitle: 'Now — Anuj Yadav',
      seoDescription: 'Current focus, active projects, and learning journey of Anuj Yadav.',
    },
    {
      slug: 'uses',
      title: 'Tools & Hardware I Use',
      content:
        '# Uses\n\nHere is a list of the hardware, software, and tools I use on a daily basis for development and productivity.\n\n### Hardware\n- **Workstation:** Custom Ryzen 9 Developer Rig\n- **Display:** 4K Ultra-Wide Monitor\n\n### Software\n- **Editor:** Visual Studio Code / Antigravity IDE\n- **Terminal:** PowerShell / Windows Terminal\n- **Database Client:** Prisma Studio & pgAdmin',
      status: 'published' as const,
      isNavVisible: true,
      sortOrder: 1,
      seoTitle: 'Uses — Anuj Yadav',
      seoDescription: 'Development setup, hardware, editor themes, and everyday software tools.',
    },
    {
      slug: 'stack',
      title: 'My Technology Stack',
      content:
        '# Technology Stack\n\nOverview of the core technologies, libraries, and frameworks powering this platform.\n\n- **Runtime:** Node.js & TypeScript\n- **Frontend:** Next.js 16 App Router & Tailwind CSS v4\n- **Backend:** Express REST API\n- **Database:** PostgreSQL & Prisma ORM\n- **Data Fetching:** TanStack Query',
      status: 'published' as const,
      isNavVisible: true,
      sortOrder: 2,
      seoTitle: 'Tech Stack — Anuj Yadav',
      seoDescription: 'Technical breakdown of libraries, frameworks, and architecture patterns.',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  // ─── 13. Timeline Events ────────────────────────────────────
  console.log('⏳ Seeding timeline events...');
  const timelineEvents = [
    {
      title: 'Started Building Developer Portfolio Platform',
      description:
        'Architected and implemented a dynamic, database-driven portfolio platform with Next.js, Express, PostgreSQL, and Prisma.',
      eventType: 'project' as const,
      date: new Date('2025-08-25'),
      sortOrder: 0,
      isEnabled: true,
    },
    {
      title: 'Full-Stack Software Engineer',
      description:
        'Designing and deploying web applications and REST APIs with TypeScript and PostgreSQL.',
      eventType: 'job' as const,
      date: new Date('2024-01-01'),
      sortOrder: 1,
      isEnabled: true,
    },
    {
      title: 'Bachelor of Technology in Computer Science',
      description: 'Graduated with focus on algorithms, systems design, and database engineering.',
      eventType: 'education' as const,
      date: new Date('2023-06-01'),
      sortOrder: 2,
      isEnabled: true,
    },
  ];

  for (const event of timelineEvents) {
    const existing = await prisma.timelineEvent.findFirst({
      where: { title: event.title, date: event.date },
    });
    if (!existing) {
      await prisma.timelineEvent.create({
        data: event,
      });
    }
  }

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
