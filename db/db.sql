-- PassOwl Database Schema
-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS credential_category_links CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS credentials CASCADE;
DROP TABLE IF EXISTS secure_notes CASCADE;
DROP TABLE IF EXISTS password_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL UNIQUE,
    login_password_hash VARCHAR NOT NULL,
    login_salt VARCHAR NOT NULL,
    encryption_salt VARCHAR NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles junction table
CREATE TABLE user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create password_categories table
CREATE TABLE password_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    color_hex VARCHAR(7),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, user_id)
);

-- Create credentials table
CREATE TABLE credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    encrypted_title TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    encryption_iv VARCHAR(24) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credential_category_links junction table
CREATE TABLE credential_category_links (
    credential_id INTEGER NOT NULL REFERENCES credentials(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES password_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (credential_id, category_id)
);

-- Create secure_notes table
CREATE TABLE secure_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    encrypted_title TEXT NOT NULL,
    encrypted_content TEXT NOT NULL,
    encryption_iv VARCHAR(24) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_credentials_user_id ON credentials(user_id);
CREATE INDEX idx_password_categories_user_id ON password_categories(user_id);
CREATE INDEX idx_secure_notes_user_id ON secure_notes(user_id);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('user', 'Standard user role'),
    ('admin', 'Administrator role with elevated privileges');

-- Commit the transaction
COMMIT;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_password_categories_updated_at BEFORE UPDATE ON password_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secure_notes_updated_at BEFORE UPDATE ON secure_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Commit the transaction
COMMIT;