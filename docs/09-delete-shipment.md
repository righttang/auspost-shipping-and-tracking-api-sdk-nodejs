# Delete Shipment API

## Overview
This service deletes one or more existing shipments that have previously been created using the Create Shipment service.

**Note**: Only shipments that have NOT been included in an order can be deleted.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | DELETE |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | JSON |
| Response Code | 200 OK (no payload) |
| API Version | v1.0 |

## Resource URLs

**Single Shipment**:
`https://digitalapi.auspost.com.au/shipping/v1/shipments/{shipment_id}`

**Multiple Shipments**:
`https://digitalapi.auspost.com.au/shipping/v1/shipments?shipment_ids={shipment_ids}`

**Testbed**: Replace `digitalapi.auspost.com.au/shipping/v1` with `digitalapi.auspost.com.au/test/shipping/v1`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| shipment_id | Optional | Single shipment ID (in URL path) |
| shipment_ids | Optional | Comma-separated list of shipment IDs (as query parameter) |

**Note**: Use either `shipment_id` in the path OR `shipment_ids` as a query parameter.

## Example Requests

**Delete single shipment:**
```
DELETE https://digitalapi.auspost.com.au/shipping/v1/shipments/9lesEAOvOm4AAAFI3swaDRYB
```

**Delete multiple shipments:**
```
DELETE https://digitalapi.auspost.com.au/shipping/v1/shipments?shipment_ids=9lesEAOvOm4AAAFI3swaDRYB,54kjEFSvIo4759AJGsaaMNBF
```

## Example Response (200 OK)

No payload is returned on successful deletion.

## Example Error Response (404 Not Found)

```json
{
  "errors": [
    {
      "code": "44013",
      "name": "SHIPMENT_NOT_FOUND_ERROR",
      "message": "The shipment with shipment id 9lesEAOvOm4AAAFI3swaDRYB you requested can not be found. Please check the shipment id requested and submit the request again.",
      "context": {
        "shipment_id": "9lesEAOvOm4AAAFI3swaDRYB"
      }
    }
  ]
}
```

## Error Response Fields

| Field | Type | Description |
|-------|------|-------------|
| errors | Array | Error details |
| errors[].code | String | Error code |
| errors[].name | String | Error name/category |
| errors[].message | String | Human-readable error message |
| errors[].field | String | Request field in error (if applicable) |
| errors[].context | Map | Additional context about the error |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 44013 | SHIPMENT_NOT_FOUND_ERROR | Shipment ID not found |
| 44016 | SHIPMENT_INITIATED | Shipment already in an existing order |
| 44017 | SHIPMENT_IN_PROGRESS | Shipment in an order being finalized |
| 44023 | NO_SHIPMENT_TO_DELETE | Request contains no shipments |
| 44038 | SHIPMENT_NOT_WITH_CONTRACT_ERROR | Shipment doesn't belong to account |
