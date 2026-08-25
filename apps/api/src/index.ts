import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@/config/env';
import { logger } from '@/config/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestIdMiddleware } from '@/middleware/requestId.middleware';
import { requestLoggerMiddleware } from '@/middleware/requestLogger.middleware';
import { publicRateLimiter } from '@/middleware/rateLimit.middleware';

import { healthRouter } from '@/routes/health.route';
import { authRouter } from '@/routes/auth.route';
import { mediaRouter } from '@/routes/media.route';
import { analyticsRouter } from '@/routes/analytics.route';
import { contactRouter } from '@/routes/contact.route';
import { projectCategoryRouter } from '@/routes/projectCategory.route';
import { projectRouter } from '@/routes/project.route';
import { blogCategoryRouter } from '@/routes/blogCategory.route';
import { blogRouter } from '@/routes/blog.route';
import { researchRouter } from '@/routes/research.route';
import { pageRouter } from '@/routes/page.route';
import { contentBlockRouter } from '@/routes/contentBlock.route';
import { aboutSectionRouter } from '@/routes/aboutSection.route';
import { skillCategoryRouter } from '@/routes/skillCategory.route';
import { skillRouter } from '@/routes/skill.route';
import { experienceRouter } from '@/routes/experience.route';
import { educationRouter } from '@/routes/education.route';
import { certificateRouter } from '@/routes/certificate.route';
import { achievementRouter } from '@/routes/achievement.route';
import { timelineRouter } from '@/routes/timeline.route';
import { resumeRouter } from '@/routes/resume.route';
import { socialLinkRouter } from '@/routes/socialLink.route';
import { opensourceRouter } from '@/routes/opensource.route';
import { galleryRouter } from '@/routes/gallery.route';
import { homepageSectionRouter } from '@/routes/homepageSection.route';
import { navItemRouter } from '@/routes/navItem.route';
import { siteSettingRouter } from '@/routes/siteSetting.route';
import { guestbookRouter } from '@/routes/guestbook.route';
import { testimonialRouter } from '@/routes/testimonial.route';
import { newsletterRouter } from '@/routes/newsletter.route';
import { tagRouter } from '@/routes/tag.route';
import { searchRouter } from '@/routes/search.route';
import { statsRouter } from '@/routes/stats.route';
import { schedulerService } from '@/services/scheduler.service';

const app = express();

app.set('trust proxy', 1);

app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.STORAGE_PROVIDER === 'local') {
  const uploadPath = path.resolve(process.cwd(), config.UPLOAD_DIR);
  app.use('/uploads', express.static(uploadPath));
}

const apiRouter = express.Router();
apiRouter.use(publicRateLimiter);
apiRouter.use(healthRouter);

// Auth & Infrastructure
apiRouter.use('/auth', authRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/analytics', analyticsRouter);

// Content Modules
apiRouter.use('/project-categories', projectCategoryRouter);
apiRouter.use('/projects', projectRouter);
apiRouter.use('/blog-categories', blogCategoryRouter);
apiRouter.use('/blogs', blogRouter);
apiRouter.use('/research', researchRouter);
apiRouter.use('/pages', pageRouter);
apiRouter.use('/content-blocks', contentBlockRouter);

// Profile & Portfolio Modules
apiRouter.use('/about-sections', aboutSectionRouter);
apiRouter.use('/skill-categories', skillCategoryRouter);
apiRouter.use('/skills', skillRouter);
apiRouter.use('/experiences', experienceRouter);
apiRouter.use('/education', educationRouter);
apiRouter.use('/certificates', certificateRouter);
apiRouter.use('/achievements', achievementRouter);
apiRouter.use('/timeline-events', timelineRouter);
apiRouter.use('/resumes', resumeRouter);
apiRouter.use('/social-links', socialLinkRouter);
apiRouter.use('/opensource', opensourceRouter);
apiRouter.use('/gallery', galleryRouter);

// Layout & Site Configuration Modules
apiRouter.use('/homepage-sections', homepageSectionRouter);
apiRouter.use('/nav-items', navItemRouter);
apiRouter.use('/site-settings', siteSettingRouter);

// Interactions, Moderation & Communications
apiRouter.use('/contact', contactRouter);
apiRouter.use('/guestbook', guestbookRouter);
apiRouter.use('/testimonials', testimonialRouter);
apiRouter.use('/newsletter', newsletterRouter);

// Discovery, Taxonomy & Metrics
apiRouter.use('/tags', tagRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/stats', statsRouter);

app.use('/api/v1', apiRouter);
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    logger.info(
      { port: config.PORT, env: config.NODE_ENV },
      'API server started',
    );
    schedulerService.startScheduler();
  });
}

export { app };
