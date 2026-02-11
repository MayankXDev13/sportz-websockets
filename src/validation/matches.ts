import { z } from "zod";


export const MATCH_STATUS = {
  SCHEDULED: "scheduled",
  LIVE: "live",
  FINISHED: "finished",
} as const;


export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});


export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, "Sport is required"),
    homeTeam: z.string().min(1, "Home team is required"),
    awayTeam: z.string().min(1, "Away team is required"),
    startTime: z.string().refine(
      (val) => {
        try {
          const date = new Date(val);
          return !isNaN(date.getTime()) && date.toISOString() === val;
        } catch {
          return false;
        }
      },
      { message: "Start time must be a valid ISO date string" },
    ),
    endTime: z.string().refine(
      (val) => {
        try {
          const date = new Date(val);
          return !isNaN(date.getTime()) && date.toISOString() === val;
        } catch {
          return false;
        }
      },
      { message: "End time must be a valid ISO date string" },
    ),
    homeScore: z.coerce.number().int().nonnegative().optional(),
    awayScore: z.coerce.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.startTime);
    const endDate = new Date(data.endTime);

    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });


export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().nonnegative(),
  awayScore: z.coerce.number().int().nonnegative(),
});


export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;
export type MatchIdParam = z.infer<typeof matchIdParamSchema>;
export type CreateMatch = z.infer<typeof createMatchSchema>;
export type UpdateScore = z.infer<typeof updateScoreSchema>;
export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];
