CREATE OR REPLACE FUNCTION add_business_days(start_date date, num_days integer)
RETURNS date AS $$
DECLARE
  result_date date := start_date;
  days_added integer := 0;
BEGIN
  WHILE days_added < num_days LOOP
    result_date := result_date + 1;
    IF EXTRACT(ISODOW FROM result_date) < 6 THEN
      days_added := days_added + 1;
    END IF;
  END LOOP;
  RETURN result_date;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION advance_order_status_after_one_business_day()
RETURNS void AS $$
DECLARE
  order_record RECORD;
  target_date date;
BEGIN
  FOR order_record IN
    SELECT id, created_at FROM orders WHERE status = 'Confirmado'
  LOOP
    -- Calculate the date after 1 business day
    target_date := add_business_days(order_record.created_at::date, 1);

    -- If the current date is past the target date, update the status
    IF current_date > target_date THEN
      UPDATE orders
      SET status = 'Preparando'
      WHERE id = order_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;