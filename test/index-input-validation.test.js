const {Request, Response} = require('jest-express');
const {updateConfig} = require('../build/index');

const DATA_NO_OP = {
  tenantId: 'abcd',
  displayName: 'AB CD',
};

const DATA_EMPTY_OP = {
  operation: '',
  tenantId: 'abcd',
  displayName: 'AB CD',
};

const DATA_INVALID_OP = {
  operation: 'XYZ',
  tenantId: 'abcd',
  displayName: 'AB CD',
};

const ADD_DATA_NO_TENANT_CONFIG = {
  operation: 'add',
  tenantId: 'abcd-12345',
};

const ADD_DATA_INVALID_TENANT_ID_1 = {
  operation: 'add',
  tenantId: 'abcd-',
};

const ADD_DATA_INVALID_TENANT_ID_2 = {
  operation: 'add',
  tenantId: '',
};

const ADD_DATA_INVALID_TENANT_ID_3 = {
  operation: 'add',
  displayName: 'AB CD',
};

const ADD_DATA_INVALID_TENANT_ID_4 = {
  operation: 'add',
  tenantId: 'abcd-12345678901234567890',
};

const AUTH_ERROR = 'Authentication host must be defined via the AUTH_HOST environment variable.';
const OP_ERROR = '"operation" must be specified and its value must be one of either "add" or "delete".';
const TC_ERROR = '"tenantUiConfig" must be speciffied if operation is "add".';
const TENANT_ID_ERROR = '"tenantId" must conform to the following regular expression: /[a-z][a-z0-9-]{8,14}[a-z0-9]/.';

/**
 * function that factors out common code that generates an input validation error
 * @param {*} data
 * @param {*} errorMessage
 */
async function errorRequest(data, errorMessage) {
  const req = new Request();
  req.setBody(data);
  const res = new Response();
  await updateConfig(req, res);
  expect(res.send).toHaveBeenCalled();
  expect(res.statusCode).toBe(400);
  expect(res.body).toBe(errorMessage);
}

describe('updateConfig input validation tests', () => {
  beforeEach(async () => {
    process.env.AUTH_HOST = 'auth.example.com';
  });

  it('AUTH_HOST not set', async () => {
    delete process.env.AUTH_HOST;
    errorRequest(ADD_DATA_NO_TENANT_CONFIG, AUTH_ERROR);
  });

  it('AUTH_HOST empty', async () => {
    process.env.AUTH_HOST = '';
    errorRequest(ADD_DATA_NO_TENANT_CONFIG, AUTH_ERROR);
  });

  it('Operation missing', async () => {
    errorRequest(DATA_NO_OP, OP_ERROR);
  });

  it('Operation empty', async () => {
    errorRequest(DATA_EMPTY_OP, OP_ERROR);
  });

  it('Invalid operation', async () => {
    errorRequest(DATA_INVALID_OP, OP_ERROR);
  });

  it('Add operation without display name', async () => {
    errorRequest(ADD_DATA_NO_TENANT_CONFIG, TC_ERROR);
  });

  it('Add operation with invalid tenant ID # 1', async () => {
    errorRequest(ADD_DATA_INVALID_TENANT_ID_1, TENANT_ID_ERROR);
  });

  it('Add operation with invalid tenant ID # 2', async () => {
    errorRequest(ADD_DATA_INVALID_TENANT_ID_2, TENANT_ID_ERROR);
  });

  it('Add operation with invalid tenant ID # 3', async () => {
    errorRequest(ADD_DATA_INVALID_TENANT_ID_3, TENANT_ID_ERROR);
  });

  it('Add operation with invalid tenant ID # 4', async () => {
    errorRequest(ADD_DATA_INVALID_TENANT_ID_4, TENANT_ID_ERROR);
  });
},
);
