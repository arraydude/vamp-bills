-- Replace Drizzle's client-side $onUpdate with a Postgres trigger.
-- The trigger sets updated_at = now() on every UPDATE, with full
-- Postgres timestamp precision. This fixes the optimistic-lock
-- precision mismatch where JS Date (milliseconds) didn't match
-- Postgres timestamp (microseconds).
--
-- Idempotent: safe to re-run.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vendors_updated_at ON "vendors";
CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON "vendors"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_bills_updated_at ON "bills";
CREATE TRIGGER trg_bills_updated_at
  BEFORE UPDATE ON "bills"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_bill_line_items_updated_at ON "bill_line_items";
CREATE TRIGGER trg_bill_line_items_updated_at
  BEFORE UPDATE ON "bill_line_items"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON "payments";
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON "payments"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
