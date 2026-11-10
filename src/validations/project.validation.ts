import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(["active", "completed", "on_hold"]).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(3).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(["active", "completed", "on_hold"]).optional(),
});