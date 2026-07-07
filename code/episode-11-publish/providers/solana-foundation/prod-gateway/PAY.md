---
name: prod-gateway
title: 'Production Gateway'
description: 'Search and retrieve normalized usage reports with metrics, filters, time ranges, pagination, and result fields for analytics and billing automation.'
use_case: 'Use for usage reporting, metering analytics, billing reconciliation, and consumption monitoring across paid API gateways.'
category: data
service_url: https://prod-gateway.example.com
openapi:
  path: openapi.json
---

## Usage Notes

Use `v1/reports/usage` for direct usage lookups. Include a time range and keep
`limit` small to avoid unnecessary paid calls. The `v1/health` endpoint is free.

## Spend-Aware Usage

- Use the narrowest endpoint that answers the user.
- Batch records when supported.
- Ask before broad crawls, bulk enrichment, dynamic pricing, or purchases.
