import {ApiKey, Policy, PolicyProduct, Product} from "../models/models";
import * as fs from "fs";
import * as path from "path";

export class Repository {
    private static instance: Repository;
    private policies: Policy[] = [];
    private products: Product[] = [];
    private apiKeys: ApiKey[] = [];

    private dataSourcesPath = path.join(__dirname, "./dataSources");

    private constructor() {
        this.loadPolicies();
        this.loadProducts();
        this.loadApiKeys();
    }

    public static getInstance(): Repository {
        if (!Repository.instance) {
            Repository.instance = new Repository();
        }
        return Repository.instance;
    }

    private loadPolicies(): void {
        const filePath = path.join(this.dataSourcesPath, "policies.json");
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf-8");
            this.policies = JSON.parse(data);
        }
    }

    private loadProducts(): void {
        const filePath = path.join(this.dataSourcesPath, "products.json");
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, "utf-8");
            this.products = JSON.parse(data);
        }
    }

    public loadApiKeys(): void {
        this.apiKeys = JSON.parse(`
        [
            {
                "key": "VGhlLWVhZ2xlLxZC02Nzg5MC1mZ2hpa2p0LWxqYW5l",
                "createdAt": "2024-12-01T00:00:00Z",
                "expiresAt": "2025-04-01T00:00:00Z",
                "isActive": true,
                "permissions": ["read", "write", "delete"]
            },
            {
                "key": "RW50ZXIgdGhlIHRleHQgdG8gQmFzZTY0IEVuY29kZQm",
                "createdAt": "2024-01-01T00:00:00Z",
                "expiresAt": "2100-06-01T00:00:00Z",
                "isActive": true,
                "permissions": ["read", "write", "delete"]
            },            
            {
                "key": "CkJhc2U2NCBFbmNvZGUKICAKRW50ZXIgdGhhdCB0aGF0",
                "createdAt": "2025-02-01T00:00:00Z",
                "expiresAt": "2100-08-01T00:00:00Z",
                "isActive": true,
                "permissions": ["read"]
            },
            {
                "key": "Gb3JtYXR0ZIsIEpT04gQmXRpZmllciwgWE1FZpZXdlcg",
                "createdAt": "2025-01-01T00:00:00Z",
                "expiresAt": "2026-01-01T00:00:00Z",
                "isActive": false,
                "permissions": ["read", "write", "delete"]
            } 
        ]
        `);
    }

    public getApiByKey(apiKey: string): ApiKey | undefined {
        return this.apiKeys.find((key) => key.key === apiKey);
    }

    public getPolicyById(id: string): Policy | undefined {
        return this.policies.find((policy) => policy.id === id);
    }

    public getProductById(id: string): Product | undefined {
        return this.products.find((product) => product.id === id);
    }

    public getPoliciesByCustomerName(customerName: string): Policy[] {
        return this.policies.filter((policy) =>
            policy.customerName.toLowerCase().includes(customerName.toLowerCase())
        );
    }

    public addPolicy(policy: Policy): boolean {
        if (this.getPolicyById(policy.id)) {
            return false; // Policy with this ID already exists
        }

        this.policies.push(policy);
        return true;
    }

    public getPolicyProductById(id: string): PolicyProduct | undefined {
        const policy = this.getPolicyById(id);
        if (!policy) return undefined;

        const product = this.getProductById(policy.productId);
        if (!product) return undefined;

        return {...policy, product}; // Assuming Policy has a product field
    }

    public updatePolicy(
        id: string,
        updates: Partial<Omit<Policy, "id">>
    ): boolean {
        const index = this.policies.findIndex((policy) => policy.id === id);
        if (index === -1) return false;

        this.policies[index] = {...this.policies[index], ...updates} as Policy;
        return true;
    }

    public deletePolicy(id: string): boolean {
        const index = this.policies.findIndex((policy) => policy.id === id);
        if (index === -1) return false;

        this.policies.splice(index, 1);
        return true;
    }

    public generatePolicyId(): string {
        const maxId = this.policies.reduce((max, policy) => {
            const num = parseInt(policy.id.replace("pol_", ""));
            return num > max ? num : max;
        }, 0);

        return `pol_${String(maxId + 1).padStart(3, "0")}`;
    }
}
