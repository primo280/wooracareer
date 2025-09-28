import { z } from "zod"

export const createJobSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  company: z.string().min(1, "Company is required").max(100, "Company must be less than 100 characters"),
  location: z.string().min(1, "Location is required").max(100, "Location must be less than 100 characters"),
  type: z.enum(["CDI", "CDD", "Stage", "Freelance"], {
    errorMap: () => ({ message: "Type must be one of: CDI, CDD, Stage, Freelance" }),
  }),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  currency: z.string().default("EUR"),
  description: z.string().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  requirements: z.string().max(5000, "Requirements must be less than 5000 characters").optional(),
  benefits: z.string().max(5000, "Benefits must be less than 5000 characters").optional(),
  remoteWork: z.boolean().default(false),
  experienceLevel: z.string().max(50, "Experience level must be less than 50 characters").optional(),
  contractDuration: z.string().max(50, "Contract duration must be less than 50 characters").optional(),
  applicationUrl: z.string().url("Application URL must be a valid URL").optional().or(z.literal("")),
  applicationEmail: z.string().email("Application email must be a valid email").optional().or(z.literal("")),
  companyLogo: z.string().url("Company logo must be a valid URL").optional().or(z.literal("")),
  companyWebsite: z.string().url("Company website must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  expiresAt: z.string().datetime("Expires at must be a valid date").optional(),
}).refine((data) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax
  }
  return true
}, {
  message: "Minimum salary must be less than or equal to maximum salary",
  path: ["salaryMin"],
})

export const updateJobSchema = z.object({
  id: z.number().int().positive("Job ID must be a positive number"),
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters").optional(),
  company: z.string().min(1, "Company is required").max(100, "Company must be less than 100 characters").optional(),
  location: z.string().min(1, "Location is required").max(100, "Location must be less than 100 characters").optional(),
  type: z.enum(["CDI", "CDD", "Stage", "Freelance"], {
    errorMap: () => ({ message: "Type must be one of: CDI, CDD, Stage, Freelance" }),
  }).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  currency: z.string().default("EUR").optional(),
  description: z.string().min(1, "Description is required").max(5000, "Description must be less than 5000 characters").optional(),
  requirements: z.string().max(5000, "Requirements must be less than 5000 characters").optional(),
  benefits: z.string().max(5000, "Benefits must be less than 5000 characters").optional(),
  remoteWork: z.boolean().optional(),
  experienceLevel: z.string().max(50, "Experience level must be less than 50 characters").optional(),
  contractDuration: z.string().max(50, "Contract duration must be less than 50 characters").optional(),
  applicationUrl: z.string().url("Application URL must be a valid URL").optional().or(z.literal("")),
  applicationEmail: z.string().email("Application email must be a valid email").optional().or(z.literal("")),
  companyLogo: z.string().url("Company logo must be a valid URL").optional().or(z.literal("")),
  companyWebsite: z.string().url("Company website must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(["active", "paused", "closed"]).optional(),
  expiresAt: z.string().datetime("Expires at must be a valid date").optional(),
}).refine((data: any) => {
  if (data.salaryMin && data.salaryMax) {
    return data.salaryMin <= data.salaryMax
  }
  return true
}, {
  message: "Minimum salary must be less than or equal to maximum salary",
  path: ["salaryMin"],
})

export type UpdateJobInput = z.infer<typeof updateJobSchema>

export type CreateJobInput = z.infer<typeof createJobSchema>

export const jobFiltersSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["CDI", "CDD", "Stage", "Freelance"]).optional(),
  salaryMin: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val >= 0, {
    message: "Salary minimum must be a valid non-negative number"
  }).optional(),
})

export type JobFiltersInput = z.infer<typeof jobFiltersSchema>
