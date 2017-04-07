package com.archibus.eventhandler.invoice;

/**
 * Public constants for invoice package.
 * 
 * @author Ioan Draghici
 * 
 */
final class Constants {
    
    /**
     * Constant: DOT.
     */
    static final String DOT = ".";
    
    /**
     * Constant: table name: "invoice".
     */
    static final String INVOICE_TABLE = "invoice";
    
    /**
     * Constant: table name: "invoice_payment".
     */
    static final String PAYMENT_TABLE = "invoice_payment";
    
    /**
     * Constant: table name: "invoice".
     */
    static final String ACTUAL_COST_TABLE = "cost_tran";
    
    /**
     * Constant: field name: "invoice_id".
     */
    static final String INVOICE_ID = "invoice_id";
    
    /**
     * Constant: field name: "payment_id".
     */
    static final String PAYMENT_ID = "payment_id";
    
    /**
     * Constant: field name: "description".
     */
    static final String DESCRIPTION = "description";
    
    /**
     * Constant: field name: "description".
     */
    static final String CURRENCY_INVOICE = "currency_invoice";
    
    /**
     * Constant: field name: "invoice_id".
     */
    static final String INVOICE_ID_FULL_NAME = "invoice.invoice_id";
    
    /**
     * Constant: field name: "ac_id".
     */
    static final String ACCOUNT_ID = "ac_id";
    
    /**
     * Constant: field name: "bl_id".
     */
    static final String BUILDING_ID = "bl_id";
    
    /**
     * Constant: field name: "pr_id".
     */
    static final String PROPERTY_ID = "pr_id";
    
    /**
     * Constant: field name: "ls_id".
     */
    static final String LEASE_ID = "ls_id";
    
    /**
     * Constant: field name: "status".
     */
    static final String STATUS = "status";
    
    /**
     * Constant: field name: "status".
     */
    static final String STATUS_FULL_NAME = "invoice.status";
    
    /**
     * Constant: field name: "amount_tot_invoice".
     */
    static final String AMOUNT_TOT_INVOICE_FULL_NAME = "invoice.amount_tot_invoice";
    
    /**
     * Constant: field name: "amount_tot_invoice".
     */
    static final String AMOUNT_BASE_INVOICE_FULL_NAME = "invoice.amount_base_invoice";
    
    /**
     * Constant: field name: "amount_tot_invoice".
     */
    static final String AMOUNT_VAT_INVOICE_FULL_NAME = "invoice.amount_vat_invoice";
    
    /**
     * Constant: field name: "amount_closed".
     */
    static final String AMOUNT_CLOSED_FULL_NAME = "invoice.amount_closed";
    
    /**
     * Constant: field name: "currency_invoice".
     */
    static final String CURRENCY_INVOICE_FULL_NAME = "invoice.currency_invoice";
    
    /**
     * Constant: field name: "amount_income".
     */
    static final String PAYMENT_AMOUNT_INCOME_FULL_NAME = "invoice_payment.amount_income";
    
    /**
     * Constant: field name: "contact_id".
     */
    static final String CONTACT_ID = "contact_id";
    
    /**
     * Constant: field name: "date_paid".
     */
    static final String PAYMENT_DATE_PAID_FULL_NAME = "invoice_payment.date_paid";
    
    /**
     * Table fields.
     */
    static final String[] INVOICE_FIELDS = { INVOICE_ID, ACCOUNT_ID, BUILDING_ID, LEASE_ID,
            PROPERTY_ID, STATUS, "contact_id_remit_to", "contact_id_send_to", "date_expected_rec",
            "date_sent", DESCRIPTION, "terms", "amount_closed", "amount_tot_invoice",
            "amount_base_invoice", "amount_vat_invoice", CURRENCY_INVOICE };
    
    /**
     * Table fields.
     */
    static final String[] PAYMENT_FIELDS = { INVOICE_ID, PAYMENT_ID, "date_paid", "amount_income",
            "check_number", "payment_method", DESCRIPTION, CONTACT_ID, CURRENCY_INVOICE };
    
    /**
     * Owner type : lease.
     */
    static final String OWNER_TYPE_LEASE = "lease";
    
    /**
     * Owner type : building.
     */
    static final String OWNER_TYPE_BUILDING = "building";
    
    /**
     * Owner type : property.
     */
    static final String OWNER_TYPE_PROPERTY = "property";
    
    /**
     * Owner type : account.
     */
    static final String OWNER_TYPE_ACCOUNT = "account";
    
    /**
     * Status value N/A.
     */
    static final String STATUS_VALUE_NA = "N/A";
    
    /**
     * Status value ISSUED.
     */
    static final String STATUS_VALUE_ISSUED = "ISSUED";
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private Constants() {
    }
}
