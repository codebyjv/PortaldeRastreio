CREATE OR REPLACE FUNCTION get_pending_ipem_items_for_notification(date_limit text)
RETURNS TABLE(id int) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.id
  FROM
    order_items oi
  WHERE
    oi.certificate_type ILIKE '%IPEM%'
    AND oi.created_at < date_limit::date
    AND NOT EXISTS (
      SELECT 1
      FROM ipem_assessment_items iai
      WHERE iai.item_id = oi.id
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_orders_without_documents(date_limit text)
RETURNS TABLE(id uuid, order_number text) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.order_number
  FROM
    orders o
  WHERE
    o.created_at < date_limit::date
    AND NOT EXISTS (
      SELECT 1
      FROM documents d
      WHERE d.order_id = o.id
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_status_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.status_updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_status_updated_at
BEFORE UPDATE OF status ON orders
FOR EACH ROW
EXECUTE PROCEDURE update_status_updated_at_column();