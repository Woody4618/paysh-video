import { z } from "zod";

// OpenAPI schemas for the Weather Pro API, kept out of the route.ts files
// because Next.js only allows specific exports (HTTP method handlers, `dynamic`,
// etc.) from a route module. `openapi-gen` scans schemaDir (app/api) for these
// and resolves them from the @response / @queryParams JSDoc tags in the routes.

export const HealthResponse = z
  .object({
    status: z.string().describe("Service status, e.g. \"ok\""),
  })
  .describe("Service health payload");

export const LocationsResponse = z
  .object({
    locations: z
      .array(
        z.object({
          key: z.string().describe("Normalized location key"),
          name: z.string().describe("Canonical display name"),
        }),
      )
      .describe("Supported forecast locations"),
    hint: z.string().describe("How to call the paid forecast endpoint"),
  })
  .describe("Discovery list of supported locations");

/** @internal */
export const ForecastQuery = z.object({
  location: z
    .string()
    .optional()
    .describe("City to forecast. Defaults to San Francisco. See /locations for valid values."),
});

const DailyForecast = z.object({
  date: z.string().describe("ISO date (YYYY-MM-DD)"),
  high_c: z.number().describe("Daily high in Celsius"),
  low_c: z.number().describe("Daily low in Celsius"),
  condition: z.string().describe("Summary condition, e.g. \"sunny\""),
});

export const ForecastResponse = z
  .object({
    location: z.string().describe("Canonical location name"),
    generated_at: z.string().describe("ISO timestamp when the forecast was generated"),
    current: z
      .object({
        temp_c: z.number().describe("Current temperature in Celsius"),
        condition: z.string().describe("Current condition"),
        wind_kph: z.number().describe("Current wind speed in km/h"),
      })
      .describe("Current conditions"),
    forecast: z.array(DailyForecast).describe("Seven-day daily forecast"),
  })
  .describe("Current conditions and 7-day forecast");

export const UnknownLocationResponse = z
  .object({
    error: z.string().describe("Machine-readable error code"),
    message: z.string().describe("Human-readable explanation"),
    available: z.array(z.string()).describe("Supported location names"),
  })
  .describe("Returned when the requested location is not supported");

// The 402 is produced by the pay gateway (not this upstream route), but it is
// part of the public contract, so document a minimal challenge-error shape.
export const PaymentRequired = z
  .object({
    error: z.string().describe("Error code, e.g. \"payment_required\""),
    message: z.string().describe("How to complete payment through the gateway"),
  })
  .describe("Payment required — returned by the paid gateway");
