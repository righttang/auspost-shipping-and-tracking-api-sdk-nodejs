# Create Labels API

## Overview
This service initiates the generation of labels for the requested shipments that have been previously created using the Create Shipments service.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | POST |
| Rate Limited | No |
| Authentication | Basic Auth |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/labels`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/labels`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |
| Content-Type | Yes | application/json |

## Two Modes of Label Printing

1. **One-Step (Synchronous)**: Returns labels in the same request (< 250 parcels). Use `wait_for_label_url: true`
2. **Two-Step (Asynchronous)**: For larger requests (> 250 parcels). Use Get Label API to retrieve.

**Note**: ZPL labels have a strict limit of 50 parcels per request.

## Request Body

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| preferences | Yes | Array | Print preferences |
| preferences[].type | Yes | String | Must be "PRINT" |
| preferences[].format | No | String | "PDF" or "ZPL" |
| preferences[].groups | Yes | Array | Label format groups |
| preferences[].groups[].group | Yes | String | Label group: "Parcel Post", "Express Post", "StarTrack", "Startrack Courier", "International", "Commercial" |
| preferences[].groups[].layout | Yes | String | "A4-1pp", "A4-3pp", "A4-4pp", "A6-1pp" |
| preferences[].groups[].branded | Yes | Boolean | Include Australia Post branding |
| preferences[].groups[].left_offset | Yes | Integer | Left margin adjustment |
| preferences[].groups[].top_offset | Yes | Integer | Top margin adjustment |
| shipments | Yes | Array | Shipments to generate labels for |
| shipments[].shipment_id | Yes | String | Australia Post shipment ID |
| shipments[].items | No | Array | Specific items (if omitted, all items) |
| shipments[].items[].item_id | Yes | String | Item ID for label generation |
| wait_for_label_url | No | Boolean | If true, returns URL immediately |
| unlabelled_articles_only | No | Boolean | Generate only for unlabelled items |

## Example Request

```
POST https://digitalapi.auspost.com.au/shipping/v1/labels
```

```json
{
  "wait_for_label_url": true,
  "preferences": [
    {
      "type": "PRINT",
      "groups": [
        {
          "group": "Parcel Post",
          "layout": "A4-1pp",
          "branded": true,
          "left_offset": 0,
          "top_offset": 0
        },
        {
          "group": "Express Post",
          "layout": "A4-1pp",
          "branded": true,
          "left_offset": 0,
          "top_offset": 0
        }
      ]
    }
  ],
  "shipments": [
    {
      "shipment_id": "t4AK0EhQTu4AAAFeVsxGqhLO"
    }
  ]
}
```

## Example Response (One-Step - 200 OK)

```json
{
  "labels": [
    {
      "request_id": "c2991876-9596-42ed-aed3-dd11dcfb03ba",
      "url": "https://ptest.npe.auspost.com.au/lodgement4/labels/c2991876-9596-42ed-aed3-dd11dcfb03ba.pdf?...",
      "status": "AVAILABLE",
      "request_date": "11-09-2019 17:43:46",
      "url_creation_date": "11-09-2019 17:43:46",
      "shipments": [
        {
          "shipment_id": "t4AK0EhQTu4AAAFeVsxGqhLO",
          "options": {}
        }
      ],
      "shipment_ids": [
        "t4AK0EhQTu4AAAFeVsxGqhLO"
      ]
    }
  ]
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| labels | Array | Label information |
| labels[].request_id | String | Label request identifier |
| labels[].url | String | URL to download PDF/ZPL label |
| labels[].status | String | PENDING, ERROR, or AVAILABLE |
| labels[].request_date | String | Request timestamp |
| labels[].shipments | Array | Shipments included |
| labels[].shipment_ids | Array | List of shipment IDs |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 44013 | SHIPMENT_NOT_FOUND_ERROR | Shipment ID not found |
| 44033 | NO_SHIPMENT_IN_REQUEST_ERROR | No shipments in request |
| 51008 | CREATE_LABEL_ERROR_ZPL_LABELS_EXCEEDED | Exceeded 50 ZPL label limit |
| 51015 | CREATE_LABEL_ERROR_DIFFERENT_PRINTING_SERVICE | Labels created via different service |
