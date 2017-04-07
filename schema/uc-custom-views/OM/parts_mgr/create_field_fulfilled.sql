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
'wr_other', 1, 1, 2050,
0, 'UC - Added by JC 20100106', 5, 0,
NULL, 0, NULL, NULL,
'0;No;1;Yes', 'fulfilled', 0,
0, NULL, NULL, 'Fulfilled',
0, 0, NULL, NULL,
NULL, 25);

