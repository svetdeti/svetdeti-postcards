# Project Documentation

This document provides instructions on how to use the Docker environment for our project and outlines the functionality of our API endpoints.

## Docker Compose Configuration

To configure the Docker environment, update your `docker-compose.yml` file as follows:

```yaml
version: "3"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SMTP_SERVICE=SMTP
      - SMTP_USER=user@example.com
      - SMTP_PASS=pass
      - SMTP_HOST=host
      - SMTP_PORT=465
```

## Starting Docker

To initialize the Docker environment, run the following command:

docker-compose up -d

## Update the Container

To update your Docker container, run the following command:

docker-compose up -d --build

## Testing PDF Generation

To test the PDF generation feature, access the form at:
**URL:** `http://localhost:3000/form.html`

## API Endpoints

### Submit Letter Endpoint

**URL:** `http://localhost:3000/submit-letter`

**Method:** `POST`

**Body Format:**

```json
{
  "email": "string",
  "name": "string",
  "letterText": "string",
  "momentGift": "string",
  "signature": "string"
}
```

**Response:** A PDF file containing the submitted letter.

### Send Email Endpoint

**URL:** http://localhost:3000/send-email

**Method:** POST

**Body Format:**

```json
{
  "email": "string",
  "name": "string",
  "letterText": "string",
  "momentGift": "string",
  "signature": "string"
}
```

**Description:** Sends an email with the provided content using the settings defined in the .env file.
