---
name: weather-pro
title: 'Weather Pro'
description: 'Current conditions and a 7-day forecast for a location, returning daily high/low temperatures, conditions, and wind — with a free discovery list of supported cities.'
use_case: 'Use for weather lookups, trip and event planning, daily high/low and condition forecasts, and wind checks for a named city.'
category: data
service_url: https://paysh-video-gateway.vercel.app
openapi:
  path: openapi.json
---

## Usage Notes

Call the free `locations` endpoint first to discover the supported cities, then
call the paid `forecast` endpoint with `?location=<city>` for a 7-day forecast.
`health` is free. An unknown `location` returns 404 with the list of valid
cities, so callers can recover without paying again.

## Spend-Aware Usage

- Hit `locations` (free) before paying, so `forecast` calls use a valid city.
- One paid `forecast` call already returns the full 7-day outlook — don't loop
  per day.
- Cache a forecast for the day; conditions don't meaningfully change call-to-call.
