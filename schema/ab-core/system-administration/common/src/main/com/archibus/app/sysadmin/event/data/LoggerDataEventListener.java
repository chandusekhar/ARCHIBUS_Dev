package com.archibus.app.sysadmin.event.data;

import java.util.List;

import org.springframework.context.ApplicationEvent;

import com.archibus.config.Project;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.utility.Utility;

/**
 * Event listener which is configured to be notified by the core when there is a DataEvent.
 * <p>
 * Logs all event parameters to afm_data_event_log table.
 * <p>
 * Delegates events to ILoggerRecordChanged or ILoggerSqlExecuted.
 * <p>
 * Configured as a WFR of DataEvent type. The security group of this WFR is always ignored. The WFR
 * container loads "AbSystemAdministration-DataChangeLogger" prototype Spring bean, defined in
 * WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * @author Valery Tydykov
 * 
 */
public class LoggerDataEventListener implements IDataEventListener {
    
    /**
     * Constant: name of activity parameter which contains list of tables to log.
     */
    static final String DATA_CHANGE_EVENT_TABLES_TO_LOG =
            "AbSystemAdministration-DataChangeEventTablesToLog";
    
    /**
     * Logger for RecordChanged event.
     */
    private ILoggerRecordChanged loggerRecordChanged;
    
    /**
     * Logger for SqlExecuted event.
     */
    private ILoggerSqlExecuted loggerSqlExecuted;
    
    /**
     * Project, required to get activity parameter value.
     */
    private Project.Immutable project;
    
    /**
     * @return the loggerRecordChanged
     */
    public ILoggerRecordChanged getLoggerRecordChanged() {
        return this.loggerRecordChanged;
    }
    
    /**
     * @return the loggerSqlExecuted
     */
    public ILoggerSqlExecuted getLoggerSqlExecuted() {
        return this.loggerSqlExecuted;
    }
    
    /**
     * @return the project
     */
    public Project.Immutable getProject() {
        return this.project;
    }
    
    /** {@inheritDoc} */
    public void onApplicationEvent(final ApplicationEvent event) {
        if (event instanceof RecordChangedEvent) {
            final RecordChangedEvent recordChangedEvent = (RecordChangedEvent) event;
            
            // log event if DELETE BEFORE event or non-DELETE AFTER event
            final boolean logEvent = decideToLogEvent(recordChangedEvent);
            if (logEvent) {
                // load the list of tables from the activity parameter
                final List<String> tablesToLog = this.loadTablesToLog();
                
                // delegate event to specialized listener
                this.loggerRecordChanged.onRecordChanged(recordChangedEvent, tablesToLog);
            }
        } else if (event instanceof SqlExecutedEvent) {
            final SqlExecutedEvent sqlExecutedEvent = (SqlExecutedEvent) event;
            
            // log only AFTER events
            if (sqlExecutedEvent.getBeforeOrAfter().equals(BeforeOrAfter.AFTER)) {
                // load the list of tables from the activity parameter
                final List<String> tablesToLog = this.loadTablesToLog();
                
                // delegate event to specialized listener
                this.loggerSqlExecuted.onSqlExecuted(sqlExecutedEvent, tablesToLog);
            }
        }
    }
    
    /**
     * @param loggerRecordChanged the loggerRecordChanged to set
     */
    public void setLoggerRecordChanged(final ILoggerRecordChanged loggerRecordChanged) {
        this.loggerRecordChanged = loggerRecordChanged;
    }
    
    /**
     * @param loggerSqlExecuted the loggerSqlExecuted to set
     */
    public void setLoggerSqlExecuted(final ILoggerSqlExecuted loggerSqlExecuted) {
        this.loggerSqlExecuted = loggerSqlExecuted;
    }
    
    /**
     * @param project the project to set
     */
    public void setProject(final Project.Immutable project) {
        this.project = project;
    }
    
    /**
     * Decide if the event should be logged.
     * 
     * @param recordChangedEvent the event to make the decision about.
     * @return true if the event should be logged.
     */
    private boolean decideToLogEvent(final RecordChangedEvent recordChangedEvent) {
        // log event if DELETE BEFORE event or non-DELETE AFTER event
        boolean logEvent = false;
        if (recordChangedEvent.getChangeType().equals(ChangeType.DELETE)) {
            // DELETE
            if (recordChangedEvent.getBeforeOrAfter().equals(BeforeOrAfter.BEFORE)) {
                // BEFORE
                logEvent = true;
            }
        } else {
            // non-DELETE
            if (recordChangedEvent.getBeforeOrAfter().equals(BeforeOrAfter.AFTER)) {
                // AFTER
                logEvent = true;
            }
        }
        
        return logEvent;
    }
    
    /**
     * Load table names for which data events should be logged. Loads table names from the activity
     * parameter. Parses string with table names into list, using ";" as separator.
     * 
     * @return list of table names.
     */
    private List<String> loadTablesToLog() {
        final String parameterValue =
                this.project.getActivityParameterManager().getParameterValue(
                    DATA_CHANGE_EVENT_TABLES_TO_LOG);
        final List<String> tablesToLog = Utility.stringToList(parameterValue, ";");
        
        return tablesToLog;
    }
}
