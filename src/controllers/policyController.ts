import {Request, Response} from 'express';
import {Repository} from '../data/repository';
import {ApiError, CreatePolicyRequest, Policy, PolicyProduct} from '../models/models';


export class PolicyController {
    public static getPolicyById(req: Request, res: Response): void {
        try {
            const {id} = req.params;
            if (!id || id.trim() === '') {
                res.status(400).json({error: 'Policy ID is required'});
                return;
            }

            const policy = Repository.getInstance().getPolicyById(id);

            if (!policy) {
                res.status(404).json({error: 'Policy not found'});
                return;
            }

            const product = Repository.getInstance().getProductById(policy.productId);

            if (!product) {
                const error: ApiError = {
                    error: 'Internal Server Error',
                    message: 'Associated product not found',
                    statusCode: 500
                };
                res.status(500).json(error);
                return;
            }

            const policyWithProduct: PolicyProduct = {
                ...policy,
                product
            };

            res.json(policyWithProduct);
        } catch (error) {
            console.error('Error in getPolicyById:', error);
            const apiError: ApiError = {
                error: 'Internal Server Error',
                message: 'Failed to retrieve policy',
                statusCode: 500
            };
            res.status(500).json(apiError);
        }
    }

    public static getPoliciesByCustomerName(req: Request, res: Response): void {
        try {
            const customerName = req.query.customerName as string;
            if (!customerName) {
                res.status(400).json({error: 'Customer name is required'});
                return;
            }

            const policies = Repository.getInstance().getPoliciesByCustomerName(customerName);

            const policiesProducts: PolicyProduct[] = policies.map(policy => {
                const product = Repository.getInstance().getProductById(policy.productId);
                if (!product) {
                    throw new Error(`Product ${policy.productId} not found for policy ${policy.id}`);
                }
                return {...policy, product};
            });

            res.status(200).json(policiesProducts);
        } catch (error) {
            console.error('Error in getPoliciesByCustomerName:', error);
            const apiError: ApiError = {
                error: 'Internal Server Error',
                message: 'Failed to retrieve policies',
                statusCode: 500
            };
            res.status(500).json(apiError);

        }
    }

    // POST /policies - Authenticated endpoint
    public static createPolicy(req: Request, res: Response): void {

        try {
            const policyData: CreatePolicyRequest = req.body;

            // Validate that the product specify is valid. To ensure Referential Integrity
            const existingProduct = Repository.getInstance().getProductById(policyData.productId)
            if (!existingProduct) {
                const error: ApiError = {
                    error: 'Bad Request',
                    message: `Product with ID ${policyData.productId} not found`,
                    statusCode: 400
                };
                res.status(400).json(error);
                return;
            }

            const startDate = new Date(policyData.startDate);
            const endDate = new Date(policyData.endDate);

            if (endDate <= startDate) {
                const error: ApiError = {
                    error: 'Bad Request',
                    message: 'End date must be after start date',
                    statusCode: 400
                };
                res.status(400).json(error);
                return;
            }

            const newPolicy: Policy = {
                id: Repository.getInstance().generatePolicyId(),
                productId: policyData.productId,
                customerName: policyData.customerName,
                startDate: policyData.startDate,
                endDate: policyData.endDate,
                premium: policyData.premium,
                status: policyData.status || 'active',
                createdAt: new Date().toISOString()
            };

            const repoResult = Repository.getInstance().addPolicy(newPolicy);

            if (!repoResult) {
                // const error: ApiError = {
                //     error: 'Internal Server Error',
                //     message: 'Failed to create policy',
                //     statusCode: 500
                // };
                // res.status(500).json(error);
                // return;
                throw new Error(`Unable to create new policy for customer ${newPolicy.customerName} with product ${newPolicy.productId}. Please try again later.`);
            }

            const policyWithProduct: PolicyProduct = {
                ...newPolicy,
                product: {...existingProduct}
            };

            res.status(201).json(policyWithProduct);

        } catch (error) {
            console.error('Error in createPolicy:', error);
            const apiError: ApiError = {
                error: 'Internal Server Error',
                message: 'Failed to create policy',
                statusCode: 500
            };
            res.status(500).json(apiError);
        }
    }

    public static updatePolicy(req: Request, res: Response): void {
        try {
            const policyData = req.body;
            const {id} = req.params;
            if (!id || id.trim() === '') {
                res.status(400).json({error: 'Policy ID is required'});
                return;
            }
            const existingPolicy = Repository.getInstance().getPolicyById(id);
            if (!existingPolicy) {
                const error: ApiError = {
                    error: 'Not Found',
                    message: `Policy with ID ${id} not found`,
                    statusCode: 404
                };
                res.status(404).json(error);
                return;
            }

            if (policyData.productId) {
                const product = Repository.getInstance().getProductById(policyData.productId);
                if (!product) {
                    const error: ApiError = {
                        error: 'Bad Request',
                        message: `Product with ID ${policyData.productId} not found`,
                        statusCode: 400
                    };
                    res.status(400).json(error);
                    return;
                }
            }

            if (policyData.startDate || policyData.endDate) {
                const startDate = new Date(policyData.startDate || existingPolicy.startDate);
                const endDate = new Date(policyData.endDate || existingPolicy.endDate);

                if (endDate <= startDate) {
                    const error: ApiError = {
                        error: 'Bad Request',
                        message: 'End date must be after start date',
                        statusCode: 400
                    };
                    res.status(400).json(error);
                    return;
                }
            }
            
            const success = Repository.getInstance().updatePolicy(id, policyData);

            if (!success) {
                throw new Error(`Failed to update policy with ID ${id}`);
            }

            const updatedPolicy = Repository.getInstance().getPolicyProductById(id);
            if (!updatedPolicy) {
                throw new Error(`Policy with ID ${id} not found after update`);
            }

            res.status(200).json(updatedPolicy);

        } catch (error) {
            console.error('Error in updatePolicy:', error);
            const apiError: ApiError = {
                error: 'Internal Server Error',
                message: 'Failed to update policy',
                statusCode: 500
            };
            res.status(500).json(apiError);

        }
    }

    public static deletePolicy(req: Request, res: Response): void {
    try {

        const {id} = req.params;
        if (!id || id.trim() === '') {
            res.status(400).json({error: 'Policy ID is required'});
            return;
        }

        const existingPolicy = Repository.getInstance().getPolicyById(id);
        if (!existingPolicy) {
            const error: ApiError = {
                error: 'Not Found',
                message: `Policy with ID ${id} not found`,
                statusCode: 404
            };
            res.status(404).json(error);
            return;
        }

        const success = Repository.getInstance().deletePolicy(id);
        if (!success) {
            throw new Error(`Failed to delete policy with ID ${id}`);
        }

        res.status(204).send(); // No content response

    }catch (error) {
        console.error('Error in deletePolicy:', error);
        const apiError: ApiError = {
            error: 'Internal Server Error',
            message: 'Failed to delete policy',
            statusCode: 500
        };
        res.status(500).json(apiError);
    }
}

}
