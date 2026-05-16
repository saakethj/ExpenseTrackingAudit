-- Add transaction_type column to categories table
ALTER TABLE categories
ADD COLUMN transaction_type TEXT DEFAULT 'both' CHECK (transaction_type IN ('expense', 'income', 'both'));

-- Create index for filtering by type
CREATE INDEX idx_categories_user_type ON categories(user_id, transaction_type);
