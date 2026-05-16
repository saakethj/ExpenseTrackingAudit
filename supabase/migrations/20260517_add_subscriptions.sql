-- Phase 1: Create subscriptions table

CREATE TABLE subscriptions (
  id                uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              text           NOT NULL,
  amount            numeric(12, 2) NOT NULL CHECK (amount > 0),
  billing_cycle     text           NOT NULL CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_billing_date date           NOT NULL,
  category          text,
  payment_mode      text           NOT NULL CHECK (payment_mode IN ('cash', 'card', 'upi', 'bank', 'other')),
  status            text           NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  notes             text,
  created_at        timestamptz    NOT NULL DEFAULT now(),
  updated_at        timestamptz    NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_select_own" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own" ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own" ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own" ON subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_subscriptions_user_status ON subscriptions (user_id, status, next_billing_date);
CREATE INDEX idx_subscriptions_user_next   ON subscriptions (user_id, next_billing_date ASC);

-- Trigger for updated_at
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
