IF EXISTS (SELECT 1 FROM sysindex WHERE index_name='bas_data_clean_num_comboIndex') DROP INDEX bas_data_clean_num.bas_data_clean_num_comboIndex;

IF EXISTS (SELECT 1 FROM systable WHERE table_name='bas_data_clean_num' AND table_type='BASE') CREATE INDEX bas_data_clean_num_comboIndex ON bas_data_clean_num (date_measured, time_measured, process_status);