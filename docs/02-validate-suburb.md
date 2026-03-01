# Validate Suburb API

## Overview
This service validates a suburb, state, and postcode combination for an Australian postal address and returns the valid suburbs for the given state and postcode.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | GET |
| Rate Limited | No |
| Authentication | Basic Auth |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/address?suburb={suburb}&state={state}&postcode={postcode}`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/address?suburb={suburb}&state={state}&postcode={postcode}`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |

## Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| suburb | Yes | The suburb to validate |
| state | Yes | The state to validate (ACT, NSW, NT, QLD, SA, TAS, VIC, WA) |
| postcode | Yes | The 4-digit postcode to validate |

## Example Request

```
GET https://digitalapi.auspost.com.au/shipping/v1/address?suburb=Greensborough&state=VIC&postcode=3088
```

## Example Response (200 OK)

```json
{
  "found": true,
  "results": [
    "Briar Hill",
    "Greensborough",
    "St Helena"
  ]
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| found | Boolean | Whether the submitted suburb, state, and postcode is valid |
| results | Array | The suburbs located based on the state and postcode submitted |

## Example Error Response (400)

```json
{
  "errors": [
    {
      "code": "400",
      "name": "Bad Request",
      "message": "Unable to find a match for provided suburb: null"
    }
  ]
}
```

## Error Codes

| Code | Name | Message |
|------|------|---------|
| 400 | Bad Request | Unable to find a match for provided suburb: SUBURB |
