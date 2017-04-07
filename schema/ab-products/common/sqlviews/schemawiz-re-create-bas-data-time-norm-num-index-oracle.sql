BEGIN EXECUTE IMMEDIATE 'DROP INDEX bas_data_time_norm_num_index'; EXCEPTION WHEN OTHERS THEN null; END;;

BEGIN EXECUTE IMMEDIATE 'CREATE INDEX bas_data_time_norm_num_index ON bas_data_time_norm_num (date_measured, time_measured, interval)'; EXCEPTION WHEN OTHERS THEN null; END;;