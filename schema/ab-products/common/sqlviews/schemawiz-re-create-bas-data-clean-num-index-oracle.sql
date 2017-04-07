BEGIN EXECUTE IMMEDIATE 'DROP INDEX bas_data_clean_num_index'; EXCEPTION WHEN OTHERS THEN null; END;;

BEGIN EXECUTE IMMEDIATE 'CREATE INDEX bas_data_clean_num_index ON bas_data_clean_num (date_measured, time_measured, process_status)'; EXCEPTION WHEN OTHERS THEN null; END;;