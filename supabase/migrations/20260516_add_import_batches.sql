-- Create import_batches table to track CSV/XLSX imports
CREATE TABLE import_batches (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename          text NOT NULL,
  transaction_count int  NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Enable row-level security
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "users_select_own" ON import_batches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own" ON import_batches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own" ON import_batches FOR DELETE USING (auth.uid() = user_id);

-- Add import_batch_id column to transactions
ALTER TABLE transactions
  ADD COLUMN import_batch_id uuid REFERENCES import_batches(id) ON DELETE CASCADE;

-- Create indexes for efficient queries
CREATE INDEX idx_transactions_import_batch ON transactions(import_batch_id);
CREATE INDEX idx_import_batches_user ON import_batches(user_id, created_at DESC);
