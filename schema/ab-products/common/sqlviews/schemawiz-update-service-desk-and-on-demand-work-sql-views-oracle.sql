INSERT INTO afm_flds_lang (table_name, field_name) SELECT table_name, field_name FROM afm_flds WHERE NOT EXISTS (SELECT 1 FROM afm_flds_lang afm_flds_lang_inner WHERE afm_flds_lang_inner.table_name = afm_flds.table_name AND afm_flds_lang_inner.field_name = afm_flds.field_name) AND afm_flds.table_name IN ('activity_log_step_waiting','activity_logview','hactivity_logmonth','hwr_month','wr_step_waiting','activity_log_hactivity_log');

CREATE OR REPLACE VIEW activity_log_step_waiting as 
select pkey_value as activity_log_id,em_id,vn_id,cf_id,user_name,date_created,time_created,date_response,time_response,status,comments,step,step_code,step_type,step_log_id,activity_id 
from AFM.helpdesk_step_log where date_response is null and table_name = 'activity_log';

CREATE OR REPLACE VIEW activity_logview AS select activity_log.*,
    TO_NUMBER( TO_CHAR( date_requested, 'YYYY' )) || '-' ||  TO_NUMBER( TO_CHAR( date_requested, 'MM' )) AS month, 
    TO_NUMBER( TO_CHAR( date_requested, 'YYYY' )) || '-' ||  TO_NUMBER( TO_CHAR( date_requested, 'WW' )) AS week,
    NVL(assigned_to,vn_id) AS service_provider,
    cost_estimated-cost_actual AS cost_var,
    DECODE (status, 'CREATED', 0,'REQUESTED' , 1,'APPROVED' , 2,'REJECTED' , 3,'ISSUED' , 5,'CANCELLED' , 6, 'STOPPED' , 7,
    'COMPLETED' , 8,'CLOSED' , 9,10) AS status_sort
    from  activity_log;

CREATE OR REPLACE VIEW hactivity_logmonth as select hactivity_log.*,
    TO_NUMBER( TO_CHAR( date_requested, 'YYYY' )) || '-' ||  TO_NUMBER( TO_CHAR( date_requested, 'MM' )) AS month, 
    TO_NUMBER( TO_CHAR( date_requested, 'YYYY' )) || '-' ||  TO_NUMBER( TO_CHAR( date_requested, 'WW' )) AS week,
    NVL(assigned_to,vn_id) as service_provider,cost_estimated-cost_actual AS cost_var from
     hactivity_log;

CREATE OR REPLACE VIEW hwr_month as select 
hwr.wr_id,hwr.site_id,hwr.bl_id,hwr.fl_id,hwr.rm_id,hwr.requestor,hwr.status,hwr.dv_id,hwr.dp_id,hwr.ac_id,hwr.repair_type,
    hwr.cause_type,hwr.prob_type,hwr.date_requested,hwr.tr_id,hwr.eq_id,hwr.cost_est_total,hwr.cost_total,
    hwr.wo_id,hwr.work_team_id,hwr.escalated_response,hwr.escalated_completion,hwr.date_completed,hwr.time_completed,hwr.date_escalation_response,hwr.time_escalation_response,hwr.date_escalation_completion,hwr.time_escalation_completion,hwr.supervisor,hwr.date_esc_comp_orig,hwr.request_params_updated,
    hwr.time_requested,hwr.date_assigned,hwr.time_assigned,hwr.satisfaction,
    TO_NUMBER( TO_CHAR(hwr.date_requested, 'YYYY' )) || '-' ||  TO_NUMBER( TO_CHAR(hwr.date_requested, 'MM' )) AS month, 
    TO_NUMBER( TO_CHAR(hwr.date_requested, 'YYYY' )) || '-' ||  TO_NUMBER( TO_CHAR(hwr.date_requested, 'WW' )) AS week,
    eq.eq_std as eq_std,cost_est_total-cost_total as cost_var from
     hwr, eq
where hwr.eq_id = eq.eq_id(+);

CREATE OR REPLACE VIEW wr_step_waiting as 
select pkey_value as wr_id,em_id,vn_id,cf_id,user_name,date_created,time_created,date_response,time_response,status,comments,step,step_code,step_type,step_log_id,activity_id, role_name,rejected_step 
from AFM.helpdesk_step_log where date_response is null and table_name = 'wr';

CREATE OR REPLACE VIEW activity_log_hactivity_log as
select ac_id,act_quest,action_title,activity_log_id,activity_type,approved_by,assessed_by,assigned_to,autocreate_wr,bl_id,capital_program,cf_id,comments,completed_by,cond_priority,cond_value,copied_from,cost_act_cap,cost_actual,cost_cat_id,cost_est_cap,cost_est_design_cap,cost_est_design_exp,cost_estimated,cost_to_replace,created_by,csi_id,date_approved,date_assessed,date_closed,date_completed,date_escalation_completion,date_escalation_response,date_installed,date_issued,date_planned_end,date_planned_for,date_requested,date_required,date_review,date_scheduled,date_scheduled_end,date_started,date_verified,description,dispatcher,doc_file1,doc_file2,doc_file3,dp_id,duration,duration_act,duration_est_baseline,dv_id,dwgname,ehandle,eq_id,escalated_completion,escalated_response,fl_id,fund_id,hours_actual,hours_est_baseline,hours_est_design,location,ls_id,manager,mo_id,op_id,option1,option2,owner_type,parcel_id,pct_complete,phone_requestor,po_id,pr_id,predecessors,priority,prob_type,proj_phase,project_id,qty_life_expct,rec_action,regcomp_id,requestor,requestor_type,resp_id,rm_id,satisfaction,satisfaction_notes,site_id,start_offset,status,step_status,supervisor,sust_priority,time_escalation_completion,time_escalation_response,time_requested,time_required,tr_id,verified_by,vn_id,wbs_id,wo_id,work_pkg_id,work_team_id,wr_id,recurring_rule,assessment_id,pmp_id,lat,lon,geo_objectid  
from activity_log 
union all
select ac_id,act_quest,action_title,activity_log_id,activity_type,approved_by,assessed_by,assigned_to,autocreate_wr,bl_id,capital_program,cf_id,comments,completed_by,cond_priority,cond_value,copied_from,cost_act_cap,cost_actual,cost_cat_id,cost_est_cap,cost_est_design_cap,cost_est_design_exp,cost_estimated,cost_to_replace,created_by,csi_id,date_approved,date_assessed,date_closed,date_completed,date_escalation_completion,date_escalation_response,date_installed,date_issued,date_planned_end,date_planned_for,date_requested,date_required,date_review,date_scheduled,date_scheduled_end,date_started,date_verified,description,dispatcher,doc_file1,doc_file2,doc_file3,dp_id,duration,duration_act,duration_est_baseline,dv_id,dwgname,ehandle,eq_id,escalated_completion,escalated_response,fl_id,fund_id,hours_actual,hours_est_baseline,hours_est_design,location,ls_id,manager,mo_id,op_id,option1,option2,owner_type,parcel_id,pct_complete,phone_requestor,po_id,pr_id,predecessors,priority,prob_type,proj_phase,project_id,qty_life_expct,rec_action,regcomp_id,requestor,requestor_type,resp_id,rm_id,satisfaction,satisfaction_notes,site_id,start_offset,status,step_status,supervisor,sust_priority,time_escalation_completion,time_escalation_response,time_requested,time_required,tr_id,verified_by,vn_id,wbs_id,wo_id,work_pkg_id,work_team_id,wr_id,recurring_rule,assessment_id,pmp_id,lat,lon,geo_objectid 
from hactivity_log;
