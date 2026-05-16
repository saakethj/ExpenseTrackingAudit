-- Create budgets table for per-period budget tracking
CREATE TABLE budgets (
  id            uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category      text,
  limit_amount  numeric(12, 2) NOT NULL CHECK (limit_amount > 0),
  period_type   text           NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_start  date           NOT NULL,
  period_end    date           NOT NULL,
  created_at    timestamptz    NOT NULL DEFAULT now(),
  updated_at    timestamptz    NOT NULL DEFAULT now(),
  CHECK (period_end >= period_start)
);

-- Enable row-level security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies (gated on auth.uid() = user_id)
CREATE POLICY "users_select_own" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "users_delete_own" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- Indexes for common query patterns
CREATE INDEX idx_budgets_user_period      ON budgets(user_id, period_start DESC);
CREATE INDEX idx_budgets_user_cat_period  ON budgets(user_id, category, period_start DESC);

-- Maintain updated_at via existing set_updated_at() trigger function
CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Prevent duplicate budgets for the same (user, category, period) combo.
-- Treats null category (overall budget) as a distinct row via coalesce.
CREATE UNIQUE INDEX idx_budgets_unique_per_period
  ON budgets (user_id, coalesce(category, ''), period_start, period_end);
