# Track Items API

## Overview
This service allows the client to track the progress of delivery by returning delivery events for one or more consignments or articles.

**Important**: Cannot track both Australia Post and StarTrack items in one request. Use either Australia Post tracking IDs OR StarTrack consignment IDs.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | GET |
| Rate Limited | Yes |
| Requests per minute | 10 |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/track?tracking_ids={tracking_ids}`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/track?tracking_ids={tracking_ids}`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |

## Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| tracking_ids | Yes | Comma-separated list of tracking IDs (max 10) |

## Example Request

```
GET https://digitalapi.auspost.com.au/shipping/v1/track?tracking_ids=7XX1000634011427,33XXX0123456
```

## Example Response (200 OK)

```json
{
  "tracking_results": [
    {
      "tracking_id": "7XX1000634011427",
      "status": "Delivered",
      "trackable_items": [
        {
          "article_id": "7XX1000634011427",
          "product_type": "eParcel",
          "events": [
            {
              "location": "ALEXANDRIA NSW",
              "description": "Delivered",
              "date": "2014-05-30T14:43:09+10:00"
            },
            {
              "location": "ALEXANDRIA NSW",
              "description": "With Australia Post for delivery today",
              "date": "2014-05-30T06:08:51+10:00"
            },
            {
              "location": "CHULLORA NSW",
              "description": "Processed through Australia Post facility",
              "date": "2014-05-29T19:40:19+10:00"
            },
            {
              "description": "Shipping information approved by Australia Post",
              "date": "2014-05-23T14:27:15+10:00"
            }
          ],
          "status": "Delivered"
        }
      ]
    }
  ]
}
```

## StarTrack Response (with consignment)

```json
{
  "tracking_results": [
    {
      "tracking_id": "5XXXX0XXXXXX",
      "consignment": {
        "events": [
          {
            "location": "NEWTOWN VIC",
            "description": "Awaiting collection",
            "date": "2024-08-08T12:51:22+10:00"
          }
        ],
        "status": "Awaiting Collection"
      },
      "trackable_items": [
        {
          "article_id": "5XXXX0XXXXXXFPP00001",
          "product_type": "FPP",
          "events": [...],
          "status": "In Transit"
        }
      ]
    }
  ]
}
```

## Response Fields

### Tracking Result

| Field | Type | Description |
|-------|------|-------------|
| tracking_id | String | Queried tracking ID |
| status | String | Overall delivery status |
| consignment | Object | StarTrack consignment info (StarTrack only) |
| trackable_items | Array | Tracked articles/items |
| errors | Array | Errors for this tracking ID |

### Consignment Object (StarTrack only)

| Field | Type | Description |
|-------|------|-------------|
| events | Array | Consignment-level events |
| status | String | Consignment delivery status |

### Trackable Item

| Field | Type | Description |
|-------|------|-------------|
| article_id | String | Article tracking ID |
| consignment_id | String | Related consignment ID |
| product_type | String | Product classification |
| events | Array | Delivery events |
| status | String | Item delivery status |
| number_of_items | Integer | Number of items |
| items | Array | Individual items in consignment |

### Event Object

| Field | Type | Description |
|-------|------|-------------|
| location | String | Where event occurred |
| description | String | Event description |
| date | DateTime | Event timestamp |

## Tracking ID Error Response

```json
{
  "tracking_results": [
    {
      "tracking_id": "7XX1000",
      "errors": [
        {
          "code": "ESB-10001",
          "name": "Invalid tracking ID"
        }
      ]
    }
  ]
}
```

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| ESB-10001 | Invalid Tracking ID | Tracking ID not found |
| ESB-10002 | Product Not Trackable | Article/consignment not trackable |
| ESB-20010 | System Error | Internal technical error |
| ESB-20050 | System Error | Internal technical error |
| 51100 | TRACKING_IDS_MISSING | No tracking IDs provided |
| 51101 | TOO_MANY_AP_TRACKING_IDS | More than 10 AP tracking IDs |
| 51102 | TOO_MANY_ST_TRACKING_IDS | More than 10 StarTrack IDs |
| 51103 | TRACKING_IDS_MIX_OF_AP_AND_ST | Mixed AP and StarTrack IDs |
| 51104 | INVALID_TRACKING_ID | Tracking ID(s) not found |
| API_002 | Too many requests | Rate limit exceeded (HTTP 429) |

## Rate Limiting

This endpoint is rate limited to 10 requests per minute. If exceeded:

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

## Common Status Values

- Delivered
- In Transit
- Awaiting Collection
- Item Delivered
- Delivered in Full
- Unknown
