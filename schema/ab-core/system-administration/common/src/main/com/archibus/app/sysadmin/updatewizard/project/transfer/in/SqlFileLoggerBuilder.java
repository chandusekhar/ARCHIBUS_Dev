package com.archibus.app.sysadmin.updatewizard.project.transfer.in;

import java.io.*;

import org.apache.log4j.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.db.RecordPersistenceBase;
import com.archibus.utility.*;

/**
 * Utility class. Provides methods to build the SQL file logger for Transfer in process.
 * <p>
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public final class SqlFileLoggerBuilder {
    
    /**
     * Logger name.
     */
    public static final String LOGGER_NAME = "LOGFILE";
    
    /**
     * SQL file pattern.
     * 
     * "import_priority_number"_"table_type"_"table_name".sql.
     */
    private static final String SQL_FILE_LOG_PATTERN = "%s_%s_%s.sql";
    
    /**
     * Pattern constant.
     */
    private static final String PATTERN = "%m;%n";
    
    /**
     * Enumeration list of tables groups.
     */
    private enum TablesGroup {
        /**
         * Data dictionary tables group.
         */
        DATA_DICTIONARY("dictionary"),
        /**
         * Project security tables group.
         */
        PROJECT_SECURITY("security"),
        /**
         * Project navigator tables group.
         */
        PROCESS_NAVIGATOR("navigator"),
        
        /**
         * Application dictionary tables group.
         */
        APPLICATION_DICTIONARY("app-dictionary"),
        
        /**
         * Project application data tables group.
         */
        PROJECT_APPLICATION_DATA("proj-app-data"),
        
        /**
         * Project data tables group.
         */
        PROJECT_DATA("project-data");
        
        /**
         * Value to construct the SQL file name.
         */
        private final String shortName;
        
        /**
         * Constructor.
         * 
         * @param sName short name for table group.
         */
        TablesGroup(final String sName) {
            this.shortName = sName;
        }
        
        /**
         * Getter for the shortName property.
         * 
         * @see shortName
         * @return the shortName property.
         */
        private String getShortName() {
            return this.shortName;
        }
    }
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private SqlFileLoggerBuilder() {
        super();
    }
    
    /**
     * Builds the sqlFileLogger.
     * 
     * @param tableName file to be transferred in.
     * @return Category logger
     */
    public static Category buildSqlFileLogger(final String tableName) {
        
        final DataRecord record = getTableRecord(tableName);
        
        final Object priorityValue = record.getValue("afm_transfer_set.processing_order");
        final String tableTypeValue =
                record.getString("afm_tbls.table_type").toUpperCase().replace(" ", "_");
        
        final String sqlFileName =
                String.format(SQL_FILE_LOG_PATTERN, getPriority(priorityValue),
                    getShortNameFromTableGroup(tableTypeValue), tableName);
        
        final String sqlLogfileFullPath =
                TransferFile.getTransferFolderOut() + File.separator + sqlFileName;
        
        return createLogger(sqlLogfileFullPath, false);
    }
    
    /**
     * Builds the sqlFileLogger.
     * 
     * @param output output.
     * @param append append.
     * @return Category logger
     */
    public static Category buildSqlFileLogger(final SqlCommandOutput output, final boolean append) {
        
        final String sqlLogfileFullPath = output.getFile().getAbsolutePath();
        
        return createLogger(sqlLogfileFullPath, append);
    }
    
    /**
     * 
     * Create the SQL logger.
     * 
     * @param sqlLogfileFullPath file name path
     * @param append append
     * @return Category
     */
    public static Category createLogger(final String sqlLogfileFullPath, final boolean append) {
        final Category fileLogger = Logger.getLogger(RecordPersistenceBase.class);
        
        final Layout layout = new PatternLayout(PATTERN);
        
        try {
            fileLogger.removeAllAppenders();
            final FileAppender fileAppender = new FileAppender(layout, sqlLogfileFullPath, append);
            fileAppender.setName(LOGGER_NAME);
            fileLogger.addAppender(fileAppender);
        } catch (final IOException e) {
            throw new ExceptionBase("Can't create sql file logger " + sqlLogfileFullPath, e);
        }
        return fileLogger;
    }
    
    /**
     * 
     * Get transfer in priority as 2 digits.
     * 
     * @param priorityValue value from DB.
     * @return priority value
     */
    private static String getPriority(final Object priorityValue) {
        String priority = "00";
        if (StringUtil.notNullOrEmpty(priorityValue)) {
            priority =
                    priorityValue.toString().length() == 1 ? "0" + priorityValue.toString()
                            : priorityValue.toString();
        }
        
        return priority;
    }
    
    /**
     * 
     * Get short name from table group.
     * 
     * @param tableTypeValue table type
     * @return short name
     */
    private static String getShortNameFromTableGroup(final String tableTypeValue) {
        
        String shortName = TablesGroup.PROJECT_DATA.getShortName();
        
        if (StringUtil.notNullOrEmpty(tableTypeValue)) {
            shortName = TablesGroup.valueOf(tableTypeValue).getShortName();
        }
        
        return shortName;
    }
    
    /**
     * 
     * get table record.
     * 
     * @param tableName table name
     * @return DataRecord
     */
    private static DataRecord getTableRecord(final String tableName) {
        final DataSource tblNamesByTypeDS = DataSourceFactory.createDataSource();
        tblNamesByTypeDS.addTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            DataSource.ROLE_MAIN);
        tblNamesByTypeDS.addTable(ProjectUpdateWizardConstants.AFM_TBLS, DataSource.ROLE_STANDARD);
        tblNamesByTypeDS.addField(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardUtilities.TABLE_NAME);
        tblNamesByTypeDS.addField(ProjectUpdateWizardConstants.AFM_TBLS, "table_type");
        tblNamesByTypeDS
            .addField(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, "processing_order");
        tblNamesByTypeDS.addField(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, "autonumbered_id");
        tblNamesByTypeDS.addRestriction(Restrictions
            .sql("afm_transfer_set.table_name=afm_tbls.table_name"));
        tblNamesByTypeDS.addRestriction(Restrictions.eq(ProjectUpdateWizardConstants.AFM_TBLS,
            ProjectUpdateWizardConstants.TABLE_NAME, tableName));
        
        return tblNamesByTypeDS.getRecord();
        
    }
    
}
