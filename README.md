# PassOwl

**PassOwl** is a secure and user-friendly password and note manager with **end-to-end encryption**. It allows you to safely store, organize, and share sensitive information.

---

## Key Features

* **Secure Storage:** Encrypted passwords and notes that never leave your client unencrypted.
* **Client-Side Encryption:** Your master password never leaves your device. All encryption happens in your browser.
* **Category Management:** Organize your credentials with custom categories.
* **Secure Sharing:** Share passwords with other PassOwl users using asymmetric encryption.
* **Identity Verification:** Secure login and registration with password hashing and salts.
* **Personalization:** Upload your own profile picture.

---

## Technologies

* **Backend:** **FastAPI** (Python), **SQLAlchemy**, **PostgreSQL**.
* **Frontend:** **SvelteKit**, **Svelte**, **Tailwind CSS**, **Web Crypto API** for client-side encryption, **TypeScript**.

---

## Quick Start

### Prerequisites

Make sure you have: **Python 3.9+**, **Node.js 18+**, **npm** (or alternative), **PostgreSQL**.

### Installation & Run

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/fadrny/PassOwl.git](https://github.com/fadrny/PassOwl.git)
    cd PassOwl
    ```
    
2.  **Set up environment variables:**
    * `backend/.env`: Copy `.env.example` and fill in `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS`.
    * `frontend/.env`: Copy `.env.example` and fill in `PUBLIC_API_URL`, `SECRET_CLOUDINARY_*` (for avatar uploads).
  
3.  **Database Setup:**
    Create a PostgreSQL database and execute the setup script `db/db.sql`.
    
5.  **Start the Backend:**
    ```bash
    cd backend
    python3 -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    python run.py
    ```
    
6.  **Start the Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## Usage

Navigate to the frontend application (something like `http://localhost:5173`). Register and log in using your **master password**. This password is crucial for decrypting your data and private keys. All sensitive data is encrypted client-side.

You can find the API documentation at `http://localhost:8000/docs`.

---

## Security Notes

* **Master Password:** Never sent to the server. It's used to derive your encryption key and decrypt your private key.
* **In-Memory Keys:** Encryption keys are stored in memory for a limited time only, requiring re-authentication afterward.
* **Client-Side Encryption:** Your data is encrypted in your browser before being sent to the server.

---
