package com.archibus.app.common.connectors.logging.common;

import com.archibus.app.common.connectors.logging.IUserLog;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * A UserLog that writes info messages to a log4j logger.
 *
 * @author cole
 *
 */
public class ConnectorLogTableLogger implements IUserLog {

    /**
     * The table to which to log messages.
     */
    private static final String CONNECTOR_LOG_TABLE = "afm_conn_log";

    /**
     * The table to which to store historic log messages.
     */
    private static final String CONNECTOR_LOG_HISTORY_TABLE = "afm_conn_logh";

    /**
     * The field for the identifier for the connector whose activity is being logged on the
     * connector log table.
     */
    private static final String CONNECTOR_LOG_CONNECTOR_ID = "connector_id";

    /**
     * The field for the logged message on the connector log table.
     */
    private static final String CONNECTOR_LOG_MSG = "msg";

    /**
     * The field for the date the message was logged on the connector log table.
     */
    private static final String CONNECTOR_LOG_DATE = "date_log";

    /**
     * The field for the time the message was logged on the connector log table.
     */
    private static final String CONNECTOR_LOG_TIME = "time_log";

    /**
     * The field for the instance of connector execution.
     */
    private static final String CONNECTOR_LOG_RUN_ID = "run_id";

    /**
     * The field for the logged message on the connector log table.
     */
    private static final String CONNECTOR_LOG_ID = "conn_log_id";

    /**
     * An ellipsis, to append to a message that is too long and has been truncated.
     */
    private static final String ELLIPSIS = "...";

    /**
     * All fields on connector log or log history table, as they would be listed in SQL.
     */
    private static final String FIELDS =
            "connector_id, date_log, msg, time_log, conn_log_id, run_id";

    /**
     * The beginning of a where clause.
     */
    private static final String WHERE = " where ";

    /**
     * SQL to move a connector's records to a history table.
     */
    private static final String SQL_MOVE_TO_LOG_HISTORY = "insert into "
            + CONNECTOR_LOG_HISTORY_TABLE + " (" + FIELDS + ") select " + FIELDS + " from "
            + CONNECTOR_LOG_TABLE + WHERE + CONNECTOR_LOG_CONNECTOR_ID + '=';

    /**
     * SQL to remove a connector's logs from the log table.
     */
    private static final String SQL_REMOVE_FROM_LOG = "delete from " + CONNECTOR_LOG_TABLE + WHERE
            + CONNECTOR_LOG_CONNECTOR_ID + '=';

    /**
     * The identifier for the connector whose activity is being logged.
     */
    private final String connectorId;

    /**
     * The table to log to.
     */
    private final DataSource loggingDataSource;

    /**
     * The longest message that can be logged.
     */
    private final int maxMessageSize;

    /**
     * The identifier for this execution.
     */
    private Integer runId;

    /**
     * Create a logger for the connector log table.
     *
     * @param connectorId the identifier for the connector whose activity is being logged.
     */
    public ConnectorLogTableLogger(final String connectorId) {
        this.connectorId = connectorId;

        this.loggingDataSource = DataSourceFactory.createDataSource();
        this.loggingDataSource.addTable(CONNECTOR_LOG_TABLE);
        this.loggingDataSource.addField(CONNECTOR_LOG_CONNECTOR_ID);
        this.loggingDataSource.addField(CONNECTOR_LOG_RUN_ID);
        this.loggingDataSource.addField(CONNECTOR_LOG_MSG);
        final DataSourceFieldDefLoader fieldDefLoader = new DataSourceFieldDefLoader();
        this.maxMessageSize =
                fieldDefLoader.loadFieldDef(CONNECTOR_LOG_TABLE, CONNECTOR_LOG_MSG).getSize();
    }

    /**
     * Delete existing log records.
     */
    public void clear() {
        final String sqlConnectorId = SqlUtils.formatValueForSql(this.connectorId);
        SqlUtils.executeUpdate(CONNECTOR_LOG_HISTORY_TABLE, SQL_MOVE_TO_LOG_HISTORY
                + sqlConnectorId);
        SqlUtils.executeUpdate(CONNECTOR_LOG_TABLE, SQL_REMOVE_FROM_LOG + sqlConnectorId);
    }

    /**
     * Write a message to the connector log table. If necessary it will be truncated at the first
     * newline, and then further if needed to fit into the field.
     *
     * @param message the text to be written to the log.
     */
    @Override
    public void writeMessage(final String message) {
        if (this.runId == null) {
            /*
             * Ensures run identifiers are not duplicated.
             */
            synchronized (ConnectorLogTableLogger.class) {
                resolveRunId();
                writeMessageInternal(message);
            }
        } else {
            writeMessageInternal(message);
        }
    }

    /**
     * Writes the message to the log.
     *
     * @param message the message to log.
     */
    private void writeMessageInternal(final String message) {
        String trimmedMessage;
        if (message == null) {
            trimmedMessage = "";
        } else if (message.length() > this.maxMessageSize) {
            if (message.length() > this.maxMessageSize) {
                trimmedMessage =
                        message.substring(0, this.maxMessageSize - ELLIPSIS.length()) + ELLIPSIS;
            } else {
                trimmedMessage = message;
            }
        } else {
            trimmedMessage = message;
        }

        final DataRecord logRecord = this.loggingDataSource.createNewRecord();
        logRecord
            .setValue(CONNECTOR_LOG_TABLE + '.' + CONNECTOR_LOG_CONNECTOR_ID, this.connectorId);
        logRecord.setValue(CONNECTOR_LOG_TABLE + '.' + CONNECTOR_LOG_MSG, trimmedMessage);
        logRecord.setValue(CONNECTOR_LOG_TABLE + '.' + CONNECTOR_LOG_RUN_ID, this.runId);

        this.loggingDataSource.saveRecord(logRecord);
        this.loggingDataSource.commit();
    }

    /**
     * Ensure that this.runId is set.
     */
    private void resolveRunId() {
        final DataSource logDs =
                DataSourceFactory.createDataSourceForFields(CONNECTOR_LOG_TABLE,
                    new String[] { CONNECTOR_LOG_RUN_ID });
        logDs.addSort(CONNECTOR_LOG_TABLE, CONNECTOR_LOG_RUN_ID, DataSource.SORT_DESC);
        logDs.addRestriction(Restrictions.eq(CONNECTOR_LOG_TABLE, CONNECTOR_LOG_CONNECTOR_ID,
            this.connectorId));
        DataRecord record = logDs.getRecord();
        if (record == null) {
            final DataSource logHistoryDs =
                    DataSourceFactory.createDataSourceForFields(CONNECTOR_LOG_HISTORY_TABLE,
                        new String[] { CONNECTOR_LOG_RUN_ID });
            logHistoryDs.addSort(CONNECTOR_LOG_HISTORY_TABLE, CONNECTOR_LOG_RUN_ID,
                DataSource.SORT_DESC);
            logHistoryDs.addRestriction(Restrictions.eq(CONNECTOR_LOG_HISTORY_TABLE,
                CONNECTOR_LOG_CONNECTOR_ID, this.connectorId));
            record = logHistoryDs.getRecord();
            if (record == null) {
                this.runId = 1;
            } else {
                this.runId =
                        1 + record.getInt(CONNECTOR_LOG_HISTORY_TABLE + '.' + CONNECTOR_LOG_RUN_ID);
            }
        } else {
            this.runId = 1 + record.getInt(CONNECTOR_LOG_TABLE + '.' + CONNECTOR_LOG_RUN_ID);
        }
    }

    /**
     * Retrieve a summary of the log.
     *
     * @return the contents of the log.
     */
    public String getLogSummary() {
        final DataSource logDs = DataSourceFactory.createDataSource();
        logDs.addTable(CONNECTOR_LOG_TABLE);
        logDs.addField(CONNECTOR_LOG_CONNECTOR_ID);
        logDs.addField(CONNECTOR_LOG_ID);
        logDs.addField(CONNECTOR_LOG_DATE);
        logDs.addField(CONNECTOR_LOG_TIME);
        logDs.addField(CONNECTOR_LOG_MSG);
        logDs.addSort(CONNECTOR_LOG_TABLE, CONNECTOR_LOG_ID);
        final Clause connectorClause =
                Restrictions.eq(CONNECTOR_LOG_TABLE, CONNECTOR_LOG_CONNECTOR_ID, this.connectorId);
        logDs.addRestriction(connectorClause);
        final StringBuilder logMessages = new StringBuilder();
        for (final DataRecord logRecord : logDs.getRecords()) {
            logMessages.append(logRecord.getString(CONNECTOR_LOG_TABLE + '.' + CONNECTOR_LOG_MSG))
                .append('\n');
        }
        return logMessages.toString();
    }
}
