package com.archibus.datasource.cascade.common;

import java.text.MessageFormat;
import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.ExceptionBase;

/**
 * Provides methods that executes SQL statements on database.
 * 
 * @author Catalin Purice
 * 
 */
public final class ExecuteSql extends EventHandlerBase {
    
    /**
     * Runs the SQL command on the database.
     * 
     * @param sqlCommand SQL command
     */
    public static void runCommand(final String sqlCommand) {
        try {
            executeDbSql(ContextStore.get().getEventHandlerContext(), sqlCommand, false);
        } catch (final ExceptionBase sqlException) {
            final String errorMessage =
                    MessageFormat.format(sqlException.getPattern(), sqlException.getArgs());
            logExceptionMessageAndThrowExceptionBase(errorMessage);
        }
    }
    
    /**
     * Runs the SQL commands on the database.
     * 
     * @param sqlCommands SQL commands
     */
    public static void runCommands(final List<String> sqlCommands) {
        for (final String sqlCommand : sqlCommands) {
            runCommand(sqlCommand);
        }
    }
    
    /**
     * Delete from main table.
     * 
     * @param pRecords parent records
     */
    public static void deleteRecord(final List<DataRecord> pRecords) {
        final String pTableName = CascadeUtility.getTableNameFromRecord(pRecords);
        final DataSource deleteDs = CascadeUtility.createDataSourceForPrimaryKeys(pTableName);
        deleteDs.deleteRecord(pRecords.get(0));
    }
    
    /**
     * Write message to log file.
     * 
     * @param errorMessage String message will write to archibus.log
     */
    private static void logExceptionMessageAndThrowExceptionBase(final String errorMessage) {
        
        final Logger logger = Logger.getLogger(ExecuteSql.class);
        if (logger.isDebugEnabled()) {
            logger.error(errorMessage);
        }
        
        // @non-translatable
        throw new ExceptionBase("Cascade Handler: " + errorMessage);
        
    }
    
}
