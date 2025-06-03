import {body, validationResult} from "express-validator";
import {Request, Response, NextFunction} from "express";
import {ApiError} from "../models/models";

export const validateCreatePolicyPayload = [
    body('productId')
        .notEmpty()
        .withMessage('Product ID is required')
        .isString()
        .withMessage('Product ID must be a string'),

    body('customerName')
        .notEmpty()
        .withMessage('Customer name is required')
        .isString()
        .withMessage('Customer name must be a string')
        .isLength({min: 2, max: 100})
        .withMessage('Customer name must be between 2 and 100 characters'),

    body('startDate')
        .notEmpty()
        .withMessage('Start date is required')
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),

    body('endDate')
        .notEmpty()
        .withMessage('End date is required')
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),

    body('premium')
        .notEmpty()
        .withMessage('Premium is required')
        .isNumeric()
        .withMessage('Premium must be a number')
        .custom((value) => {
            if (value <= 0) {
                throw new Error('Premium must be greater than 0');
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['active', 'expired', 'cancelled'])
        .withMessage('Status must be one of: active, expired, cancelled'),
];


export const validateUpdatePolicyPayload = [
    body('productId')
        .optional()
        .isString()
        .withMessage('Product ID must be a string'),

    body('customerName')
        .optional()
        .isString()
        .withMessage('Customer name must be a string')
        .isLength({min: 2, max: 100})
        .withMessage('Customer name must be between 2 and 100 characters'),

    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),

    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),

    body('premium')
        .optional()
        .isNumeric()
        .withMessage('Premium must be a number')
        .custom((value) => {
            if (value <= 0) {
                throw new Error('Premium must be greater than 0');
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['active', 'expired', 'cancelled'])
        .withMessage('Status must be one of: active, expired, cancelled'),
];


export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const error: ApiError = {
      error: 'Validation Error',
      message: errors.array().map((err: {msg: string}) => err.msg).join(', '),
      statusCode: 400
    };
    res.status(400).json(error);
    return;
  }
  
  next();
};
