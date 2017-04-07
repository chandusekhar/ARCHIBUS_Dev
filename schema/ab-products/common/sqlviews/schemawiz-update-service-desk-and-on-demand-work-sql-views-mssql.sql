INSERT INTO afm_flds_lang (table_name, field_name) SELECT table_name, field_name FROM afm_flds WHERE NOT EXISTS (SELECT 1 FROM afm_flds_lang afm_flds_lang_inner WHERE afm_flds_lang_inner.table_name = afm_flds.table_name AND afm_flds_lang_inner.field_name = afm_flds.field_name) AND afm_flds.table_name IN ('activity_log_step_waiting','activity_logview','hactivity_logmonth','hwr_month','wr_step_waiting','activity_log_hactivity_log');

IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('activity_log_step_waiting')) DROP VIEW activity_log_step_waiting;
IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('activity_logview')) DROP VIEW activity_logview;
IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('hactivity_logmonth')) DROP VIEW hactivity_logmonth;
IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('hwr_month')) DROP VIEW hwr_month;
IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('wr_step_waiting')) DROP VIEW wr_step_waiting;
IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.VIEWS AS V WHERE LOWER(table_name) = LOWER('activity_log_hactivity_log')) DROP VIEW activity_log_hactivity_log;

CREATE VIEW activity_log_step_waiting as select pkey_value as activity_log_id,
    em_id,vn_id,cf_id,user_name,date_created,time_created,date_response,time_response,
    status,comments,step,step_code,step_type,step_log_id,activity_id from
    helpdesk_step_log where date_response is null and table_name = 'activity_log';

CREATE VIEW activity_logview as select*,
    cast(datepart(year,date_requested) as char(4))+'-'+cast(datepart(month,date_requested) as char(2)) as month,
    cast(datepart(year,date_requested) as char(4))+'-'+cast(datepart(week,date_requested) as char(2)) as week,
    ISNULL(assigned_to,vn_id) as service_provider,cost_estimated-cost_actual AS cost_var,
    (case when status = 'Created' then 0
        when status = 'Requested' then 1
      when status = 'Approved' then 2
        when status = 'Rejected' then 3
          when status = 'Issued' then 5
            when status = 'Cancelled' then 6
              when status = 'Stopped' then 7
                when status = 'Completed' then 8
                  when status = 'Closed' then 9
                    else 10
    end) as status_sort from activity_log;

CREATE VIEW hactivity_logmonth as select*,
    cast(datepart(year,date_requested) as char(4))+'-'+cast(datepart(month,date_requested) as char(2)) as month,
    cast(datepart(year,date_requested) as char(4))+'-'+cast(datepart(week,date_requested) as char(2)) as week,
    ISNULL(assigned_to,vn_id) as service_provider,cost_estimated-cost_actual AS cost_var from
    hactivity_log;

CREATE VIEW hwr_month as select hwr.wr_id,hwr.site_id,hwr.bl_id,hwr.fl_id,hwr.rm_id,hwr.requestor,hwr.status,hwr.dv_id,hwr.dp_id,hwr.ac_id,hwr.repair_type,
    hwr.cause_type,hwr.prob_type,hwr.date_requested,hwr.tr_id,hwr.eq_id,hwr.cost_est_total,hwr.cost_total,
    hwr.wo_id,hwr.work_team_id,hwr.escalated_response,hwr.escalated_completion,hwr.date_completed,hwr.time_completed,hwr.date_escalation_response,hwr.time_escalation_response,hwr.date_escalation_completion,hwr.time_escalation_completion,hwr.supervisor,hwr.date_esc_comp_orig,hwr.request_params_updated,
    hwr.time_requested,hwr.date_assigned,hwr.time_assigned,hwr.satisfaction,
    cast(datepart(year,hwr.date_requested) as char(4))+'-'+cast(datepart(month,hwr.date_requested) as char(2)) as month,
    cast(datepart(year,hwr.date_requested) as char(4))+'-'+cast(datepart(week,hwr.date_requested) as char(2)) as week,
    eq.eq_std as eq_std,cost_est_total-cost_total as cost_var from
    hwr left outer join eq on hwr.eq_id = eq.eq_id;

CREATE VIEW wr_step_waiting as select pkey_value as wr_id,em_id,vn_id,cf_id,user_name,
    date_created,time_created,date_response,time_response,
    status,comments,step,step_code,step_type,step_log_id,activity_id, role_name,rejected_step from
    helpdesk_step_log where date_response is null and table_name = 'wr';


CREATE VIEW activity_log_hactivity_log as
select ac_id,act_quest,action_title,activity_log_id,activity_type,approved_by,assessed_by,assigned_to,autocreate_wr,bl_id,capital_program,cf_id,comments,completed_by,cond_priority,cond_value,copied_from,cost_act_cap,cost_actual,cost_cat_id,cost_est_cap,cost_est_design_cap,cost_est_design_exp,cost_estimated,cost_to_replace,created_by,csi_id,date_approved,date_assessed,date_closed,date_completed,date_escalation_completion,date_escalation_response,date_installed,date_issued,date_planned_end,date_planned_for,date_requested,date_required,date_review,date_scheduled,date_scheduled_end,date_started,date_verified,description,dispatcher,dp_id,duration,duration_act,duration_est_baseline,dv_id,dwgname,ehandle,eq_id,escalated_completion,escalated_response,fl_id,fund_id,hours_actual,hours_est_baseline,hours_est_design,location,ls_id,manager,mo_id,op_id,option1,option2,owner_type,parcel_id,pct_complete,phone_requestor,po_id,pr_id,predecessors,priority,prob_type,proj_phase,project_id,qty_life_expct,rec_action,regcomp_id,requestor,requestor_type,resp_id,rm_id,satisfaction,satisfaction_notes,site_id,start_offset,status,step_status,supervisor,sust_priority,time_escalation_completion,time_escalation_response,time_requested,time_required,tr_id,verified_by,vn_id,wbs_id,wo_id,work_pkg_id,work_team_id,wr_id,recurring_rule,assessment_id,pmp_id,lat,lon,geo_objectid  
from activity_log 
union all
select ac_id,act_quest,action_title,activity_log_id,activity_type,approved_by,assessed_by,assigned_to,autocreate_wr,bl_id,capital_program,cf_id,comments,completed_by,cond_priority,cond_value,copied_from,cost_act_cap,cost_actual,cost_cat_id,cost_est_cap,cost_est_design_cap,cost_est_design_exp,cost_estimated,cost_to_replace,created_by,csi_id,date_approved,date_assessed,date_closed,date_completed,date_escalation_completion,date_escalation_response,date_installed,date_issued,date_planned_end,date_planned_for,date_requested,date_required,date_review,date_scheduled,date_scheduled_end,date_started,date_verified,description,dispatcher,dp_id,duration,duration_act,duration_est_baseline,dv_id,dwgname,ehandle,eq_id,escalated_completion,escalated_response,fl_id,fund_id,hours_actual,hours_est_baseline,hours_est_design,location,ls_id,manager,mo_id,op_id,option1,option2,owner_type,parcel_id,pct_complete,phone_requestor,po_id,pr_id,predecessors,priority,prob_type,proj_phase,project_id,qty_life_expct,rec_action,regcomp_id,requestor,requestor_type,resp_id,rm_id,satisfaction,satisfaction_notes,site_id,start_offset,status,step_status,supervisor,sust_priority,time_escalation_completion,time_escalation_response,time_requested,time_required,tr_id,verified_by,vn_id,wbs_id,wo_id,work_pkg_id,work_team_id,wr_id,recurring_rule,assessment_id,pmp_id,lat,lon,geo_objectid 
from hactivity_log;