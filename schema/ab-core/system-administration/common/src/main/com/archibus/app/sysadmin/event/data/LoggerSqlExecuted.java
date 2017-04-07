package com.archibus.app.sysadmin.event.data;

import java.util.List;

import com.archibus.app.common.event.domain.*;
import com.archibus.context.DatabaseRole;
import com.archibus.core.dao.IDao;
import com.archibus.core.event.data.SqlExecutedEvent;
import com.archibus.utility.CoreUserSessionTemplate;

/**
 * Event listener which is configured to be notified by the core when there is a SqlExecuted
 * DataEvent.
 * 
 * @see LoggerRecordChanged
 * 
 * @author Valery Tydykov
 * 
 *         Suppress PMD warning "DoNotUseThreads".
 *         <p>
 *         Justification: False positive: We use here Runnable interface, but do not use threads.
 *         <p>
 *         Suppress PMD warning "AvoidUsingSql".
 *         <p>
 *         Justification: False positive: we have to use SQL key word to parse SQL here.
 */
@SuppressWarnings({ "PMD.DoNotUseThreads", "PMD.AvoidUsingSql" })
class LoggerSqlExecuted implements ILoggerSqlExecuted {
    /**
     * Constant: SQL key word DELETE.
     */
    private static final String DELETE = "DELETE ";
    
    /**
     * Constant: SQL key word INSERT.
     */
    private static final String INSERT = "INSERT ";
    
    /**
     * Constant: SQL key word UPDATE.
     */
    private static final String UPDATE = "UPDATE ";
    
    /**
     * Dao for SqlExecuted.
     */
    private IDao<SqlExecuted> sqlExecutedDao;
    
    /**
     * Determines if the SQL statement caused data change. Checks if SQL contains “INSERT ” or
     * “UPDATE ” or “DELETE ”.
     * 
     * @param sqlUpperCase the SQL statement from the event, converted to upper case.
     * @return true if SQL statement caused data change, false otherwise.
     */
    protected static boolean isDataChangeEvent(final String sqlUpperCase) {
        return sqlUpperCase.contains(INSERT) || sqlUpperCase.contains(UPDATE)
                || sqlUpperCase.contains(DELETE);
    }
    
    /**
     * @return the sqlExecutedDao
     */
    public IDao<SqlExecuted> getSqlExecutedDao() {
        return this.sqlExecutedDao;
    }
    
    /** {@inheritDoc} */
    public void onSqlExecuted(final SqlExecutedEvent sqlExecutedEvent,
            final List<String> tablesToLog) {
        // if SQL was supplied in the event
        if (sqlExecutedEvent.getSql() != null) {
            final String sqlUpperCase = sqlExecutedEvent.getSql().toUpperCase();
            // parse SQL to determine if event is a DataChange event
            if (isDataChangeEvent(sqlUpperCase)) {
                onDataChangeEvent(sqlExecutedEvent, tablesToLog, sqlUpperCase);
            }
        }
    }
    
    /**
     * @param sqlExecutedDao the sqlExecutedDao to set
     */
    public void setSqlExecutedDao(final IDao<SqlExecuted> sqlExecutedDao) {
        this.sqlExecutedDao = sqlExecutedDao;
    }
    
    /**
     * Logs sqlExecutedDataChangeEvent, using sqlExecutedDao.
     * 
     * @param tableName table name to be logged.
     * @param sqlExecutedEvent the event to be logged.
     */
    private void logEvent(final String tableName, final SqlExecutedEvent sqlExecutedEvent) {
        final SqlExecuted sqlExecuted = new SqlExecuted();
        sqlExecuted.setDate(new java.sql.Date(sqlExecutedEvent.getTimestamp()));
        sqlExecuted.setTime(new java.sql.Time(sqlExecutedEvent.getTimestamp()));
        sqlExecuted.setEventType(EventType.SQL_EXECUTED);
        sqlExecuted.setTableName(tableName);
        sqlExecuted.setUserName(sqlExecutedEvent.getUser().getName());
        sqlExecuted.setSql(sqlExecutedEvent.getSql());
        
        // prepare core UserSession context
        final CoreUserSessionTemplate template = new CoreUserSessionTemplate();
        // use DATA database
        template.setDatabaseRole(DatabaseRole.DATA);
        template.execute(new Runnable() {
            public void run() {
                LoggerSqlExecuted.this.sqlExecutedDao.save(sqlExecuted);
            }
        });
    }
    
    /**
     * Specialized event listener, to be notified when SQL statement caused data change.
     * <p>
     * Logs event parameters, if the SQL statement caused data change, and the changed table is in
     * the tablesToLog.
     * 
     * @param sqlExecutedEvent the event to be logged.
     * @param tablesToLog table names for which the event needs to be logged.
     * @param sqlUpperCase the SQL statement from the event, converted to upper case.
     */
    private void onDataChangeEvent(final SqlExecutedEvent sqlExecutedEvent,
            final List<String> tablesToLog, final String sqlUpperCase) {
        final String tableNameToLog =
                LoggerUtilities.determineTableName(sqlExecutedEvent.getTableName(),
                    sqlUpperCase, tablesToLog);
        if (tableNameToLog != null) {
            logEvent(tableNameToLog, sqlExecutedEvent);
        }
    }
}
