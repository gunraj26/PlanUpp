import { createSwaggerSpec } from "next-swagger-doc"

export const getSwaggerSpec = () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "PlanUpp API Documentation",
        version: "1.0.0",
        description: "API documentation for PlanUpp application",
        contact: {
          name: "PlanUpp Support",
          email: "support@planupp.com",
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
          description: "Development server",
        },
        {
          url: "https://planupp.vercel.app",
          description: "Production server",
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apiFolder: "app/api", // Updated to use app/api instead of pages/api
  })
  return spec
}
