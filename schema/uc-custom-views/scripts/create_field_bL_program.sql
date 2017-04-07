-- Update AFM Schema


INSERT INTO afm.afm_flds
(table_name, afm_module, afm_size, afm_type,
allow_null, comments, data_type, decimals,
dep_cols, dflt_val, edit_group, edit_mask,
enum_list, field_name, is_atxt,
is_tc_traceable, max_val, min_val, ml_heading,
num_format, primary_key, ref_table, review_group,
sl_heading, string_format)
VALUES (
'bl', 1, 10, 2050,
1, 'UC - Added by JC 20100127', 1, 0,
NULL, NULL, NULL, NULL,
NULL, 'program', 0,
0, NULL, NULL, 'Program Account',
0, 0, NULL, NULL,
NULL, 10);

