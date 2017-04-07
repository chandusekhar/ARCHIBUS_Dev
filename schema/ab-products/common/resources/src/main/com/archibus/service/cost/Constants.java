package com.archibus.service.cost;

/**
 * Public constants for Finance Domain implementations.
 * <p>
 * Constants here are shared between several Domain implementation classes.
 *
 * @author Ioan Draghici
 *
 */
final class Constants {

    /**
     * Constant: field name: "max".
     */
    static final String MAX = "max";

    /**
     * Constant: number of month in year - to avoid magic number warnings.
     */
    static final int MONTH_NO = 12;

    /**
     * Constant: 100 - to avoid magic number warnings.
     */
    static final int ONE_HUNDRED = 100;

    /**
     * Constant: value Yes.
     */
    static final String OPT_YES = "Yes";

    /**
     * Constant: LANDLORD.
     */
    static final String LANDLORD = "LANDLORD";

    /**
     * Constant: TENANT.
     */
    static final String TENANT = "TENANT";

    /**
     * Constant: cost category.
     */
    static final String BASE_RENT_COST_CATEG = "RENT - BASE RENT";

    /**
     * Constant: cost category.
     */
    static final String CAM_ESTIMATE_COST_CATEG = "RENT - CAM ESTIMATE";

    /**
     * Constant: cost category.
     */
    static final String CAM_RECONCILIATION_COST_CATEG = "RENT - CAM RECONCILIATION";

    /**
     * Activity id.
     */
    static final String REPM_COST_ACTIVITY_ID = "AbRPLMCosts";

    /**
     * Activity parameter name.
     */
    static final String BASE_RENT_ACTIVITY_PARAM = "Base_Rent_Category";

    /**
     * Activity parameter name.
     */
    static final String CAM_ESTIMATE_ACTIVITY_PARAM = "CAM_Estimate";

    /**
     * Activity parameter name.
     */
    static final String CAM_RECONCILIATION_ACTIVITY_PARAM = "CAM_Reconciliation";

    /**
     * Constant: cost category.
     */
    static final String LEASEHOLD_IMPROVMENT_COST_CATEG = "LEASEHOLD IMPROVEMENT";

    /**
     * Constant: field name.
     */
    static final String BASE_RENT = "a_base_rent";

    /**
     * Constant: field name.
     */
    static final String LI_CREDIT = "b_li_credit";

    /**
     * Constant: field name.
     */
    static final String ACTUAL_RENT = "c_actual_rent";

    /**
     * Constant: field name.
     */
    static final String STRAIGHT_LINE_RENT = "d_sl_rent";

    /**
     * Constant: field name.
     */
    static final String DIFFERENTIAL_RENT = "e_differential_rent";

    /**
     * Constant: field name.
     */
    static final String DIFFERENTIAL_RENT_CUMUL = "f_differential_rent_cumul";

    /**
     * Constant: all leases.
     */
    static final String LEASES_ALL = "ls";

    /**
     * Constant: leases for buildings.
     */
    static final String LEASES_FOR_BUILDINGS = "ls_bl";

    /**
     * Constant: leases for properties.
     */
    static final String LEASES_FOR_PROPERTIES = "ls_pr";

    /**
     * Constant: group_by_cost_categ.
     */
    static final String GROUP_BY_COST_CATEG = "group_by_cost_categ";

    /**
     * Constant DOT.
     */
    static final String DOT = ".";

    /**
     * Constant EQUAL.
     */
    static final String EQUAL = " = ";

    /**
     * Constant comma.
     */
    static final String COMMA = ",";

    /**
     * Constant.
     */
    static final String AND = " AND ";

    /**
     * Constant.
     */
    static final String BUDGET = "budget";

    /**
     * Constant.
     */
    static final String PAYMENT = "payment";

    /**
     * Constant comma.
     */
    static final String DATE_NEUTRAL_FORMAT = "yyyy-mm-dd";

    /**
     * Constant.
     */
    static final String USER_NAME = "user_name";

    /**
     * Constant: property name.
     */
    static final String PROPERTY_MISSING_EXCHANGE_RATE = "missingExchangeRate";
    
    /**
     * Constant: separator character for multiple values in one field.
     */
    static final String MULTIPLE_VALUES_SEPARATOR = ", \u200C";

    /**
     * Constant.
     */
    static final String CALCTYPE_TAX = "tax";

    /**
     * Constant.
     */
    static final String TAX_TYPE_NA = "N/A";

    /**
     * Constant.
     */
    static final String TAX_TYPE_PROPERTY = "PROPERTY";

    /**
     * Constant.
     */
    static final String TAX_TYPE_SCHOOL = "SCHOOL";

    /**
     * Constant.
     */
    static final String TRUE_ASSESSED_VALUE = "trueAssessedValue";
    
    /**
     * Constant.
     */
    static final String ASSESSED_VALUE = "assessedValue";
    
    /**
     * Constant.
     */
    static final String YEARLY_TAX_RATE = "yearlyTaxRate";

    /**
     * Constant.
     */
    static final String IS_FOR_SLR = "isForSLR";
    
    /**
     * Constant.
     */
    static final String TRUE = "true";

    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private Constants() {
    }
}
