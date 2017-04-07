package com.archibus.app.projectmgmt;

/**
 * Contains capital projects costs constants definition.
 */
public class Constants {
    /**
     * Job Status Message.
     */
    // @translatable
    public static final String MESSAGE_FAILED_RETRIEVE_RECORDS = "Failed to retrieve data records";
    
    /**
     * ARCHIBUS Calendar Dates table.
     */
    public static final String AFM_CAL_DATES_TABLE = "afm_cal_dates";
    
    /**
     * Baseline, Design and Actual Capital Cost field names.
     */
    public static final String[] COSTCAP_FIELDS = { "activity_log.cost_est_cap",
            "activity_log.cost_est_design_cap", "activity_log.cost_act_cap" };
    
    /**
     * Baseline, Design and Actual Expense Cost field names.
     */
    public static final String[] COSTEXP_FIELDS = { "activity_log.cost_estimated",
            "activity_log.cost_est_design_exp", "activity_log.cost_actual" };
    
    /**
     * Baseline, Design and Actual End Date field names.
     */
    public static final String[] DATEEND_FIELDS = { "activity_log.date_planned_end",
            "activity_log.date_scheduled_end", "activity_log.date_completed" };
    
    /**
     * Baseline, Design and Actual Start Date field names.
     */
    public static final String[] DATESTART_FIELDS = { "activity_log.date_planned_for",
            "activity_log.date_scheduled", "activity_log.date_started" };
    
    /**
     * Baseline, Design and Actual Duration field names.
     */
    public static final String[] DURATION_FIELDS = { "activity_log.duration_est_baseline",
            "activity_log.duration", "activity_log.duration_act" };
    
    /**
     * Baseline, Design and Actual Person-Hours field names.
     */
    public static final String[] HOURS_FIELDS = { "activity_log.hours_est_baseline",
            "activity_log.hours_est_design", "activity_log.hours_actual" };
    
    /**
     * Virtual Person-Hours field name.
     */
    public static final String PRSNHRS_FIELD = "afm_cal_dates.prsnhrs";
    
    /**
     * Virtual Costs field name.
     */
    public static final String COSTS_FIELD = "afm_cal_dates.costs";
    
    /**
     * Cumulative Person-Hours field name prefix.
     */
    public static final String CUMPRSNHRS_FIELD = "afm_cal_dates.cumprsnhrs";
    
    /**
     * Cumulative Costs field name prefix.
     */
    public static final String CUMCOSTS_FIELD = "afm_cal_dates.cumcosts";
    
    /**
     * Baseline values suffix.
     */
    public static final String SUFFIX_BASE = "_base";
    
    /**
     * Design values suffix.
     */
    public static final String SUFFIX_DESIGN = "_design";
    
    /**
     * Actual values suffix.
     */
    public static final String SUFFIX_ACT = "_act";
    
    /**
     * Virtual Date field name.
     */
    public static final String DATE_FIELD = "date_field";
    
    /**
     * Virtual Date full field name.
     */
    public static final String FULL_DATE_FIELD = "afm_cal_dates.date_field";
    
    /**
     * Group by Week value.
     */
    public static final String WEEK = "week";
    
    /**
     * Group by Month value.
     */
    public static final String MONTH = "month";
    
    /**
     * Group by Quarter value.
     */
    public static final String QUARTER = "quarter";
    
    /**
     * Group by Year value.
     */
    public static final String YEAR = "year";
    
    /**
     * Job Progress number 25.
     */
    public static final int PROGRESS_25 = 25;
    
    /**
     * Job Progress number 50.
     */
    public static final int PROGRESS_50 = 50;
    
    /**
     * Job Progress number 75.
     */
    public static final int PROGRESS_75 = 75;
    
    /**
     * Job Progress number 100.
     */
    public static final int PROGRESS_100 = 100;
    
    /**
     * Number size 18.
     */
    public static final int SIZE_18 = 18;
    
    /**
     * Decimal places 0.
     */
    public static final int DECIMALS_0 = 0;
    
    /**
     * Decimal places 2.
     */
    public static final int DECIMALS_2 = 2;
    
    /**
     * LEFT OUTER JOIN ctry String constant.
     */
    public static final String LEFT_OUTER_JOIN_CTRY =
            " LEFT OUTER JOIN ctry ON ctry.ctry_id = bl.ctry_id ";
    
    /**
     * LEFT OUTER JOIN site String constant.
     */
    public static final String LEFT_OUTER_JOIN_SITE =
            " LEFT OUTER JOIN site on site.site_id = project.site_id ";
    
    /**
     * LEFT OUTER JOIN bl String constant.
     */
    public static final String LEFT_OUTER_JOIN_BL =
            " LEFT OUTER JOIN bl ON bl.bl_id = project.bl_id ";
    
    /**
     * LEFT OUTER JOIN program String constant.
     */
    public static final String LEFT_OUTER_JOIN_PROGRAM =
            " LEFT OUTER JOIN program ON program.program_id = project.program_id ";
    
    /**
     * fromDate String constant.
     */
    public static final String FROM_DATE = "fromDate";
    
    /**
     * toDate String constant.
     */
    public static final String TO_DATE = "toDate";
    
    /**
     * NVL String constant.
     */
    public static final String NULL_VALUE = "NVL";
    
    /**
     * jsonExpression String constant.
     */
    public static final String JSON_EXPRESSION = "jsonExpression";
    
    /**
     * ISNULL String constant.
     */
    public static final String IS_NULL = "ISNULL";
    
    /**
     * groupBy String constant.
     */
    public static final String GROUP_BY = "groupBy";
    
    /**
     * consoleRestriction String constant.
     */
    public static final String CONSOLE_RESTRICTION = "consoleRestriction";
    
    /**
     * fcstRestriction String constant.
     */
    public static final String FCST_RESTRICTION = "fcstRestriction";
    
    /**
     * Project.
     */
    public static final String PROJECTS = "projects";
    
    /**
     * Forecast Items table.
     */
    public static final String FORECAST = "proj_forecast_item";
    
    /**
     * TOP expression.
     */
    public static final String SQL_SERV_TOP = " TOP 100 PERCENT ";
    
    /**
     * Hidden constructor.
     */
    protected Constants() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }
}
