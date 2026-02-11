import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches";
import { db } from "../db/db";
import { matches } from "../db/schema";
import { getMatchStatus } from "../utils/match-status";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

const MAX_LIMIT = 100;

matchRouter.get("/", async(req, res) => {
const parsed = listMatchesQuerySchema.safeParse(req.query);

if (!parsed.success) {
    return res.status(400).json({
        error: "Invalid query",
        details: JSON.stringify(parsed.error),
    });
}

const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);
try {
    const data = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit);
    res.status(200).json({
        message: "Matches fetched successfully",
        data,
    });
} catch (error) {
    res.status(500).json({
        error: "Failed to list matches",
        details: JSON.stringify(error),
    });
}



});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: JSON.stringify(parsed.error),
    });
  }

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(parsed.data.startTime),
        endTime: new Date(parsed.data.endTime),
        homeScore: parsed.data.homeScore ?? 0,
        awayScore: parsed.data.awayScore ?? 0,
        status: getMatchStatus(parsed.data.startTime, parsed.data.endTime),
      })
      .returning();

    res.status(201).json({
      message: "Match created successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create match",
      details: JSON.stringify(error),
    });
  }
});
