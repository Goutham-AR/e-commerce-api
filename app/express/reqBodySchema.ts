import { z } from "zod";


export const userRegisterSchema = z.object({
    email: z.string(),
    name: z.string(),
    password: z.string(),
    role: z.string(),
});