# Get Order API

## Overview
This service returns information related to the order previously created using the Create Order From Shipments or Create Order Including Shipments services.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | GET |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/orders/{order_id}`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/orders/{order_id}`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |

## URL Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| order_id | Yes | Australia Post generated order ID |

## Example Request

```
GET https://digitalapi.auspost.com.au/shipping/v1/orders/AP0000002422
```

## Example Response (200 OK)

```json
{
  "order": {
    "order_id": "AP0000002422",
    "order_reference": "XYZ-001",
    "order_creation_date": "2014-08-27T13:55:47+10:00",
    "order_summary": {
      "total_cost": 74.00,
      "total_cost_ex_gst": 67.27,
      "total_gst": 6.73,
      "status": "Initiated",
      "tracking_summary": {
        "Initiated": 1
      },
      "number_of_shipments": 1
    },
    "shipments": [
      {
        "shipment_id": "m.cK1UrU_t0AAAFSz8ZKdt.K",
        "shipment_creation_date": "2014-08-27T13:55:47+10:00",
        "shipment_modified_date": "2014-08-27T13:55:47+10:00",
        "email_tracking_enabled": true,
        "from": {
          "type": "MERCHANT_LOCATION",
          "lines": ["1 Main Street"],
          "suburb": "Blackburn",
          "postcode": "3130",
          "state": "VIC",
          "name": "John Citizen",
          "email": "john.citizen@citizen.com",
          "phone": "0401234567"
        },
        "to": {
          "lines": ["123 Centre Road"],
          "suburb": "Sydney",
          "postcode": "2000",
          "state": "NSW",
          "name": "Jane Smith",
          "business_name": "Smith Pty Ltd",
          "email": "jane.smith@smith.com",
          "phone": "0412345678"
        },
        "shipment_summary": {
          "total_cost": 37.00,
          "total_cost_ex_gst": 33.64,
          "fuel_surcharge": 2.15,
          "total_gst": 3.36,
          "status": "Sealed",
          "tracking_summary": {
            "Initiated": 1
          },
          "number_of_items": 1
        }
      }
    ],
    "payment_method": "CHARGE_TO_ACCOUNT",
    "consignor": "1234567890123456789012345678901234567890"
  }
}
```

## Response Fields

### Order Object

| Field | Type | Description |
|-------|------|-------------|
| order_id | String | Australia Post generated order ID |
| order_reference | String | Your order reference |
| order_creation_date | DateTime | Order creation timestamp |
| order_summary | Object | Order summary with totals |
| shipments | Array | Shipments in the order |
| payment_method | String | Payment method (CHARGE_TO_ACCOUNT) |
| consignor | String | Consignor name/ID |

### Order Summary Object

| Field | Type | Description |
|-------|------|-------------|
| total_cost | Decimal | Total cost including GST |
| total_cost_ex_gst | Decimal | Total cost excluding GST |
| total_gst | Decimal | GST amount |
| status | String | Order status |
| tracking_summary | Object | Count of items by status |
| number_of_shipments | Integer | Number of shipments |

### Shipment Object

| Field | Type | Description |
|-------|------|-------------|
| shipment_id | String | Shipment ID |
| shipment_creation_date | DateTime | Creation timestamp |
| shipment_modified_date | DateTime | Last modification timestamp |
| email_tracking_enabled | Boolean | Email tracking enabled |
| from | Object | Sender address |
| to | Object | Recipient address |
| shipment_summary | Object | Shipment cost summary |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 44026 | ORDER_NOT_FOUND | Order ID not found |
