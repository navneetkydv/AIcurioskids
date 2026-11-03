-- Simple CRM fields for leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS crm_status TEXT DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS crm_notes TEXT;

-- Optional check
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_crm_status_check'
  ) THEN
    ALTER TABLE leads
      ADD CONSTRAINT leads_crm_status_check
      CHECK (crm_status IS NULL OR crm_status IN ('new', 'contacted', 'qualified', 'won', 'lost'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_crm_status ON leads(crm_status);