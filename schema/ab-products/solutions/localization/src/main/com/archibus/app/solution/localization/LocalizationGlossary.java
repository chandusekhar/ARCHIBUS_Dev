package com.archibus.app.solution.localization;

import com.archibus.datasource.*;
import com.archibus.jobmanager.JobStatus;

/**
 * Handles interaction with glossary (lang_glos)
 *
 */
public class LocalizationGlossary extends LocalizationBase {
    
    public static final String ALL_STRINGS = "all";
    
    public static final String NEED_TRANS = "needTrans";
    
    protected String stringsToInclude = "";
    
    private Boolean isOracle = false;
    
    // protected String language;
    
    /**
     * Job that reads in strings from lang_files, lang_strings, and lang_enum into lang_glos
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param stringsToInclude String ("all", or "needTrans")
     */
    public void readStringsIntoGlossary(final String language, final String stringsToInclude) {
        
        this.status.setTotalNumber(100);
        this.stringsToInclude = stringsToInclude;
        this.language = language;
        
        // set status to "No Change"
        final String sqlStatement =
                "UPDATE lang_glossary SET transfer_status = '" + UPDATE_STATUS_NO_CHANGE + "'";
        
        if (SqlUtils.isOracle()) {
            this.isOracle = true;
        }
        
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_glossary")
                    .addQuery(sqlStatement);
        ds.executeUpdate();
        
        readLangFilesIntoGlossary();
        this.status.setCurrentNumber(33);
        
        readLangStringsIntoGlossary();
        this.status.setCurrentNumber(66);
        
        readLangEnumsIntoGlossary();
        this.status.setCurrentNumber(100);
        
        // update the view and progress bar
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.addProperty("affectedLangFiles",
                Integer.toString(getCountInserted("lang_glossary", "language")));
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * Creates a glossary of unique strings from lang_files table and inserts them into
     * lang_glossary table
     */
    private void readLangFilesIntoGlossary() {
        
        String sqlStatement =
                "INSERT INTO lang_glossary ( string_english, language, string_trans, transfer_status )"
                        + " SELECT DISTINCT RTRIM(LTRIM( string_english )), language, MAX(RTRIM(LTRIM( string_trans ))), "
                        + " '" + UPDATE_STATUS_INSERTED + "' " + " FROM lang_files "
                        + " WHERE language = '" + this.language + "' "
                        + " AND string_english IS NOT NULL ";
        
        if (this.isOracle) {
            sqlStatement += " AND LENGTH(RTRIM(LTRIM( string_english ))) > 0 ";
        } else {
            sqlStatement += " AND RTRIM(LTRIM( string_english )) <> '' ";
        }
        
        if (this.stringsToInclude.compareToIgnoreCase(LocalizationGlossary.NEED_TRANS) == 0) {
            if (this.isOracle) {
                sqlStatement +=
                        " AND (string_trans IS NULL OR LENGTH(RTRIM(LTRIM(string_trans))) > 0 ) ";
            } else {
                sqlStatement += " AND (string_trans IS NULL OR RTRIM(LTRIM(string_trans)) = '' ) ";
            }
        }
        
        sqlStatement +=
                " AND (filename LIKE '%') "
                        + " AND NOT EXISTS "
                        + " (SELECT 1 FROM lang_glossary "
                        + " WHERE language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_files.string_english ))) "
                        + " GROUP BY RTRIM(LTRIM( string_english )), language ";
        
        // execute the the bulk insert
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_glossary")
                    .addQuery(sqlStatement);
        ds.executeUpdate();
    }
    
    /**
     * Creates a glossary of unique strings from lang_strings table and inserts them into
     * lang_glossary table
     */
    private void readLangStringsIntoGlossary() {
        
        String sqlStatement =
                "INSERT INTO lang_glossary ( string_english, language, string_trans, string_type, transfer_status )"
                        + " SELECT DISTINCT RTRIM(LTRIM( string_english )), language, MAX(RTRIM(LTRIM( string_trans ))), "
                        + "'1', "
                        + " '"
                        + UPDATE_STATUS_INSERTED
                        + "' "
                        + " FROM lang_strings "
                        + " WHERE language = '"
                        + this.language
                        + "' "
                        + " AND string_english IS NOT NULL ";
        
        if (this.isOracle) {
            sqlStatement += " AND LENGTH(RTRIM(LTRIM( string_english ))) > 0 ";
        } else {
            sqlStatement += " AND RTRIM(LTRIM( string_english )) <> '' ";
        }
        
        if (this.stringsToInclude.compareToIgnoreCase(LocalizationGlossary.NEED_TRANS) == 0) {
            if (this.isOracle) {
                sqlStatement +=
                        " AND (string_trans IS NULL OR LENGTH(RTRIM(LTRIM(string_trans))) > 0 ) ";
            } else {
                sqlStatement += " AND (string_trans IS NULL OR RTRIM(LTRIM(string_trans)) = '' ) ";
            }
            
        }
        
        sqlStatement +=
                " AND NOT EXISTS "
                        + " (SELECT 1 FROM lang_glossary "
                        + " WHERE language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_strings.string_english ))) "
                        + " GROUP BY RTRIM(LTRIM( string_english )), language ";
        
        // execute the the bulk insert
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_glossary")
                    .addQuery(sqlStatement);
        ds.executeUpdate();
        
    }
    
    /**
     * Creates a glossary of unique strings from lang_enum table and inserts them into lang_glossary
     * table
     */
    private void readLangEnumsIntoGlossary() {
        
        String sqlStatement =
                "INSERT INTO lang_glossary ( string_english, language, string_trans, string_type, transfer_status )"
                        + " SELECT DISTINCT RTRIM(LTRIM( enum_english )), language, MAX(RTRIM(LTRIM( enum_trans ))), "
                        + "'1', "
                        + " '"
                        + UPDATE_STATUS_INSERTED
                        + "' "
                        + " FROM lang_enum "
                        + " WHERE language = '"
                        + this.language
                        + "' "
                        + " AND enum_english IS NOT NULL ";
        
        if (this.isOracle) {
            sqlStatement += " AND LENGTH(RTRIM(LTRIM( enum_english ))) > 0 ";
        } else {
            sqlStatement += " AND RTRIM(LTRIM( enum_english )) <> '' ";
        }
        
        if (this.stringsToInclude.compareToIgnoreCase(LocalizationGlossary.NEED_TRANS) == 0) {
            if (this.isOracle) {
                sqlStatement +=
                        " AND (enum_trans IS NULL OR LENGTH(RTRIM(LTRIM(enum_trans))) > 0 ) ";
            } else {
                sqlStatement += " AND (enum_trans IS NULL OR RTRIM(LTRIM(enum_trans)) = '' ) ";
            }
        }
        
        sqlStatement +=
                " AND NOT EXISTS "
                        + " (SELECT 1 FROM lang_glossary "
                        + " WHERE language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_enum.enum_english))) "
                        + " GROUP BY RTRIM(LTRIM( enum_english )), language ";
        
        // execute the the bulk insert
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_glossary")
                    .addQuery(sqlStatement);
        ds.executeUpdate();
        
    }
    
    /**
     * Job that writes strings from lang_glossary to lang_files, lang_strings, and lang_enum
     *
     * @param language String (eg. Spanish, French, German, etc.)
     * @param stringsToInclude String ("all", or "needTrans")
     */
    public void writeStringsFromGlossary(final String language, final String stringsToInclude) {
        this.status.setTotalNumber(100);
        
        this.language = language;
        
        writeToLangFiles();
        this.status.setCurrentNumber(33);
        
        writeToLangStrings();
        this.status.setCurrentNumber(66);
        
        writeToLangEnums();
        this.status.setCurrentNumber(100);
        
        // update the view and progress bar
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.addProperty("affectedFiles",
                Integer.toString(getCountInsertedUpdated("lang_files", "language")));
            this.status.addProperty("affectedStrings",
                Integer.toString(getCountInsertedUpdated("lang_strings", "language")));
            this.status.addProperty("affectedEnums",
                Integer.toString(getCountInsertedUpdated("lang_enum", "language")));
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
        
    }
    
    /**
     * Write strings from lang_glossary to lang_files
     */
    private void writeToLangFiles() {

        final String protectedClause =
                (LocalizationHelper.schemaFieldExists("lang_files", "protected")) ? " AND protected = 0"
                        : "";
        
        final String sqlStatement =
                "UPDATE lang_files " + " SET transfer_status = " + " '"
                        + UPDATE_STATUS_UPDATED
                        + "',"
                        + " string_trans = "
                        + " (SELECT string_trans FROM lang_glossary "
                        + " WHERE lang_glossary.language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_files.string_english )) "
                        + " AND (lang_files.string_trans is null OR lang_glossary.string_trans <> RTRIM(LTRIM( lang_files.string_trans ))) "
                        + " AND lang_glossary.string_trans IS NOT NULL)"
                        + " WHERE language = '"
                        + this.language
                        + "' "
                        + protectedClause
                        + " AND EXISTS "
                        + " (SELECT string_trans FROM lang_glossary "
                        + " WHERE lang_glossary.language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_files.string_english )) "
                        + " AND (lang_files.string_trans is null OR lang_glossary.string_trans <> RTRIM(LTRIM( lang_files.string_trans ))) "
                        + " AND lang_glossary.string_trans IS NOT NULL)";
        
        // execute the the update
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_files").addQuery(sqlStatement);
        ds.executeUpdate();
    }
    
    /**
     * Write strings from lang_glossary to lang_strings
     */
    private void writeToLangStrings() {
        
        final String protectedClause =
                (LocalizationHelper.schemaFieldExists("lang_strings", "protected")) ? " AND protected = 0"
                        : "";

        final String sqlStatement =
                "UPDATE lang_strings " + " SET transfer_status = " + " '"
                        + UPDATE_STATUS_UPDATED
                        + "',"
                        + " string_trans = "
                        + " (SELECT string_trans FROM lang_glossary "
                        + " WHERE lang_glossary.language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_strings.string_english )) "
                        + " AND (lang_strings.string_trans is null OR lang_glossary.string_trans <> RTRIM(LTRIM( lang_strings.string_trans ))) "
                        + " AND lang_glossary.string_trans IS NOT NULL)"
                        + " WHERE language = '"
                        + this.language
                        + "' "
                        + protectedClause
                        + " AND EXISTS "
                        + " (SELECT string_trans FROM lang_glossary "
                        + " WHERE lang_glossary.language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_strings.string_english )) "
                        + " AND (lang_strings.string_trans is null OR lang_glossary.string_trans <> RTRIM(LTRIM( lang_strings.string_trans ))) "
                        + " AND lang_glossary.string_trans IS NOT NULL)";
        
        // execute the the update
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_strings")
                    .addQuery(sqlStatement);
        ds.executeUpdate();
    }
    
    /**
     * Write strings from lang_glossary to lang_enums
     */
    private void writeToLangEnums() {
        final String protectedClause =
                (LocalizationHelper.schemaFieldExists("lang_files", "protected")) ? " AND protected = 0"
                        : "";
        
        final String sqlStatement =
                "UPDATE lang_enum " + " SET transfer_status = " + " '"
                        + UPDATE_STATUS_UPDATED
                        + "',"
                        + " enum_trans = "
                        + " (SELECT string_trans FROM lang_glossary "
                        + " WHERE lang_glossary.language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_enum.enum_english )) "
                        + " AND (lang_enum.enum_trans is null OR lang_glossary.string_trans <> RTRIM(LTRIM( lang_enum.enum_trans ))) "
                        + " AND lang_glossary.string_trans IS NOT NULL)"
                        + " WHERE language = '"
                        + this.language
                        + "' "
                        + protectedClause
                        + " AND EXISTS "
                        + " (SELECT string_trans FROM lang_glossary "
                        + " WHERE lang_glossary.language = '"
                        + this.language
                        + "' "
                        + " AND lang_glossary.string_english = RTRIM(LTRIM( lang_enum.enum_english )) "
                        + " AND (lang_enum.enum_trans is null OR lang_glossary.string_trans <> RTRIM(LTRIM( lang_enum.enum_trans ))) "
                        + " AND lang_glossary.string_trans IS NOT NULL)";
        
        // execute the the update
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable("lang_enum").addQuery(sqlStatement);
        ds.executeUpdate();
    }
}