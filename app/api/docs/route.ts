import { NextResponse } from "next/server"
import { getSwaggerSpec } from "@/lib/swagger"

/**
 * @swagger
 * /api/docs:
 *   get:
 *     description: Returns the Swagger documentation as JSON
 *     responses:
 *       200:
 *         description: Swagger documentation JSON
 */
export async function GET() {
  const spec = getSwaggerSpec()
  return NextResponse.json(spec)
}
