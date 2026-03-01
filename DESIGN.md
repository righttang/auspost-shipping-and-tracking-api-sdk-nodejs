# Australia Post SDK Design Document

## Overview
This document outlines the design and modular architecture of the Australia Post SDK project. The SDK is built in Node.js and provides core functionalities for interacting with the Australia Post APIs. It simplifies API operations into reusable components, each focused on a specific service.

## Architecture
The SDK structure follows a modular design, ensuring that individual components can work independently while integrating seamlessly.

### Modules
1. **Authentication** (`auth.js`):
   - Authenticate API requests using **API Key:**
     - Basic authentication method via a user-provided API key.
   - Environment support:
     - Sandbox for testing integrations.
     - Production for live operations (requires separate credentials).
   - Configuration options:
     - Set an API key during SDK initialization.

     ```javascript
     import AusPostSDK from 'auspost-sdk';
     const sdk = new AusPostSDK({
       apiKey: '<YOUR_API_KEY>',
       environment: 'sandbox' // or 'production'
     });
     ```

2. **Shipping and Orders** (`shipping.js`):
   - Create, update, delete, and validate shipments.
   - Calculate shipping rates and generate shipment labels.
   - Manage orders, including creation, updates, summaries, and deletion of orders.
   - Serviceability Lookup: Identify available delivery services for specified locations.
   - Dangerous Goods Declaration: Generate PDF forms for hazardous materials shipping.

3. **Tracking** (`tracking.js`):
   - Track consignments, shipments, or orders using tracking numbers.
   - Fetch delivery progress, estimated arrival times, and detailed updates for each item.

4. **Customs and Export Tools** (`export_tools.js`):
   - Export Classification Tool: Lookup Harmonized System (HS) tariff codes for international shipments.
   - Combined Export Tool: Estimate duties, taxes, and prohibitions for exported goods.

5. **Error Management** (`errors.js`):
   - Define custom error handlers.
   - Map API errors to meaningful exception messages.

## Design Goals
- **Developer-Friendly:** Provide an intuitive and minimal interface for API interaction.
- **Maintainability:** Ensure modular, testable code for easier updates and extensions.
- **Lightweight:** Minimize dependencies to ensure optimal performance.

## Functional Requirements
### Authentication
- Support authentication using:
  - **API Key Authentication:** Used for secure access to all API operations.
- Provide initialization options for configuring authentication settings, including environments (sandbox and production).

### Shipping and Orders
- Handle domestic and international shipments.
- Support creating, updating, and deleting shipments.
- Calculate shipping rates.
- Validate shipment data.
- Enable managing orders, including:
  - **Create Orders:** Combine shipments into bulk or individual orders.
  - **Update Orders:** Modify existing orders.
  - **Order Summaries:** Generate and retrieve PDF order summaries.
  - **Delete Orders:** Remove orders that are no longer required.
- Provide serviceability lookups to check delivery availability.
- Enable dangerous goods form generation for shipments requiring specific declarations.

### Tracking
- Track parcels, shipments, or orders and retrieve updates on delivery progress.
- Provide delivery events and estimated time of arrival (ETA) for tracked items.

### Customs and Export Tools
- **Export Classification Tool:** Lookup Harmonized System (HS) codes for items being shipped internationally.
- **Combined Export Tool:** Retrieve estimated duties, taxes, and export restrictions for international shipments.

### Error Management
- Centralized error handling for API requests.
- Detailed error messages for invalid input or request failures.

## Non-Functional Requirements
- **Performance:** Optimize API calls for fast response times.
- **Scalability:** Support large volumes of shipment and tracking operations.
- **Security:** Protect sensitive data like API keys and tokens.
- **Documentation:** Provide detailed usage examples for all features supported by the SDK.

## Future Enhancements
1. **Batch Processing:** Add support for batch creation and tracking of shipments.
2. **Webhooks:** Enable real-time notifications for delivery events.
3. **Enhanced Customizations:** Allow user-defined configurations for services and APIs.
4. **Detailed Logs:** Provide granular logging levels for developer debugging.

This document will be updated iteratively to reflect ongoing development progress. For further details, refer to the original Australia Post API documentation. Thank you for your collaboration!
