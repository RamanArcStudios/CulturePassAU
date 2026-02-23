import type { Express, Request, Response } from "express";
import * as followsService from "./follows.service";

function p(val: string | string[]): string { return Array.isArray(val) ? val[0] : val; }

export function registerFollowsRoutes(app: Express) {
  app.post("/api/follow", async (req: Request, res: Response) => {
    const { followerId, targetId, targetType } = req.body;
    const follow = await followsService.follow(followerId, targetId, targetType);
    res.json(follow);
  });

  app.post("/api/unfollow", async (req: Request, res: Response) => {
    const { followerId, targetId } = req.body;
    const result = await followsService.unfollow(followerId, targetId);
    res.json({ success: result });
  });

  app.get("/api/followers/:targetId", async (req: Request, res: Response) => {
    const followers = await followsService.getFollowers(p(req.params.targetId));
    res.json(followers);
  });

  app.get("/api/following/:userId", async (req: Request, res: Response) => {
    const following = await followsService.getFollowing(p(req.params.userId));
    res.json(following);
  });

  app.get("/api/is-following", async (req: Request, res: Response) => {
    const { followerId, targetId } = req.query;
    const result = await followsService.isFollowing(followerId as string, targetId as string);
    res.json({ isFollowing: result });
  });

  app.post("/api/like", async (req: Request, res: Response) => {
    const { userId, targetId, targetType } = req.body;
    const like = await followsService.likeEntity(userId, targetId, targetType);
    res.json(like);
  });

  app.post("/api/unlike", async (req: Request, res: Response) => {
    const { userId, targetId } = req.body;
    const result = await followsService.unlikeEntity(userId, targetId);
    res.json({ success: result });
  });

  app.get("/api/is-liked", async (req: Request, res: Response) => {
    const { userId, targetId } = req.query;
    const result = await followsService.isLiked(userId as string, targetId as string);
    res.json({ isLiked: result });
  });

  app.get("/api/reviews/:targetId", async (req: Request, res: Response) => {
    const reviews = await followsService.getReviews(p(req.params.targetId));
    res.json(reviews);
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const review = await followsService.createReview(req.body);
      res.status(201).json(review);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.delete("/api/reviews/:id", async (req: Request, res: Response) => {
    const deleted = await followsService.deleteReview(p(req.params.id));
    if (!deleted) return res.status(404).json({ error: "Review not found" });
    res.json({ success: true });
  });

  app.get("/api/members/:profileId", async (req: Request, res: Response) => {
    const members = await followsService.getMembers(p(req.params.profileId));
    res.json(members);
  });
}
