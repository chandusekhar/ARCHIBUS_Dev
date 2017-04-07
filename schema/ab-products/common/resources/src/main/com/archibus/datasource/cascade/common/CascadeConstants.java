package com.archibus.datasource.cascade.common;

/**
 * 
 * Utility class. Constants used by Cascade Handler.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */

/**
 * <p>
 * Suppress PMD warning "AvoidUsingSql" in this method.
 * <p>
 * Justification: Case #2: Bulk INSERT/UPDATE/DELETE.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public final class CascadeConstants {
    /**
     * Constant.
     */
    public static final String DOT = ".";
    
    /**
     * Constant.
     */
    public static final String COMMA = ",";
    
    /**
     * Constant.
     */
    public static final String PIPE = "|";
    
    /**
     * Update command template.
     */
    public static final String UPDATE_TEMPLATE_SQL = "UPDATE %s SET %s WHERE %s";
    
    /**
     * CAST expression for SQL Server.
     */
    public static final String CAST_TO_CHAR_EXPRESSION = "CAST(%s AS CHAR)";
    
    /**
     * Restriction for AFM document fields.
     */
    public static final String RESTRICTION_DOCUMENT_TEMPLATE_SQL =
            "table_name = %s AND field_name = %s AND pkey_value IN (SELECT %s FROM %s WHERE %s)";
    
    /**
     * Delete command template.
     */
    public static final String DELETE_TEMPLATE_SQL = "DELETE FROM %s WHERE %s";
    
    /**
     * Delete command template.
     */
    public static final String INSERT_TEMPLATE_SQL =
            "INSERT INTO %s (%s) (SELECT %s FROM %s WHERE %s)";
    
    /**
     * Select command template.
     */
    public static final String SELECT_TEMPLATE_SQL = "SELECT %s FROM %s WHERE %s";
    
    /**
     * Template restriction using IN operator.
     */
    public static final String OP_IN_RESTRICTION_SQL = " %s IN (%s)";
    
    /**
     * Constant.
     */
    public static final String AND = " AND ";
    
    /**
     * Constant.
     */
    public static final String EQUALS = " = ";
    
    /**
     * Constant.
     */
    public static final String AFM_TBLS = "afm_tbls";
    
    /**
     * Constant.
     */
    public static final String AFM_FLDS = "afm_flds";
    
    /**
     * private constructor.
     */
    private CascadeConstants() {
        
    }
}
