package com.archibus.app.common.finance.domain;

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
     * Constant: cost type vat.
     */
    static final String COST_TYPE_VAT = "vat";
    
    /**
     * Constant: cost type total.
     */
    static final String COST_TYPE_TOTAL = "total";
    
    /**
     * Constant: cost type base.
     */
    static final String COST_TYPE_BASE = "base";
    
    /**
     * Constant: organization currency type.
     */
    static final String CURRENCY_TYPE_BUDGET = "budget";
    
    /**
     * Constant: field name: "date_due".
     */
    static final String DATE_DUE = "date_due";
    
    /**
     * Constant: field name: "max".
     */
    static final String MAX = "max";
    
    /**
     * Constant: 100 - to avoid magic number warnings.
     */
    static final int ONE_HUNDRED = 100;
    
    /**
     * Constant: number of month in year - to avoid magic number warnings.
     */
    static final int MONTH_NO = 12;
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private Constants() {
    }
}
