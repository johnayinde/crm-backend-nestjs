# CRM Backend Service

A robust CRM backend API built with NestJS that provides customer management functionality, secure authentication, and integration with Django endpoints.

## Postman Collection

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/11191710/2sAYkLkGPH)

## Features

- **Customer Management API**

  - CRUD operations for customer data
  - Pagination & filtering support
  - Data validation
  - In-memory or PostgreSQL data storage

- **Security Features**

  - JWT authentication
  - Role-based access control (RBAC)
  - Prevention of common security vulnerabilities
    - SQL Injection protection via TypeORM/Parameterized queries
    - XSS protection via input validation
    - CSRF protection
    - Rate limiting to prevent abuse
  - CORS configuration
  - Encryption of sensitive customer data

- **Django API Integration**
  - Proxy route to fetch customer orders from Django API
  - Authentication forwarding
  - Error handling and logging
  - Caching
  - Retry mechanism for failed requests

## Project Structure

The project follows a modular architecture with the following main components:

- `src/customers`: Customer management module
- `src/auth`: Authentication and authorization module
- `src/proxy`: Django API proxy module
- `src/common`: Shared utilities and middleware
- `src/config`: Application configuration

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/johnayinde/crm-backend-nestjs.git
   cd crm-backend-nestjs
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Copy the environment variables file:

   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in the `.env` file:

   - Set database connection details
   - Configure JWT secret
   - Set Django API URL and key

5. Start the application:

   ```bash
   yarn run start:dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get access token
  ***
- `GET /api/auth/profile` - Helper route to get current user profile

### Customer Management

- `POST /api/customers` - Create a new customer
- `GET /api/customers` - List customers (with pagination and filtering)
- `GET /api/customers/:id` - Get a specific customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer (admin only)

### Django Integration

- `GET /api/customers/:id/orders` - Get orders for a customer from Django API

## Security Measures Implemented

### Authentication & Authorization

- JWT-based authentication for all API endpoints
- Role-based access control restricting delete operations to admin users
- Secure password storage with bcrypt hashing

### Data Protection

- Encryption of sensitive customer data (phone, address) using AES-256
- Input validation using class-validator to prevent injection attacks
- TypeORM with parameterized queries to prevent SQL injection

### API Security

- Rate limiting to prevent brute force and DDoS attacks
- CORS configuration to restrict access from unauthorized origins
- Helmet middleware to set various HTTP headers for security
- Input sanitization and validation

### Django Integration Security

- Secure forwarding of authentication credentials
- Timeout and retry configuration
- Error handling to prevent information leakage
- Caching to reduce load on Django API

## Error Handling

The application implements global exception filters to ensure consistent error responses across the API. This includes:

- Validation errors (400 Bad Request)
- Authentication errors (401 Unauthorized)
- Authorization errors (403 Forbidden)
- Resource not found errors (404 Not Found)
- Conflict errors (409 Conflict)
- Server errors (500 Internal Server Error)
