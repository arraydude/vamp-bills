-- Replace Drizzle's client-side $onUpdate with a Postgres trigger.
-- The trigger sets updated_at = now() on every UPDATE, with full
-- Postgres timestamp precision. This fixes the optimistic-lock
-- precision mismatch where JS Date (milliseconds) didn't match
-- Postgres timestamp (microseconds).

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendors_updated_at
  BEFORE UPDATE ON "vendors"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bills_updated_at
  BEFORE UPDATE ON "bills"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bill_line_items_updated_at
  BEFORE UPDATE ON "bill_line_items"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON "payments"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
