# Airbnb Clone (Full-Stack MERN)

A full-stack Airbnb clone built exclusively with **pure JavaScript** (`.js` only, zero TypeScript). The application features a dynamic property detail page with real-time MongoDB synchronization, an interactive 5-photo bento gallery, guest reservation workflow with server-side price calculation, wishlists/favorites persisted across sessions, and an automated review aggregation system.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React *(Pure JavaScript & JSX)* |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose ODM |
| **Database** | MongoDB (Local database `Airbnb` on port `27017`) |
| **Architecture** | REST API with decoupled frontend & backend, Vite dev proxy, and global error handling |

---

## Folder Structure

```
Airbnb-Clone/
├── client/                           # React frontend application
│   ├── public/                       # Static public assets
│   ├── src/
│   │   ├── api/                      # Backend API client modules
│   │   │   ├── bookingApi.js         # POST /api/bookings client
│   │   │   ├── favoriteApi.js        # GET, POST, DELETE /api/favorites client
│   │   │   ├── listingApi.js         # GET /api/listings/:id hook & client
│   │   │   └── reviewApi.js          # GET, POST /api/listings/:id/reviews client
│   │   ├── components/               # Modular UI components
│   │   │   ├── ListingSkeleton.js    # Pulse skeleton placeholder for initial load
│   │   │   └── ReviewsSection.js     # 6-category ratings breakdown & review cards
│   │   ├── App.js                    # Main listing detail page with live DB sync
│   │   ├── index.css                 # Tailwind CSS directives and custom tokens
│   │   └── main.js                   # Application DOM entry point
│   ├── index.html                    # Root HTML document
│   ├── package.json                  # Client dependencies and build scripts
│   ├── tailwind.config.js            # Airbnb brand color palette & styling tokens
│   └── vite.config.js                # Vite config with /api proxy to backend (port 5000)
│
├── server/                           # Node.js + Express backend application
│   ├── controllers/                  # Route business logic (wrapped in asyncHandler)
│   │   ├── bookingController.js      # Server-side booking validation & pricing calculation
│   │   ├── favoriteController.js     # User session favorite management
│   │   ├── listingController.js      # Listing detail retrieval by MongoDB ObjectId
│   │   └── reviewController.js       # Review creation & automatic rating aggregation
│   ├── middleware/                   # Global middleware
│   │   └── errorHandler.js           # Centralized AppError, asyncHandler & JSON formatter
│   ├── models/                       # Mongoose database schemas
│   │   ├── Booking.js                # Booking schema with pricing breakdown & code
│   │   ├── Favorite.js               # Compound indexed favorite schema (userId + listingId)
│   │   ├── Listing.js                # Full listing schema (title, images, host, pricing)
│   │   └── Review.js                 # Review schema with category ratings & aggregation
│   ├── routes/                       # Express REST router definitions
│   │   ├── bookingRoutes.js          # /api/bookings routes
│   │   ├── favoriteRoutes.js         # /api/favorites routes
│   │   ├── healthRoutes.js           # /api/health MongoDB status check
│   │   ├── listingRoutes.js          # /api/listings routes
│   │   └── reviewRoutes.js           # /api/listings/:id/reviews routes
│   ├── scripts/                      # Utility scripts
│   │   ├── seed.js                   # Seeds sample villa listing with default reviews
│   │   └── test_e2e_flow.js          # Automated end-to-end user flow verification
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Mongoose connection & lifecycle event handling
│   │   └── server.js                 # Express server configuration, CORS, and routes
│   ├── .env                          # Local environment variables
│   ├── .env.example                  # Template for environment variables
│   └── package.json                  # Backend dependencies and execution scripts
│
├── package.json                      # Root workspace convenience scripts
└── README.md                         # Project documentation
```

---

## Environment Variables

Create a `.env` file in the `server/` directory (a pre-configured `.env.example` is provided):

```env
# Server Port
PORT=5000

# MongoDB Connection URI (pointing to local MongoDB Compass instance)
MONGODB_URI=mongodb://localhost:27017/Airbnb
```

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `PORT` | The port the Express backend server listens on | `5000` |
| `MONGODB_URI` | MongoDB connection string specifying host and database | `mongodb://localhost:27017/Airbnb` |

---

## Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Installed and running locally on port `27017` (e.g., via MongoDB Community Server or MongoDB Compass)

### 1. Clone the Repository
```bash
git clone https://github.com/shreya-272/Airbnb-Clone.git
cd Airbnb-Clone
```

### 2. Install Dependencies

Install packages for both the backend and frontend:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

cd ..
```

### 3. Seed MongoDB Database
Seed the initial luxury villa listing document into MongoDB:

```bash
cd server
npm run seed
cd ..
```
*Sample output:*
```
✓ Connected to MongoDB at: mongodb://localhost:27017/Airbnb
✓ Successfully seeded listing: Villa Paradiso - Cliffside Luxury Ocean Villa
  Document ID: 6aa7d647bda80dd066fe3c61
```

> **MongoDB Compass Inspection Note:**  
> Open MongoDB Compass and connect to:
> ```
> mongodb://localhost:27017/Airbnb
> ```
> You can inspect four collections persisting live data:
> - `listings`: The seeded luxury villa document (`_id: 6aa7d647bda80dd066fe3c61`).
> - `favorites`: User-saved wishlist items with compound indexing.
> - `reviews`: Review documents with 6-category ratings (cleanliness, accuracy, check-in, communication, location, value).
> - `bookings`: Completed reservations with server-calculated totals, date ranges, and confirmation codes.

---

## Running in Development

The frontend and backend run as independent applications in dev mode.

### Option A: Run Concurrently from Root
Open two terminal windows:

```bash
# Terminal 1: Start Express Backend (with native node --watch)
npm run dev:server

# Terminal 2: Start React Frontend (Vite)
npm run dev:client
```

### Option B: Run Independently in Subdirectories

**1. Start Backend:**
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000`.*  
*Health Check: `http://localhost:5000/api/health`.*

**2. Start Frontend:**
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`.*  
*The Vite development server automatically proxies all `/api/*` requests to `http://localhost:5000`.*

---

## Build & Production Commands

| Command | Working Directory | Description |
| :--- | :--- | :--- |
| `npm run dev` | `server/` | Starts the Express backend in watch mode (`node --watch`) |
| `npm start` | `server/` | Starts the Express server in production mode |
| `npm run seed` | `server/` | Seeds sample listing and reviews into MongoDB |
| `node scripts/test_e2e_flow.js` | `server/` | Runs the automated end-to-end integration test suite |
| `npm run dev` | `client/` | Starts the Vite development server with Hot Module Replacement |
| `npm run build` | `client/` | Bundles and optimizes the React frontend into `client/dist/` |
| `npm run preview` | `client/` | Locally previews the production build output |
| `npm run build:client` | Root | Builds client from root workspace |

---

## API Endpoint Reference

All endpoints return consistent JSON responses and handle errors via centralized middleware.

### 1. Health & Status
- **`GET /api/health`**
  - **Description**: Verifies Express server and MongoDB connectivity.
  - **Response (200 OK)**:
    ```json
    {
      "status": "ok",
      "uptime": "120.45s",
      "database": {
        "status": "connected",
        "readyState": 1,
        "name": "Airbnb",
        "host": "localhost"
      },
      "message": "Server and Database are healthy"
    }
    ```

### 2. Listings
- **`GET /api/listings/:id`**
  - **Description**: Retrieves full listing document by MongoDB ObjectId.
  - **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "_id": "6aa7d647bda80dd066fe3c61",
        "title": "Villa Paradiso - Cliffside Luxury Ocean Villa",
        "location": { "city": "Santorini", "country": "Greece" },
        "rating": 5.0,
        "reviewCount": 6,
        "pricePerNight": 385,
        "cleaningFee": 150,
        "serviceFee": 273,
        "guestCapacity": 8,
        "amenities": ["Infinity pool", "High-speed WiFi", "Chef's kitchen", ...],
        "images": [...]
      }
    }
    ```
  - **Error (400 Bad Request)**: Invalid ObjectId format.
  - **Error (404 Not Found)**: Listing not found in database.

### 3. Favorites / Wishlist
- **`POST /api/favorites`**
  - **Headers**: `x-session-id: <string>`
  - **Body**: `{ "listingId": "6aa7d647bda80dd066fe3c61" }`
  - **Response (201 Created)**: Saves favorite to MongoDB (upsert prevents duplicates).

- **`DELETE /api/favorites/:listingId`**
  - **Headers**: `x-session-id: <string>`
  - **Response (200 OK)**: Removes favorite for current session from MongoDB.

- **`GET /api/favorites`**
  - **Query (Optional)**: `?listingId=6aa7d647bda80dd066fe3c61` &rarr; Checks if specific listing is favorited (`isFavorited: true | false`).
  - **No Query**: Returns all saved favorites for user session populated with listing details.

### 4. Bookings
- **`POST /api/bookings`**
  - **Description**: Validates date ranges (no past dates, checkout after check-in), recalculates pricing server-side, and creates a reservation.
  - **Body**:
    ```json
    {
      "listingId": "6aa7d647bda80dd066fe3c61",
      "checkIn": "2026-10-12",
      "checkOut": "2026-10-17",
      "guests": { "adults": 2, "children": 1, "infants": 0 }
    }
    ```
  - **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Reservation request submitted successfully",
      "confirmationCode": "HM-4253F1",
      "booking": {
        "_id": "673f8...",
        "listingId": "6aa7d647bda80dd066fe3c61",
        "nights": 5,
        "pricing": {
          "nightlyRate": 385,
          "basePrice": 1925,
          "cleaningFee": 150,
          "serviceFee": 273,
          "taxes": 176,
          "totalPrice": 2524
        },
        "status": "pending"
      }
    }
    ```

### 5. Reviews
- **`GET /api/listings/:id/reviews`**
  - **Description**: Returns all reviews for a listing along with calculated 6-category averages.
  - **Response (200 OK)**: Returns reviews array and `categoryAverages` object.

- **`POST /api/listings/:id/reviews`**
  - **Description**: Adds a new guest review and automatically triggers MongoDB aggregation to update `listing.rating` and `listing.reviewCount`.
  - **Body**:
    ```json
    {
      "author": { "name": "Elena Rostova", "location": "Geneva, Switzerland" },
      "rating": 5,
      "categoryRatings": {
        "cleanliness": 5,
        "accuracy": 5,
        "communication": 5,
        "location": 5,
        "checkIn": 5,
        "value": 5
      },
      "comment": "Spectacular cliffside views and immaculate infinity pool!"
    }
    ```
  - **Response (201 Created)**: Returns review document and updated listing metrics.

---

## Global Error Handling Architecture

The backend implements a standard error contract so unhandled exceptions never crash the server:

```json
{
  "success": false,
  "status": "fail",
  "statusCode": 404,
  "message": "Listing not found with ID: 6aa7d647bda80dd066fe3c61",
  "path": "/api/listings/6aa7d647bda80dd066fe3c61",
  "timestamp": "2026-09-14T11:42:48.638Z"
}
```

- Operational errors are cleanly raised using `new AppError(message, statusCode)`.
- All asynchronous controller handlers are wrapped in `asyncHandler`, forwarding errors to `next(err)`.
- The frontend provides dedicated UX for:
  - **404 Not Found**: Clear explanation when an ID does not exist with a retry button.
  - **Network Failure**: Offline alert when the Express backend is not reachable.
  - **Empty States**: Customized cards when reviews or wishlist items are empty with direct calls-to-action.