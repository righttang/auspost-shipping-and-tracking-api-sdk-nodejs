# Get Label API

## Overview
This service returns information on a label request created using the Create Labels service.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | GET |
| Rate Limited | Yes |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/labels/{request_id}`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/labels/{request_id}`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |

## URL Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| request_id | Yes | Label request ID from Create Labels service |

## Example Request

```
GET https://digitalapi.auspost.com.au/shipping/v1/labels/d9d1445d-cd1b-452d-9d68-29dbb3967acf
```

## Example Response (200 OK)

```json
{
  "labels": [
    {
      "request_id": "d9d1445d-cd1b-452d-9d68-29dbb3967acf",
      "url": "https://auspost.com.au/d9d1445d-cd1b-452d-9d68-29dbb3967acf.pdf?Expires=1458273129&Signature=Mww3Oxd%2BV2d9SjoQkrIr%2F%2F2DrFs%3D",
      "status": "AVAILABLE",
      "request_date": "2016-03-17 11:04:29",
      "shipments": [
        {
          "shipment_id": "9lesEAOvOm4AAAFI3swaDRYB"
        },
        {
          "shipment_id": "NdgK1EV5cRgAAAFThhoE7mN6"
        }
      ],
      "url_creation_date": "2016-03-17 11:04:53",
      "shipment_ids": ["9lesEAOvOm4AAAFI3swaDRYB", "NdgK1EV5cRgAAAFThhoE7mN6"]
    }
  ]
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| labels | Array | Label information for each label created |
| labels[].request_id | String | Request ID from Create Labels service |
| labels[].url | String | URL to download label (only when status=AVAILABLE) |
| labels[].status | String | PENDING, ERROR, or AVAILABLE |
| labels[].request_date | DateTime | Request timestamp |
| labels[].shipments | Array | Shipments included |
| labels[].shipments[].shipment_id | String | Shipment ID |
| labels[].url_creation_date | DateTime | When URL was created |
| labels[].shipment_ids | Array | List of shipment IDs |

## Label Status Values

| Status | Description |
|--------|-------------|
| PENDING | Labels are being generated |
| ERROR | Label generation failed |
| AVAILABLE | Label generation complete, URL available |

## Label URL Content Types

- **PDF labels**: `application/pdf`
- **ZPL labels**: `text/plain`

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 51020 | LABEL_REQUEST_NOT_FOUND_ERROR | Request ID not found |
| API_002 | Too many requests | Rate limit exceeded (HTTP 429) |

## Rate Limiting

This endpoint is rate limited. If you exceed the limit, you'll receive HTTP 429 with:

```json
{
  "errors": [
    {
      "message": "Too many requests",
      "error_code": "API_002",
      "error_name": "Too many requests"
    }
  ]
}
```
