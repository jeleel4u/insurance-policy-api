
# Insurance Policy API

Is a NodeJs, Express.js + TypeScript backend service for managing insurance policies and products.

## Features

- **RESTful API** with appropriate HTTP status codes
- **TypeScript** with strict typing (no `any` types)
- **Authentication** using API key authentication that implements a lightweight least-previlege access and easily revocable key
- **Request validation** use express-validator for payload validation
- **Complete error handling**
- **In-memory data management** from JSON files
- **Unit tests** with Jest and Supertest
- **Modular architecture** with separation of concerns

## Quick Start

### Prerequisites

- Node.js 16+ and npm (run on node current LTS v22)
- The data files should be available at `~/src/data/dataSource/policies.json` and `~/src/data/dataSource/products.json`

### Installation

```bash
# Unzip and navigate to the project directory
cd insure-api

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL

```code
http://localhost:3000
```

#### Documentation Endpoint - A quick implementation of OpenAPI/Swagger documentation

`http://localhost:3000/api-doc` - Preview in the browser (there might be consideration to exclude this from Production)
  
### Authentication

Protected endpoints require an API key in the `x-api-key` header:

```code
x-api-key: your-secret-api-key
```

### Endpoints

#### Health Check

- **GET** `/health` - Returns service health status
  
#### Public Endpoints (No Authentication Required)

##### Get Policy by ID

- **GET** `/policies/:id`
- Returns a single policy with full product object
- **Example**: `GET /policies/pol_001`

**Response:**

```json
{
  "id": "pol_001",
  "productId": "prod_motor",
  "customerName": "Alice Smith",
  "startDate": "2025-01-01",
  "endDate": "2026-01-01",
  "premium": 320,
  "status": "active",
  "createdAt": "2025-01-01T12:00:00Z",
  "product": {
    "id": "prod_motor",
    "name": "Motor Insurance",
    "category": "motor",
    "description": "Covers damage and liability for cars and motorcycles.",
    "basePrice": 300,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

##### Get Policies by Customer Name

- **GET** `/policies?customerName=<name>`
- Returns all policies for a customer (case-insensitive search)
- **Example**: `GET /policies?customerName=Alice Smith`

**Response:**

```json
[
  {
    "id": "pol_001",
    "productId": "prod_motor",
    "customerName": "Alice Smith",
    "startDate": "2025-01-01",
    "endDate": "2026-01-01",
    "premium": 320,
    "status": "active",
    "createdAt": "2025-01-01T12:00:00Z",
    "product": {
      "id": "prod_motor",
      "name": "Motor Insurance",
      "category": "motor",
      "description": "Covers damage and liability for cars and motorcycles.",
      "basePrice": 300,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  }
]
```

#### Protected Endpoints (Require API Key)

##### Create New Policy

- **POST** `/policies`
- **Headers**: `x-api-key: your-secret-api-key`

**Request Body:**

```json
{
  "productId": "prod_motor",
  "customerName": "John Doe",
  "startDate": "2025-06-01",
  "endDate": "2026-06-01",
  "premium": 350,
  "status": "active"
}
```

**Response:** `201 Created`

```json
{
  "id": "pol_011",
  "productId": "prod_motor",
  "customerName": "John Doe",
  "startDate": "2025-06-01",
  "endDate": "2026-06-01",
  "premium": 350,
  "status": "active",
  "createdAt": "2025-05-29T10:30:00Z",
  "product": {
    "id": "prod_motor",
    "name": "Motor Insurance",
    "category": "motor",
    "description": "Covers damage and liability for cars and motorcycles.",
    "basePrice": 300,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

##### Update Existing Policy

- **PUT** `/policies/:id`
- **Headers**: `x-api-key: your-secret-api-key`

**Request Body (partial update):**

```json
{
  "customerName": "John Smith",
  "premium": 375
}
```

**Response:** `200 OK` (same format as create response)

##### Delete Policy

- **DELETE** `/policies/:id`
- **Headers**: `x-api-key: your-secret-api-key`
- **Response:** `204 No Content`

### Error Responses

All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "statusCode": 400
}
```

**Common Error Codes:**

- `400` - Bad Request (validation errors, invalid data)
- `401` - Unauthorized (missing or invalid API key)
- `403` - Fobbiden (Where api-key used does not have sufficient permission)
- `404` - Not Found (policy/product not found)
- `500` - Internal Server Error

### Validation Rules

#### Create Policy

- `productId`: Required, must be a valid product ID
- `customerName`: Required, 2-100 characters
- `startDate`: Required, valid ISO 8601 date
- `endDate`: Required, valid ISO 8601 date, must be after startDate
- `premium`: Required, positive number
- `status`: Optional, one of: "active", "expired", "cancelled"

#### Update Policy

- All fields are optional
- Same validation rules apply when provided
- `endDate` must be after `startDate` (considering existing values)

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Type check without compilation

## Data Models

### Policy

```typescript
interface Policy {
  id: string;
  productId: string;
  customerName: string;
  startDate: string;        // ISO 8601 date
  endDate: string;          // ISO 8601 date
  premium: number;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;        // ISO 8601 datetime
}
```

### Product

```typescript
interface Product {
  id: string;
  name: string;
  category: 'home' | 'motor' | 'pet' | 'travel';
  description: string;
  basePrice: number;
  createdAt: string;        // ISO 8601 datetime
}
```

### PolicyWithProduct

```typescript
interface PolicyProduct extends Policy {
  product: Product;
}
```

## Testing

The project includes comprehensive test coverage:

- **Unit tests** for data management functions
- **Integration tests** for API endpoints
- **Authentication tests** for protected routes
- **Validation tests** for request data

Run tests with:

```bash
npm test
```

View coverage report:

```bash
npm test -- --coverage
```

## Development

### Adding New Endpoints

1. Define TypeScript interfaces in `src/models/`  This can be splited if the model file becoming bigger
2. Add controller methods in `src/controllers/`
3. Create route definitions in `src/routes/`
4. Add validation middleware if needed
5. Write tests in `src/__tests__/`

### Environment Variables

The application uses these environment variables:

- `PORT` - Server port (default: 3000)

### API Key Configuration

The static API key is currently hardcoded as `your-secret-api-key` in the repository. In production, this should be:

1. Moved to environment variables
2. Replaced with a proper authentication system
3. Stored securely (hashed/encrypted)

## Production Considerations

- **Environment Variables**: Move API key to environment variables
- **Database**: Replace in-memory storage with a proper database
- **Logging**: Add structured logging
- **Rate Limiting**: Add rate limiting middleware
- **CORS**: Configure CORS for frontend integration
- **Security**: Add helmet.js for security headers
- **Monitoring**: Extend the health checks and metrics
- **Documentation**: Consider extending documentation endpoint

## License

ISC
