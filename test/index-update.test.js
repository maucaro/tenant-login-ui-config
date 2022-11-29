const {updateConfig} = require('../build/index');
const {Request, Response} = require('jest-express');

const ORIGINAL_CONFIG = {
  'AIzaSyCIsgBJsYdqx52E66YeV35zRhQyoaviHB8': {
    'authDomain': 'arrcuspoc.firebaseapp.com',
    'displayMode': 'optionFirst',
    'selectTenantUiTitle': 'arrcuspoc',
    'selectTenantUiLogo': '',
    'styleUrl': '',
    'tenants': {
      'tenant1-624h4': {
        'displayName': 'Tenant 1',
        'iconUrl': 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png',
        'logoUrl': 'https://storage.googleapis.com/gcip-iap-bucket-authui-954140151439/arrcus.jpeg',
        'buttonColor': '#007bff',
        'immediateFederatedRedirect': true,
        'signInFlow': 'redirect',
        'signInOptions': [
          {
            'provider': 'password',
            'disableSignUp': {
              'status': true,
            },
          },
        ],
        'tosUrl': '',
        'privacyPolicyUrl': '',
      },
      'tenant2-51wdt': {
        'displayName': 'Tenant 2',
        'iconUrl': 'https://storage.googleapis.com/gcip-iap-bucket-authui-954140151439/arrcus.ico',
        'logoUrl': 'https://storage.googleapis.com/gcip-iap-bucket-authui-954140151439/arrcus.jpeg',
        'buttonColor': '#007bff',
        'immediateFederatedRedirect': true,
        'signInFlow': 'redirect',
        'signInOptions': [
          {
            'provider': 'password',
          },
        ],
        'tosUrl': '',
        'privacyPolicyUrl': '',
      },
    },
    'tosUrl': '',
    'privacyPolicyUrl': '',
  },
};

const MODIFIED_CONFIG = {
  'AIzaSyCIsgBJsYdqx52E66YeV35zRhQyoaviHB8': {
    'authDomain': 'arrcuspoc.firebaseapp.com',
    'displayMode': 'optionFirst',
    'selectTenantUiTitle': 'arrcuspoc',
    'selectTenantUiLogo': '',
    'styleUrl': '',
    'tenants': {
      'abcd-12345': {
        'displayName': 'AB CD',
        'iconUrl': 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png',
        'logoUrl': '',
        'buttonColor': '#007bff',
        'immediateFederatedRedirect': true,
        'signInFlow': 'redirect',
        'signInOptions': [
          {
            'provider': 'password',
            'disableSignUp': {
              'status': true,
            },
          },
        ],
        'tosUrl': '',
        'privacyPolicyUrl': '',
      },
      'tenant1-624h4': {
        'displayName': 'Tenant 1',
        'iconUrl': 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/anonymous.png',
        'logoUrl': 'https://storage.googleapis.com/gcip-iap-bucket-authui-954140151439/arrcus.jpeg',
        'buttonColor': '#007bff',
        'immediateFederatedRedirect': true,
        'signInFlow': 'redirect',
        'signInOptions': [
          {
            'provider': 'password',
            'disableSignUp': {
              'status': true,
            },
          },
        ],
        'tosUrl': '',
        'privacyPolicyUrl': '',
      },
      'tenant2-51wdt': {
        'displayName': 'Tenant 2',
        'iconUrl': 'https://storage.googleapis.com/gcip-iap-bucket-authui-954140151439/arrcus.ico',
        'logoUrl': 'https://storage.googleapis.com/gcip-iap-bucket-authui-954140151439/arrcus.jpeg',
        'buttonColor': '#007bff',
        'immediateFederatedRedirect': true,
        'signInFlow': 'redirect',
        'signInOptions': [
          {
            'provider': 'password',
          },
        ],
        'tosUrl': '',
        'privacyPolicyUrl': '',
      },
    },
    'tosUrl': '',
    'privacyPolicyUrl': '',
  },
};

const mockConfig = structuredClone(ORIGINAL_CONFIG);

jest.mock('../build/config-functions', () => {
  return {
    writeConfig: jest.fn((data) => {
      if (Object.keys(data[Object.keys(data)[0]].tenants).find((e) => e === 'abcd-error') === 'abcd-error') {
        throw new Error('simulated error');
      }
    }),
    readConfig: jest.fn(() => {
      if (Object.keys(mockConfig[Object.keys(mockConfig)[0]].tenants).find((e) => e === 'abcd-error') === 'abcd-error') {
        throw new Error('simulated error');
      }
      return mockConfig;
    }),
  };
},
);

const ADD_DATA = {
  operation: 'add',
  tenantId: 'abcd-12345',
  displayName: 'AB CD',
};

const DELETE_DATA = {
  operation: 'delete',
  tenantId: 'abcd-12345',
};

// The following cause the mock to simulate an error
const ADD_DATA_GENERATE_ERROR = {
  operation: 'add',
  tenantId: 'abcd-error',
  displayName: 'AB CD',
};

const DELETE_DATA_GENERATE_ERROR = {
  operation: 'delete',
  tenantId: 'abcd-error',
};

describe('updateConfig update tests', () => {
  beforeEach(async () => {
    process.env.AUTH_HOST = 'auth.example.com';
  });

  it('Add tenant', async () => {
    const req = new Request();
    req.setBody(ADD_DATA);
    const res = new Response();
    await updateConfig(req, res);
    expect(res.statusCode).toBe(200);
    expect(mockConfig).toEqual(MODIFIED_CONFIG);
  });

  it('Add same tenant again', async () => {
    const req = new Request();
    req.setBody(ADD_DATA);
    const res = new Response();
    await updateConfig(req, res);
    expect(res.statusCode).toBe(400);
    expect(mockConfig).toEqual(MODIFIED_CONFIG);
  });

  it('Delete tenant', async () => {
    const req = new Request();
    req.setBody(DELETE_DATA);
    const res = new Response();
    await updateConfig(req, res);
    expect(res.statusCode).toBe(200);
    expect(mockConfig).toEqual(ORIGINAL_CONFIG);
  });

  it('Delete tenant again', async () => {
    const req = new Request();
    req.setBody(DELETE_DATA);
    const res = new Response();
    await updateConfig(req, res);
    expect(res.statusCode).toBe(400);
    expect(mockConfig).toEqual(ORIGINAL_CONFIG);
  });

  it('Add tenant - simulated error', async () => {
    const req = new Request();
    req.setBody(ADD_DATA_GENERATE_ERROR);
    const res = new Response();
    await updateConfig(req, res);
    expect(res.statusCode).toBe(500);
  });

  it('Delete tenant - simulated error', async () => {
    const req = new Request();
    req.setBody(DELETE_DATA_GENERATE_ERROR);
    const res = new Response();
    await updateConfig(req, res);
    expect(res.statusCode).toBe(500);
  });
},
);
