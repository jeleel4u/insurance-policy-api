import { Router } from "express"; 
import { PolicyController } from "../controllers/policyController";
import { authenticateApiKeyMiddleware } from "../middleware/auth";
import { handleValidationErrors, validateCreatePolicyPayload, validateUpdatePolicyPayload } from "../middleware/validation";

const router = Router();

router.get('/:id', PolicyController.getPolicyById);
router.get('/', PolicyController.getPoliciesByCustomerName);

router.post('/', 
    authenticateApiKeyMiddleware(['write']),
    validateCreatePolicyPayload,
    handleValidationErrors,
    PolicyController.createPolicy);

router.put('/:id',
    authenticateApiKeyMiddleware(['write']),
    validateUpdatePolicyPayload,
    handleValidationErrors,
    PolicyController.updatePolicy);

router.delete('/:id', 
    authenticateApiKeyMiddleware(['delete']),
    PolicyController.deletePolicy);

export default router;