package com.archibus.app.solution.localization;

import java.util.List;

import org.dom4j.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.expr.ExpressionSqlFormatter;

/**
 * Handles greeking in localization activity.
 * 
 */
public class LocalizationGreek extends LocalizationBase {
    
    private static final String GREEKING_FILE_PATH = SCHEMA_ABSOLUTE_PATH
            + "/ab-products/solutions/localization/greeking.xml";
    
    private static String ASIAN_GREEKING_CHARS = "";
    
    private static String EUROPEAN_GREEKING_CHARS = "";
    
    private String type = "";
    
    private String greekingChars = "";
    
    private String sqlConcat = "";
    
    private Boolean bEmpty = false;
    
    /**
     * Job that greeks the translatable field values of all localization tables for the given
     * language.
     * 
     * @param language String (eg. Spanish, French, German, etc.)
     * @param type Char Type of greeking (E, A, B)
     * @param dbExtension String Dbextension
     * @param bEmpty Boolean Whether or not to include strings with empty translations
     */
    public void greekLangTables(String language, String type, String dbExtension, Boolean bEmpty) {
        
        this.language = language;
        this.type = type;
        this.dbExtension = dbExtension;
        this.bEmpty = bEmpty;
        
        this.status.setTotalNumber(100);
        
        setConcat();
        this.status.setCurrentNumber(5);
        
        // get greeking chars
        getGreekingChars();
        this.status.setCurrentNumber(10);
        
        // set greeking chars
        setGreekingChars();
        this.status.setCurrentNumber(20);
        
        // greek lang_files
        greekTable("lang_files", "string_trans", getFileGreekPattern("string_english"));
        this.status.setCurrentNumber(50);
        
        // greek lang_strings
        greekTable("lang_strings", "string_trans", getStringGreekPattern("string_english"));
        this.status.setCurrentNumber(75);
        
        // greek lang_enum
        greekTable("lang_enum", "enum_trans", getEnumGreekPattern("enum_english"));
        this.status.setCurrentNumber(85);
        
        postProcessEnumTable();
        
        // report status
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCurrentNumber(100);
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * Get greeking characters from xml file.
     * 
     */
    private void getGreekingChars() {
        try {
            Document doc = LocalizationHelper.readFile(GREEKING_FILE_PATH);
            Element root = doc.getRootElement();
            Element asian = (Element) root.selectSingleNode("//characters[@name='asian'");
            ASIAN_GREEKING_CHARS = asian.attributeValue("value");
            
            Element european = (Element) root.selectSingleNode("//characters[@name='european'");
            EUROPEAN_GREEKING_CHARS = european.attributeValue("value");
        } catch (Exception e) {
            LocalizationRead.handleException(e);
        }
    }
    
    /**
     * Set the concatenation character.
     * 
     */
    private void setConcat() {
        ExpressionSqlFormatter sqlFormatter = new ExpressionSqlFormatter(ContextStore.get()
            .getDatabase());
        this.sqlConcat = sqlFormatter.getConcat();
    }
    
    /**
     * If the enum contains an ending ';' trim that off first before adding the greek character.
     * Otherwise, this will show up as a mistranslated enum
     * 
     */
    private void postProcessEnumTable() {
        
        DataSource ds = DataSourceFactory.createDataSource().addTable("lang_enum",
            DataSource.ROLE_MAIN);
        
        ds.addField("enum_english");
        ds.addField("enum_trans");
        ds.addField("language");
        String restriction = " enum_english LIKE '%;' AND language='" + this.language + "'"
                + " AND enum_trans =" + getEnumGreekPattern("enum_english");
        ds.addRestriction(Restrictions.sql(restriction));
        
        List<DataRecord> records = ds.getAllRecords();
        
        for (int j = 0; j < records.size(); j++) {
            
            DataRecord record = records.get(j);
            
            String enumTrans = (String) record.getValue("lang_enum.enum_trans");
            
            int position = enumTrans.lastIndexOf(';');
            if ((position > -1)
                    && ((position == enumTrans.length() - 1) || enumTrans.endsWith(";_"
                            + this.dbExtension + this.greekingChars))) {
                String newEnumTrans = enumTrans.substring(0, position)
                        + enumTrans.substring(position + 1, enumTrans.length());
                
                record.setValue("lang_enum.enum_trans", newEnumTrans);
                ds.saveRecord(record);
            }
        }
    }
    
    /**
     * Greek the specified table.
     * 
     * @param tableToGreek String Name of table to greek
     * @param fieldToGreek String Name of field to greek (ie. the translation field)
     * @param pattern String Pattern used for greeking
     */
    private void greekTable(String tableToGreek, String fieldToGreek, String pattern) {
        String[] fieldNames = { fieldToGreek };
        
        String sql = "UPDATE " + tableToGreek + " SET " + fieldToGreek + " = " + pattern
                + " WHERE " + "language='" + this.language + "'";
        
        if (this.bEmpty) {
            sql += " AND " + fieldToGreek + " IS NULL OR " + fieldToGreek + " = ''";
        }
        
        DataSource ds = DataSourceFactory.createDataSourceForFields(tableToGreek, fieldNames)
            .addQuery(sql);
        ds.executeUpdate();
        ds.commit();
    }
    
    /**
     * Based on user selected method of greeking, generate greeking characters.
     * 
     */
    private void setGreekingChars() {
        
        if (this.type.equals("A")) {
            this.greekingChars = ASIAN_GREEKING_CHARS;
            
        } else if (this.type.equals("E")) {
            this.greekingChars = EUROPEAN_GREEKING_CHARS;
            
        } else if (this.type.equals("B")) {
            this.greekingChars = EUROPEAN_GREEKING_CHARS + ASIAN_GREEKING_CHARS;
        }
    }
    
    /**
     * Generate the greeking lang_files pattern.
     * 
     * @param field String Name of field to greek
     * @return String
     */
    private String getFileGreekPattern(String field) {
        // return "'xx_' " + this.sqlConcat + " " + field + this.sqlConcat + " '_xx"
        // + this.greekingChars + "'";
        return SqlUtils.isSqlServer() ? "'xx_' " + this.sqlConcat + " RTRIM(" + field + ")"
                + this.sqlConcat + " '_xx" + this.greekingChars + "'" : "'xx_' " + this.sqlConcat
                + " " + field + this.sqlConcat + " '_xx" + this.greekingChars + "'";
    }
    
    /**
     * Generate the greeking lang_strings pattern.
     * 
     * @param field String Name of field to greek
     * @return String
     */
    private String getStringGreekPattern(String field) {
        // return "'" + this.dbExtension + "_' " + this.sqlConcat + " " + field + this.sqlConcat
        // + " '_" + this.dbExtension + this.greekingChars + "'";
        return SqlUtils.isSqlServer() ? "'" + this.dbExtension + "_' " + this.sqlConcat + " RTRIM("
                + field + ")" + this.sqlConcat + " '_" + this.dbExtension + this.greekingChars
                + "'" : "'" + this.dbExtension + "_' " + this.sqlConcat + " " + field
                + this.sqlConcat + " '_" + this.dbExtension + this.greekingChars + "'";
    }
    
    /**
     * Generate the greeking lang_enum pattern.
     * 
     * @param field String Name of field to greek
     * @return String
     */
    private String getEnumGreekPattern(String field) {
        // return field + this.sqlConcat + " '_" + this.dbExtension + this.greekingChars + "'";
        return SqlUtils.isSqlServer() ? "RTRIM(" + field + ")" + this.sqlConcat + " '_"
                + this.dbExtension + this.greekingChars + "'" : field + this.sqlConcat + " '_"
                + this.dbExtension + this.greekingChars + "'";
    }
}