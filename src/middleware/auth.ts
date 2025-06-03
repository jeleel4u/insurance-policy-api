import {Request, Response, NextFunction} from "express";
import {ApiError} from "../models/models";
import {Repository} from "../data/repository"; // Assuming you have a repository for data access

// export interface AuthenticatedRequest extends Request {
//     isAuthenticated?: boolean;
// }

interface ApiCheckResult {
    isValid: boolean;
    permissions: string[];
}

export function authenticateApiKeyMiddleware(requiredPermission: string[] = []): (req: Request, res: Response, next: NextFunction) => void {

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const apiKey = req.headers['x-api-key'] as string;

            if (!apiKey) {
                const error: ApiError = {
                    error: 'Unauthorized',
                    message: 'API key is required. Please provide x-api-key header.',
                    statusCode: 401
                };

                res.status(401).json(error);
                return;
            }

            // Validate the API key
            const apiKeyDb = Repository.getInstance().getApiByKey(apiKey);

            if (!apiKeyDb) {
                const error: ApiError = {
                    error: "Unauthorized",
                    message: "Invalid API key",
                    statusCode: 401
                };

                res.status(401).json(error);
                return;
            }

            const validationResult = validateApiKey(apiKey);

            if (!validationResult.isValid) {
                const error: ApiError = {
                    error: "Unauthorized",
                    message: "Invalid or missing API key",
                    statusCode: 401
                };

                res.status(401).json(error);
                return;
            }

            if (requiredPermission.length > 0) {
                const hasRequiredPermissions = requiredPermission.every(permission => validationResult.permissions.includes(permission));
                if (!hasRequiredPermissions) {
                    const error: ApiError = {
                        error: "Forbidden",
                        message: "Insufficient permissions for the requested operation",
                        statusCode: 403
                    };

                    res.status(403).json(error);
                    return;
                }
            }
            // (req as AuthenticatedRequest).isAuthenticated = true;

            next();

        } catch (error) {
            const apiError: ApiError = {
                error: 'Internal Server Error',
                message: 'An unexpected error occurred during authentication.',
                statusCode: 500
            };
            res.status(500).json(apiError);
        }
    };
}

const validateApiKey = (apiKey: string): ApiCheckResult => {
    let checkResult: ApiCheckResult = {
        isValid: false,
        permissions: []
    };

    if (!apiKey || apiKey.trim() === '') {
        return checkResult;
    }

    const apiKeyDb = Repository.getInstance().getApiByKey(apiKey);
    if (!apiKeyDb || !apiKeyDb.isActive) {
        return checkResult;
    }

    const currentDate = new Date();
    const expiresAt = new Date(apiKeyDb.expiresAt);
    if (expiresAt < currentDate) {
        return checkResult;
    }

    checkResult = {...{isValid: true, permissions: apiKeyDb.permissions || []}};

    return checkResult;
}
