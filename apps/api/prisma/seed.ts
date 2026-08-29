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
      email: 'anujyadav9449@gmail.com',
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
      value: 'anujyadav9449@gmail.com',
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
    {
      key: 'analytics_intent_scoring_enabled',
      value: 'true',
      group: 'analytics',
    },
    {
      key: 'analytics_live_pulse_window_minutes',
      value: '5',
      group: 'analytics',
    },
    {
      key: 'analytics_ignore_admin_traffic',
      value: 'true',
      group: 'analytics',
    },
    {
      key: 'analytics_track_web_vitals',
      value: 'true',
      group: 'analytics',
    },
    {
      key: 'analytics_track_scroll_depth',
      value: 'true',
      group: 'analytics',
    },
    {
      key: 'analytics_track_code_copies',
      value: 'true',
      group: 'analytics',
    },
    {
      key: 'analytics_intent_weights_json',
      value: '{"resumeDownload":40,"contactSubmission":50,"worksView":15,"experienceView":15,"githubClick":20,"liveDemoClick":20,"blogResearch":20,"multiPage":15}',
      group: 'analytics',
    },
    {
      key: 'email_notifications_visit_enabled',
      value: 'false',
      group: 'notifications',
    },
    {
      key: 'email_notifications_visit_cooldown_minutes',
      value: '60',
      group: 'notifications',
    },
    {
      key: 'email_notifications_resume_download_enabled',
      value: 'true',
      group: 'notifications',
    },
    {
      key: 'email_notifications_contact_enabled',
      value: 'true',
      group: 'notifications',
    },
    {
      key: 'email_notifications_newsletter_enabled',
      value: 'true',
      group: 'notifications',
    },
    {
      key: 'email_notifications_guestbook_enabled',
      value: 'true',
      group: 'notifications',
    },
    {
      key: 'email_notifications_scheduled_publish_enabled',
      value: 'true',
      group: 'notifications',
    },
    {
      key: 'email_notifications_security_login_enabled',
      value: 'true',
      group: 'notifications',
    },
    {
      key: 'email_notifications_auto_broadcast_blog',
      value: 'true',
      group: 'notifications',
    },
    {
      key: 'email_notifications_auto_broadcast_project',
      value: 'false',
      group: 'notifications',
    },
    {
      key: 'email_notifications_auto_broadcast_research',
      value: 'false',
      group: 'notifications',
    },
    {
      key: 'newsletter_double_opt_in',
      value: 'true',
      group: 'newsletter',
    },
    {
      key: 'admin_notification_email',
      value: 'anujyadav9449@gmail.com',
      group: 'notifications',
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
      description:
        'Next.js 16, Express REST API, PostgreSQL, and high-accuracy telemetry platform.',
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

  // Footer Navigation Items — Multi-Column Structure
  const footerWorks = await prisma.navItem.create({
    data: {
      label: 'Works',
      url: '/works',
      location: 'footer',
      itemType: 'group',
      sortOrder: 0,
    },
  });

  await prisma.navItem.createMany({
    data: [
      {
        label: 'Case Studies',
        url: '/works',
        location: 'footer',
        itemType: 'link',
        parentId: footerWorks.id,
        sortOrder: 0,
      },
      {
        label: 'Open Source',
        url: '/opensource',
        location: 'footer',
        itemType: 'link',
        parentId: footerWorks.id,
        sortOrder: 1,
      },
      {
        label: 'Architecture Highlights',
        url: '/works?category=backend',
        location: 'footer',
        itemType: 'link',
        parentId: footerWorks.id,
        sortOrder: 2,
      },
    ],
  });

  const footerWriting = await prisma.navItem.create({
    data: {
      label: 'Writing',
      url: '/blogs',
      location: 'footer',
      itemType: 'group',
      sortOrder: 1,
    },
  });

  await prisma.navItem.createMany({
    data: [
      {
        label: 'Technical Blog',
        url: '/blogs',
        location: 'footer',
        itemType: 'link',
        parentId: footerWriting.id,
        sortOrder: 0,
      },
      {
        label: 'Research Papers',
        url: '/research',
        location: 'footer',
        itemType: 'link',
        parentId: footerWriting.id,
        sortOrder: 1,
      },
      {
        label: 'Newsletter Archive',
        url: '/newsletter',
        location: 'footer',
        itemType: 'link',
        parentId: footerWriting.id,
        sortOrder: 2,
      },
    ],
  });

  const footerJourney = await prisma.navItem.create({
    data: {
      label: 'Journey',
      url: '/about',
      location: 'footer',
      itemType: 'group',
      sortOrder: 2,
    },
  });

  await prisma.navItem.createMany({
    data: [
      {
        label: 'About & Philosophy',
        url: '/about',
        location: 'footer',
        itemType: 'link',
        parentId: footerJourney.id,
        sortOrder: 0,
      },
      {
        label: 'Skills Matrix',
        url: '/skills',
        location: 'footer',
        itemType: 'link',
        parentId: footerJourney.id,
        sortOrder: 1,
      },
      {
        label: 'Career Timeline',
        url: '/my-timeline',
        location: 'footer',
        itemType: 'link',
        parentId: footerJourney.id,
        sortOrder: 2,
      },
      {
        label: 'Verified Resume',
        url: '/resume',
        location: 'footer',
        itemType: 'link',
        parentId: footerJourney.id,
        sortOrder: 3,
      },
    ],
  });

  const footerPlatform = await prisma.navItem.create({
    data: {
      label: 'Platform',
      url: '/now',
      location: 'footer',
      itemType: 'group',
      sortOrder: 3,
    },
  });

  await prisma.navItem.createMany({
    data: [
      {
        label: 'Now',
        url: '/now',
        location: 'footer',
        itemType: 'link',
        parentId: footerPlatform.id,
        sortOrder: 0,
      },
      {
        label: 'Tech Stack (Uses)',
        url: '/uses',
        location: 'footer',
        itemType: 'link',
        parentId: footerPlatform.id,
        sortOrder: 1,
      },
      {
        label: 'Guestbook',
        url: '/guestbook',
        location: 'footer',
        itemType: 'link',
        parentId: footerPlatform.id,
        sortOrder: 2,
      },
      {
        label: 'Get in Touch',
        url: '/contact',
        location: 'footer',
        itemType: 'link',
        parentId: footerPlatform.id,
        sortOrder: 3,
      },
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
      purpose: 'contact_auto_reply',
      name: 'Default Auto-Reply (Visitor)',
      description: 'Automated receipt acknowledgment sent to visitors who submit the contact form.',
      subject: 'Thank you for reaching out, {{name}}!',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><h2 style="margin-top: 0; color: #64ffda; font-size: 20px; font-weight: 700;">Message Received</h2><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Hi <strong style="color: #ffffff;">{{name}}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Thank you for getting in touch through my portfolio. I have safely received your inquiry regarding <em style="color: #64ffda;">"{{subject}}"</em> and will review your message promptly.</p><div style="background-color: #151921; border-left: 3px solid #64ffda; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #cbd5e1; font-style: italic;">{{message}}</div><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">I typically reply within 24 to 48 business hours.</p><hr style="border: none; border-top: 1px solid #1f242e; margin: 28px 0;"/><p style="margin-bottom: 0; font-size: 13px; color: #718096;">Best regards,<br/><strong style="color: #ffffff;">Anuj Yadav</strong><br/><span style="font-size: 12px; color: #4a5568;">Full-Stack Engineer & Architect</span></p></div>',
      bodyText:
        'Hi {{name}},\n\nThank you for reaching out via my portfolio. I have received your message regarding "{{subject}}" and will get back to you as soon as possible.\n\nYour message:\n{{message}}\n\nBest regards,\nAnuj Yadav\nFull-Stack Engineer & Architect',
      variables: ['name', 'email', 'subject', 'message', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'contact_admin_notification',
      name: 'Default Contact Inquiry (Admin)',
      description: 'Instant alert sent to admin when a new inquiry is submitted.',
      subject: 'New Contact Inquiry from {{name}}: {{subject}}',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><div style="display: inline-block; padding: 4px 10px; background-color: rgba(100, 255, 218, 0.1); border: 1px solid rgba(100, 255, 218, 0.3); border-radius: 6px; font-size: 11px; font-family: monospace; color: #64ffda; text-transform: uppercase; margin-bottom: 16px;">Contact Inquiry Alert</div><h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 700;">New Message from {{name}}</h2><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;"><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096; width: 100px;">From:</td><td style="padding: 8px 0; color: #ffffff; font-weight: 600;">{{name}} (&lt;{{email}}&gt;)</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Subject:</td><td style="padding: 8px 0; color: #64ffda; font-weight: 600;">{{subject}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">IP Address:</td><td style="padding: 8px 0; color: #a0aec0; font-family: monospace;">{{ipAddress}}</td></tr><tr><td style="padding: 8px 0; color: #718096;">Date:</td><td style="padding: 8px 0; color: #a0aec0;">{{submittedAt}}</td></tr></table><div style="background-color: #151921; border-radius: 8px; border: 1px solid #1f242e; padding: 18px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; white-space: pre-wrap;">{{message}}</div><div style="margin-top: 24px;"><a href="mailto:{{email}}?subject=Re: {{subject}}" style="display: inline-block; padding: 10px 20px; background-color: #64ffda; color: #0d0f14; font-weight: 700; text-decoration: none; border-radius: 6px; font-size: 13px;">Reply to {{name}}</a></div></div>',
      bodyText:
        'You have received a new contact inquiry:\n\nSender: {{name}} ({{email}})\nSubject: {{subject}}\nIP: {{ipAddress}}\nDate: {{submittedAt}}\n\nMessage:\n{{message}}',
      variables: ['name', 'email', 'subject', 'message', 'ipAddress', 'submittedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'newsletter_confirmation',
      name: 'Double Opt-In Verification',
      description: 'Verification link sent to new newsletter subscribers.',
      subject: 'Confirm your subscription to Anuj Yadav Engineering Dispatch',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><h2 style="margin-top: 0; color: #64ffda; font-size: 20px; font-weight: 700;">Confirm Your Subscription</h2><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Hi {{name}},</p><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Thanks for subscribing to the <strong style="color: #ffffff;">Engineering Dispatch</strong>. Please confirm your email address by clicking the button below:</p><div style="margin: 28px 0; text-align: center;"><a href="{{confirmationUrl}}" style="display: inline-block; padding: 12px 28px; background-color: #64ffda; color: #0d0f14; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 14px;">Confirm Subscription</a></div><p style="font-size: 12px; color: #718096; line-height: 1.5;">Or copy and paste this link in your browser:<br/><a href="{{confirmationUrl}}" style="color: #64ffda; word-break: break-all;">{{confirmationUrl}}</a></p><hr style="border: none; border-top: 1px solid #1f242e; margin: 28px 0;"/><p style="font-size: 12px; color: #4a5568;">If you did not request this subscription, you can safely ignore this email.</p></div>',
      bodyText:
        'Hi {{name}},\n\nThanks for subscribing to the Engineering Dispatch.\n\nPlease confirm your email address by opening the following link:\n{{confirmationUrl}}\n\nIf you did not request this, please ignore this email.\n\nBest,\nAnuj Yadav',
      variables: ['name', 'email', 'confirmationUrl', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'newsletter_welcome',
      name: 'Welcome to Engineering Dispatch',
      description: 'Welcome email sent immediately after subscriber confirms subscription.',
      subject: 'Welcome to the Engineering Dispatch! 🚀',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><h2 style="margin-top: 0; color: #64ffda; font-size: 20px; font-weight: 700;">Welcome Aboard! 🎉</h2><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Hi {{name}},</p><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">You are now officially subscribed to the <strong style="color: #ffffff;">Engineering Dispatch</strong>. You will receive periodic deep dives on software architecture, distributed systems, modern web engineering, and technical breakdowns.</p><div style="background-color: #151921; border-radius: 8px; border: 1px solid #1f242e; padding: 18px; margin: 20px 0;"><h4 style="margin: 0 0 8px 0; color: #64ffda; font-size: 13px;">What to expect:</h4><ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #cbd5e1; line-height: 1.6;"><li>Zero spam, strictly engineering substance</li><li>Early access to technical case studies</li><li>Open source architecture retrospectives</li></ul></div><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Feel free to reply to any issue with your thoughts or questions.</p><hr style="border: none; border-top: 1px solid #1f242e; margin: 28px 0;"/><p style="font-size: 12px; color: #4a5568;">You can <a href="{{unsubscribeUrl}}" style="color: #718096; text-decoration: underline;">unsubscribe at any time</a>.</p></div>',
      bodyText:
        'Hi {{name}},\n\nWelcome to the Engineering Dispatch! You are now subscribed to receive periodic deep dives on software architecture, web engineering, and systems design.\n\nBest regards,\nAnuj Yadav\n\nUnsubscribe: {{unsubscribeUrl}}',
      variables: ['name', 'email', 'unsubscribeUrl', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'newsletter_admin_notification',
      name: 'New Subscriber Notification (Admin)',
      description: 'Notification sent to admin when a new subscriber joins the mailing list.',
      subject: 'New Newsletter Subscriber: {{email}}',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><h2 style="margin-top: 0; color: #64ffda; font-size: 20px; font-weight: 700;">New Subscriber Joined</h2><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">A new reader has joined your newsletter audience:</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;"><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096; width: 120px;">Email:</td><td style="padding: 8px 0; color: #ffffff; font-weight: 600;">{{email}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Name:</td><td style="padding: 8px 0; color: #cbd5e1;">{{name}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Status:</td><td style="padding: 8px 0; color: #64ffda;">{{isConfirmed}}</td></tr><tr><td style="padding: 8px 0; color: #718096;">Subscribed At:</td><td style="padding: 8px 0; color: #a0aec0;">{{subscribedAt}}</td></tr></table></div>',
      bodyText:
        'New Newsletter Subscriber:\n\nEmail: {{email}}\nName: {{name}}\nStatus: {{isConfirmed}}\nDate: {{subscribedAt}}',
      variables: ['email', 'name', 'isConfirmed', 'subscribedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'newsletter_broadcast',
      name: 'Standard Article / Dispatch Broadcast',
      description: 'Default template for broadcasting new blog posts or engineering newsletters.',
      subject: '{{subject}}',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><p style="font-size: 13px; color: #64ffda; text-transform: uppercase; font-family: monospace; letter-spacing: 0.05em; margin-top: 0;">Anuj Yadav Engineering Dispatch</p><h1 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3; margin: 12px 0 24px 0;">{{subject}}</h1><div style="font-size: 15px; line-height: 1.7; color: #cbd5e1;">{{{contentHtml}}}</div><hr style="border: none; border-top: 1px solid #1f242e; margin: 32px 0;"/><p style="font-size: 12px; color: #718096; line-height: 1.5;">You received this email because you subscribed to Anuj Yadav\'s Engineering Dispatch.<br/><a href="{{unsubscribeUrl}}" style="color: #a0aec0; text-decoration: underline;">Unsubscribe</a> • <a href="{{siteUrl}}" style="color: #a0aec0; text-decoration: underline;">Visit Portfolio</a></p></div>',
      bodyText:
        '{{subject}}\n\n{{contentHtml}}\n\nUnsubscribe: {{unsubscribeUrl}}\nPortfolio: {{siteUrl}}',
      variables: [
        'name',
        'email',
        'subject',
        'previewText',
        'contentHtml',
        'unsubscribeUrl',
        'siteUrl',
      ],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'resume_download_admin',
      name: 'Recruiter Resume Download Alert (Admin)',
      description: 'Alert sent to admin when a recruiter or visitor downloads the resume PDF.',
      subject: '📄 Resume Downloaded by visitor from {{country}}, {{city}}',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><div style="display: inline-block; padding: 4px 10px; background-color: rgba(100, 255, 218, 0.1); border: 1px solid rgba(100, 255, 218, 0.3); border-radius: 6px; font-size: 11px; font-family: monospace; color: #64ffda; text-transform: uppercase; margin-bottom: 16px;">Recruiter Telemetry</div><h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Resume PDF Downloaded</h2><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;"><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096; width: 120px;">Resume Version:</td><td style="padding: 8px 0; color: #64ffda; font-weight: 600;">{{resumeTitle}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Location:</td><td style="padding: 8px 0; color: #ffffff; font-weight: 600;">{{city}}, {{country}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Referrer:</td><td style="padding: 8px 0; color: #a0aec0;">{{referrerSource}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">IP Address:</td><td style="padding: 8px 0; color: #a0aec0; font-family: monospace;">{{ipAddress}}</td></tr><tr><td style="padding: 8px 0; color: #718096;">Timestamp:</td><td style="padding: 8px 0; color: #a0aec0;">{{downloadedAt}}</td></tr></table></div>',
      bodyText:
        'Resume Download Alert:\n\nResume: {{resumeTitle}}\nLocation: {{city}}, {{country}}\nReferrer: {{referrerSource}}\nIP: {{ipAddress}}\nTime: {{downloadedAt}}',
      variables: [
        'resumeTitle',
        'ipAddress',
        'country',
        'city',
        'referrerSource',
        'downloadedAt',
        'siteUrl',
      ],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'content_published_admin',
      name: 'Scheduled Content Published (Admin)',
      description: 'Report sent to admin when scheduled blog posts or projects go live.',
      subject: 'Scheduled Content Published ({{itemCount}} item(s))',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><h2 style="margin-top: 0; color: #64ffda; font-size: 20px; font-weight: 700;">Scheduled Content Published</h2><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">The automated content scheduler has published <strong style="color: #ffffff;">{{itemCount}}</strong> scheduled item(s) on your portfolio:</p><div style="background-color: #151921; border-radius: 8px; border: 1px solid #1f242e; padding: 18px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">{{publishedItemsSummary}}</div><p style="font-size: 12px; color: #718096;">Published at: {{publishedAt}}</p></div>',
      bodyText:
        'Scheduled Content Published:\n\nTotal items: {{itemCount}}\nSummary:\n{{publishedItemsSummary}}\n\nPublished at: {{publishedAt}}',
      variables: ['itemCount', 'publishedItemsSummary', 'publishedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'guestbook_admin_notification',
      name: 'New Guestbook Entry (Admin)',
      description: 'Alert sent to admin when a new guestbook message is pending moderation.',
      subject: 'New Guestbook Signature from {{authorName}} awaiting review',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><div style="display: inline-block; padding: 4px 10px; background-color: rgba(100, 255, 218, 0.1); border: 1px solid rgba(100, 255, 218, 0.3); border-radius: 6px; font-size: 11px; font-family: monospace; color: #64ffda; text-transform: uppercase; margin-bottom: 16px;">Guestbook Moderation</div><h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 700;">New Signature from {{authorName}}</h2><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;"><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096; width: 120px;">Author:</td><td style="padding: 8px 0; color: #ffffff; font-weight: 600;">{{authorName}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Email:</td><td style="padding: 8px 0; color: #a0aec0;">{{authorEmail}}</td></tr><tr><td style="padding: 8px 0; color: #718096;">Date:</td><td style="padding: 8px 0; color: #a0aec0;">{{submittedAt}}</td></tr></table><div style="background-color: #151921; border-radius: 8px; border: 1px solid #1f242e; padding: 18px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; font-style: italic;">"{{message}}"</div><div style="margin-top: 24px;"><a href="{{adminUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #64ffda; color: #0d0f14; font-weight: 700; text-decoration: none; border-radius: 6px; font-size: 13px;">Review in Guestbook Moderation</a></div></div>',
      bodyText:
        'New Guestbook Entry:\n\nAuthor: {{authorName}}\nEmail: {{authorEmail}}\nDate: {{submittedAt}}\n\nMessage:\n{{message}}\n\nModerate at: {{adminUrl}}',
      variables: ['authorName', 'authorEmail', 'message', 'adminUrl', 'submittedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'guestbook_approved',
      name: 'Guestbook Entry Approved (Visitor)',
      description: 'Confirmation sent to guest author when their entry is approved.',
      subject: 'Your guestbook message is now live on Anuj Yadav Portfolio!',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><h2 style="margin-top: 0; color: #64ffda; font-size: 20px; font-weight: 700;">Your Message is Live! ✨</h2><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Hi <strong style="color: #ffffff;">{{authorName}}</strong>,</p><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Thank you for signing my guestbook. Your message has been approved and is now visible on the website:</p><div style="background-color: #151921; border-left: 3px solid #64ffda; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #cbd5e1; font-style: italic;">"{{message}}"</div><div style="margin: 24px 0;"><a href="{{guestbookUrl}}" style="display: inline-block; padding: 10px 20px; background-color: #64ffda; color: #0d0f14; font-weight: 700; text-decoration: none; border-radius: 6px; font-size: 13px;">View Live Guestbook</a></div><p style="font-size: 13px; color: #718096; margin-bottom: 0;">Thanks for visiting and sharing your note!</p></div>',
      bodyText:
        'Hi {{authorName}},\n\nThank you for signing my guestbook. Your message has been approved and is now live:\n\n"{{message}}"\n\nView it at: {{guestbookUrl}}\n\nBest regards,\nAnuj Yadav',
      variables: ['authorName', 'message', 'guestbookUrl', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'visit_admin_notification',
      name: 'Visitor Telemetry Alert (Admin)',
      description: 'Real-time alert sent to admin on new unique visitor sessions.',
      subject: '🌐 New Portfolio Visitor from {{country}}, {{city}}',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><div style="display: inline-block; padding: 4px 10px; background-color: rgba(100, 255, 218, 0.1); border: 1px solid rgba(100, 255, 218, 0.3); border-radius: 6px; font-size: 11px; font-family: monospace; color: #64ffda; text-transform: uppercase; margin-bottom: 16px;">Visitor Telemetry</div><h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 700;">New Unique Visitor Session</h2><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;"><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096; width: 120px;">Location:</td><td style="padding: 8px 0; color: #64ffda; font-weight: 600;">{{city}}, {{country}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Device & OS:</td><td style="padding: 8px 0; color: #ffffff;">{{deviceType}} • {{os}} ({{browser}})</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Referrer:</td><td style="padding: 8px 0; color: #a0aec0;">{{referrerSource}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">IP Address:</td><td style="padding: 8px 0; color: #a0aec0; font-family: monospace;">{{ipAddress}}</td></tr><tr><td style="padding: 8px 0; color: #718096;">Time:</td><td style="padding: 8px 0; color: #a0aec0;">{{visitedAt}}</td></tr></table></div>',
      bodyText:
        'New Visitor Session:\n\nLocation: {{city}}, {{country}}\nDevice: {{deviceType}} ({{os}}, {{browser}})\nReferrer: {{referrerSource}}\nIP: {{ipAddress}}\nTime: {{visitedAt}}',
      variables: [
        'ipAddress',
        'country',
        'city',
        'deviceType',
        'browser',
        'os',
        'referrerSource',
        'visitedAt',
        'siteUrl',
      ],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'admin_login_security',
      name: 'New Device Login Security Alert (Admin)',
      description:
        'Security alert sent on admin dashboard login from an unrecognized device or IP.',
      subject: '🛡️ Security Alert: New Admin Login from {{ipAddress}}',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><h2 style="margin-top: 0; color: #f56565; font-size: 20px; font-weight: 700;">Security Alert: New Admin Login</h2><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">An administrative session was just initialized on your portfolio platform:</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;"><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096; width: 120px;">Admin Account:</td><td style="padding: 8px 0; color: #ffffff; font-weight: 600;">{{adminName}} ({{adminEmail}})</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">IP Address:</td><td style="padding: 8px 0; color: #f56565; font-family: monospace; font-weight: 600;">{{ipAddress}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Location:</td><td style="padding: 8px 0; color: #cbd5e1;">{{location}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">Device:</td><td style="padding: 8px 0; color: #a0aec0;">{{deviceType}} • {{os}} ({{browser}})</td></tr><tr><td style="padding: 8px 0; color: #718096;">Login Time:</td><td style="padding: 8px 0; color: #a0aec0;">{{loginTime}}</td></tr></table><p style="font-size: 13px; color: #a0aec0;">If this was you, you can safely disregard this alert. If you did not log in, please reset your admin password immediately.</p></div>',
      bodyText:
        'Security Alert: New Admin Login\n\nAdmin: {{adminName}} ({{adminEmail}})\nIP: {{ipAddress}}\nLocation: {{location}}\nDevice: {{deviceType}} ({{os}}, {{browser}})\nTime: {{loginTime}}\n\nIf this was not you, reset your password immediately.',
      variables: [
        'adminName',
        'adminEmail',
        'ipAddress',
        'deviceType',
        'browser',
        'os',
        'location',
        'loginTime',
        'siteUrl',
      ],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'security_profile_updated',
      name: 'Security Audit Notification (Admin)',
      description: 'Security audit confirmation sent when admin password or profile is updated.',
      subject: 'Security Notice: {{actionType}} on your account',
      bodyHtml:
        '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f14; border: 1px solid #1f242e; border-radius: 12px; overflow: hidden; color: #e1e7ec; padding: 32px;"><h2 style="margin-top: 0; color: #64ffda; font-size: 20px; font-weight: 700;">Account Security Notice</h2><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">Hi {{adminName}},</p><p style="font-size: 14px; line-height: 1.6; color: #a0aec0;">This is a confirmation that <strong style="color: #ffffff;">{{actionType}}</strong> was successfully executed on your portfolio admin profile.</p><table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;"><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096; width: 120px;">Action:</td><td style="padding: 8px 0; color: #64ffda; font-weight: 600;">{{actionType}}</td></tr><tr style="border-bottom: 1px solid #1f242e;"><td style="padding: 8px 0; color: #718096;">IP Address:</td><td style="padding: 8px 0; color: #a0aec0; font-family: monospace;">{{ipAddress}}</td></tr><tr><td style="padding: 8px 0; color: #718096;">Timestamp:</td><td style="padding: 8px 0; color: #a0aec0;">{{updatedAt}}</td></tr></table></div>',
      bodyText:
        'Account Security Notice:\n\nAction: {{actionType}}\nAdmin: {{adminName}} ({{adminEmail}})\nIP: {{ipAddress}}\nTime: {{updatedAt}}',
      variables: ['adminName', 'adminEmail', 'actionType', 'ipAddress', 'updatedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
  ];

  for (const template of emailTemplates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { purpose: template.purpose, name: template.name },
    });
    if (existing) {
      await prisma.emailTemplate.update({
        where: { id: existing.id },
        data: template,
      });
    } else {
      await prisma.emailTemplate.create({
        data: template,
      });
    }
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
      url: 'https://www.linkedin.com/in/anujyadav-dev/',
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
      url: 'mailto:anujyadav9449@gmail.com',
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

  // ─── 14. Email Templates ───────────────────────────────────
  console.log('📧 Seeding default email templates...');
  const defaultTemplates = [
    {
      purpose: 'contact_auto_reply',
      name: 'Contact Form Auto-Reply',
      description: 'Auto-reply sent to visitors acknowledging their contact message submission.',
      subject: 'Thank you for reaching out, {{name}}!',
      bodyHtml:
        '<p>Hi <strong>{{name}}</strong>,</p><p>Thank you for reaching out. I have received your message regarding "{{subject}}" and will get back to you shortly.</p><p>Best regards,<br/>Anuj Yadav</p>',
      bodyText:
        'Hi {{name}},\n\nThank you for reaching out. I have received your message regarding "{{subject}}" and will get back to you shortly.\n\nBest regards,\nAnuj Yadav',
      variables: ['name', 'email', 'subject', 'message', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'contact_admin_notification',
      name: 'Contact Admin Notification',
      description: 'Instant notification dispatched to administrator upon a new contact form inquiry.',
      subject: 'New Contact Inquiry from {{name}}: {{subject}}',
      bodyHtml:
        '<p>You have received a new contact inquiry:</p><p><strong>From:</strong> {{name}} ({{email}})<br/><strong>Subject:</strong> {{subject}}<br/><strong>IP:</strong> {{ipAddress}}</p><p><strong>Message:</strong></p><p>{{message}}</p>',
      bodyText:
        'New contact inquiry:\nFrom: {{name}} ({{email}})\nSubject: {{subject}}\nIP: {{ipAddress}}\nMessage:\n{{message}}',
      variables: ['name', 'email', 'subject', 'message', 'ipAddress', 'submittedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'newsletter_confirmation',
      name: 'Newsletter Confirmation',
      description: 'Sent to new newsletter subscribers with their unique verification link.',
      subject: 'Confirm your newsletter subscription',
      bodyHtml:
        '<p>Hi {{name}},</p><p>Please confirm your subscription by clicking <a href="{{confirmationUrl}}">here</a>.</p>',
      bodyText: 'Hi {{name}},\n\nPlease confirm your subscription:\n{{confirmationUrl}}',
      variables: ['name', 'email', 'confirmationUrl', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'newsletter_welcome',
      name: 'Newsletter Welcome Email',
      description: 'Sent to subscribers immediately upon confirming their subscription.',
      subject: 'Welcome to the Engineering Dispatch!',
      bodyHtml:
        '<p>Hi {{name}},</p><p>Welcome to the newsletter! You will receive periodic engineering updates and case studies.</p>',
      bodyText: 'Hi {{name}},\n\nWelcome to the newsletter!',
      variables: ['name', 'email', 'unsubscribeUrl', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'newsletter_admin_notification',
      name: 'Newsletter New Subscriber Alert',
      description: 'Alert sent to administrator whenever a new reader joins the subscriber list.',
      subject: 'New Newsletter Subscriber: {{email}}',
      bodyHtml:
        '<p>New subscriber joined your newsletter:</p><p><strong>Email:</strong> {{email}}<br/><strong>Name:</strong> {{name}}</p>',
      bodyText: 'New subscriber:\nEmail: {{email}}\nName: {{name}}',
      variables: ['email', 'name', 'isConfirmed', 'subscribedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'newsletter_unsubscribe_admin_notification',
      name: 'Newsletter Unsubscribed Alert',
      description: 'Notification sent to administrator whenever a reader unsubscribes from the newsletter.',
      subject: 'Newsletter Unsubscribed: {{email}}',
      bodyHtml:
        '<div style="max-width: 560px; margin: 0 auto; background: #0c1017; border: 1px solid #1c2333; border-radius: 12px; padding: 32px 32px; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;"><h2 style="font-size: 20px; font-weight: bold; color: #10b981; margin: 0 0 6px 0;">Subscriber Unsubscribed</h2><p style="margin: 0 0 20px 0; font-size: 13px; color: #8b949e;">A reader has unsubscribed from your newsletter dispatch:</p><table style="width: 100%; border-collapse: collapse; font-size: 13px;"><tr style="border-bottom: 1px solid #1c2333;"><td style="padding: 10px 0; color: #8b949e; width: 140px;">Email:</td><td style="padding: 10px 0; color: #ffffff; font-weight: 500;"><a href="mailto:{{email}}" style="color: #ffffff; text-decoration: none;">{{email}}</a></td></tr><tr style="border-bottom: 1px solid #1c2333;"><td style="padding: 10px 0; color: #8b949e;">Name:</td><td style="padding: 10px 0; color: #ffffff; font-weight: 500;">{{name}}</td></tr><tr style="border-bottom: 1px solid #1c2333;"><td style="padding: 10px 0; color: #8b949e;">Status:</td><td style="padding: 10px 0; color: #10b981; font-weight: 500;">Unsubscribed</td></tr><tr><td style="padding: 10px 0; color: #8b949e;">Unsubscribed At:</td><td style="padding: 10px 0; color: #ffffff;">{{unsubscribedAt}}</td></tr></table></div>',
      bodyText:
        'Newsletter Unsubscribed:\nEmail: {{email}}\nName: {{name}}\nStatus: Unsubscribed\nUnsubscribed At: {{unsubscribedAt}}',
      variables: ['email', 'name', 'unsubscribedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },

    {
      purpose: 'newsletter_broadcast',
      name: 'Newsletter Broadcast Template',
      description: 'Default template for broadcasting new blog posts and articles to all subscribers.',
      subject: '{{subject}}',
      bodyHtml: '<div>{{{contentHtml}}}</div>',
      bodyText: '{{subject}}\n\n{{contentHtml}}',
      variables: ['name', 'email', 'subject', 'previewText', 'contentHtml', 'unsubscribeUrl', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'resume_download_admin',
      name: 'Resume Download Alert',
      description: 'Dispatched when a visitor or recruiter downloads your resume PDF.',
      subject: 'Resume Downloaded by visitor from {{country}}, {{city}}',
      bodyHtml:
        '<p>A visitor has downloaded your resume:</p><p><strong>Location:</strong> {{city}}, {{country}}<br/><strong>Referrer:</strong> {{referrerSource}}<br/><strong>IP:</strong> {{ipAddress}}</p>',
      bodyText:
        'Resume Downloaded:\nLocation: {{city}}, {{country}}\nReferrer: {{referrerSource}}\nIP: {{ipAddress}}',
      variables: ['resumeTitle', 'ipAddress', 'country', 'city', 'referrerSource', 'downloadedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'content_published_admin',
      name: 'Scheduled Content Published',
      description: 'Summary report sent when scheduled blog posts or projects go live automatically.',
      subject: 'Scheduled Content Published ({{itemCount}} item(s))',
      bodyHtml:
        '<p>The automated scheduler published {{itemCount}} item(s):</p><p>{{publishedItemsSummary}}</p>',
      bodyText: 'Scheduled content published ({{itemCount}} items):\n{{publishedItemsSummary}}',
      variables: ['itemCount', 'publishedItemsSummary', 'publishedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'guestbook_admin_notification',
      name: 'Guestbook New Entry Alert',
      description: 'Dispatched when a new guestbook note is submitted and awaiting review.',
      subject: 'New Guestbook Signature from {{authorName}}',
      bodyHtml:
        '<p>New guestbook entry awaiting moderation from <strong>{{authorName}}</strong> ({{authorEmail}}):</p><p>{{message}}</p>',
      bodyText:
        'New guestbook entry:\nAuthor: {{authorName}} ({{authorEmail}})\nMessage:\n{{message}}',
      variables: ['authorName', 'authorEmail', 'message', 'submittedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'guestbook_approved',
      name: 'Guestbook Entry Approved',
      description: 'Notice sent to author when their guestbook entry is approved.',
      subject: 'Your guestbook message is now live!',
      bodyHtml:
        '<p>Hi {{authorName}},</p><p>Your guestbook entry has been approved and is now live on the portfolio:</p><p><em>"{{message}}"</em></p>',
      bodyText:
        'Hi {{authorName}},\n\nYour guestbook message is now live:\n"{{message}}"\n\nBest,\nAnuj Yadav',
      variables: ['authorName', 'authorEmail', 'message', 'approvedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'visit_admin_notification',
      name: 'Visitor Telemetry Alert',
      description: 'Notification sent to admin when a new unique visitor browses the site.',
      subject: 'New Portfolio Visitor from {{country}}, {{city}}',
      bodyHtml:
        '<p>New visitor session:</p><p><strong>Location:</strong> {{city}}, {{country}}<br/><strong>Device:</strong> {{deviceType}} ({{os}}, {{browser}})<br/><strong>Referrer:</strong> {{referrerSource}}</p>',
      bodyText:
        'New visitor session:\nLocation: {{city}}, {{country}}\nDevice: {{deviceType}} ({{os}}, {{browser}})\nReferrer: {{referrerSource}}',
      variables: ['city', 'country', 'deviceType', 'os', 'browser', 'referrerSource', 'visitedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'admin_login_security',
      name: 'Security: Admin Login Alert',
      description: 'Security alert sent to admin upon login.',
      subject: 'Security Alert: New Admin Login from {{ipAddress}}',
      bodyHtml:
        '<p>Security Notice: New admin login detected from IP <strong>{{ipAddress}}</strong> ({{location}}) using {{deviceType}} / {{browser}}.</p>',
      bodyText:
        'Security Alert: New admin login from {{ipAddress}} ({{location}}) on {{deviceType}} ({{browser}}).',
      variables: ['ipAddress', 'location', 'deviceType', 'browser', 'loginTime', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
    {
      purpose: 'security_profile_updated',
      name: 'Security: Profile Updated',
      description: 'Notice sent when admin credentials or profile change.',
      subject: 'Security Notice: {{actionType}} on your account',
      bodyHtml:
        '<p>Confirmation: {{actionType}} was performed on your admin account from IP {{ipAddress}} at {{updatedAt}}.</p>',
      bodyText:
        'Security Notice: {{actionType}} on your account from {{ipAddress}} at {{updatedAt}}.',
      variables: ['adminName', 'adminEmail', 'actionType', 'ipAddress', 'updatedAt', 'siteUrl'],
      isActive: true,
      isEnabled: true,
    },
  ];

  for (const t of defaultTemplates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { purpose: t.purpose },
    });
    if (!existing) {
      await prisma.emailTemplate.create({
        data: t,
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
