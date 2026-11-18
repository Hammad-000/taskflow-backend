
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Task title must be at least 3 characters")
    .max(100, "Task title cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  projectId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID"),

  assigneeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid assignee ID")
    .optional(),

  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .default("medium"),

  status: z
    .enum(["todo", "in_progress", "review", "done"])
    .default("todo"),

  dueDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  projectId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),

  assigneeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .nullable()
    .optional(),

  priority: z
    .enum(["low", "medium", "high", "urgent"])
    .optional(),

  status: z
    .enum(["todo", "in_progress", "review", "done"])
    .optional(),

  dueDate: z.coerce.date().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
