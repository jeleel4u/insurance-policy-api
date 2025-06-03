import request from "supertest";
import app from "../app";
import {Repository} from "../data/repository";

describe('Policy Controller', () => {
    const API_KEY_VALID = 'RW50ZXIgdGhlIHRleHQgdG8gQmFzZTY0IEVuY29kZQm';
    const API_KEY_INACTIVE = 'Gb3JtYXR0ZIsIEpT04gQmXRpZmllciwgWE1FZpZXdlcg';
    const API_KEY_EXPIRED = 'VGhlLWVhZ2xlLxZC02Nzg5MC1mZ2hpa2p0LWxqYW5l';
    const API_KEY_INSUFFICIENT_PERMISSION = 'CkJhc2U2NCBFbmNvZGUKICAKRW50ZXIgdGhhdCB0aGF0';

    const API_KEY_HEADER = 'x-api-key';

    let repository: Repository;

    beforeEach(() => {
        // Reset data before each test
        repository = Repository.getInstance();
    });

    describe('GET /policies/:id', () => {
        it('should return a policy by ID with associated product', async () => {
            const policyId = 'pol_001'; // Adjust this to an existing policy ID in your test data
            const response = await request(app)
                .get(`/policies/${policyId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', policyId);
            expect(response.body).toHaveProperty('product');
        });

        it('should return 404 for non-existent policy ID', async () => {
            const response = await request(app)
                .get('/policies/non_existent');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Policy not found');
        });
    });

    describe('GET /policies?customerName=', () => {
        it('should return policies by customer name', async () => {
            const customerName = 'Hannah Davis'; // Adjust this to an existing customer name in your test data
            const response = await request(app)
                .get(`/policies?customerName=${customerName}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('customerName', customerName);
        });

        it('should return 400 for missing customer name', async () => {
            const response = await request(app)
                .get('/policies');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Customer name is required');
        });
    });

    describe('POST /policies', () => {
        const validPolicy = {
            productId: 'prod_motor',
            customerName: 'Test Customer',
            startDate: '2025-06-01',
            endDate: '2026-06-01',
            premium: 350
        };

        it('should create a new policy with valid data', async () => {
            const response = await request(app)
                .post('/policies')
                .set(API_KEY_HEADER, API_KEY_VALID)
                .send(validPolicy)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('customerName', 'Test Customer');
            expect(response.body).toHaveProperty('product');
            expect(response.body).toHaveProperty('createdAt');
        });

        it('should return 401 without API key', async () => {
            const response = await request(app)
                .post('/policies')
                .send(validPolicy)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 401 with invalid API key', async () => {
            const response = await request(app)
                .post('/policies')
                .set(API_KEY_HEADER, API_KEY_INACTIVE)
                .send(validPolicy)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 401 with inactive API key', async () => {
            const response = await request(app)
                .post('/policies')
                .set(API_KEY_HEADER, API_KEY_INACTIVE)
                .send(validPolicy)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 401 with expired API key', async () => {
            const response = await request(app)
                .post('/policies')
                .set(API_KEY_HEADER, API_KEY_EXPIRED)
                .send(validPolicy)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 403 with insufficient permissions', async () => {
            const response = await request(app)
                .post('/policies')
                .set(API_KEY_HEADER, API_KEY_INSUFFICIENT_PERMISSION)
                .send(validPolicy)
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Forbidden');
        });

        it('should return 400 with invalid product ID', async () => {
            const invalidPolicy = {...validPolicy, productId: 'invalid_product'};

            const response = await request(app)
                .post('/policies')
                .set(API_KEY_HEADER, API_KEY_VALID)
                .send(invalidPolicy)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Bad Request');
        });

        it('should return 400 with invalid date range', async () => {
            const invalidPolicy = {
                ...validPolicy,
                startDate: '2025-06-01',
                endDate: '2025-05-01' // End date before start date
            };

            const response = await request(app)
                .post('/policies')
                .set(API_KEY_HEADER, API_KEY_VALID)
                .send(invalidPolicy)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Bad Request');
        });

        it('should return 400 with missing required fields', async () => {
            const incompletePolicy = {customerName: 'Test Customer'};

            const response = await request(app)
                .post('/policies')
                .set(API_KEY_HEADER, API_KEY_VALID)
                .send(incompletePolicy)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Validation Error');
        });
    });

    describe('PUT /policies/:id', () => {
        const validUpdate = {
            productId: 'prod_motor',
            customerName: 'Updated Customer',
            startDate: '2025-06-01',
            endDate: '2026-06-01',
            premium: 400
        };

        it('should update an existing policy with valid data', async () => {
            const policyId = 'pol_001'; // Adjust this to an existing policy ID in your test data
            const response = await request(app)
                .put(`/policies/${policyId}`)
                .set(API_KEY_HEADER, API_KEY_VALID)
                .send(validUpdate)
                .expect(200);

            expect(response.body).toHaveProperty('id', policyId);
            expect(response.body).toHaveProperty('customerName', 'Updated Customer');
        });

        it('should return 404 for non-existent policy ID', async () => {
            const response = await request(app)
                .put('/policies/non_existent')
                .set(API_KEY_HEADER, API_KEY_VALID)
                .send(validUpdate)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Not Found');
        });

        it('should return 401 without API key', async () => {
            const response = await request(app)
                .put('/policies/pol_001')
                .send(validUpdate)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 401 with invalid API key', async () => {
            const response = await request(app)
                .put('/policies/pol_001')
                .set(API_KEY_HEADER, API_KEY_INACTIVE)
                .send(validUpdate)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 403 with insufficient permissions', async () => {
            const response = await request(app)
                .put('/policies/pol_001')
                .set(API_KEY_HEADER, API_KEY_INSUFFICIENT_PERMISSION)
                .send(validUpdate)
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Forbidden');
        });
    });

    describe('DELETE /policies/:id', () => {
        it('should delete an existing policy by ID', async () => {
            const policyId = 'pol_001'; // Adjust this to an existing policy ID in your test data
            const response = await request(app)
                .delete(`/policies/${policyId}`)
                .set(API_KEY_HEADER, API_KEY_VALID)
                .expect(204);

            expect(response.body).toEqual({});
        });

        it('should return 404 for non-existent policy ID', async () => {
            const response = await request(app)
                .delete('/policies/non_existent')
                .set(API_KEY_HEADER, API_KEY_VALID)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Not Found');
        });

        it('should return 401 without API key', async () => {
            const response = await request(app)
                .delete('/policies/pol_001')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 401 with invalid API key', async () => {
            const response = await request(app)
                .delete('/policies/pol_001')
                .set(API_KEY_HEADER, API_KEY_INACTIVE)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 403 with insufficient permissions', async () => {
            const response = await request(app)
                .delete('/policies/pol_001')
                .set(API_KEY_HEADER, API_KEY_INSUFFICIENT_PERMISSION)
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Forbidden');
        });
    })

})




