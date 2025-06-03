import { Repository } from '../data/repository';
import { Policy } from '../models/models';

describe('Repository', () => {
    let repository: Repository;

    beforeAll(() => {
        repository = Repository.getInstance();
    });

    describe('getPolicyById', () => {
    it('should get policy by ID', () => {
        const policy = repository.getPolicyById("pol_001");
        expect(policy).toBeDefined();
        expect(policy?.id).toBe("pol_001");
    });

        it('should return undefined for non-existent policy ID', () => {
            const policy = repository.getPolicyById("non_existent");
            expect(policy).toBeUndefined();
        });

    });

    describe('getProductById', () => {
        it('should get product by ID', () => {
            const product = repository.getProductById("prod_pet");
            expect(product).toBeDefined();
            expect(product?.id).toBe("prod_pet");
        });

        it('should return undefined for non-existent product ID', () => {
            const product = repository.getProductById("non_existent");
            expect(product).toBeUndefined();
        });
    });

    describe('getPoliciesByCustomerName', () => {
        it('should return policies for a valid customer name', () => {
            const policies = repository.getPoliciesByCustomerName("Hannah Davis");
            expect(policies.length).toBeGreaterThan(0);
            expect(policies[0]?.customerName).toBe("Hannah Davis");
        });

        it('should return an empty array for a non-existent customer name', () => {
            const policies = repository.getPoliciesByCustomerName("Non Existent Customer");
            expect(policies.length).toBe(0);
        });
    });

    describe('addPolicy', () => {
        it('should add a new policy', () => {
            const newPolicy: Policy = {
                id: repository.generatePolicyId(),
                customerName: "Jane Doe",
                productId: "prod_001",
                startDate: "2023-01-01",
                endDate: "2024-01-01",
                premium: 1000,
                status: "active",
                createdAt: new Date().toISOString()
            };
            const result = repository.addPolicy(newPolicy);
            expect(result).toBe(true);
        });

        it('should not add a policy with an existing ID', () => {
            const existingPolicy: Policy = {
                id: "pol_001",
                customerName: "Jane Doe",
                productId: "prod_001",
                startDate: "2023-01-01",
                endDate: "2024-01-01",
                premium: 1000,
                status: "active",
                createdAt: new Date().toISOString()
            };
            const result = repository.addPolicy(existingPolicy);
            expect(result).toBe(false);
        });
    });

    describe('updatePolicy', () => {
        it('should update an existing policy', () => {
            const updates = { premium: 1200 };
            const result = repository.updatePolicy("pol_001", updates);
            expect(result).toBe(true);
            const updatedPolicy = repository.getPolicyById("pol_001");
            expect(updatedPolicy?.premium).toBe(1200);
        });

        it('should not update a non-existent policy', () => {
            const updates = { premium: 1500 };
            const result = repository.updatePolicy("non_existent", updates);
            expect(result).toBe(false);
        });
    });

    describe('deletePolicy', () => {
        it('should delete an existing policy', () => {
            const result = repository.deletePolicy("pol_001");
            expect(result).toBe(true);
            const deletedPolicy = repository.getPolicyById("pol_001");
            expect(deletedPolicy).toBeUndefined();
        });

        it('should not delete a non-existent policy', () => {
            const result = repository.deletePolicy("non_existent");
            expect(result).toBe(false);
        });
    } );
});
