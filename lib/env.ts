import { validateEnv } from "./schemas/env.schema"

/**
 * Variables de entorno validadas y tipadas
 */
export const env = validateEnv()
