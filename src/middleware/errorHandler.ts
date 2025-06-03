import {Request, Response, NextFunction} from 'express';
import {ApiError} from '../models/models';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
    console.error('Error occurred:', err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || 500;
    const errorResponse: ApiError = {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        statusCode: statusCode
    };

    // Log Error details - with Logger - err.error, err.message, err.stack

    res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
    const errorResponse: ApiError = {
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        statusCode: 404
    };

    res.status(404).json(errorResponse);
}