Express Ecommerce Backend API

This project is an Express.js backend application built to support a web or mobile frontend. It provides RESTful APIs for handling authentication, file uploads, payments, emails, and general server-side logic. The backend is designed to be modular, secure, and easy to extend.

Tech Stack

Node.js / Express

TypeScript

Stripe (Checkout Sessions for payments)

Firebase Admin (authentication and admin tasks)

Cloudinary (media storage)

Multer (file uploads)

Zod (request validation)

firebase admin is used to access db

Packages Used
Package	Purpose
express	Web framework for building APIs
cors	Enable cross-origin requests
dotenv	Environment variable management
dayjs	Date and time handling
firebase-admin	Server-side Firebase access
cloudinary	Image and file storage
multer	Handling multipart file uploads
nodemailer	Sending transactional emails
stripe	Payment processing using Checkout Sessions
zod	Request and data validation
tsc-alias	Path alias support for TypeScript builds
Features

RESTful API structure

Stripe Checkout Sessions for secure payments

File uploads with Multer and Cloudinary

Input validation using Zod

Email sending with Nodemailer

Firebase Admin integration

Environment-based configuration

CORS support

Stripe Payments (Checkout Sessions)

Stripe is used to create Checkout Sessions, allowing secure handling of payments without exposing sensitive payment data.

Example flow:

Client requests a checkout session

Backend creates a Stripe Checkout Session

Client is redirected to Stripe Checkout

Stripe handles payment securely

Webhooks can be used to confirm payment status

Environment Variables

Create a .env file in the root of the project:

PORT=5000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
EMAIL_HOST=your_email_host
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

Installation
npm install

Running the App
Development
npm run dev

Build
npm run build

Production
npm start

Validation

All incoming requests are validated using Zod to ensure correct data shapes and reduce runtime errors.

File Uploads

Files are uploaded using Multer

Stored securely using Cloudinary

Supports image and media uploads

Notes

Do not commit .env files

Use Stripe webhooks for payment confirmation

Follow best practices for handling secrets and credentials

Future Improvements

Role-based access control

Improved logging

Rate limiting

Extended webhook handling
g secrets
