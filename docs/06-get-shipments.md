# Get Shipments API

## Overview
This service retrieves the information against shipments and the items contained within for shipments created using the Create Shipments service.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | GET |
| Rate Limited | Yes |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| API Version | v1.0 |

## Resource URLs

**By Shipment IDs**:
`https://digitalapi.auspost.com.au/shipping/v1/shipments?shipment_ids={shipment_ids}`

**With Pagination**:
`https://digitalapi.auspost.com.au/shipping/v1/shipments?offset={offset}&number_of_shipments={number_of_shipments}&status={status_list}`

**Testbed**: Replace `digitalapi.auspost.com.au/shipping/v1` with `digitalapi.auspost.com.au/test/shipping/v1`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |

## Query Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| shipment_ids | Conditional | Comma-separated list of shipment IDs (takes precedence over other params) |
| offset | Conditional | Starting record number (0-based). Required with number_of_shipments |
| number_of_shipments | Conditional | Number of records to return. Required with offset |
| status | No | Filter by status (e.g., Created, Initiated). Use + for spaces |
| despatch_date | No | Filter by date (yyyy-MM-dd format, comma-separated) |
| sender_reference | No | Filter by sender reference (comma-separated) |

## Notes
- Use either `shipment_ids` OR `offset`/`number_of_shipments` parameters
- Pagination allows page-at-a-time UI display

## Example Requests

```
GET https://digitalapi.auspost.com.au/shipping/v1/shipments?shipment_ids=9lesEAOvOm4AAAFI3swaDRYB
```

```
GET https://digitalapi.auspost.com.au/shipping/v1/shipments?offset=0&number_of_shipments=20&status=Created,Initiated
```

## Example Response (200 OK)

```json
{
  "shipments": [
    {
      "shipment_id": "9lesEAOvOm4AAAFI3swaDRYB",
      "shipment_reference": "XYZ-001-01",
      "shipment_creation_date": "2014-08-27T15:48:09+10:00",
      "shipment_modified_date": "2014-08-27T15:48:09+10:00",
      "customer_reference_1": "Order 001",
      "sender_references": ["Order 001"],
      "email_tracking_enabled": false,
      "from": {
        "type": "MERCHANT_LOCATION",
        "lines": ["1 Main Street"],
        "suburb": "Geelong",
        "postcode": "3220",
        "state": "VIC",
        "name": "John Citizen"
      },
      "to": {
        "lines": ["123 Centre Road"],
        "suburb": "Sydney",
        "postcode": "2000",
        "state": "NSW",
        "name": "Jane Smith"
      },
      "items": [
        {
          "item_id": "LDCsEAOvU_oAAAFI6MwaDRYB",
          "item_reference": "SKU-1",
          "product_id": "T28S",
          "tracking_details": {
            "article_id": "ABC803349001000931404",
            "consignment_id": "ABC5033490"
          },
          "item_summary": {
            "total_cost": 5.00,
            "total_cost_ex_gst": 4.55,
            "total_gst": 0.45,
            "status": "Initiated"
          },
          "label": {
            "label_url": "https://auspost.com.au/ABC0028165DA.pdf",
            "status": "Available"
          }
        }
      ],
      "shipment_summary": {
        "total_cost": 13.00,
        "total_cost_ex_gst": 11.82,
        "fuel_surcharge": 2.00,
        "total_gst": 1.18,
        "status": "Initiated",
        "number_of_items": 3
      },
      "order_id": "AP0000002999"
    }
  ]
}
```

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 41001 | CUSTOMER_NOT_FOUND | Customer not found for account |
| 44013 | SHIPMENT_NOT_FOUND_ERROR | Shipment ID not found |
| 44038 | SHIPMENT_NOT_WITH_CONTRACT_ERROR | Shipment doesn't belong to account |
| API_002 | Too many requests | Rate limit exceeded (HTTP 429) |
