import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName1: z.string().optional().default(''),
  lastName2: z.string().optional().default(''),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
})

export const createRoundSchema = z.object({
  playerId: z.string().optional(),
  courseName: z.string().min(1, 'Course name is required'),
  courseId: z.string().optional(),
  teeColor: z.string().min(1, 'Tee color is required'),
  totalHoles: z.union([z.literal(9), z.literal(18)]),
  holes: z
    .array(
      z.object({
        number: z.number().int().min(1).max(18),
        par: z.number().int().min(3).max(6),
        score: z.number().int(),
        handicap: z.number().optional(),
        fairwayHit: z
          .union([z.literal('Yes'), z.literal('No'), z.literal('Left'), z.literal('Right')])
          .nullable()
          .default(null),
        gir: z.boolean().nullable().default(null),
        putts: z.number().int().default(0),
        puttDistance: z
          .union([z.literal('<1'), z.literal('1-2'), z.literal('2-4'), z.literal('4-8'), z.literal('+8')])
          .nullable()
          .default(null),
        penalties: z.number().int().default(0),
        sandSave: z.number().int().default(0),
        approach: z.number().int().default(0),
        drivingDistance: z.number().nullable().default(null),
      })
    )
    .optional(),
  gameMode: z.string().optional(),
})

export const updateHoleSchema = z.object({
  score: z.number().int().optional(),
  fairwayHit: z
    .union([z.literal('Yes'), z.literal('No'), z.literal('Left'), z.literal('Right')])
    .nullable()
    .optional(),
  gir: z.boolean().nullable().optional(),
  putts: z.number().int().optional(),
  puttDistance: z
    .union([z.literal('<1'), z.literal('1-2'), z.literal('2-4'), z.literal('4-8'), z.literal('+8')])
    .nullable()
    .optional(),
  penalties: z.number().int().optional(),
  sandSave: z.number().int().optional(),
  approach: z.number().int().optional(),
  drivingDistance: z.number().nullable().optional(),
})

export const createPlayerSchema = z.object({
  id: z.string().optional(),
  email: z.string().email().optional().default(''),
  firstName: z.string().min(1, 'First name is required'),
  lastName1: z.string().optional().default(''),
  lastName2: z.string().optional().default(''),
  handicap: z.number().optional().default(0),
  homeCourse: z.string().optional().default(''),
  licenseNumber: z.string().optional().default(''),
})

export const verifyLicenseSchema = z.object({
  licenseNumber: z.string().min(1, 'License number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName1: z.string().optional(),
  lastName2: z.string().optional(),
})

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName1: z.string().optional().default(''),
  lastName2: z.string().optional().default(''),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
})

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName1: z.string().optional(),
  lastName2: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6).optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
})

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Token is required'),
})

export const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required'),
  tees: z.array(
    z.object({
      name: z.string().min(1),
      rating: z.number(),
      slope: z.number(),
      totalHoles: z.union([z.literal(9), z.literal(18)]),
      pars: z.array(z.number().int()),
    })
  ),
})

export const updateCourseSchema = z.object({
  name: z.string().optional(),
  tees: z
    .array(
      z.object({
        name: z.string().min(1),
        rating: z.number(),
        slope: z.number(),
        totalHoles: z.union([z.literal(9), z.literal(18)]),
        pars: z.array(z.number().int()),
      })
    )
    .optional(),
})

export function formatZodErrors(error: unknown): { path: string; message: string }[] {
  if (error && typeof error === 'object' && 'issues' in error) {
    return (error as { issues: { path: (string | number)[]; message: string }[] }).issues.map(
      (issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })
    )
  }
  return [{ path: '', message: 'Validation failed' }]
}
