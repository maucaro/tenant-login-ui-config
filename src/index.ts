import * as ff from '@google-cloud/functions-framework';
import * as cf from './config-functions';

enum StatusCode {
  ok = 0,
  existingTenant,
  inexistentTenant,
  invocationError
}

/**
 * Adds a new tenant to the configuration
 * @param {string} tenantId
 * @param {string} displayName
 * @return {StatusCode}
 */
async function addTenant(tenantId: string, displayName: string): Promise<StatusCode> {
  const iconUrl = process.env.ICON_URL || 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png';
  const logoUrl = process.env.LOGO_URL || '';
  const tosUrl = process.env.TOS_URL || '';
  const privacyPolicyUrl = process.env.PRIVACY_POLICY_URL || '';
  try {
    const config = await cf.readConfig();
    const tenants = config[Object.keys(config)[0]].tenants;
    if (tenants[tenantId] != null) {
      return StatusCode.existingTenant;
    }
    tenants[tenantId] = {
      displayName: displayName,
      iconUrl: iconUrl,
      logoUrl: logoUrl,
      buttonColor: '#007bff',
      immediateFederatedRedirect: true,
      signInFlow: 'redirect',
      signInOptions: [
        {
          provider: 'password',
          disableSignUp: {
            status: true,
          },
        },
      ],
      tosUrl: tosUrl,
      privacyPolicyUrl: privacyPolicyUrl,
    };
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
    return 0;
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
    res.status(500).send('Authentication host must be defined via the AUTH_HOST environment variable.');
    return;
  }
  // operation must have a value of either 'add' or 'delete' (case insensitive)
  const operation = req.body.operation ? req.body.operation.toLowerCase() : '';
  if (operation != 'add' && operation != 'delete') {
    res.status(500).send('"operation" must be specified and its value must be one of either "add" or "delete".');
    return;
  }

  // tenantId must:
  // - be 10 to 16 character and only contain lowercase letters, numbers and dashes (-)
  // - start with a lowercase letter
  // - end with a lowercase letter or number
  const tenantId = req.body.tenantId ?? '';
  const re = /[a-z][a-z0-9-]{8,14}[a-z0-9]/;
  const match = tenantId.match(re);
  if (! (match && tenantId === match[0])) {
    res.status(500).send('"tenantId" must conform to the following regular expression: /[a-z][a-z0-9-]{8,14}[a-z0-9]/.');
    return;
  }

  // displayName must be specified if operation === 'add' and if so, its length must be between 1 and 30
  const displayName = req.body.displayName ?? '';
  if (operation === 'add' && (displayName.length < 1 || displayName.length> 30)) {
    res.status(500).send('"displayName" must be speciffied if operation equals "add" and if so, its length must be between 1 and 30.');
    return;
  }

  let result;
  if (operation === 'add') {
    result = await addTenant(tenantId, displayName);
  } else if (operation === 'delete') {
    result = await deleteTenant(tenantId);
  }

  if (result === StatusCode.ok) {
    res.status(200).send('OK');
  } else {
    res.status(500).send(`Error code: ${result}`);
  }
};

ff.http('updateConfig', updateConfig);
