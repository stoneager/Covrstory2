# E-Commerce Platform

A complete e-commerce platform with separate applications for owners, customers, and authentication.

## Project Structure

```
├── ecommerce-owner/          # Owner management panel
│   ├── frontend/             # React frontend (Port 3001)
│   └── backend/              # Node.js backend (Port 5000)
├── ecommerce-customer/       # Customer shopping app
│   ├── frontend/             # React frontend (Port 3000)
│   └── backend/              # Node.js backend (Port 5001)
├── login/                    # Shared authentication
│   ├── frontend/             # React frontend (Port 3002)
│   └── backend/              # Node.js backend (Port 5002)
```

## Features

### Owner Panel
- Product management with variants (colors, sizes)
- Collection management
- Discount and coupon management
- Order tracking and packaging
- Dashboard with analytics

### Customer App
- Product browsing with filters
- Shopping cart functionality
- Coupon application
- Razorpay payment integration
- Responsive design with Tailwind CSS

### Authentication
- Google OAuth integration
- Phone number authentication with OTP
- Role-based redirection (owner/customer)
- JWT token management

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Firebase project (for authentication)
- Razorpay account (for payments)
- AWS S3 bucket (for image storage)

### 1. Database Setup
Create a MongoDB database and note the connection string.

### 2. Firebase Setup
1. Create a Firebase project
2. Enable Authentication with Google and Phone providers
3. Get your Firebase configuration

### 3. Razorpay Setup
1. Create a Razorpay account
2. Get your Key ID and Key Secret from the dashboard

### 4. Environment Variables
Copy the `.env.example` files in each backend folder and fill in your values:

#### Owner Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
PORT=5000
```

#### Customer Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5001
```

#### Login Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
PORT=5002
```

#### Frontend Environment Variables
Update the `.env` files in each frontend folder with your configuration.

### 5. Installation & Running

#### Install Dependencies
```bash
# Owner app
cd ecommerce-owner/frontend && npm install
cd ../backend && npm install

# Customer app
cd ../../ecommerce-customer/frontend && npm install
cd ../backend && npm install

# Login app
cd ../../login/frontend && npm install
cd ../backend && npm install
```

#### Start All Services
```bash
# Terminal 1 - Owner Backend
cd ecommerce-owner/backend && npm run dev

# Terminal 2 - Owner Frontend
cd ecommerce-owner/frontend && npm start

# Terminal 3 - Customer Backend
cd ecommerce-customer/backend && npm run dev

# Terminal 4 - Customer Frontend
cd ecommerce-customer/frontend && npm start

# Terminal 5 - Login Backend
cd login/backend && npm run dev

# Terminal 6 - Login Frontend
cd login/frontend && npm start
```

### 6. Access the Applications
- Customer App: http://localhost:3000
- Owner Panel: http://localhost:3001
- Login Page: http://localhost:3002

## Usage Flow

1. **First Time Setup**: Access the owner panel to add collections and products
2. **Customer Shopping**: 
   - Visit customer app
   - Click on products to be redirected to login
   - Login with Google or Phone
   - Browse products, add to cart
   - Apply coupons at checkout
   - Complete payment with Razorpay
3. **Order Management**: Use owner panel to track and manage orders

## API Endpoints

### Customer Backend (Port 5001)
- `GET /api/products` - Get all products with discounts
- `POST /api/cart/add` - Add item to cart
- `POST /api/checkout/apply-coupon` - Apply coupon
- `POST /api/payment/create-order` - Create Razorpay order

### Owner Backend (Port 5000)
- `GET /api/products` - Get all products (owner view)
- `POST /api/products` - Create new product
- `GET /api/orders/stats` - Get order statistics
- `POST /api/upload/product-presigned` - Get S3 upload URL

### Login Backend (Port 5002)
- `POST /api/auth/login` - Authenticate user

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- FontAwesome Icons
- Firebase (Authentication)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Razorpay (Payments)
- AWS S3 (File Storage)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

