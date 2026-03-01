# Update Shipment API

## Overview
This service updates an existing shipment that has previously been created using the Create Shipment service.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | PUT |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| Response Code | 201 Created |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/shipments/{shipment_id}`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/shipments/{shipment_id}`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |
| Content-Type | Yes | application/json |

## URL Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| shipment_id | Yes | The shipment ID to update |

## Request Body

The request body follows the same structure as Create Shipments, but items must include their `item_id` for updates.

### Key Fields

| Field | Required | Description |
|-------|----------|-------------|
| shipment_reference | No | Your reference for this shipment |
| customer_reference_1 | No | Merchant reference |
| customer_reference_2 | No | Merchant reference |
| from | Yes | Sender address |
| to | Yes | Recipient address |
| items | Yes | Array of items (must include item_id for existing items) |

### Item Object (for updates)

| Field | Required | Description |
|-------|----------|-------------|
| item_id | Yes | Australia Post generated item ID (from create response) |
| item_reference | No | Your reference for this item |
| product_id | Yes | Australia Post product code |
| length | Conditional | Length in cm |
| width | Conditional | Width in cm |
| height | Conditional | Height in cm |
| weight | Conditional | Weight in kg |
| authority_to_leave | No | Allow authority to leave |
| allow_partial_delivery | No | Allow partial delivery |
| features | No | Additional features (e.g., TRANSIT_COVER) |

## Example Request

```
PUT https://digitalapi.auspost.com.au/shipping/v1/shipments/9lesEAOvOm4AAAFI3swaDRYB
```

```json
{
  "shipment_reference": "My first shipment",
  "customer_reference_2": "cb2345",
  "from": {
    "name": "John Citizen",
    "lines": ["1 Main Street"],
    "suburb": "Melbourne",
    "postcode": "3000",
    "state": "VIC",
    "phone": "0401234567",
    "email": "john.citizen@citizen.com"
  },
  "to": {
    "name": "Jane Citizen",
    "business_name": "Abc Pty Ltd",
    "lines": ["Level 1", "1 Smith Street"],
    "suburb": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "phone": "0312345678",
    "email": "jane.smith@smith.com"
  },
  "items": [
    {
      "item_id": "r5IK1UZjagkAAAFvwxAcefoV",
      "length": "10",
      "height": "10",
      "width": "10",
      "weight": "1",
      "item_reference": "SKU-1",
      "product_id": "XS",
      "authority_to_leave": false,
      "allow_partial_delivery": true,
      "features": {
        "TRANSIT_COVER": {
          "attributes": {
            "cover_amount": 100
          }
        }
      }
    },
    {
      "item_id": "4ZUK1UZjpiYAAAFvxRAcefoV",
      "length": "10",
      "height": "10",
      "width": "10",
      "weight": "1",
      "item_reference": "SKU-2",
      "product_id": "XS",
      "authority_to_leave": false,
      "allow_partial_delivery": true
    }
  ]
}
```

## Example Response (201 Created)

```json
{
  "shipment_id": "E.0K1UZjRcUAAAFvwhAcefoV",
  "shipment_reference": "My first shipment",
  "shipment_creation_date": "2020-01-31T16:31:22+11:00",
  "shipment_modified_date": "2020-01-31T16:31:22+11:00",
  "items": [
    {
      "weight": 1.000,
      "authority_to_leave": false,
      "safe_drop_enabled": true,
      "allow_partial_delivery": true,
      "item_id": "r5IK1UZjagkAAAFvwxAcefoV",
      "item_reference": "SKU-1",
      "tracking_details": {
        "article_id": "2JD279658403000615103",
        "consignment_id": "2JD2796584"
      },
      "product_id": "XS",
      "item_summary": {
        "total_cost": 14.54,
        "total_cost_ex_gst": 13.21,
        "total_gst": 1.33,
        "status": "Created"
      }
    }
  ],
  "shipment_summary": {
    "total_cost": 40.62,
    "total_cost_ex_gst": 36.93,
    "fuel_surcharge": 0.00,
    "total_gst": 3.69,
    "status": "Created",
    "tracking_summary": {
      "Created": 3
    },
    "number_of_items": 3
  },
  "movement_type": "DESPATCH",
  "charge_to_account": "0007457272"
}
```

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 40002 | JSON_MANDATORY_FIELD_MISSING | Required field missing |
| 41007 | FROM_POSTCODE_DOES_NOT_MATCH_CONTRACT | Origin postcode doesn't match contract |
| 42002 | NO_PRICES_FOR_PRODUCT | Product not available for submitted info |
| 42006 | MAX_WIDTH | Width exceeds 105 cm limit |
| 42007 | MAX_HEIGHT | Height exceeds 105 cm limit |
| 42008 | MAX_LENGTH | Length exceeds 105 cm limit |
| 42009 | MAX_VOLUME | Volume exceeds 0.25 m3 limit |
| 42010 | MAX_WEIGHT | Weight exceeds limit |
| 42011 | TWO_DIMENSIONS_LESS_THAN_5CM | At least two dimensions must be 5 cm |
| 42012 | PRODUCT_NOT_SUPPORTED_BY_CONTRACT_ERROR | Product not available on contract |
| 43003 | UNABLE_TO_CALCULATE_PRICE | Weight-based pricing error |
| 43004 | UNABLE_TO_CALCULATE_PRICE | Cubic weight pricing error |
| 43009 | MAX_LENGTH_CUSTOMER_REFERENCE_TEXT | Customer reference exceeds 50 chars |
| 43011 | MAX_LENGTH_DELIVERY_INSTRUCTION | Delivery instructions exceed 128 chars |
| 43017 | ALL_OR_NONE_SHIPMENT_NO_ERROR | Items missing barcode IDs |
| 44002 | ALL_OR_NONE_AUSPOST_ID_ERROR | Items missing tracking identifiers |
| 44003 | DANGEROUS_GOODS_NOT_SUPPORTED | Product doesn't allow dangerous goods |
| 44010 | MAX_LENGTH_MERCHANT_REFERENCE_TEXT | Merchant reference exceeds 50 chars |
| 44043 | ITEM_DIMENSION_WEIGHT_NOT_APPLICABLE | Flat-rate product must not include dimensions |
| 46000 | TRANSIT_WARRANTY_MAX_COVER_EXCEEDED | Transit warranty above contracted maximum |
| 46001 | TRANSIT_WARRANTY_NOT_ENABLED | Transit warranty not enabled on contract |
| 80002 | INVALID_OPTION_COMBINATION | Invalid ATL/partial delivery/safe drop combo |

## Warnings

| Warning | Description |
|---------|-------------|
| Address lines truncated | Only first 2 lines used for StarTrack products |
| Cubic weight discrepancy | Cubic weight > 4x dead weight - verify dimensions |
| Dead weight discrepancy | Dead weight > 4x cubic weight - verify dimensions |
