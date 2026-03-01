# Get Shipment Price API

## Overview
This service returns the shipment price including surcharges (fuel surcharge, etc.). Use this API when you need the full price breakdown.

**Note**: This is different from Get Item Prices API. Get Shipment Price includes surcharges while Get Item Prices provides base pricing excluding surcharges.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | POST |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/prices/shipments`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/prices/shipments`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |
| Content-Type | Yes | application/json |

## Request Body

The request body uses the same structure as Create Shipments but is used for pricing estimation.

| Field | Required | Description |
|-------|----------|-------------|
| shipments | Yes | Array of shipment objects to price |

### Shipment Object

| Field | Required | Description |
|-------|----------|-------------|
| shipment_reference | No | Your reference |
| from | Yes | Sender address |
| to | Yes | Recipient address |
| items | Yes | Items to price |

## Example Request

```
POST https://digitalapi.auspost.com.au/shipping/v1/prices/shipments
```

```json
{
  "shipments": [
    {
      "from": {
        "postcode": "3000",
        "suburb": "MELBOURNE",
        "state": "VIC"
      },
      "to": {
        "postcode": "2000",
        "suburb": "SYDNEY",
        "state": "NSW"
      },
      "items": [
        {
          "product_id": "T28S",
          "length": 10,
          "height": 10,
          "width": 10,
          "weight": 1
        }
      ]
    }
  ]
}
```

## Example Response (200 OK)

```json
{
  "shipments": [
    {
      "shipment_summary": {
        "total_cost": 15.50,
        "total_cost_ex_gst": 14.09,
        "fuel_surcharge": 2.15,
        "total_gst": 1.41,
        "status": "Quoted"
      },
      "items": [
        {
          "product_id": "T28S",
          "item_summary": {
            "total_cost": 13.35,
            "total_cost_ex_gst": 12.14,
            "total_gst": 1.21
          }
        }
      ]
    }
  ]
}
```

## Response Fields

### Shipment Summary

| Field | Type | Description |
|-------|------|-------------|
| total_cost | Decimal | Total price including GST and surcharges |
| total_cost_ex_gst | Decimal | Total price excluding GST |
| fuel_surcharge | Decimal | Fuel surcharge amount |
| total_gst | Decimal | GST amount |
| status | String | "Quoted" |

### Item Summary

| Field | Type | Description |
|-------|------|-------------|
| total_cost | Decimal | Item price including GST |
| total_cost_ex_gst | Decimal | Item price excluding GST |
| total_gst | Decimal | GST for item |

## Difference from Get Item Prices

| Feature | Get Item Prices | Get Shipment Price |
|---------|-----------------|-------------------|
| Endpoint | /prices/items | /prices/shipments |
| Surcharges | Excluded | Included |
| Fuel surcharge | Not shown | Included |
| Full address | Postcode only | Full address |
| Use case | Quick price estimate | Accurate final price |

## Error Codes

Refer to Create Shipments error codes as the validation is similar.
