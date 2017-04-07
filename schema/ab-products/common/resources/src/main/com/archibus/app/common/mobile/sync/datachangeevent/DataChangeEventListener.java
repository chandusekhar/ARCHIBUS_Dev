package com.archibus.app.common.mobile.sync.datachangeevent;

import java.util.List;

import org.springframework.context.ApplicationEvent;

import com.archibus.app.common.mobile.sync.dao.ITableTransactionDao;
import com.archibus.config.Project;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.utility.Utility;

/**
 * Event listener which is configured to be notified by the core when there is a DataEvent.
 * <p>
 * Logs all event parameters to afm_table_trans table.
 * <p>
 * Configured as a WFR of DataEvent type. The security group of this WFR is always ignored.
 *
 * @author Jeff Martin
 * @since 23.1
 */
public class DataChangeEventListener implements IDataEventListener {

    /**
     * Constant: name of activity parameter which contains list of tables to log.
     */
    static final String DATA_CHANGE_EVENT_TABLES_TO_LOG =
            "AbCommonResources-MobileSyncDataChangesOnlyTables";

    // CHECKSTYLE:ON

    // CHECKSTYLE:OFF Justification: Suppress "Strict duplicate code" warning: several classes have
    // "project" property.
    /**
     * Project, required to get activity parameter value.
     */
    private Project.Immutable project;

    /**
     * Getter for the project property.
     *
     * @see project
     * @return the project property.
     */
    public Project.Immutable getProject() {
        return this.project;
    }

    /**
     * Setter for the project property.
     *
     * @see project
     * @param project the project to set
     */

    public void setProject(final Project.Immutable project) {
        this.project = project;
    }

    /**
     * Custom data source used to load object from database. Set by spring configuration file.
     */
    private ITableTransactionDao tableTransactionDao;

    /**
     * Getter for the tableTransactionDao property.
     *
     * @see tableTransactionDao
     * @return the tableTransactionDao property.
     */
    public ITableTransactionDao getTableTransactionDao() {
        return this.tableTransactionDao;
    }

    /**
     * Setter for the tableTransactionDao property.
     *
     * @see tableTransactionDao
     * @param tableTransactionDao the tableTransactionDao to set
     */

    public void setTableTransactionDao(final ITableTransactionDao tableTransactionDao) {
        this.tableTransactionDao = tableTransactionDao;
    }

    @Override
    public void onApplicationEvent(final ApplicationEvent event) {
        if (event instanceof RecordChangedEvent) {
            final RecordChangedEvent recordChangedEvent = (RecordChangedEvent) event;

            if (isLoggingEnabled(recordChangedEvent)) {
                onRecordChangedEvent(recordChangedEvent);
            }
        }
    }

    private void onRecordChangedEvent(final RecordChangedEvent recordChangedEvent) {
        final boolean isBeforeInsertOrUpdate =
                BeforeOrAfter.BEFORE.equals(recordChangedEvent.getBeforeOrAfter())
                        && (ChangeType.INSERT.equals(recordChangedEvent.getChangeType()) || ChangeType.UPDATE
                            .equals(recordChangedEvent.getChangeType()));
        final boolean isBeforeDelete =
                BeforeOrAfter.BEFORE.equals(recordChangedEvent.getBeforeOrAfter())
                        && ChangeType.DELETE.equals(recordChangedEvent.getChangeType());

        if (isBeforeInsertOrUpdate || isBeforeDelete) {
            this.tableTransactionDao.recordTransactionEvent(recordChangedEvent);
        }
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

    /**
     *
     * TODO isLoggingEnabled.
     *
     * @param recordChangedEvent the data change event
     * @return true if the record changed event occurs for a configured table.
     */
    private boolean isLoggingEnabled(final RecordChangedEvent recordChangedEvent) {

        final String eventTableName = recordChangedEvent.getTableName();
        recordChangedEvent.getRecord();

        // load the list of tables from the activity parameter
        final List<String> tablesToLog = this.loadTablesToLog();

        // Logging is enabled if the event table is in the list of tables to log or if the
        // afm_docvers table is modified and the afm_docvers table_name field is in the list

        return tablesToLog.contains(eventTableName);
        /*
         * if (tablesToLog.contains(eventTableName)) { isEnabled = true; } else if
         * ("afm_docvers".equals(eventTableName)) { final String docversTableName =
         * record.getString("afm_docvers.table_name"); isEnabled =
         * tablesToLog.contains(docversTableName); }
         * 
         * return isEnabled;
         */
    }

}
