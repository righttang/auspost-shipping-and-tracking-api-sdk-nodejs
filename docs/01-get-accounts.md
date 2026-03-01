# Get Accounts API

## Overview
This service retrieves information regarding the requestor's charge account and the postage products that the charge account is able to use.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | GET |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/accounts/{account_number}`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/accounts/{account_number}`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |

## Path Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| account_number | Yes | Numeric ID of the charge account to query |

## Example Request

```
GET https://digitalapi.auspost.com.au/shipping/v1/accounts/0000123456
```

## Example Response (200 OK)

```json
{
  "account_number": "0000123456",
  "name": "Abc Xyz Co",
  "valid_from": "2014-02-24",
  "valid_to": "2999-12-31",
  "expired": false,
  "addresses": [
    {
      "type": "MERCHANT_LOCATION",
      "lines": ["1 Main Street", "Melbourne"],
      "suburb": "CHADSTONE",
      "postcode": "3000",
      "state": "VIC"
    }
  ],
  "details": {
    "abn": "123456789",
    "acn": "123456789",
    "contact_number": "0312345678",
    "email_address": "abcxyz@example.com",
    "lodgement_postcode": "3000"
  },
  "postage_products": [
    {
      "type": "PARCEL POST",
      "group": "Parcel Post",
      "product_id": "T28",
      "contract": {
        "valid_from": "2014-01-31",
        "valid_to": "2015-01-31",
        "expired": false,
        "volumetric_pricing": true,
        "max_item_count": 0,
        "cubing_factor": 250
      },
      "authority_to_leave_threshold": 500,
      "features": {
        "TRANSIT_COVER": {
          "type": "TRANSIT_COVER",
          "attributes": {
            "rate": 1.5,
            "included_cover": 200,
            "maximum_cover": 5000
          },
          "bundled": true
        }
      },
      "options": {
        "signature_on_delivery_option": false,
        "authority_to_leave_option": true
      }
    }
  ],
  "merchant_location_id": "ABC",
  "credit_blocked": false
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| account_number | String(10) | The charge account for the location |
| name | String(40) | The name for the location |
| valid_from | Date | Beginning validity date (YYYY-MM-DD) |
| valid_to | Date | Ending validity date (YYYY-MM-DD) |
| expired | Boolean | Whether the charge account has expired |
| addresses | Array | Addresses associated with the location |
| addresses[].type | String | Address type (MERCHANT_LOCATION) |
| addresses[].lines | Array | Address lines (1-3 lines, max 40 chars each) |
| addresses[].suburb | String(40) | Suburb name |
| addresses[].state | String(3) | State code (ACT, NSW, NT, QLD, SA, TAS, VIC, WA) |
| addresses[].postcode | String(4) | Postcode |
| details | Object | Additional location information |
| details.lodgement_postcode | String(4) | Postcode where parcels are lodged |
| details.abn | String(20) | Australian Business Number |
| details.acn | String(25) | Australian Company Number |
| details.contact_number | String(30) | Phone number |
| details.email_address | String(240) | Email address |
| postage_products | Array | Available postage products |
| postage_products[].type | String(30) | Product name |
| postage_products[].group | String(50) | Product group (for labels) |
| postage_products[].product_id | String(5) | Australia Post product code |
| postage_products[].options | Object | Available options |
| postage_products[].contract | Object | Contract details |
| merchant_location_id | String | Merchant location ID |
| credit_blocked | Boolean | Whether account is credit blocked |

## Error Codes

| Code | Name | Message |
|------|------|---------|
| 41001 | CUSTOMER_NOT_FOUND | Customer information for the submitted customer identifier could not be found |
| 41002 | ACCOUNT_NOT_FOUND | An account with the id cannot be found |
| 41007 | CONTRACT_SETUP_ERROR | Contract information could not be found |
