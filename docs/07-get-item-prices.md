# Get Item Prices API

## Overview
This service retrieves valid postage products and pricing based upon the merchant location address, destination, and details of the parcel for eParcel Accounts.

**Note**: This API provides base pricing **excluding** surcharges. For full price breakdown including surcharges (e.g., fuel surcharge), use the Get Shipment Price API.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | POST |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/prices/items`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/prices/items`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |
| Content-Type | Yes | application/json |

## Request Body

### Root Object

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| from | Yes | Object | Origin address |
| to | Yes | Object | Destination address |
| items | Yes | Array | Items to price (max 20 for Parcel/Express Post) |

### From Object

| Field | Required | Type | Length | Description |
|-------|----------|------|--------|-------------|
| postcode | Yes | String | 4 | Origin postcode |
| suburb | Conditional | String | 40 | Required for StarTrack products |
| country | No | String | 2 | Country code (must be "AU" if specified) |

### To Object

| Field | Required | Type | Length | Description |
|-------|----------|------|--------|-------------|
| postcode | Yes | String | 4 (AU), 10 (Int'l) | Destination postcode |
| suburb | Conditional | String | 40 | Required for StarTrack products |
| country | No | String | 2 | ISO 3166-1 alpha-2 code (defaults to "AU") |

### Item Object

| Field | Required | Type | Length | Description |
|-------|----------|------|--------|-------------|
| item_reference | No | String | 50 | Your reference for the item |
| length | Conditional | Decimal | 4.1 | Length in cm (required if volumetric pricing) |
| width | Conditional | Decimal | 4.1 | Width in cm (required if volumetric pricing) |
| height | Conditional | Decimal | 4.1 | Height in cm (required if volumetric pricing) |
| weight | Yes | Decimal | N.3 | Weight in kg |
| packaging_type | No | String | 3 | e.g., CTN, PAL, SAT, BAG, ENV, ITM, JIF, SKI |
| product_ids | No | List | - | Filter to specific products (returns all if omitted) |
| features | No | Object | - | Additional features (e.g., TRANSIT_COVER) |

### Features Object (TRANSIT_COVER)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| TRANSIT_COVER.attributes.cover_amount | Yes | Decimal | Amount of cover required |

## Example Request

```
POST https://digitalapi.auspost.com.au/shipping/v1/prices/items
```

```json
{
  "from": {
    "postcode": "3207"
  },
  "to": {
    "postcode": "2001"
  },
  "items": [
    {
      "length": 5,
      "height": 5,
      "width": 5,
      "weight": 5,
      "item_reference": "abc xyz",
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
```

## Example Response (200 OK)

```json
{
  "items": [
    {
      "weight": 5,
      "height": 5,
      "length": 5,
      "width": 5,
      "prices": [
        {
          "product_id": "E34",
          "product_type": "EXPRESS POST",
          "options": {
            "signature_on_delivery_option": false,
            "authority_to_leave_option": true
          },
          "calculated_price": 42.70,
          "calculated_price_ex_gst": 38.82,
          "calculated_gst": 3.88,
          "bundled_price": 37.45,
          "bundled_price_ex_gst": 34.05,
          "bundled_gst": 3.40,
          "features": {
            "TRANSIT_COVER": {
              "type": "TRANSIT_COVER",
              "attributes": {
                "rate": 1.5,
                "maximum_cover": 5000,
                "cover_amount": 3000,
                "included_cover": 200
              },
              "price": {
                "calculated_price": 210.00,
                "calculated_price_ex_gst": 189.99,
                "calculated_gst": 20.01
              },
              "bundled": false
            }
          }
        },
        {
          "product_id": "T28S",
          "product_type": "PARCEL POST + SIGNATURE",
          "options": {
            "signature_on_delivery_option": true,
            "authority_to_leave_option": true
          },
          "calculated_price": 9.00,
          "calculated_price_ex_gst": 8.18,
          "calculated_gst": 0.82,
          "bundled_price": 8.00,
          "bundled_price_ex_gst": 7.27,
          "bundled_gst": 0.73
        }
      ],
      "errors": [],
      "warnings": [
        {
          "code": "43003",
          "name": "NO_PRICE_SCALE_FOUND_FOR_QUANTITY",
          "message": "The service T28V1N0 is not available based upon the submitted weight of 5 kg.",
          "context": {
            "weight": "95.0",
            "product_id": "T28V1N0"
          }
        }
      ]
    }
  ]
}
```

## Response Fields

### Item Response

| Field | Type | Description |
|-------|------|-------------|
| item_reference | String | Your reference for the item |
| length | Decimal | Length in cm |
| width | Decimal | Width in cm |
| height | Decimal | Height in cm |
| weight | Decimal | Weight in kg |
| prices | Array | Available products and pricing |
| errors | Array | Errors for this item |
| warnings | Array | Warnings for this item |

### Price Object

| Field | Type | Description |
|-------|------|-------------|
| product_id | String | Australia Post product ID (e.g., E34, T28S) |
| product_type | String | Display name (e.g., "EXPRESS POST") |
| options | Object | Available options for this product |
| options.authority_to_leave_option | Boolean | ATL option available |
| options.signature_on_delivery_option | Boolean | Signature option available |
| calculated_price | Decimal | Total price including GST (single item) |
| calculated_price_ex_gst | Decimal | Price excluding GST |
| calculated_gst | Decimal | GST amount |
| bundled_price | Decimal | Price when part of a bundle |
| bundled_price_ex_gst | Decimal | Bundled price excluding GST |
| bundled_gst | Decimal | GST for bundled price |

### Features Response (TRANSIT_COVER)

| Field | Type | Description |
|-------|------|-------------|
| type | String | Feature type (TRANSIT_COVER) |
| attributes.rate | Decimal | Percentage rate for calculating fees |
| attributes.cover_amount | Decimal | Requested cover amount |
| attributes.included_cover | Integer | Cover included with product |
| attributes.maximum_cover | Integer | Maximum cover available |
| bundled | Boolean | Whether feature is included with product |
| price.calculated_price | Decimal | Feature price including GST |
| price.calculated_price_ex_gst | Decimal | Feature price excluding GST |
| price.calculated_gst | Decimal | Feature GST amount |

### Estimated Delivery (International only)

| Field | Type | Description |
|-------|------|-------------|
| earliest | Integer | Earliest delivery in working days |
| latest | Integer | Latest delivery in working days |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 41001 | CUSTOMER_NOT_FOUND | Customer not found for account |
| 41002 | ACCOUNT_NOT_FOUND | Account ID not found |
| 41003 | CONTRACT_NOT_VALID_ERROR | Contract expired or not yet valid |
| 41007 | FROM_POSTCODE_DOES_NOT_MATCH_CONTRACT | Origin postcode doesn't match contract |
| 42001 | NO_PRODUCTS_FOUND | No products found for origin/destination |
| 42006 | MAX_WIDTH | Width exceeds 105 cm limit |
| 42007 | MAX_HEIGHT | Height exceeds 105 cm limit |
| 42008 | MAX_LENGTH | Length exceeds 105 cm limit |
| 42009 | MAX_VOLUME | Volume exceeds 0.25 m3 limit |
| 42010 | MAX_WEIGHT | Weight exceeds limit |
| 42011 | TWO_DIMENSIONS_LESS_THAN_5CM | At least two dimensions must be 5 cm |
| 44010 | MAX_LENGTH_MERCHANT_REFERENCE_TEXT | Reference exceeds 50 character limit |
| 66004 | NO_CONTRACT_PRICING_AVAILABLE | No contracted rate for product/lane |
