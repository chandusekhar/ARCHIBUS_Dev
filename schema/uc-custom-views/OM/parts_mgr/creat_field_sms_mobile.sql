-- Update AFM Schema

-- Create SMS field
INSERT INTO afm.afm_flds
(table_name, afm_module, afm_size, afm_type,
allow_null, comments, data_type, decimals,
dep_cols, dflt_val, edit_group, edit_mask,
enum_list, field_name, is_atxt,
is_tc_traceable, max_val, min_val, ml_heading,
num_format, primary_key, ref_table, review_group,
sl_heading, string_format)
VALUES (
'cf', 20, 64, 2050,
1, 'UC - Added by JC 20100125', 12, 0,
NULL, NULL, NULL, NULL,
NULL, 'sms_address', 0,
0, NULL, NULL, 'SMS Address',
0, 0, NULL, NULL,
NULL, 5);

-- Create Mobile Field
INSERT INTO afm.afm_flds
(table_name, afm_module, afm_size, afm_type,
allow_null, comments, data_type, decimals,
dep_cols, dflt_val, edit_group, edit_mask,
enum_list, field_name, is_atxt,
is_tc_traceable, max_val, min_val, ml_heading,
num_format, primary_key, ref_table, review_group,
sl_heading, string_format)
VALUES (
'cf', 20, 24, 2050,
1, 'UC - Added by JC 20100125', 1, 0,
NULL, NULL, NULL, NULL,
NULL, 'mobile_number', 0,
0, NULL, NULL, 'Mobile Number',
0, 0, NULL, NULL,
NULL, 5);

