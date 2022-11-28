import {GoogleAuth} from 'google-auth-library';
import {UiConfig} from './config';

/**
 * Reads tenant configuration
 * @return {UiConfig} tenant configuration for the Identity-Aware Proxy (IAP) pre-built sign-in page using Cloud Run.
 */
export async function readConfig(): Promise<UiConfig> {
  // scopes set as per https://cloud.google.com/iap/docs/cloud-run-sign-in#customizing_the_sign-in_page_programmatically
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/devstorage.read_write',
  });
  const client = await auth.getClient();
  const authHost = process.env.AUTH_HOST;
  const getUrl = `https://${authHost}/get_admin_config`;
  const response = await client.request({url: getUrl});
  return response.data as UiConfig;
}

/**
 * Writes tenant configuration
 * @param {UiConfig} config tenant configuration for the Identity-Aware Proxy (IAP) pre-built sign-in page using Cloud Run.
 */
export async function writeConfig(config: UiConfig) {
  // scopes set as per https://cloud.google.com/iap/docs/cloud-run-sign-in#customizing_the_sign-in_page_programmatically
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/devstorage.read_write',
  });
  const client = await auth.getClient();
  const authHost = process.env.AUTH_HOST;
  const setUrl = `https://${authHost}/set_admin_config`;
  await client.request({url: setUrl, method: 'POST', data: config});
  return;
}
