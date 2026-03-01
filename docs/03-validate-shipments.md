# Validate Shipments API

## Overview
This service validates a shipment with items and returns a list of validation errors if any are present.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | POST |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/shipments/validation`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/shipments/validation`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |
| Content-Type | Yes | application/json |

## Request Body

Same structure as Create Shipments API. See Create Shipments documentation for full field reference.

## Example Request

```
POST https://digitalapi.auspost.com.au/shipping/v1/shipments/validation
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

## Example Response (200 OK)

No payload - empty body indicates validation passed.

## Example Error Response (400)

```json
{
  "errors": [
    {
      "code": "44003",
      "name": "DANGEROUS_GOODS_NOT_SUPPORTED_BY_PRODUCT_ERROR",
      "field": "shipments[0].items[0]",
      "message": "The product T28S specified in an item has indicated that dangerous goods will be included in the parcel, however, the product does not allow dangerous goods to be sent using the service."
    }
  ]
}
```

## Common Error Codes

| Code | Name | Description |
|------|------|-------------|
| 42012 | PRODUCT_NOT_SUPPORTED_BY_CONTRACT_ERROR | Product not available on contract |
| 44003 | DANGEROUS_GOODS_NOT_SUPPORTED_BY_PRODUCT_ERROR | Product doesn't allow dangerous goods |
| 44005 | DUPLICATE_ARTICLE_ID_ERROR | Duplicate article_id submitted |
| 40002 | JSON_MANDATORY_FIELD_MISSING | Required field missing |
| 42006 | MAX_WIDTH | Width exceeds 105 cm |
| 42007 | MAX_HEIGHT | Height exceeds 105 cm |
| 42008 | MAX_LENGTH | Length exceeds 105 cm |
| 42010 | MAX_WEIGHT | Weight exceeds limit |
