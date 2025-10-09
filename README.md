# TEGA Auth Starter

## Quickstart

### Server
```bash
cd server
npm i
# update .env if needed
npm run dev
```
API: `http://localhost:5001`

### Client
```bash
cd client
npm i
npm run dev
```
Client: `http://localhost:3000`

The client reads `VITE_API_URL` from `client/.env`.

## Payment Flow & User-Specific Data

### How Payments Work

1. **User Authentication**: Users must be logged in to make payments
2. **Course Selection**: Users select a course from the available options
3. **Payment Processing**: 
   - Payment is processed through the backend API
   - Payment data is saved to the user's specific database record
   - Both MongoDB (if available) and in-memory storage are used
4. **Payment History**: 
   - All payments are associated with the specific user
   - Payment history is displayed only for the authenticated user
   - Real-time updates when new payments are made

### Payment Data Storage

- **Database**: Payments are saved to MongoDB with user ID association
- **In-Memory**: Fallback storage when MongoDB is unavailable
- **Local Storage**: Client-side caching for offline access
- **User Isolation**: Each user can only see their own payment history

### Key Features

- ✅ User-specific payment tracking
- ✅ Real-time payment history updates
- ✅ Secure payment processing
- ✅ Multiple payment methods (Card, UPI, Net Banking)
- ✅ Payment receipt generation
- ✅ Course access control based on payment status

### Testing Payment Flow

1. Register/Login as a student
2. Navigate to Payment page
3. Select a course and payment method
4. Complete the payment
5. Check Payment History page to see the transaction
6. Verify course access is granted

### API Endpoints

- `POST /api/payments/process-dummy` - Process payment
- `GET /api/payments/history` - Get user's payment history
- `GET /api/payments/paid-courses` - Get user's paid courses
- `GET /api/payments/access/:courseId` - Check course access
