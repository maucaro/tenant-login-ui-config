# IAP for External Identities - Tenant Login UI Configuration
This project implements a Google Cloud Function using the [Functions Framework for Node.js](https://github.com/GoogleCloudPlatform/functions-framework-nodejs) to update tenant login UI configuration programmatically as described [here](https://cloud.google.com/iap/docs/cloud-run-sign-in#customizing_the_sign-in_page_programmatically).

This function is meant to be invoked as part of the automated process that provisions and deprovisions tenants.

The following JSON data structure must be included in the POST payload:
```json
{
    "operation":"add|delete",
    "tenantId":"tenant1-624h4", 
    "tenantUiConfig":{...}
}
```

Data structure notes:
- operation must be either "add" or "delete"
- tenantId must conform to the following regular expression: `/[a-z][a-z0-9-]{8,14}[a-z0-9]/`
- tenantUiConfig conforms to [ExtendedTenantUiConfig](https://github.com/GoogleCloudPlatform/iap-gcip-web-toolkit/blob/master/authui-container/common/config.ts#L62) interface; additional information can be found [here](https://github.com/GoogleCloudPlatform/iap-gcip-web-toolkit/tree/master/authui-container)

Environment variable:
- AUTH_HOST (required): the target authentication host 

Cloud Function notes:
- The service account assigned to Cloud Function requires the https://www.googleapis.com/auth/devstorage.read_write scope as described [here](https://cloud.google.com/iap/docs/cloud-run-sign-in#customizing_the_sign-in_page_programmatically).
- In order to avoid a possible race condition where one update overwrites another, it's recommended that requests do not run concurrently. In Cloud Functions this can be accomplished by setting the "max-instances" option to 1.   