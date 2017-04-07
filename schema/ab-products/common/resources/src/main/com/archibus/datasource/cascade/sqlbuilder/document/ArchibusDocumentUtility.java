package com.archibus.datasource.cascade.sqlbuilder.document;

import java.util.*;

import com.archibus.datasource.SqlUtils;

/**
 * 
 * Utility class. Provides methods uded by AfmDocumentSqlBuilder class.
 * <p>
 * 
 * @author Catalin Purice
 * 
 */
public final class ArchibusDocumentUtility {
    
    /**
     * ARCHIBUS document tables.
     */
    private static List<String> docTables = Arrays.asList("afm_docversarch", "afm_docvers",
        "afm_docs");
    
    /**
     * ARCHIBUS document fields.
     */
    private static List<String> docFields = Arrays.asList("table_name", "field_name", "pkey_value");
    
    /**
     * REPLACE function template.
     */
    private static String replacePKValuesTemplateOracle =
            "DECODE(NVL(INSTR(pkey_value, %1$s),0), 0, pkey_value, SUBSTR(pkey_value,1,INSTR(pkey_value, %1$s)-1) || %2$s|| SUBSTR(pkey_value,INSTR(pkey_value, %1$s)+LENGTH(%1$s)) )";
    
    /**
     * REPLACE function template.
     */
    private static String replacePKValuesTemplateSybase =
            "REPLACE(SUBSTR(pkey_value, CHARINDEX(%1$s, pkey_value), LENGTH(%1$s)), %1$s, %2$s) || SUBSTR(pkey_value, CHARINDEX(%1$s, pkey_value)+LENGTH(%1$s))";
    
    /**
     * REPLACE function template.
     */
    private static String replacePKValuesTemplateSqlServer =
            "STUFF(pkey_value, CHARINDEX(%1$s, pkey_value), LEN(%1$s), %2$s)";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ArchibusDocumentUtility() {
        super();
    }
    
    /**
     * Returns replace primary key expression for ARCHIBUS document tables.
     * 
     * @return String
     */
    public static String getReplacePrimaryKeyExpresion() {
        
        String replacePKexpression = "";
        if (SqlUtils.isOracle()) {
            replacePKexpression = replacePKValuesTemplateOracle;
        } else if (SqlUtils.isSybase()) {
            replacePKexpression = replacePKValuesTemplateSybase;
        } else {
            replacePKexpression = replacePKValuesTemplateSqlServer;
        }
        return replacePKexpression;
    }
    
    /**
     * Getter for the docTables property.
     * 
     * @see docTables
     * @return the docTables property.
     */
    public static List<String> getDocTables() {
        return docTables;
    }
    
    /**
     * Getter for the docFields property.
     * 
     * @see docFields
     * @return the docFields property.
     */
    public static List<String> getDocFields() {
        return docFields;
    }
    
}
