package com.archibus.app.sysadmin.updatewizard.schema.util;

/**
 * Schema update wizard constants.
 * 
 * @author Catalin Purice
 * 
 */
public final class SchemaUpdateWizardConstants {
    
    /**
     * Constant.
     */
    public static final String TEMP_TABLE = "AFM_TEMP";
    
    /**
     * Constant.
     */
    public static final String DOT = ".";
    
    /**
     * constant.
     */
    public static final String CLOSE_BRACKET = ")";
    
    /**
     * constant.
     */
    public static final String OPEN_BRACKET = "(";
    
    /**
     * Constant.
     */
    public static final String NULL = "NULL";
    
    /**
     * Constant.
     */
    public static final String ADD_CONSTRAINT = " ADD CONSTRAINT ";
    
    /**
     * Constant.
     */
    public static final String ADD_FOREIGN_KEY = " ADD FOREIGN KEY ";
    
    /**
     * Constant.
     */
    public static final int AFM_DOC_TYPE = 2170;
    
    /**
     * Constant.
     */
    public static final String AFM_TBLS = "afm_tbls";
    
    /**
     * Constant.
     */
    public static final String ALTER_COLUMN = " ALTER COLUMN ";
    
    /**
     * Constant.
     */
    public static final String ALTER_TABLE = "ALTER TABLE ";
    
    /**
     * Constant.
     */
    public static final String AFM_TEMP_FIELD_PREFIX = "_AFM_TEMP_FIELD";
    
    /**
     * Constant.
     */
    public static final String CASCADE = " CASCADE ";
    
    /**
     * Constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this class.
     * <p>
     * Justification: Case #4: Changes to SQL schema.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static final String DELETE_FKEY = " DELETE FOREIGN KEY ";
    
    /**
     * Constant.
     */
    public static final String DROP_COLUMN = " DROP COLUMN ";
    
    /**
     * Constant.
     */
    public static final String DROP_CONSTRAINT = " DROP CONSTRAINT ";
    
    /**
     * Constant.
     */
    public static final String DROP_TRIGGER = "DROP TRIGGER ";
    
    /**
     * Constant.
     */
    public static final String FOREIGN_KEY = " FOREIGN KEY ";
    
    /**
     * Constant.
     */
    public static final Integer MAX_ORCL_VCHAR = 8000;
    
    /**
     * Constant.
     */
    public static final String MODIFY = " MODIFY ";
    
    /**
     * Constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this class.
     * <p>
     * Justification: Case #4: Changes to SQL schema.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static final String ON_DELETE = " ON DELETE ";
    
    /**
     * Constant.
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this class.
     * <p>
     * Justification: Case #4: Changes to SQL schema.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public static final String ON_UPDATE = " ON UPDATE ";
    
    /**
     * Constant.
     */
    public static final String RECREATE = "RECREATE ";
    
    /**
     * Constant.
     */
    public static final String REFERENCES = " REFERENCES ";
    
    /**
     * Constant.
     */
    public static final String RENAME = " RENAME ";
    
    /**
     * Constant.
     */
    public static final String SET_NULL = " SET NULL";
    
    /**
     * Constant.
     */
    public static final String SET_NLS_TO_BYTE_STMT = "ALTER SYSTEM SET NLS_LENGTH_SEMANTICS=BYTE";
    
    /**
     * Constant.
     */
    public static final String SET_NLS_TO_CHAR_STMT = "ALTER SYSTEM SET NLS_LENGTH_SEMANTICS=CHAR";
    
    /**
     * SQL output file name.
     */
    public static final String SQL_FILE_NAME = "03_changes-database-table-structure.sql";
    
    /**
     * Constructor.
     */
    private SchemaUpdateWizardConstants() {
    }
    
    /**
     * 
     * @return data user(eg. afm)
     */
    public static String getDataUser() {
        return com.archibus.context.ContextStore.get().getTransactionInfos()
            .getTransactionInfo(com.archibus.context.DatabaseRole.DATA).getDatabase()
            .getConfigJDBC().getLogin();
    }
    
    /**
     * 
     * @return secure user(eg. afm_secure)
     */
    public static String getSecureUser() {
        return com.archibus.context.ContextStore.get().getTransactionInfos()
            .getTransactionInfo(com.archibus.context.DatabaseRole.SECURITY).getDatabase()
            .getConfigJDBC().getLogin();
    }
}
