import * as ff from '@google-cloud/functions-framework';
import * as cf from './config-functions';
import {ExtendedTenantUiConfig} from './config';

enum StatusCode {
  ok = 0,
  existingTenant,
  inexistentTenant,
  invocationError
}

/**
 * Adds a new tenant to the configuration
 * @param {string} tenantId
 * @param {ExtendedTenantUiConfig} tenantUiConfig
 * @return {StatusCode}
 */
async function addTenant(tenantId: string, tenantUiConfig: ExtendedTenantUiConfig): Promise<StatusCode> {
  try {
    const config = await cf.readConfig();
    const tenants = config[Object.keys(config)[0]].tenants;
    if (tenants[tenantId] != null) {
      return StatusCode.existingTenant;
    }
    tenants[tenantId] = tenantUiConfig;
    await cf.writeConfig(config);
    return StatusCode.ok;
  } catch (error) {
    console.error(error);
    return StatusCode.invocationError;
  }
}

/**
 * Deletes an existing tenant from the configuration
 * @param {string} tenantId
 * @return {StatusCode}
 */
async function deleteTenant(tenantId: string): Promise<StatusCode> {
  try {
    const config = await cf.readConfig();
    const tenants = config[Object.keys(config)[0]].tenants;
    if (tenants[tenantId] === undefined) {
      return StatusCode.inexistentTenant;
    }
    delete tenants[tenantId];
    await cf.writeConfig(config);
    return StatusCode.ok;
  } catch (error) {
    console.error(error);
    return StatusCode.invocationError;
  }
}

/**
 * Responds to an HTTP request to either add or delete a tenant configuration for the Identity-Aware Proxy (IAP) pre-built sign-in page using Cloud Run.
 * Reference: https://cloud.google.com/iap/docs/cloud-run-sign-in#customizing_the_sign-in_page_programmatically
 *
 * @param {ff.Request} req Cloud Function request context.
 * @param {ff.Response} res Cloud Function response context.
 */
export const updateConfig = async (req: ff.Request, res: ff.Response) => {
  if (process.env.AUTH_HOST === undefined || process.env.AUTH_HOST === '') {
    res.status(400).send('Authentication host must be defined via the AUTH_HOST environment variable.');
    return;
  }

  const payloadData = req.body;

  // operation must have a value of either 'add' or 'delete' (case insensitive)
  const operation = payloadData.operation ? payloadData.operation.toLowerCase() : '';
  if (operation != 'add' && operation != 'delete') {
    res.status(400).send('"operation" must be specified and its value must be one of either "add" or "delete".');
    return;
  }

  // tenantId must:
  // - be 10 to 16 character and only contain lowercase letters, numbers and dashes (-)
  // - start with a lowercase letter
  // - end with a lowercase letter or number
  const tenantId = payloadData.tenantId ?? '';
  const re = /[a-z][a-z0-9-]{8,14}[a-z0-9]/;
  const match = tenantId.match(re);
  if (! (match && tenantId === match[0])) {
    res.status(400).send('"tenantId" must conform to the following regular expression: /[a-z][a-z0-9-]{8,14}[a-z0-9]/.');
    return;
  }

  const tenantUiConfig = payloadData.tenantUiConfig;
  let result;
  if (operation === 'add') {
    if (!tenantUiConfig) {
      res.status(400).send('"tenantUiConfig" must be speciffied if operation is "add".');
      return;
    } else {
      result = await addTenant(tenantId, tenantUiConfig);
    }
  } else if (operation === 'delete') {
    result = await deleteTenant(tenantId);
  }

  if (result === StatusCode.ok) {
    res.status(200).send('OK');
  } else if (result != StatusCode.invocationError) {
    res.status(400).send(`Error code: ${result}`);
  } else {
    res.status(500).send(`Error code: ${result}`);
  }
};

ff.http('updateConfig', updateConfig);
