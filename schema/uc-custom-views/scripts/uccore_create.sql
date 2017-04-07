-- Create the afm.uc_accore table


CREATE TABLE afm.uc_accore
(
	accore_id			CHAR(5) PRIMARY KEY,
	description			VARCHAR(30)
)



	


-- Update AFM Schema

INSERT INTO afm.afm_tbls
(table_name, title, comments, is_sql_view, afm_module)
VALUES
('uc_accore', 'UofC Core Accounts', 'Added 01/2010', 0, 4);


INSERT INTO afm.afm_flds
(table_name, afm_module, afm_size, afm_type,
allow_null, comments, data_type, decimals,
dep_cols, dflt_val, edit_group, edit_mask,
enum_list, field_name, is_atxt,
is_tc_traceable, max_val, min_val, ml_heading,
num_format, primary_key, ref_table, review_group,
sl_heading, string_format)
VALUES (
'uc_accore', 1, 5, 2050,
0, 'UC - JC Added 2010/01', 1, 0,
NULL, NULL, NULL, NULL,
NULL, 'accore_id', 0,
0, NULL, NULL, 'Core Account' + CHAR(13) + CHAR(10) + 'Code ID',
0, 1, NULL, NULL,
NULL, 10);


INSERT INTO afm.afm_flds
(table_name, afm_module, afm_size, afm_type,
allow_null, comments, data_type, decimals,
dep_cols, dflt_val, edit_group, edit_mask,
enum_list, field_name, is_atxt,
is_tc_traceable, max_val, min_val, ml_heading,
num_format, primary_key, ref_table, review_group,
sl_heading, string_format)
VALUES (
'uc_accore', 1, 30, 2055,
1, 'UC - JC Added 2010/01', 12, 0,
NULL, NULL, NULL, NULL,
NULL, 'description', 0,
0, NULL, NULL, 'Description',
0, 0, NULL, NULL,
NULL, 5);




