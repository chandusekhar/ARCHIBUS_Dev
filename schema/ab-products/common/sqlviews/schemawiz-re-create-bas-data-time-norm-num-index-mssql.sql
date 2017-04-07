IF EXISTS (SELECT 1 FROM sysindexes WHERE name='bas_data_time_norm_num_index') DROP INDEX bas_data_time_norm_num.bas_data_time_norm_num_index;

IF EXISTS (SELECT 1 FROM sys.tables WHERE name='bas_data_time_norm_num') CREATE INDEX bas_data_time_norm_num_index ON bas_data_time_norm_num (date_measured, time_measured, interval);