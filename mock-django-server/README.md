# Mock Django API Server

## Purpose

This mock server is specifically designed to simulate the Django orders API endpoint that the CRM Backend needs to integrate with. It helps with development and testing without requiring a full Django backend to be set up.

## Prerequisites

- Node.js (v14 or later)
- yarn

## Setup

1.  Install dependencies:

```bash
yarn install
```

## Running the Server

Start the mock server with:

```bash
yarn run server
```

## Integrating with the CRM Backend

To use this mock server with your CRM Backend application, set the following environment variables in your CRM Backend's `.env` file:

```
DJANGO_API_URL=http://localhost:8000/api
DJANGO_API_KEY=fake-api-key-for-testing
```
