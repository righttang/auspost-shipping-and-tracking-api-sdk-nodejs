# Create Order From Shipments API

## Overview
This service creates an order for the referenced shipments that have previously been created using the Create Shipments service.

**Note**: This API uses the PUT method. The POST method on the same endpoint is for "Create Order Including Shipments".

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

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/orders`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/orders`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |
| Content-Type | Yes | application/json |

## Request Body

| Field | Required | Type | Length | Description |
|-------|----------|------|--------|-------------|
| order_reference | No | String | 50 | Your reference for the order |
| payment_method | No | String | 50 | Only valid value: "CHARGE_TO_ACCOUNT" |
| consignor | No | String | 40 | Name/ID of consignor (for traceability) |
| shipments | Yes | Array | - | Shipments to include in order |
| shipments[].shipment_id | Yes | String | 50 | Previously created shipment ID |

## Example Request

```
PUT https://digitalapi.auspost.com.au/shipping/v1/orders
```

```json
{
  "order_reference": "My order reference",
  "payment_method": "CHARGE_TO_ACCOUNT",
  "shipments": [
    {
      "shipment_id": "569b9a3accdc791c4ba34d6f"
    }
  ]
}
```

## Example Response (201 Created)

```json
{
  "order": {
    "order_id": "AP0000002422",
    "order_reference": "My order reference",
    "order_creation_date": "2014-08-27T13:55:47+10:00",
    "order_summary": {
      "total_cost": 13.29,
      "total_cost_ex_gst": 12.08,
      "total_gst": 1.21,
      "status": "Initiated",
      "tracking_summary": {
        "Sealed": 1
      },
      "number_of_shipments": 1,
      "number_of_items": 1,
      "dangerous_goods_included": false,
      "total_weight": 5.000,
      "shipping_methods": {
        "3H03": 1
      }
    },
    "shipments": [
      {
        "shipment_id": "569b9a3accdc791c4ba34d6f",
        "shipment_reference": "XYZ-001-01",
        "shipment_creation_date": "2014-08-27T13:55:47+10:00",
        "email_tracking_enabled": false,
        "items": [
          {
            "weight": 5.000,
            "authority_to_leave": true,
            "safe_drop_enabled": true,
            "allow_partial_delivery": true,
            "item_id": "NfMK1UnLtDcAAAFyJ1IF297V",
            "item_reference": "the reference",
            "tracking_details": {
              "article_id": "2JD541813301000870900",
              "consignment_id": "2JD5418133",
              "barcode_id": "0199312650999998912JD541813301000870900|4200221|8008200703142616"
            },
            "product_id": "3H03",
            "item_summary": {
              "total_cost": 13.29,
              "total_cost_ex_gst": 12.08,
              "total_gst": 1.21,
              "status": "Sealed"
            }
          }
        ],
        "shipment_summary": {
          "total_cost": 13.29,
          "total_cost_ex_gst": 12.08,
          "fuel_surcharge": 0.00,
          "total_gst": 1.21,
          "status": "Sealed",
          "tracking_summary": {
            "Sealed": 1
          },
          "number_of_items": 1
        },
        "movement_type": "DESPATCH",
        "charge_to_account": "0000000000",
        "shipment_modified_date": "2014-08-27T13:55:47+10:00"
      }
    ],
    "payment_method": "CHARGE_TO_ACCOUNT"
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
| order_summary | Object | Order pricing and status summary |
| shipments | Array | Shipments in the order |
| payment_method | String | Payment method used |

### Order Summary Object

| Field | Type | Description |
|-------|------|-------------|
| total_cost | Decimal | Total cost including GST |
| total_cost_ex_gst | Decimal | Total cost excluding GST |
| total_gst | Decimal | GST amount |
| status | String | Order status |
| tracking_summary | Object | Count of items by status |
| number_of_shipments | Integer | Number of shipments |
| number_of_items | Integer | Number of items |
| dangerous_goods_included | Boolean | Whether DG items included |
| total_weight | Decimal | Total weight in kg |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 44013 | SHIPMENT_NOT_FOUND_ERROR | Shipment ID not found |
| 44015 | NO_SHIPMENT_TO_DISPATCH | No shipments in request |
| 44016 | SHIPMENT_INITIATED | Shipment already in existing order |
| 44017 | SHIPMENT_IN_PROGRESS | Shipment being finalized |
| 44031 | MAX_ITEM_COUNT_ERROR | Max 2000 items per manifest |
| 44038 | SHIPMENT_NOT_WITH_CONTRACT_ERROR | Shipment doesn't belong to account |
| 44059 | ORDER_CONTAINS_SHIPMENTS_MULTIPLE_AUSPOST_ACCOUNTS | Shipments from multiple accounts |
