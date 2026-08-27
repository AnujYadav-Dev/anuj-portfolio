import type { Request, Response } from 'express';
import { newsletterService } from '@/services/newsletter.service';
import type { ListNewsletterSubscribersQuery, NewsletterSubscribeInput } from '@portfolio/shared';

export const newsletterController = {
  async subscribe(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as NewsletterSubscribeInput;
    const result = await newsletterService.subscribe(input);
    res.status(201).json({ data: result });
  },

  async confirm(req: Request, res: Response): Promise<void> {
    const token = String(req.query.token);
    const result = await newsletterService.confirm(token);
    res.json({ data: result });
  },

  async unsubscribe(req: Request, res: Response): Promise<void> {
    const tokenOrEmail = String(req.query.token || req.body.email);
    const result = await newsletterService.unsubscribe(tokenOrEmail);
    res.json({ data: result });
  },

  async listSubscribers(req: Request, res: Response): Promise<void> {
    const query = (req.validatedQuery as ListNewsletterSubscribersQuery) ?? req.query;
    const result = await newsletterService.listSubscribers(query);
    res.json(result);
  },

  async exportSubscribers(_req: Request, res: Response): Promise<void> {
    const subscribers = await newsletterService.exportSubscribers();
    res.json({ data: subscribers });
  },

  async broadcast(req: Request, res: Response): Promise<void> {
    const input = req.validatedBody as any;
    const result = await newsletterService.broadcast(input);
    res.status(200).json(result);
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    await newsletterService.deleteSubscriber(id);
    res.status(204).send();
  },
};
