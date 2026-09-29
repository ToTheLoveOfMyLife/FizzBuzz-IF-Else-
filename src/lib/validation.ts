import { z } from "zod";
import { workOrderPriorities, workOrderStatuses } from "../domain/work-order";

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
});

export const customerCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  siteAddress: z.string().trim().min(4).max(240),
});

export const workOrderCreateSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(12).max(3000),
  priority: z.enum(workOrderPriorities),
  customerId: z.string().min(1),
  assigneeId: z.string().min(1).nullable().optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
});

export const workOrderUpdateSchema = z.object({
  status: z.enum(workOrderStatuses).optional(),
  priority: z.enum(workOrderPriorities).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  scheduledFor: z.string().datetime().nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one field is required.");
