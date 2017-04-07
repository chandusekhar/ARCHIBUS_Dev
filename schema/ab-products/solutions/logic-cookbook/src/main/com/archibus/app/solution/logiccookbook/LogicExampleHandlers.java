package com.archibus.app.solution.logiccookbook;

import java.text.MessageFormat;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.dao.DocumentDao;
import com.archibus.dao.jdbc.DocumentDaoImpl;
import com.archibus.datasource.*;
import com.archibus.datasource.DataSource.RecordHandler;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.ext.report.ReportUtility;
import com.archibus.jobmanager.*;
import com.archibus.model.view.datasource.AbstractRestrictionDef;
import com.archibus.schema.*;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.*;

/**
 * Examples of event-handler methods that show common business logic techniques.
 *
 * <p>
 * History:
 * <li>Web Central 17.2: Initial implementation.
 * <li>Web Central 18.1: Updated for 18.1 API, added "cookbook" examples.
 * <li>Web Central 19.2: Moved Java language examples JavaExamples class, added comments.
 *
 * @author Sergey Kuramshin
 * @author Valery Tydykov
 */

/**
 * Suppress PMD warnings "AvoidDuplicateLiterals", "TooManyMethods" in this class.
 * <p>
 * Justification: This is a simplified example. Don't do this in production code.
 * <p>
 * Suppress PMD warning "AvoidFinalLocalVariable". Normally final local variables are not required,
 * because we would use either constants or method parameters instead.
 * <p>
 * Suppress PMD warning "AvoidUsingSql". The example uses SQL statements to illustrate the available
 * API.
 * <p>
 * Suppress PMD warning "AvoidThrowingRawExceptionTypes". The example throws Exception exception
 * imitates a third-party API behavior; do not do this in production code.
 * <p>
 * Suppress PMD warning "ExcessiveClassLength". The example illustrates the use of the core
 * DataSource API, which itself is too large.
 */
@SuppressWarnings({ "PMD.AvoidDuplicateLiterals", "PMD.TooManyMethods",
        "PMD.AvoidFinalLocalVariable", "PMD.AvoidUsingSql", "PMD.AvoidThrowingRawExceptionTypes",
        "PMD.ExcessiveClassLength" })
public class LogicExampleHandlers extends JobBase {

    /**
     * Table name.
     */
    private static final String TABLE_ACTIVITY_LOG = "activity_log";

    /**
     * Table name.
     */
    private static final String TABLE_BL = "bl";

    /**
     * Table name.
     */
    private static final String TABLE_PMPSUM = "pmpsum";

    /**
     * Table name.
     */
    private static final String TABLE_PT = "pt";

    /**
     * Table name.
     */
    private static final String TABLE_WO = "wo";

    /**
     * Table name.
     */
    private static final String TABLE_WR = "wr";

    /**
     * Table name.
     */
    private static final String TABLE_WRPT = "wrpt";

    /**
     * Field name.
     */
    private static final String FIELD_DATE_TODO = "date_todo";

    /**
     * Field name.
     */
    private static final String FIELD_QTY_ON_HAND = "qty_on_hand";

    /**
     * Field name.
     */
    private static final String FIELD_PART_ID = "part_id";

    /**
     * Field name.
     */
    private static final String FULL_NAME_PT_QTY_ON_HAND = "pt.qty_on_hand";

    /**
     * Field name.
     */
    private static final String FIELD_DATE_REQUESTED = "date_requested";

    /**
     * Field name.
     */
    private static final String FIELD_COST_EST_TOTAL = "cost_est_total";

    /**
     * Field name.
     */
    private static final String FIELD_DP_ID = "dp_id";

    /**
     * Field name.
     */
    private static final String FIELD_DV_ID = "dv_id";

    /**
     * Field name.
     */
    private static final String FIELD_VERIFIED_BY = "verified_by";

    /**
     * Field name.
     */
    private static final String FIELD_DATE_VERIFIED = "date_verified";

    /**
     * Field name.
     */
    private static final String FIELD_STATUS = "status";

    /**
     * Field name.
     */
    private static final String FIELD_ACTIVITY_LOG_ID = "activity_log_id";

    /**
     * Field name.
     */
    private static final String FIELD_WO_TYPE = "wo_type";

    /**
     * Field name.
     */
    private static final String FIELD_DESCRIPTION = "description";

    /**
     * Field name.
     */
    private static final String FIELD_PRIORITY = "priority";

    /**
     * Field name.
     */
    private static final String FIELD_TIME_ASSIGNED = "time_assigned";

    /**
     * Field name.
     */
    private static final String FIELD_BL_ID = "bl_id";

    /**
     * Field name.
     */
    private static final String FIELD_DATE_FROM = "dateFrom";

    /**
     * Field name.
     */
    private static final String FIELD_DATE_ASSIGNED = "date_assigned";

    /**
     * Field name.
     */
    private static final String FIELD_WO_ID = "wo_id";

    /**
     * Field name.
     */
    private static final String FULL_NAME_WR_BL_AND_FL = "wr.bl_and_fl";

    /**
     * Field name.
     */
    private static final String FULL_NAME_ACTIVITY_LOG_VERIFIED_BY = "activity_log.verified_by";

    /**
     * Field name.
     */
    private static final String FULL_NAME_ACTIVITY_LOG_DATE_VERIFIED = "activity_log.date_verified";

    /**
     * Field name.
     */
    private static final String FULL_NAME_ACTIVITY_LOG_STATUS = "activity_log.status";

    /**
     * Field name.
     */
    private static final String FULL_NAME_ACTIVITY_LOG_ACTIVITY_LOG_ID =
            "activity_log.activity_log_id";

    /**
     * Field name.
     */
    private static final String FULL_NAME_WO_DESCRIPTION = "wo.description";

    /**
     * Field name.
     */
    private static final String FULL_NAME_WO_DATE_ASSIGNED = "wo.date_assigned";

    /**
     * Field name.
     */
    private static final String FULL_NAME_WO_WO_TYPE = "wo.wo_type";

    /**
     * Field name.
     */
    private static final String FULL_NAME_WO_WO_ID = "wo.wo_id";

    /**
     * Field name.
     */
    private static final String FULL_NAME_WO_PRIORITY = "wo.priority";

    /**
     * Restriction clause.
     */
    private static final String RESTRICTION_WO_TYPE = "wo_type IN ('EQPM', 'HSPM')";

    /**
     * Status reserved: R.
     */
    private static final String WORK_REQUEST_STATUS_RESERVED = "R";

    /**
     * Work request priority: 10.
     */
    private static final int DEFAULT_WORK_REQUEST_PRIORITY = 10;

    /**
     * The Logger object to log messages to archibus.log.
     */
    private final Logger logger = Logger.getLogger(this.getClass());

    // ----------------------- common techniques --------------------------------------------------

    /**
     * Shows how to log message and how to implement custom exception handling.
     *
     * @param woId ID of the work order to be processed.
     */
    public void logProgressAndThrowException(final String woId) {
        // Log the progress message to archibus.log.
        // The afm-logging.xml file sets logging levels.
        if (this.logger.isInfoEnabled()) {
            final String message = "Processing work order: " + woId;
            this.logger.info(message);
        }

        // Handle an error that should be logged, but does not prevent the WFR from completing the
        // task.
        try {
            // Call a Web Central API method that throws ExceptionBase.

            // @non-translatable
            throw new ExceptionBase("Web Central API operation has failed");

        } catch (final ExceptionBase webCentralException) {
            // catch the Web Central exception

            // Log your own message + the original exception to archibus.log.
            // @non-translatable
            final String errorMessage =
                    MessageFormat.format("My custom operation has failed.\nRoot cause: {0}",
                        webCentralException.toStringForLogging());
            this.logger.error(errorMessage);
        }

        // Handle an error.
        // This code is not required unless you want to provide your own localized error message,
        // or need to call a third-party API that throws Exception, which is a bad practice.
        try {
            // Do something that throws an exception.
            // Your code or Java API methods that it calls can throw many different exception types.
            // Web Central API methods can throw ExceptionBase.

            // @non-translatable
            throw new Exception("Original error message (not user-friendly)");

            // CHECKSTYLE:OFF : Suppress IllegalCatch warning. Justification: third-party API method
            // throws a checked Exception, which needs to be wrapped in ExceptionBase.
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON

            // catch the original exception

            // Wrap original exception into ExceptionBase, supplying user-friendly error message.
            // @translatable
            final String message = "Could not perform requested operation with work order [{0}].";

            // The message can include additional parameter values that will not be translated.
            final ExceptionBase exception =
                    ExceptionBaseFactory.newTranslatableException(message, new Object[] { woId });

            // Attach the original exception to the new exception. Web Central will log the original
            // exception stack trace into archibus.log.
            exception.setNested(originalException);

            // Throw ExceptionBase - Web Central will log it (to archibus.log and to afm_wf_log
            // table), translate the @translatable message, and return the exception to the browser.
            // The calling view will show the user-friendly message in the error dialog.
            throw exception;
        }
    }

    // ----------------------- DataSource API examples --------------------------------------------

    /**
     * Finds and returns a record specified by its primary key value.
     *
     * @param woId Primary key value in the "wo" table.
     * @return DataRecord, or null if no record exists for specified primary key.
     */
    public final DataRecord getRecordByPrimaryKey(final int woId) {
        final DataSource dataSource = createWorkOrderDataSource();
        dataSource.addRestriction(Restrictions.eq(TABLE_WO, FIELD_WO_ID, woId));

        final DataRecord record = dataSource.getRecord();

        return record;
    }

    /**
     * Returns all records that match specified date restriction. Uses default VPA restrictions.
     *
     * @param dateFrom Records should have date_assigned >= this date.
     * @return List<DataRecord>, empty if there are no such records.
     */
    public final DataSetList getRecordsUsingDateRestriction(final Date dateFrom) {
        final DataSource dataSource = createWorkOrderDataSource();

        // if dateFrom was supplied
        if (dateFrom != null) {
            dataSource.addRestriction(Restrictions.gte(TABLE_WO, FIELD_DATE_ASSIGNED, dateFrom));
        }

        final List<DataRecord> records = dataSource.getRecords();

        return new DataSetList(records);
    }

    /**
     * Returns all records that match specified date restriction.
     *
     * @param restriction The restriction.
     * @return List<DataRecord>, empty if there are no such records.
     */
    public final DataSetList getRecordsUsingRestrictionObject(
            final AbstractRestrictionDef restriction) {
        final DataSource dataSource = createWorkOrderDataSource();

        final List<DataRecord> records = dataSource.getRecords(restriction);

        return new DataSetList(records);
    }

    /**
     * Returns all records that match specified SQL restriction.
     *
     * @return List<DataRecord>, empty if there are no such records.
     */
    public final DataSetList getRecordsUsingSqlRestriction() {
        final DataSource dataSource = createWorkOrderDataSource();

        dataSource.addRestriction(Restrictions.sql(RESTRICTION_WO_TYPE));

        final List<DataRecord> records = dataSource.getRecords();

        return new DataSetList(records);
    }

    /**
     * Returns all records that match specified SQL restriction.
     *
     * @param dateFrom Records should have date_assigned >= this date.
     * @return List<DataRecord>, empty if there are no such records.
     */
    public final DataSetList getRecordsUsingSqlRestrictionWithParameters(final Date dateFrom) {
        final DataSource dataSource = createWorkOrderDataSource();

        String restriction = RESTRICTION_WO_TYPE;
        if (dateFrom != null) {
            restriction += " AND date_assigned >= ${parameters['dateFrom']}";
            dataSource.addParameter(FIELD_DATE_FROM, dateFrom, DataSource.DATA_TYPE_DATE);
        }

        dataSource.addRestriction(Restrictions.sql(restriction));

        final List<DataRecord> records = dataSource.getRecords();

        return new DataSetList(records);
    }

    /**
     * Returns data records for the standard grid panel. Handles grid parameters:
     * <ul>
     * <li>Panel parameters for the data source.
     * <li>Filter values.
     * <li>Sort values.
     * </ul>
     * See ab-products/solutions/programming/grid/ab-ex-prg-grid-custom-wfr.axvw example view.
     *
     * @param parameters Parameters passed from the grid control.
     * @return The data set to display in the grid.
     */
    public final DataSetList getRecordsWithSupportForSortingAndFiltering(
            final Map<String, Object> parameters) {
        // load the data source form the view
        final DataSource dataSource = DataSourceFactory
            .loadDataSourceFromFile("ab-ex-prg-grid-custom-wfr.axvw", "prgGridCustomWfr_gridDs");

        // initialize the data source
        dataSource.setContext();

        String restriction = null;
        // apply grid parameters to the data source
        ReportUtility.handleParameters(dataSource, parameters);
        // Handle custom grid restriction:
        // The grid passes parsed restriction as a serialized JSON expression.
        // Pass it to the DataSource.getRecords() method.
        restriction = (String) parameters.get("restriction");

        // retrieve data records
        final List<DataRecord> records = dataSource.getRecords(restriction);

        // return data records as data set
        final DataSetList dataSet = new DataSetList(records);
        dataSet.setHasMoreRecords(dataSource.hasMoreRecords());

        return dataSet;
    }

    /**
     * Returns all records. Uses default VPA restrictions.
     *
     * @param dateFrom The start date for the records.
     * @return List<DataRecord>, empty if there are no such records.
     */
    public DataSetList getRecordsWithVpa(final Date dateFrom) {
        final DataSource dataSource = createWorkOrderDataSource();

        // if dateFrom was supplied
        if (dateFrom != null) {
            dataSource.addRestriction(Restrictions.gte(TABLE_WO, FIELD_DATE_ASSIGNED, dateFrom));
        }

        final List<DataRecord> records = dataSource.getRecords();

        return new DataSetList(records);
    }

    /**
     * Returns all records. Disables default VPA restrictions.
     * <p>
     * This technique can be used to return data that normally would be invisible to the user due to
     * VPA restrictions.
     * <p>
     * Use this technique with caution, and do not display returned records to the user.
     *
     * @param dateFrom The start date for the records.
     * @return List<DataRecord>, empty if there are no such records.
     */
    public DataSetList getRecordsWithoutVpa(final Date dateFrom) {
        final DataSource dataSource = createWorkOrderDataSource();

        // if dateFrom was supplied
        if (dateFrom != null) {
            dataSource.addRestriction(Restrictions.gte(TABLE_WO, FIELD_DATE_ASSIGNED, dateFrom));
        }

        // disable VPA restrictions, if any exist for the current user
        dataSource.setApplyVpaRestrictions(false);

        final List<DataRecord> records = dataSource.getRecords();

        return new DataSetList(records);
    }

    /**
     * Returns all records using a custom SQL query. Disables default VPA restriction handling in
     * the data source, but adds VPA restrictions to the custom SQL query.
     * <p>
     * Use this technique when the custom SQL query will not work with default VPA restrictions.
     * <p>
     * With default VPA handling, your custom SQL is the inner query SELECT, and the VPA
     * restrictions are applied in the outer query WHERE:
     * <p>
     * SELECT * FROM (SELECT ... FROM ... WHERE ...) WHERE (VPA restriction)
     * <p>
     * With custom VPA handling, you insert the VPA restrictions, if any, into your SQL:
     * <p>
     * SELECT * FROM (SELECT ... FROM ... WHERE ... AND ${sql.vpaRestriction})
     * <p>
     * If the user has no VPA restriction, the ${vpaRestriction} expression is evaluated as 1=1.
     *
     * @param dateFrom The start date for the records.
     * @return List<DataRecord>, empty if there are no such records.
     */
    public DataSetList getRecordsWithCustomVpa(final Date dateFrom) {
        final DataSource dataSource = createWorkOrderDataSource();

        // if dateFrom was supplied
        if (dateFrom != null) {
            dataSource.addRestriction(Restrictions.gte(TABLE_WO, FIELD_DATE_ASSIGNED, dateFrom));
        }

        // disable VPA restrictions, if any exist for the current user
        dataSource.setApplyVpaRestrictions(false);

        // add custom SQL query with VPA restrictions, if any exist for the current user
        dataSource.addQuery(
            "SELECT wo_id, wo_type, description, date_assigned, time_assigned, priority, bl_id "
                    + "FROM wo WHERE wo.date_assigned IS NOT NULL "
                    + "AND EXISTS (SELECT wo_id FROM wr WHERE wr.wo_id = wo.wo_id) "
                    + "AND ${sql.vpaRestriction}");

        final List<DataRecord> records = dataSource.getRecords();

        return new DataSetList(records);
    }

    /**
     * Calculates statistical values.
     *
     * @return Message with calculated values.
     */
    public String getStatistics() {
        // get MAX(wo.date_assigned) without any restriction
        final Date lastDateAssigned = DataStatistics.getDate(TABLE_WO, FIELD_DATE_ASSIGNED, "max");

        Restriction.Clause restriction = null;
        if (lastDateAssigned != null) {
            restriction = Restrictions.eq(TABLE_WO, FIELD_DATE_ASSIGNED, lastDateAssigned);
        }

        // get COUNT(wo.wo_id) for work orders that match the calculated date
        final int numberOfWorkOrders =
                DataStatistics.getInt(TABLE_WO, FIELD_WO_ID, "count", restriction);

        return "The last date to perform is " + lastDateAssigned + ".<br/>There are "
                + numberOfWorkOrders + " work orders to be performed on that date.";
    }

    /**
     * Query records and perform an operation for each record.
     *
     * @return Message with calculated values.
     */
    public String queryRecords() {
        final DataSource dataSource = createWorkOrderDataSource();

        // buffer for a long message
        final StringBuffer messageBuffer = new StringBuffer("Work orders:<br/>");

        // scroll through all records
        dataSource.queryRecords(new RecordHandler() {

            // this callback method is called for each retrieved record
            @Override
            public boolean handleRecord(final DataRecord record) {

                // add the work order ID to the message buffer
                messageBuffer.append(record.getInt(FULL_NAME_WO_WO_ID));
                messageBuffer.append("<br/>");

                // return true to continue scrolling through the result set, false to stop.
                return true;
            }
        });

        return messageBuffer.toString();
    }

    /**
     * Creates new work order record with specified type and date.
     *
     * @param type
     * @param dateAssigned
     * @return new work order ID.
     */
    public int createNewRecord() {
        final DataSource dataSource = createWorkOrderDataSource();

        final Date today = new Date();

        DataRecord record = dataSource.createNewRecord();
        record.setValue(FULL_NAME_WO_WO_TYPE, "HSPM");
        record.setValue(FULL_NAME_WO_DATE_ASSIGNED, today);
        record.setValue(FULL_NAME_WO_PRIORITY, DEFAULT_WORK_REQUEST_PRIORITY);
        record.setValue(FULL_NAME_WO_DESCRIPTION, "Test work order");

        record = dataSource.saveRecord(record);

        return record.getInt(FULL_NAME_WO_WO_ID);
    }

    /**
     * Updates work order specified by the primary key - sets priority to specified value.
     *
     * @param woId ID of the work order.
     * @param priority Priority of the work order.
     */
    public void updateRecord(final int woId, final int priority) {
        final DataSource dataSource = createWorkOrderDataSource();
        dataSource.addRestriction(Restrictions.eq(TABLE_WO, FIELD_WO_ID, woId));

        final DataRecord record = dataSource.getRecord();
        record.setValue(FULL_NAME_WO_PRIORITY, priority);

        dataSource.saveRecord(record);
    }

    /**
     * Save specified work order records.
     *
     * @param workOrders Records to be saved.
     */
    public void updateRecords(final DataSetList workOrders) {
        final DataSource dataSource = createWorkOrderDataSource();

        for (final DataRecord record : workOrders.getRecords()) {
            dataSource.saveRecord(record);
        }
    }

    /**
     * Save specified work order record.
     *
     * @param workOrder Record to be saved.
     */
    public void saveRecord(final DataRecord workOrder) {
        final DataSource dataSource = createWorkOrderDataSource();

        dataSource.saveRecord(workOrder);
    }

    /**
     * Create DataSource for work orders table.
     *
     * @return Created DataSource.
     */
    private DataSource createWorkOrderDataSource() {
        final String tableName = TABLE_WO;
        final String[] fieldNames = { FIELD_WO_ID, FIELD_WO_TYPE, FIELD_BL_ID, FIELD_DATE_ASSIGNED,
                FIELD_TIME_ASSIGNED, FIELD_PRIORITY, FIELD_DESCRIPTION };
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(tableName, fieldNames);

        return dataSource;
    }

    // ----------------------- additional example methods -----------------------------------------

    /**
     * Shows how to save values if fields that have string format = UPPER in the ARCHIBUS schema.
     * Values entered by users in standard forms are already converted as required, but values that
     * come from another source (file, web service, etc), need to be converted by the application
     * code.
     */
    public void convertFieldValueToUpperCase() {
        // prepare the data source
        final DataSource buildingDataSource = DataSourceFactory.createDataSource();
        buildingDataSource.addTable(TABLE_BL);
        buildingDataSource.addField(TABLE_BL, FIELD_BL_ID);
        final DataRecord buildingRecord = buildingDataSource.createNewRecord();

        // get the ARCHIBUS table and field definition
        final TableDef.ThreadSafe tableDef = buildingDataSource.getMainTableDef();
        final ArchibusFieldDefBase.Immutable fieldDef = tableDef.getFieldDef(FIELD_BL_ID);

        // if required, convert the value to upper case
        String buildingId = "haus";
        if (fieldDef.getFormatting().isUpper()) {
            // conversion to upper case should use the current user's locale
            // calling String.toUpperCase() without specifying locale may produce incorrect result
            final Locale currentUserLocale = ContextStore.get().getLocale();
            buildingId = buildingId.toUpperCase(currentUserLocale);
        }

        // save the record
        buildingRecord.setValue("bl.bl_id", buildingId);
        buildingDataSource.saveRecord(buildingRecord);
    }

    /**
     * Verify (completed) action item.
     *
     * @param pkRecord Record with the primary key value.
     */
    public void verifyAction(final DataRecord pkRecord) {
        final String table = TABLE_ACTIVITY_LOG;
        final String[] fields =
                { FIELD_ACTIVITY_LOG_ID, FIELD_STATUS, FIELD_DATE_VERIFIED, FIELD_VERIFIED_BY };
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields(table, fields);

        final Object activityLogId = pkRecord.getValue(FULL_NAME_ACTIVITY_LOG_ACTIVITY_LOG_ID);

        final DataRecord record = dataSource.createRecord();
        record.setValue(FULL_NAME_ACTIVITY_LOG_ACTIVITY_LOG_ID, activityLogId);
        record.setValue(FULL_NAME_ACTIVITY_LOG_STATUS, "COMPLETED-V");
        record.setValue(FULL_NAME_ACTIVITY_LOG_DATE_VERIFIED, Utility.currentDate());
        record.setValue(FULL_NAME_ACTIVITY_LOG_VERIFIED_BY, ContextStore.get().getUser().getName());
        record.setOldValue(FULL_NAME_ACTIVITY_LOG_ACTIVITY_LOG_ID, activityLogId);
        record.setOldValue(FULL_NAME_ACTIVITY_LOG_STATUS, "COMPLETED");
        record.setOldValue(FULL_NAME_ACTIVITY_LOG_DATE_VERIFIED, "");
        record.setOldValue(FULL_NAME_ACTIVITY_LOG_VERIFIED_BY, "");

        dataSource.saveRecord(record);
    }

    /**
     * Verify (completed) action items.
     *
     * @param pkRecords Records with the primary key value.
     */
    public void verifyActions(final List<DataRecord> pkRecords) {
        for (final DataRecord pkRecord : pkRecords) {
            verifyAction(pkRecord);
        }
    }

    /**
     * Return data for the work request chart. This example loads the DataSource from view.
     *
     * @param restriction Client-supplied restriction string, or null.
     * @return Data for the work request chart.
     */
    public DataSet1D getWorkRequestChartData(final String restriction) {
        // load DataSource from view
        final DataSource dataSource = DataSourceFactory
            .loadDataSourceFromFile("ab-ex-custom-chart.axvw", "customChart_requestDs");

        // get data records
        final List<DataRecord> records = dataSource.getRecords(restriction);

        // serialize dataset to the response
        // specify grouping field name from AXVW
        final DataSet1D dataSet = new DataSet1D(FULL_NAME_WR_BL_AND_FL);
        dataSet.addRecords(records);

        return dataSet;
    }

    /**
     * Return data for the work request chart. This example loads the DataSource from view.
     *
     * @return Data for the work request chart.
     */
    public DataSet2D getWorkRequestChartData2D() {
        // Total amount of work to be performed: 100.
        final int totalWorkUnits = 100;

        this.status.setTotalNumber(totalWorkUnits);

        // load DataSource from view
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-ex-test-2d.axvw", "test2d_requestDs");

        // get data records
        final List<DataRecord> records = dataSource.getRecords();

        // serialize 2D dataset to the response
        // specify row and column grouping field names from AXVW
        final DataSet2D dataSet = new DataSet2D("wr.dp_id", FULL_NAME_WR_BL_AND_FL);
        dataSet.addRecords(records);

        // update the job status
        this.status.setCurrentNumber(totalWorkUnits);
        this.status.setCode(JobStatus.JOB_COMPLETE);
        this.status.setDataSet(dataSet);

        return dataSet;
    }

    /**
     * Return data for the work request chart. This example creates the DataSource programmatically.
     *
     * @param restriction Client-supplied restriction string, or null.
     * @return Data for the work request chart.
     */
    public DataSet1D getWorkRequestChartDataWithSql(final String restriction) {
        // create new DataSource
        final DataSource dataSource = DataSourceFactory.createDataSource();

        // set table and fields
        dataSource.addTable(TABLE_WR);
        dataSource.addField(FIELD_DV_ID);
        dataSource.addField(FIELD_DP_ID);
        dataSource.addField(FIELD_COST_EST_TOTAL);
        dataSource.addField(FIELD_DATE_REQUESTED);

        // add custom SQL query
        // According to best practices, we should avoid using SQL; each SQL statement should be
        // converted to DataSource parameters.
        // The following SQL statement can not be easily converted to DataSource parameters: it
        // contains several statistics/virtual fields.
        dataSource
            .addQuery(
                "SELECT fl_id, COUNT(wr_id) AS total_requests, SUM(cost_est_total) AS total_cost, "
                        + "MAX(dp_id) AS dp_id, MAX(dv_id) AS dv_id "
                        + "FROM wr WHERE bl_id = 'HQ' GROUP BY fl_id",
                SqlExpressions.DIALECT_GENERIC);

        // add virtual fields for all fields in the SELECT clause
        dataSource.addVirtualField(TABLE_WR, "fl_id", DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(TABLE_WR, FIELD_DV_ID, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(TABLE_WR, FIELD_DP_ID, DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(TABLE_WR, "total_requests", DataSource.DATA_TYPE_NUMBER);
        dataSource.addVirtualField(TABLE_WR, "total_cost", DataSource.DATA_TYPE_NUMBER);

        // get data records
        final List<DataRecord> records = dataSource.getRecords(restriction);

        // serialize dataset to the response
        final DataSet1D dataSet = new DataSet1D("wr.fl_id");
        dataSet.addRecords(records);

        return dataSet;
    }

    /**
     * Saves employee and parking records in one transaction.
     *
     * @param employeeRecord Employee record.
     * @param parkingRecord Parking record.
     * @param requiresParking True if parking record is required.
     */
    public void saveEmployeeAndParking(final DataRecord employeeRecord,
            final DataRecord parkingRecord, final boolean requiresParking) {
        // create two data sources that will be used to save records
        final DataSource employeeDataSource = DataSourceFactory.createDataSourceForFields("em",
            new String[] { "em_id", "em_std", FIELD_DV_ID, FIELD_DP_ID }, false);
        final DataSource parkingDataSource = DataSourceFactory.createDataSourceForFields("parking",
            new String[] { "parking_id", "parking_std", FIELD_BL_ID }, false);

        // employee record is mandatory
        employeeDataSource.saveRecord(employeeRecord);

        // parking record is optional
        if (requiresParking) {
            parkingDataSource.saveRecord(parkingRecord);
        }
    }

    /**
     * Returns a message containing updated quantities of parts for open work requests.
     *
     * @return message containing updated quantities of parts for open work requests.
     * @throws ExceptionBase If DataSource throws exception.
     */
    public String showPartsForOpenWorkRequests() throws ExceptionBase {
        // get work request part records for all open work requests
        final List<DataRecord> wrptRecords = loadWorkRequestPartRecords();

        final String[] ptFields = { FIELD_PART_ID, FIELD_QTY_ON_HAND };
        final DataSource partsDataSource =
                DataSourceFactory.createDataSourceForFields(TABLE_PT, ptFields, false);

        final List<DataRecord> partRecords = new ArrayList<DataRecord>();

        // for each work request part record
        for (final DataRecord wrptRecord : wrptRecords) {
            final String partId = wrptRecord.getString("wrpt.part_id");
            final String status = wrptRecord.getString("wr.status");
            final double quantityEstimated = wrptRecord.getDouble("wrpt.qty_estimated");
            final double quantityActual = wrptRecord.getDouble("wrpt.qty_actual");

            // get the part record that can be used to update the parts inventory
            final DataRecord partRecord =
                    partsDataSource.getRecord("pt.part_id = '" + partId + "'");

            double quantityOnHand = partRecord.getDouble(FULL_NAME_PT_QTY_ON_HAND);

            // decrement the part's quantity on hand
            if (StringUtil.notNull(status).equals(WORK_REQUEST_STATUS_RESERVED)) {
                // if the part has been reserved for the work request
                quantityOnHand = quantityOnHand - quantityActual + quantityEstimated;
            } else {
                // if the part has not been reserved
                quantityOnHand = quantityOnHand - quantityActual;
            }

            partRecord.setValue(FULL_NAME_PT_QTY_ON_HAND, quantityOnHand);

            // add the record to the list
            partRecords.add(partRecord);
        }

        // prepare a text message that lists all part records
        final StringBuilder message = new StringBuilder();

        for (final DataRecord partRecord : partRecords) {
            final Object partId = partRecord.getValue("pt.part_id");
            final Object quantityOnHandBefore = partRecord.getOldValue(FULL_NAME_PT_QTY_ON_HAND);
            final Object quantityOnHandAfter = partRecord.getValue(FULL_NAME_PT_QTY_ON_HAND);

            message.append(
                MessageFormat.format("Part = {0}, on hand before = {1}, on hand after = {2}<br/>",
                    partId, quantityOnHandBefore, quantityOnHandAfter));
        }

        return message.toString();
    }

    /**
     * Load work request part records with the specified work request part fields, work request
     * fields, part fields.
     *
     * @return List of work request part records.
     */
    private List<DataRecord> loadWorkRequestPartRecords() {
        final String[] wrptFields = { FIELD_PART_ID, "wr_id", "qty_estimated", "qty_actual" };
        final String[] wrFields = { FIELD_STATUS, FIELD_DATE_ASSIGNED, FIELD_TIME_ASSIGNED };
        final String[] ptFields = { FIELD_PART_ID, FIELD_QTY_ON_HAND };

        final DataSource wrptDataSource = DataSourceFactory.createDataSource();
        wrptDataSource.addTable(TABLE_WRPT, DataSource.ROLE_MAIN);
        wrptDataSource.addTable(TABLE_WR, DataSource.ROLE_STANDARD);
        wrptDataSource.addTable(TABLE_PT, DataSource.ROLE_STANDARD);
        wrptDataSource.addField(TABLE_WRPT, wrptFields);
        wrptDataSource.addField(TABLE_WR, wrFields);
        wrptDataSource.addField(TABLE_PT, ptFields);
        wrptDataSource.addRestriction(Restrictions.sql("wr.status IN ('S','Can','Com')"));

        final List<DataRecord> wrptRecords = wrptDataSource.getAllRecords();

        return wrptRecords;
    }

    /**
     * Generates preventive maintenance summary records for the specified period of time.
     *
     * @param dateFrom Starting date.
     * @param dateTo Ending date.
     * @throws ExceptionBase If DataSource throws exception.
     */
    public void generatePmpSummary(final Date dateFrom, final Date dateTo) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger
                .debug("Generating pmpsum records from [" + dateFrom + "] to [" + dateTo + "]");
        }

        // delete all pmpsum records, no filter
        SqlUtils.executeUpdate(TABLE_PMPSUM, "DELETE FROM pmpsum");

        final DataSource pmpDataSource = DataSourceFactory.createDataSourceForFields(TABLE_PMPSUM,
            new String[] { FIELD_DATE_TODO });

        // add date parameters to the DataSource
        pmpDataSource.addParameter(FIELD_DATE_FROM, dateFrom, DataSource.DATA_TYPE_DATE);
        pmpDataSource.addParameter("dateTo", dateTo, DataSource.DATA_TYPE_DATE);

        // Generate new records
        // According to best practices, we should avoid using SQL; each SQL statement should be
        // converted to DataSource parameters.
        // The following SQL statement can not be easily converted to DataSource parameters: it
        // contains nested SQL statements: INSERT->SELECT.
        String sql = "INSERT INTO pmpsum (date_todo, eq_id, pmp_id, tr_id, hours)"
                + " SELECT pmsd.date_todo, ' ', pmp.pmp_id, pmpstr.tr_id, SUM(pmpstr.hours_req)"
                + " FROM pmsd, pms, pmp, pmps, pmpstr"
                + " WHERE pms.pms_id = pmsd.pms_id AND pmp.pmp_id = pms.pmp_id"
                + " AND pmps.pmp_id =pmp.pmp_id AND pmpstr.pmp_id=pmps.pmp_id"
                + " AND pmpstr.pmps_id = pmps.pmps_id"
                + " AND pmsd.date_todo >= ${parameters['dateFrom']}"
                + " AND pmsd.date_todo <= ${parameters['dateTo']}"
                + " GROUP BY pmsd.date_todo, pmp.pmp_id, pmpstr.tr_id ";

        if (pmpDataSource.isSybase()) {
            sql += "ORDER BY pmsd.date_todo, pmp.pmp_id, pmpstr.tr_id";
        }

        pmpDataSource.addQuery(sql);
        pmpDataSource.executeUpdate();
    }

    /**
     * Example of using the DataValue object to parse/format date values.
     *
     * @param dateInput String containing the date value entered by the user, sent from the client
     *            in the ARCHIBUS locale-neutral format.
     * @throws ExceptionBase If DataSource or DataValue throw an exception.
     * @return Message with all values.
     */
    public String getFormattedValues(final String dateInput) throws ExceptionBase {
        // create DataSource
        final DataSource pmpDataSource = DataSourceFactory.createDataSourceForFields(TABLE_PMPSUM,
            new String[] { FIELD_DATE_TODO }, false);
        pmpDataSource.setContext();

        // create DataValue object for pmpsum.date_todo field
        final DataValue dvDateFrom = new DataValue(pmpDataSource.findField("pmpsum.date_todo"));

        // parse date neutral string to Java Date object
        dvDateFrom.setUiValue(dateInput);

        // get Date object for use in calculations or logic
        final Date dateObject = (Date) dvDateFrom.getValue();

        // get value formatted for SQL for use in custom SQL queries
        final String dateSqlString = dvDateFrom.getDbValue();

        // get localized value formatted for UI
        final String dateLocalizedString = dvDateFrom.getLocalizedValue();

        // returns a message with all values to the client
        final Object[] parameters =
                new Object[] { dateInput, dateObject, dateSqlString, dateLocalizedString };
        final String message = MessageFormat
            .format("Neutral: {0}<br/>Object: {1}<br/>SQL: {2}<br/>Localized: {3}", parameters);

        return message;
    }

    /**
     * Example of using copyDocument method of DocumentDao interface. Copies document from one
     * record to another.
     *
     * @param documentParametersFrom Parameters of the document to copy from.
     * @param documentParametersTo Parameters of the document to copy to.
     */
    public void copyDocument(final DocumentParameters documentParametersFrom,
            final DocumentParameters documentParametersTo) {
        this.getDocumentDao().copyDocument(documentParametersFrom, documentParametersTo);
    }

    /**
     * Helper method that creates a Data Access Object (DAO) that can be used to load or save
     * documents from/to the ARCHIBUS database.
     *
     * @return new instance of DocumentDao
     */
    private DocumentDao getDocumentDao() {
        return new DocumentDaoImpl();
    }
}
