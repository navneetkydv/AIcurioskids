-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- batches
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  schedule_text TEXT NOT NULL DEFAULT '',
  seat_limit INT,
  seats_taken INT NOT NULL DEFAULT 0,
  price_inr INT NOT NULL CHECK (price_inr > 0),
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT seats_non_negative CHECK (seats_taken >= 0),
  CONSTRAINT seats_within_limit CHECK (seat_limit IS NULL OR seats_taken <= seat_limit)
);

-- leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id),
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  child_first_name TEXT NOT NULL,
  child_class INT NOT NULL CHECK (child_class BETWEEN 5 AND 8),
  city TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_at TIMESTAMPTZ,
  consent_text_version TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  amount_inr INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

-- webhook_events (idempotency)
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch ON enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(parent_email);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment ON payments(enrollment_id);

-- RLS: enable and deny all public access (service role bypasses RLS)
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No public policies — all access via service role key on the server.

-- Atomic seat confirmation function
CREATE OR REPLACE FUNCTION confirm_enrollment_seat(
  p_enrollment_id UUID,
  p_payment_id TEXT,
  p_order_id TEXT,
  p_amount INT,
  p_raw JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_batch_id UUID;
  v_status TEXT;
  v_limit INT;
  v_taken INT;
BEGIN
  -- Lock enrollment row
  SELECT batch_id, status INTO v_batch_id, v_status
  FROM enrollments
  WHERE id = p_enrollment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_status = 'confirmed' THEN
    -- Already confirmed (idempotent)
    UPDATE payments
    SET status = 'paid',
        razorpay_payment_id = COALESCE(razorpay_payment_id, p_payment_id),
        paid_at = COALESCE(paid_at, now()),
        raw_payload = COALESCE(p_raw, raw_payload)
    WHERE razorpay_order_id = p_order_id;
    RETURN true;
  END IF;

  -- Lock batch and check seats
  SELECT seat_limit, seats_taken INTO v_limit, v_taken
  FROM batches
  WHERE id = v_batch_id
  FOR UPDATE;

  IF v_limit IS NOT NULL AND v_taken >= v_limit THEN
    UPDATE enrollments SET status = 'cancelled' WHERE id = p_enrollment_id;
    UPDATE payments
    SET status = 'failed', raw_payload = p_raw
    WHERE razorpay_order_id = p_order_id;
    RETURN false;
  END IF;

  -- Confirm
  UPDATE enrollments SET status = 'confirmed' WHERE id = p_enrollment_id;
  UPDATE batches SET seats_taken = seats_taken + 1 WHERE id = v_batch_id;
  UPDATE payments
  SET status = 'paid',
      razorpay_payment_id = p_payment_id,
      paid_at = now(),
      raw_payload = p_raw
  WHERE razorpay_order_id = p_order_id;

  RETURN true;
END;
$$;

-- Seed one sample batch (edit dates/price as needed)
INSERT INTO batches (name, start_date, end_date, schedule_text, seat_limit, price_inr, is_open)
VALUES (
  'November 2025 Batch',
  '2025-11-10',
  '2025-12-05',
  '2 sessions per week, 60 minutes each · Weekday evenings',
  25,
  4999,
  true
)
ON CONFLICT DO NOTHING;
