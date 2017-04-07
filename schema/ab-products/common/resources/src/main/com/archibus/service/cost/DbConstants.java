package com.archibus.service.cost;

/**
 * Contains only database related constants (field name, table name ..).
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.3
 *
 */

final class DbConstants {
    
    /**
     * Column name.
     */
    static final String CTRY_ID = "ctry_id";
    
    /**
     * Column name.
     */
    static final String REGN_ID = "regn_id";
    
    /**
     * Column name.
     */
    static final String STATE_ID = "state_id";
    
    /**
     * Column name.
     */
    static final String CITY_ID = "city_id";
    
    /**
     * Column name.
     */
    static final String SITE_ID = "site_id";
    
    /**
     * Column name.
     */
    static final String PR_ID = "pr_id";
    
    /**
     * Column name.
     */
    static final String BL_ID = "bl_id";
    
    /**
     * Column name.
     */
    static final String LS_ID = "ls_id";
    
    /**
     * Column name.
     */
    static final String DATE_START = "date_start";
    
    /**
     * Column name.
     */
    static final String DATE_END = "date_end";
    
    /**
     * Column name.
     */
    static final String DATE_DUE = "date_due";
    
    /**
     * Column name.
     */
    static final String PERIOD = "period";
    
    /**
     * Column name.
     */
    static final String COST_CAT_ID = "cost_cat_id";
    
    /**
     * Column name.
     */
    static final String USE_AS_TEMPLATE = "use_as_template";
    
    /**
     * Column name.
     */
    static final String CURRENCY_BUDGET = "currency_budget";
    
    /**
     * Column name.
     */
    static final String CURRENCY_PAYMENT = "currency_payment";
    
    /**
     * Column name.
     */
    static final String DATE_COSTS_START = "date_costs_start";
    
    /**
     * Column name.
     */
    static final String DATE_COSTS_END = "date_costs_end";
    
    /**
     * Column name.
     */
    static final String DATE_COST_ANAL_START = "date_cost_anal_start";
    
    /**
     * Column name.
     */
    static final String DATE_COST_ANAL_END = "date_cost_anal_end";
    
    /**
     * Column name.
     */
    static final String DATE_COSTS_LAST_CALCD = "date_costs_last_calcd";
    
    /**
     * Column name.
     */
    static final String USER_NAME = "user_name";
    
    /**
     * Column name.
     */
    static final String REPORT_NAME = "report_name";
    
    /**
     * Column name.
     */
    static final String COST_TRAN_SCHED_ID = "cost_tran_sched_id";
    
    /**
     * Column name.
     */
    static final String COST_TRAN_ID = "cost_tran_id";
    
    /**
     * Column name.
     */
    static final String COST_TRAN_RECUR_ID = "cost_tran_recur_id";
    
    /**
     * Column name.
     */
    static final String LANDLORD_TENANT = "landlord_tenant";
    
    /**
     * Column name.
     */
    static final String AMOUNT_INCOME = "amount_income";
    
    /**
     * Column name.
     */
    static final String AMOUNT_EXPENSE = "amount_expense";
    
    /**
     * Column name.
     */
    static final String COST_INDEX = "cost_index";
    
    /**
     * Column name.
     */
    static final String VAT_EXCLUDE = "vat_exclude";
    
    /**
     * Column name.
     */
    static final String COST_INDEX_ID = "cost_index_id";
    
    /**
     * Column name.
     */
    static final String DATE_INDEX_VALUE = "date_index_value";
    
    /**
     * Column name.
     */
    static final String INDEX_VALUE = "index_value";
    
    /**
     * Column name.
     */
    static final String AC_ID = "ac_id";

    /**
     * Column name.
     */
    static final String PARCEL_ID = "parcel_id";

    /**
     * Column name.
     */
    static final String TAX_RATE_PROP = "tax_rate_prop";
    
    /**
     * Column name.
     */
    static final String VALUE_ASSESSED_PROP_TAX = "value_assessed_prop_tax";
    
    /**
     * Column name.
     */
    static final String TAX_RATE_SCHOOL = "tax_rate_school";
    
    /**
     * Column name.
     */
    static final String VALUE_ASSESSED_SCHOOL_TAX = "value_assessed_school_tax";
    
    /**
     * Table name.
     */
    static final String AC_TABLE = "ac";
    
    /**
     * Table name.
     */
    static final String LS_TABLE = "ls";
    
    /**
     * Table name.
     */
    static final String BL_TABLE = "bl";
    
    /**
     * Table name.
     */
    static final String PR_TABLE = "property";

    /**
     * Table name.
     */
    static final String PARCEL_TABLE = "parcel";
    
    /**
     * Table name.
     */
    static final String CCOST_SUM_TABLE = "ccost_sum";
    
    /**
     * Table name.
     */
    static final String COST_TRAN_TABLE = "cost_tran";
    
    /**
     * Table name.
     */
    static final String COST_INDEX_VALUES_TABLE = "cost_index_values";
    
    /**
     * Table name.
     */
    static final String COST_TRAN_RECUR_TABLE = "cost_tran_recur";
    
    /**
     * Table name.
     */
    static final String COST_TRAN_SCHED_TABLE = "cost_tran_sched";
    
    /**
     * Table name.
     */
    static final String LS_CAM_REC_REPORT_TABLE = "ls_cam_rec_report";
    
    /**
     * Constant.
     */
    static final String DOT = ".";
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private DbConstants() {
    }
    
    /**
     * Return field full name 'tableName.fieldName'.
     *
     * @param tableName table name
     * @param fieldName field name
     * @return string
     */
    public static String getFieldFullName(final String tableName, final String fieldName) {
        return tableName + DOT + fieldName;
    }
}
