# Get Order Summary API

## Overview
This service returns the PDF order summary that contains a charges breakdown of the articles in the order.

## Resource Information

| Property | Value |
|----------|-------|
| HTTP Method | GET |
| Rate Limited | No |
| Authentication | Secure API Key (Basic Auth) |
| Response Format | PDF (application/pdf) |
| API Version | v1.0 |

## Resource URL

**Production**: `https://digitalapi.auspost.com.au/shipping/v1/accounts/{account_number}/orders/{order_id}/summary`

**Testbed**: `https://digitalapi.auspost.com.au/test/shipping/v1/accounts/{account_number}/orders/{order_id}/summary`

**Important**: Note the URL includes both `account_number` in the path AND requires the `Account-Number` header.

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Basic Auth with API key and password |
| Account-Number | Yes | 10-digit Australia Post charge account or 8-digit StarTrack account |

## URL Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| account_number | Yes | Charge account number (same as Account-Number header) |
| order_id | Yes | Order ID to retrieve summary for |

## Example Request

```
GET https://digitalapi.auspost.com.au/shipping/v1/accounts/0000123456/orders/AP0000002422/summary
```

## Example Response (200 OK)

Response content type is `application/pdf`

The response body contains binary PDF data.

## Example Error Response (400 Bad Request)

```json
{
  "errors": [
    {
      "code": "44026",
      "name": "ORDER_NOT_FOUND",
      "message": "An order with order id AP0000002422 cannot be found. Please check that the identifier is correct and submit the request again."
    }
  ]
}
```

## Error Response Fields

| Field | Type | Description |
|-------|------|-------------|
| errors | Array | Error details |
| errors[].code | String | Error code |
| errors[].name | String | Error category |
| errors[].message | String | Human-readable message |
| errors[].field | String | Field in error (if applicable) |
| errors[].context | Map | Additional error context |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 44026 | ORDER_NOT_FOUND | Order ID not found |
