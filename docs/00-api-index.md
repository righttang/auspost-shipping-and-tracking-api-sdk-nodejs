# Australia Post Shipping & Tracking API Documentation

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://digitalapi.auspost.com.au/shipping/v1` |
| Testbed | `https://digitalapi.auspost.com.au/test/shipping/v1` |

## Authentication

All endpoints use HTTP Basic Authentication with your API key and password.

Required Headers:
- `Authorization`: Basic Auth (base64 encoded `apiKey:apiPassword`)
- `Account-Number`: 10-digit Australia Post account or 8-digit StarTrack account

## API Reference

### Account
| # | API | Method | Endpoint | Doc |
|---|-----|--------|----------|-----|
| 1 | Get Accounts | GET | `/accounts/{account_number}` | [01-get-accounts.md](01-get-accounts.md) |

### Address
| # | API | Method | Endpoint | Doc |
|---|-----|--------|----------|-----|
| 2 | Validate Suburb | GET | `/address` | [02-validate-suburb.md](02-validate-suburb.md) |

### Shipments
| # | API | Method | Endpoint | Doc |
|---|-----|--------|----------|-----|
| 3 | Validate Shipments | POST | `/shipments/validation` | [03-validate-shipments.md](03-validate-shipments.md) |
| 5 | Create Shipments | POST | `/shipments` | [05-create-shipments.md](05-create-shipments.md) |
| 6 | Get Shipments | GET | `/shipments?shipment_ids={ids}` | [06-get-shipments.md](06-get-shipments.md) |
| 8 | Update Shipment | PUT | `/shipments/{shipment_id}` | [08-update-shipment.md](08-update-shipment.md) |
| 9 | Delete Shipment | DELETE | `/shipments/{shipment_id}` | [09-delete-shipment.md](09-delete-shipment.md) |

### Pricing
| # | API | Method | Endpoint | Doc |
|---|-----|--------|----------|-----|
| 7 | Get Item Prices | POST | `/prices/items` | [07-get-item-prices.md](07-get-item-prices.md) |
| 15 | Get Shipment Price | POST | `/prices/shipments` | [15-get-shipment-price.md](15-get-shipment-price.md) |

### Orders
| # | API | Method | Endpoint | Doc |
|---|-----|--------|----------|-----|
| 10 | Create Order From Shipments | PUT | `/orders` | [10-create-order-from-shipments.md](10-create-order-from-shipments.md) |
| 11 | Get Order | GET | `/orders/{order_id}` | [11-get-order.md](11-get-order.md) |
| 14 | Get Order Summary | GET | `/accounts/{account}/orders/{order_id}/summary` | [14-get-order-summary.md](14-get-order-summary.md) |

### Labels
| # | API | Method | Endpoint | Doc |
|---|-----|--------|----------|-----|
| 4 | Create Labels | POST | `/labels` | [04-create-labels.md](04-create-labels.md) |
| 12 | Get Label | GET | `/labels/{request_id}` | [12-get-label.md](12-get-label.md) |

### Tracking
| # | API | Method | Endpoint | Doc |
|---|-----|--------|----------|-----|
| 13 | Track Items | GET | `/track?tracking_ids={ids}` | [13-track-items.md](13-track-items.md) |

## Rate Limits

| API | Rate Limited | Limit |
|-----|--------------|-------|
| Track Items | Yes | 10 requests/minute |
| Get Label | Yes | Yes |
| All Others | No | - |

## Key Corrections from Official Documentation

Based on the official Australia Post developer documentation, these corrections were identified:

1. **Validate Suburb**: Use `/address` NOT `/address/validate`
2. **Validate Shipments**: Use `/shipments/validation` NOT `/shipments/validate`
3. **Create Labels**: `type` must be `"PRINT"`, `left_offset` and `top_offset` are mandatory
4. **Get Order Summary**: URL is `/accounts/{account}/orders/{order_id}/summary` (includes account in path)
5. **Get Shipment Price**: Different from Get Item Prices - includes surcharges
