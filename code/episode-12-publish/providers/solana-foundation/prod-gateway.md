---
name: prod-gateway
title: 'Production Gateway'
description: 'Search and retrieve normalized usage reports with metrics, filters, time ranges, pagination, and result fields for analytics and billing automation.'
use_case: 'Use for usage reporting, metering analytics, billing reconciliation, and consumption monitoring across paid API gateways.'
category: data
service_url: https://prod-gateway.example.com
sandbox_service_url: https://sandbox-prod-gateway.example.com
version: v1
endpoints:
  - method: GET
    path: v1/reports/usage
    description: 'Retrieve usage reports with metrics, filters, and time-range pagination'
    pricing:
      dimensions:
        - direction: usage
          unit: requests
          scale: 1
          tiers:
            - price_usd: 0.01
---

## Usage Notes

Use `v1/reports/usage` for direct usage lookups. Include a time range and keep
`limit` small to avoid unnecessary paid calls. The `v1/health` endpoint is free.

## Spend-Aware Usage

- Use the narrowest endpoint that answers the user.
- Batch records when supported.
- Ask before broad crawls, bulk enrichment, dynamic pricing, or purchases.
