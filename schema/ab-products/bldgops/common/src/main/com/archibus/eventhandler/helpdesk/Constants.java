package com.archibus.eventhandler.helpdesk;

/**
 * <p>
 * Constants used in Helpdesk, On Demand Work and Steps.
 * 
 */

public class Constants {
    
    /*
     * GENERAL
     */
    
    /**
     * Preventive Maintenance activity
     */
    public static final String PM_ACTIVITY_ID = "AbBldgOpsPM";
    
    /**
     * Helpdesk activity
     */
    public static final String HELPDESK_ACTIVITY_ID = "AbBldgOpsHelpDesk";
    
    /**
     * On Demand activity
     */
    public static final String ONDEMAND_ACTIVITY_ID = "AbBldgOpsOnDemandWork";
    
    /**
     * Field type for document fields
     */
    public static final int DOCUMENT_TYPE_FIELD = 2165;
    
    /**
     * Request type for on demand requests
     */
    public static final String ON_DEMAND_WORK = "SERVICE DESK - MAINTENANCE";
    
    /**
     * Request type for on demand requests
     */
    public static final String PM = "PREVENTIVE MAINT";
    
    /*
     * SLA Constants
     */
    /**
     * Default Step status (instead of NULL)
     */
    public static final String STEP_STATUS_NULL = "none";
    
    /**
     * Step status result after step is forwarded
     */
    public static final String STEP_STATUS_FORWARD = "forwarded";
    
    /**
     * Step status for request waiting for step
     */
    public static final String STEP_STATUS_WAITING = "waiting";
    
    /**
     * Number of priority levels
     */
    public static final int PRIORITY_LEVELS = 5;
    
    /**
     * Lowest priority level
     */
    public static final int MINIMAL_PRIORITY = 1;
    
    /**
     * Primary key fields of sla request table
     */
    public static final String SLA_REQUEST_PKEYS = "activity_type,ordering_seq";
    
    /**
     * Primary key fields of sla response table
     */
    public static final String SLA_RESPONSE_PKEYS = "activity_type,ordering_seq,priority";
    
    /**
     * Activity log fields (problem parameters for SLA)
     */
    public static final String[] REQUEST_PARAMETER_NAMES = { "activity_type", "pmp_id", "site_id",
            "bl_id", "fl_id", "rm_id", "dp_id", "dv_id", "eq_id", "prob_type", "requestor",
            "priority" };
    
    /**
     * SLA response paramaters before v23.1
     */
    public static final String[] SLA_PARAMETER_NAMES_BEFORE_V23 = { "em_id", "vn_id", "activity_id",
            "work_team_id", "cf_id", "dispatcher", "time_to_complete", "time_to_respond",
            "interval_to_complete", "interval_to_respond", "serv_window_start", "serv_window_end",
            "serv_window_days", "allow_work_on_holidays", "manager", "supervisor",
            "priority_label", "autocreate_wr", "autocreate_wo", "autoschedule", "autoissue",
            "autoapprove", "autodispatch", "notify_requestor", "autoaccept", "default_duration",
            "notify_craftsperson", "notify_service_provider" };
    
    /**
     * SLA response paramaters of v23.1
     */
    public static final String[] SLA_PARAMETER_NAMES_V23 = { "em_id", "vn_id", "activity_id",
            "work_team_id", "cf_id", "cf_role", "dispatcher", "time_to_complete", "time_to_respond",
            "interval_to_complete", "interval_to_respond", "serv_window_start", "serv_window_end",
            "serv_window_days", "allow_work_on_holidays", "manager", "supervisor",
            "priority_label", "autocreate_wr", "autocreate_wo", "autoschedule", "autoissue",
            "autoapprove", "autodispatch", "notify_requestor", "autoaccept", "default_duration",
            "notify_craftsperson", "notify_service_provider" };
    
    /**
     * SLA response parameters for query
     */
    public static final String SQL_SLA_PARAMETER_NAMES =
            "em_id,vn_id,activity_id,work_team_id,cf_id,dispatcher,time_to_complete,time_to_respond,"
                    + "interval_to_complete,interval_to_respond,serv_window_start,serv_window_end,serv_window_days,allow_work_on_holidays,manager,supervisor, "
                    + "priority_label,autocreate_wr,autocreate_wo,autoschedule,autoissue,autoapprove,autodispatch,notify_requestor,autoaccept,default_duration, "
                    + "notify_craftsperson,notify_service_provider,servcont_id";
    
    /**
     * Helpdesk basic states
     */
    public static final String[] BASIC_STATUS = { "REQUESTED", "APPROVED", "IN PROGRESS",
            "COMPLETED", "STOPPED", "CANCELLED", "CLOSED" };
    
    /**
     * Helpdesk basic step
     */
    public static final String BASIC_STEP = "Basic";
    
    /**
     * Helpdesk basic step type
     */
    public static final String BASIC_STEP_TYPE = "basic";
    
    /**
     * Helpdesk escalation for response
     */
    public static final int ESCALATION_RESPONSE = 1;
    
    /**
     * Helpdesk escalation for completion
     */
    public static final int ESCALATION_COMPLETE = 2;
    
    /**
     * Referenced_by in messages table for notification steps
     */
    public static final String REFERENCE_BY_NOTIFICATION_STEP = "NOTIFICATION_STEP";
    
    /**
     * Activity parameter for (all possible) form fields to enter for a step
     */
    public static final String ACTIVITY_PARAMETER_STEPS_FORM_FIELDS = "StepsFormFields";
    
    /*
     * Tables and fields
     */
    
    /**
     * SLA configuration table, problem parameters
     */
    public static final String SLA_REQUEST_TABLE = "helpdesk_sla_request";
    
    /**
     * SLA request fields, problem parameters, not the priority !
     */
    public static final String[] SLA_REQUEST_FIELDS = { "activity_type", "site_id", "bl_id",
            "fl_id", "rm_id", "dp_id", "dv_id", "eq_std", "eq_id", "prob_type", "em_std",
            "requestor", "default_priority", "pmp_id" };
    
    /**
     * SLA request fields, problem parameters (to include in SQL query), not the priority !
     */
    public static final String SQL_SLA_REQUEST_FIELDS =
            "activity_type,site_id,bl_id,fl_id,rm_id,dp_id,dv_id,eq_std,eq_id,prob_type,em_std,requestor,default_priority,pmp_id";
    
    /**
     * SLA configuration table, response parameters
     */
    public static final String SLA_RESPONSE_TABLE = "helpdesk_sla_response";
    
    /**
     * SLA configuration table, steps
     */
    public static final String SLA_STEPS_TABLE = "helpdesk_sla_steps";
    
    /**
     * Step log table
     */
    public static final String STEP_LOG_TABLE = "helpdesk_step_log";
    
    /**
     * Step log fields
     */
    public static final String[] STEP_LOG_FIELDS = { "step_type", "step", "multiple_required",
            "condition", "em_id", "vn_id", "step_status_result", "status", "step_order",
            "date_response", "time_response", "date_created", "time_created", "step_code",
            "user_name", "comments", "step_log_id" };
    
    /**
     * Workflow Steps table
     */
    public static final String STEP_TABLE = "afm_wf_steps";
    
    /**
     * Action item table
     */
    public static final String ACTION_ITEM_TABLE = "activity_log";
    
    /**
     * Activity log fields for request
     */
    public static final String[] HELP_REQUEST_FIELD_NAMES = { "activity_type", "site_id", "bl_id",
            "fl_id", "rm_id", "dp_id", "dv_id", "eq_id", "prob_type", "requestor", "priority",
            "phone_requestor", "date_required", "description", "location", "created_by" };
    
    /**
     * Work Request table
     */
    public static final String WORK_REQUEST_TABLE = "wr";
    
    /**
     * Work Request fields
     */
    public static final String[] WORK_REQUEST_FIELD_NAMES = { "activity_type", "site_id", "bl_id",
            "fl_id", "rm_id", "dp_id", "dv_id", "eq_id", "prob_type", "requestor", "priority",
            "phone", "description", "location" };
    
    public static final String[] PM_REQUEST_PARAMETER_NAMES_EQ = { "activity_type", "prob_type",
            "pmp_id", "eq_id", "eq_std", "site_id", "bl_id", "fl_id", "rm_id" };
    
    public static final String[] PM_REQUEST_PARAMETER_NAMES_HK = { "activity_type", "prob_type",
            "pmp_id", "site_id", "bl_id", "fl_id", "rm_id" };
    
    public static final String PM_ACTIVITY_TYPE = "SERVICE DESK - MAINTENANCE";
    
    public static final String PM_PROB_TYPE = "PREVENTIVE MAINT";
    
}
