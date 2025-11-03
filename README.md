# Silvercel Inventory System

The **Silvercel Inventory System** is a standalone inventory management system designed for a single user to efficiently manage and track product stocks, categories, and related data. User authentication is handled through **Supabase**, while all backend operations use **PHP** and **MySQL**.

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- React
- Vite
- React Router
- Tailwind CSS
- Lucide Icons
- Fuse.js (for fuzzy searching)
- Axios (for HTTP requests)
- Supabase (for User Authentication)

### Backend
- PHP
- MySQL
- Composer
- vlucas/phpdotenv

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [XAMPP](https://www.apachefriends.org/index.html) (or any other local server with Apache, MySQL, and PHP)
- [Node.js and npm](https://nodejs.org/en/)
- [Composer](https://getcomposer.org/)
- A [Supabase](https://supabase.com/) account and project.

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `backend` directory by copying the `.env.example` if available. Add the following environment variables:

   ```
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_database_user
   DB_PASS=your_database_password
   DB_NAME=your_database_name
   ```

4. **Database Setup:**
   - Start your MySQL server.
   - Create a new database.
   - Import the database schema. The schema can be found in the `backend/database` directory. (Instructions might be in `backend/database/README.md`).

5. **Web Server Setup:**
   - Configure your Apache server to point to the `backend/api` directory as the document root.
   - Ensure `mod_rewrite` is enabled.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the `frontend` directory. Add the following environment variables with your Supabase project details and backend API URL:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost/react_inventory_system/backend/api
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at the URL provided by Vite (usually `http://localhost:5173`).

---