# Create Shipments API

## Overview
This service creates a shipment with items and returns a summary of the pricing for the items.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | POST |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| Response Code | 201 Created |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/shipments`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/shipments`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |
| Content-Type | Yes | application/json |

## Notes
- Maximum 20 items for Parcel Post and Express Post domestic despatch movements
- For international shipments, see Create International Shipments API

## Request Body

### Shipment Object

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| shipments | Yes | Array | Array of shipment objects |
| shipments[].shipment_reference | No | String(50) | Unique reference for the shipment |
| shipments[].customer_reference_1 | No | String(50) | Merchant reference |
| shipments[].customer_reference_2 | No | String(50) | Merchant reference |
| shipments[].from | Yes | Object | Sender address |
| shipments[].to | Yes | Object | Recipient address |
| shipments[].items | Yes | Array | Array of item objects |

### Address Object (from/to)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| name | Yes | String(40) | Contact name |
| business_name | No | String(40) | Business name |
| lines | Yes | Array | Address lines (1-3 lines, max 40 chars) |
| suburb | Yes | String(40) | Suburb |
| state | Yes | String(3) | State code: ACT, NSW, NT, QLD, SA, TAS, VIC, WA |
| postcode | Yes | String(4) | 4-digit postcode |
| phone | Conditional | String(20) | Phone number (required for some products) |
| email | Conditional | String(50) | Email address (required for some products) |

### Item Object

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| item_reference | No | String(50) | Unique reference for the item |
| product_id | Yes | String(5) | Australia Post product code |
| length | Conditional | Decimal | Length in cm (required for volumetric pricing) |
| width | Conditional | Decimal | Width in cm |
| height | Conditional | Decimal | Height in cm |
| weight | Conditional | Decimal | Weight in kg |
| authority_to_leave | No | Boolean | Allow authority to leave |
| allow_partial_delivery | No | Boolean | Allow partial delivery (default: true) |
| contains_dangerous_goods | No | Boolean | Contains dangerous goods (default: false) |
| features | No | Object | Additional features (e.g., TRANSIT_COVER) |

## Example Request

```
POST https://digitalapi.auspost.com.au/shipping/v1/shipments
```

```json
{
  "shipments": [
    {
      "shipment_reference": "XYZ-001-01",
      "customer_reference_1": "Order 001",
      "customer_reference_2": "SKU-1, SKU-2, SKU-3",
      "from": {
        "name": "John Citizen",
        "lines": ["1 Main Street"],
        "suburb": "MELBOURNE",
        "state": "VIC",
        "postcode": "3000",
        "phone": "0401234567",
        "email": "john.citizen@citizen.com"
      },
      "to": {
        "name": "Jane Smith",
        "business_name": "Smith Pty Ltd",
        "lines": ["123 Centre Road"],
        "suburb": "Sydney",
        "state": "NSW",
        "postcode": "2000",
        "phone": "0412345678",
        "email": "jane.smith@smith.com"
      },
      "items": [
        {
          "item_reference": "SKU-1",
          "product_id": "T28S",
          "length": "10",
          "height": "10",
          "width": "10",
          "weight": "1",
          "authority_to_leave": false,
          "allow_partial_delivery": true,
          "features": {
            "TRANSIT_COVER": {
              "attributes": {
                "cover_amount": 1000
              }
            }
          }
        }
      ]
    }
  ]
}
```

## Example Response (201 Created)

```json
{
  "shipments": [
    {
      "shipment_id": "9lesEAOvOm4AAAFI3swaDRYB",
      "shipment_reference": "XYZ-001-01",
      "shipment_creation_date": "2014-08-27T15:48:09+10:00",
      "shipment_modified_date": "2014-08-27T15:48:09+10:00",
      "customer_reference_1": "Order 001",
      "customer_reference_2": "SKU-1, SKU-2, SKU-3",
      "items": [
        {
          "item_id": "LDCsEAOvU_oAAAFI6MwaDRYB",
          "item_reference": "SKU-1",
          "tracking_details": {
            "article_id": "ABC000128B4C5",
            "consignment_id": "ABC000128"
          },
          "product_id": "T28S",
          "item_summary": {
            "total_cost": 5,
            "total_cost_ex_gst": 4.55,
            "total_gst": 0.45,
            "status": "Created"
          }
        }
      ],
      "shipment_summary": {
        "total_cost": 13,
        "total_cost_ex_gst": 11.82,
        "fuel_surcharge": 2.15,
        "total_gst": 1.18,
        "status": "Created",
        "number_of_items": 3
      }
    }
  ]
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| shipments | Array | Created shipments |
| shipments[].shipment_id | String | Australia Post generated shipment ID |
| shipments[].shipment_reference | String | Your shipment reference |
| shipments[].shipment_creation_date | DateTime | Creation timestamp |
| shipments[].items | Array | Items in the shipment |
| shipments[].items[].item_id | String | Australia Post generated item ID |
| shipments[].items[].tracking_details | Object | Tracking information |
| shipments[].items[].tracking_details.article_id | String | Article ID for tracking |
| shipments[].items[].tracking_details.consignment_id | String | Consignment ID |
| shipments[].items[].item_summary | Object | Pricing summary |
| shipments[].shipment_summary | Object | Shipment total pricing |

## Common Error Codes

| Code | Name | Description |
|------|------|-------------|
| 44003 | DANGEROUS_GOODS_NOT_SUPPORTED_BY_PRODUCT_ERROR | Product doesn't allow dangerous goods |
| 42012 | PRODUCT_NOT_SUPPORTED_BY_CONTRACT_ERROR | Product not available on contract |
| 40002 | JSON_MANDATORY_FIELD_MISSING | Required field missing |
