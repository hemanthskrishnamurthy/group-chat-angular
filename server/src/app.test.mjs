import request from 'supertest';
import { describe, expect, test } from '@jest/globals';
import { createApp } from './app.mjs';

describe('HRMS API', () => {
  test('health endpoint responds', async () => {
    const app = createApp({ emit: () => undefined });
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.service).toBe('enterprise-hrms');
  });
});
