/**
 * 
 */
package com.archibus.eventhandler.prevmaint;

import java.text.MessageFormat;
import java.util.Date;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.db.DbConnection;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * ForecastDatesGenerator - Long running job that perform forecasting for resource requirements and
 * scheduled hours by week or month.
 * 
 * <p>
 * History:
 * <li>Initial implementation for PM release 1.
 * 
 * @author Zhang Yi
 */

public class ForecastDatesGenerator extends JobBase implements DataSource.RecordHandler {
    
    /**
     * Constructor.
     * 
     * By Zhang Yi
     * 
     * @param forecastResourceType : Specify the type of forecast.
     * @param restriction : Restrict conditions from JS Client
     * @param nativeSqlDateFrom : Start date in string format.
     * @param nativeSqlDateTo : End date in string format.
     * @param weeksBetweenSql : SQL string for week between
     * @param monthsBetweenSql : SQL string for month between
     */
    public ForecastDatesGenerator(final String forecastResourceType, final String restriction,
            final String nativeSqlDateFrom, final String nativeSqlDateTo,
            final String monthsBetweenSqlStr, final String weeksBetweenSqlStr,
            final PmScheduleGenerator dateGenerator) {
        
        this.forecastResourceType = forecastResourceType;
        this.restriction = restriction;
        this.nativeSqlDateFrom = nativeSqlDateFrom;
        this.nativeSqlDateTo = nativeSqlDateTo;
        this.monthsBetweenSqlStr = monthsBetweenSqlStr;
        this.weeksBetweenSqlStr = weeksBetweenSqlStr;
        this.scheduleDateGenerator = dateGenerator;
        
        createDataSources();
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.archibus.jobmanager.Job#run()
     */
    @Override
    public void run() {
        
        this.status.setTotalNumber(100);
        
        this.status.setCurrentNumber(0);
        
        if (this.scheduleDateGenerator != null) {
            
            // add to fix KB3028545 by Guo Jiangtao 2010-08-25
            this.status.setResult(new JobResult(this.GENERATE_DATES_JOB_TITLE));
            
            final long t = System.currentTimeMillis();
            
            this.scheduleDateGenerator.run();
            
            System.out.println("createScheduledDates(): " + (System.currentTimeMillis() - t)
                    + " ms");
            this.status.setCurrentNumber(50);
        }
        
        // SQL Server JDBC driver requires either autoCommit=true, or SelectMethod=cursor
        // if multiple Statements are used within a single Connection
        // SelectMethod=cursor imposes severe performance penalty,
        // so we use autoCommit=true
        
        // add to fix KB3028545 by Guo Jiangtao 2010-08-25
        this.status.setResult(new JobResult(this.JOB_TITLE));
        
        // Construce a common date range condition string
        final String dateRangeCondition =
                " pmsd.date_todo>=" + this.nativeSqlDateFrom + " AND pmsd.date_todo<="
                        + this.nativeSqlDateTo + " ";
        
        if (this.restriction != null && this.restriction.trim().length() > 0) {
            this.restriction = " AND " + this.restriction;
        }
        
        if (this.forecastResourceType.startsWith("52W")
                || this.forecastResourceType.startsWith("12M")) {
            this.forecastPM52W(dateRangeCondition);
        } else {
            this.forecastPMResources(dateRangeCondition);
        }
        
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOP_REQUESTED);
            return;
        }
        this.status.setCurrentNumber(100);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.archibus.datasource.DataSource.RecordHandler#handleRecord(com.archibus.datasource.data
     * .DataRecord)
     * 
     * @param record : pmsd record
     */
    public boolean handleRecord(final DataRecord record) {
        if (this.stopRequested) {
            return false;
        }
        // If now is performing the forecast for resource
        if (!this.forecastResource) {
            // Get values
            final double hours = record.getDouble("pmsd.hours_req");
            final Date dateToDo = record.getDate("pmsd.date_todo");
            final String eqId = record.getString("pmsd.eq_id");
            final String pmpId = record.getString("pmsd.pmp_id");
            final String trId = record.getString("pmsd.tr_id");
            // Set values and insert record to table pmpsum
            DataRecord newRecord = this.pmpsumInsertDS.createRecord();
            newRecord.setNew(true);
            newRecord.setValue("pmpsum.date_todo", dateToDo);
            newRecord.setValue("pmpsum.eq_id", eqId);
            newRecord.setValue("pmpsum.pmp_id", pmpId);
            newRecord.setValue("pmpsum.tr_id", trId);
            newRecord.setValue("pmpsum.hours", hours);
            newRecord = this.pmpsumInsertDS.saveRecord(newRecord);
            //this.pmpsumInsertDS.commit();
            
        } else { // Else if now is performing forecast for the scheduled hours
        
            final double hours = record.getDouble("pmsd.hours_or_quantity");
            final Date dateToDo = record.getDate("pmsd.date_todo");
            final String resId = record.getString("pmsd.resource_id");
            final String resType = record.getString("pmsd.resource_type");
            
            final String tableName = "pmressum";
            final String[] fieldNames =
                    { "date_todo", "resource_type", "resource_id", "hours_or_quantity" };
            final DataSource pmressumInsertDS =
                    DataSourceFactory
                        .createDataSourceForFields(tableName, fieldNames)
                        .addQuery(
                            "INSERT INTO pmressum(date_todo, resource_type, resource_id, hours_or_quantity) "
                                    + "VALUES(${parameters['dateTodo']}, ${parameters['resType']},${parameters['resourceId']}, ${parameters['hours']})")
                        .addParameter("dateTodo", dateToDo, DataSource.DATA_TYPE_DATE)
                        .addParameter("resType", resType, DataSource.DATA_TYPE_TEXT)
                        .addParameter("resourceId", resId, DataSource.DATA_TYPE_TEXT)
                        .addParameter("hours", hours, DataSource.DATA_TYPE_NUMBER);
            pmressumInsertDS.executeUpdate();
            //pmressumInsertDS.commit();
        }
        
        return true;
    }
    
    // Constants
    private final Logger log = Logger.getLogger(this.getClass());
    
    // Constants that indicates four different forecast types for shceduled hours.
    private static final String forecast_52W_Procedure = "52W-P";
    
    private static final String forecast_52W_Equipment = "52W-E";
    
    private static final String forecast_52W_Labor = "52W-L";
    
    private static final String forecast_12M_Labor = "12M-L";
    
    // Constants that indicates four different forecast types for resource.
    private static final String forecast_RESOURCE_Labor = "L";
    
    private static final String forecast_RESOURCE_Part = "P";
    
    private static final String forecast_RESOURCE_Tool = "T";
    
    private static final String forecast_RESOURCE_All = "ALL";
    
    private boolean forecastResource = true;
    
    private String forecastResourceType = "";
    
    private String restriction = "";
    
    private String nativeSqlDateFrom = "";
    
    private String nativeSqlDateTo = "";
    
    // @translatable
    private final String JOB_TITLE = "Generate Forecast";
    
    // @translatable
    private final String GENERATE_DATES_JOB_TITLE = "Generate Schedule Dates";
    
    private final PmScheduleGenerator scheduleDateGenerator;
    
    /**
     * This method performs resources forecast by calling method forecastResources with required
     * parameters transfer in. for given date range.
     * 
     * By Zhang Yi
     * 
     * @param dateRangeCondition : SQL string indicates the date range restriction.
     * 
     */
    public void forecastPMResources(final String dateRangeCondition) {
        
        this.createDataSources();
        
        forecastDeleteRecords("pmressum");
        
        if (this.forecastResourceType.equalsIgnoreCase(forecast_RESOURCE_Labor)
                || this.forecastResourceType.equalsIgnoreCase(forecast_RESOURCE_All)) {
            forecastResources(this.restriction, dateRangeCondition, "L", "pmpstr", "tr_id",
                "hours_req");
        }
        
        if (this.forecastResourceType.equalsIgnoreCase(forecast_RESOURCE_Part)
                || this.forecastResourceType.equalsIgnoreCase(forecast_RESOURCE_All)) {
            forecastResources(this.restriction, dateRangeCondition, "P", "pmpspt", "part_id",
                "qty_required");
        }
        
        if (this.forecastResourceType.equalsIgnoreCase(forecast_RESOURCE_Tool)
                || this.forecastResourceType.equalsIgnoreCase(forecast_RESOURCE_All)) {
            forecastResources(this.restriction, dateRangeCondition, "T", "pmpstt", "tool_type",
                "hours_req");
        }
        
    }
    
    /**
     * This method performs resource requirements forecast according to given resource type.
     * 
     * By Zhang Yi
     * 
     * @param restriction : Restriction string comes from JS client
     * @param dateRangeCondition : SQL string indicates the date range restriction
     * @param resourceType : specified resource type, should be one of trade, craftperson, tool
     *            type, tool which are defined as constants
     * @param nameOfResourceTable : specified resource's table name
     * @param nameOfResourceIdField : specified field name that holds resource id
     * @param nameOfSumField : specified field name that need to sum
     * 
     */
    private void forecastResources(final String restriction, final String dateRangeCondition,
            final String resourceType, final String nameOfResourceTable,
            final String nameOfResourceIdField, final String nameOfSumField) {
        
        final String resourceFieldStr = nameOfResourceTable + "." + nameOfResourceIdField;
        final String sumStr =
                "SUM(" + nameOfResourceTable + "." + nameOfSumField + ") AS hours_or_quantity ";
        
        final String forecastResourceSelectSQL =
                "SELECT pmsd.date_todo, '"
                        + resourceType
                        + "' AS resource_type, "
                        + resourceFieldStr
                        + " AS  resource_id, "
                        + sumStr
                        + " FROM pmsd,pms,pmp,pmps,"
                        + nameOfResourceTable
                        + " WHERE pms.pms_id = pmsd.pms_id AND pmp.pmp_id =pms.pmp_id AND pmp.pmp_id=pmps.pmp_id AND "
                        + nameOfResourceTable + ".pmp_id=pmps.pmp_id AND  " + nameOfResourceTable
                        + ".pmps_id=pmps.pmps_id AND " + dateRangeCondition + restriction
                        + " GROUP BY pmsd.date_todo, " + resourceFieldStr;
        
        this.forecastResourceSelectDS =
                DataSourceFactory.createDataSource().addTable("pmsd").addTable("")
                    .addQuery(forecastResourceSelectSQL)
                    .addVirtualField("pmsd", "resource_type", DataSource.DATA_TYPE_TEXT)
                    .addVirtualField("pmsd", "hours_or_quantity", DataSource.DATA_TYPE_NUMBER)
                    .addVirtualField("pmsd", "resource_id", DataSource.DATA_TYPE_TEXT);
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format("Forecast resources ,  resource type is [{0}]",
                new Object[] { resourceType }));
        }
        // List r = forecastResourceSelectDS.getRecords();
        this.forecastResourceSelectDS.queryRecords(null, this);
    }
    
    /**
     * This method performs scheduled hours forecast. for given date range.
     * 
     * By Zhang Yi
     * 
     * @param dateRangeCondition : SQL string indicates the date range restriction.
     * 
     */
    public void forecastPM52W(final String dateRangeCondition) {
        
        if (this.forecastResourceType.equalsIgnoreCase(forecast_52W_Procedure)) {
            this.forecastResource = false;
            forecastDeleteRecords("pmpsum");
            forecast52W(this.restriction, dateRangeCondition);
            createPMForecastTradeHours("week proc");
        }
        
        if (this.forecastResourceType.equalsIgnoreCase(forecast_52W_Equipment)) {
            this.forecastResource = false;
            forecastDeleteRecords("pmpsum");
            forecast52W(this.restriction, dateRangeCondition);
            createPMForecastTradeHours("week EQ proc");
        }
        
        if (this.forecastResourceType.equalsIgnoreCase(forecast_52W_Labor)) {
            forecastDeleteRecords("pmressum");
            forecastResources(this.restriction, dateRangeCondition, "L", "pmpstr", "tr_id",
                "hours_req");
            createPMForecastTradeHours("week");
        }
        
        if (this.forecastResourceType.equalsIgnoreCase(forecast_12M_Labor)) {
            forecastDeleteRecords("pmressum");
            forecastResources(this.restriction, dateRangeCondition, "L", "pmpstr", "tr_id",
                "hours_req");
            createPMForecastTradeHours("month");
        }
    }
    
    private DataSource forecast52WSelectDS;
    
    private DataSource forecastResourceSelectDS;
    
    private DataSource pmpsumInsertDS;
    
    private DataSource pmressumInsertDS;
    
    /**
     * This method performs scheduled hours weekly forecast .
     * 
     * By Zhang Yi
     * 
     * @param restriction : Restriction string comes from JS client.
     * @param dateRangeCondition : SQL string indicates the date range restriction.
     * 
     */
    private void forecast52W(final String restriction, final String dateRangeCondition) {
        String selectClause = "", moreWhereClause = "", groupByClause = "";
        final String orderClause = "";
        
        if (this.forecastResourceType.equalsIgnoreCase(forecast_52W_Procedure)) {
            
            selectClause =
                    "SELECT pmsd.date_todo, 'N/A' AS eq_id, pmp.pmp_id AS pmp_id , pmpstr.tr_id AS tr_id ,"
                            + " SUM(pmpstr.hours_req) AS hours_req ";
            groupByClause = "GROUP BY pmsd.date_todo, pmp.pmp_id, pmpstr.tr_id  ";
            
        } else if (this.forecastResourceType.equalsIgnoreCase(forecast_52W_Equipment)) {
            selectClause =
                    "SELECT pmsd.date_todo, pms.eq_id AS eq_id , pmp.pmp_id AS pmp_id , 'N/A' AS tr_id , "
                            + "SUM(pmpstr.hours_req) AS hours_req ";
            moreWhereClause = " AND pms.eq_id IS NOT NULL ";
            groupByClause = "GROUP BY pmsd.date_todo, pms.eq_id, pmp.pmp_id  ";
        }
        
        final String fromClause =
                " FROM pmsd,pms,pmp,pmps,pmpstr WHERE pms.pms_id = pmsd.pms_id AND pmp.pmp_id =pms.pmp_id AND pmp.pmp_id=pmps.pmp_id AND pmpstr.pmps_id = pmps.pmps_id  AND pmpstr.pmp_id=pmps.pmp_id AND ";
        
        final String forecast52WSelectSQL =
                selectClause + fromClause + dateRangeCondition + moreWhereClause + restriction
                        + groupByClause + orderClause;
        
        this.forecast52WSelectDS =
                DataSourceFactory.createDataSource().addTable("pmsd")
                    .addQuery(forecast52WSelectSQL)
                    .addVirtualField("pmsd", "eq_id", DataSource.DATA_TYPE_TEXT)
                    .addVirtualField("pmsd", "pmp_id", DataSource.DATA_TYPE_TEXT)
                    .addVirtualField("pmsd", "tr_id", DataSource.DATA_TYPE_TEXT)
                    .addVirtualField("pmsd", "hours_req", DataSource.DATA_TYPE_NUMBER);
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Forecast resources within 52 week,  forecast type is [{0}]",
                new Object[] { this.forecastResourceType }));
        }
        
        this.forecast52WSelectDS.queryRecords(null, this);
    }
    
    /**
     * This method create datasource for temporary forecast table that will be inserted forecast
     * records.
     * 
     * By Zhang Yi
     * 
     */
    private void createDataSources() {
        
        this.pmpsumInsertDS =
                DataSourceFactory.createDataSourceForFields("pmpsum", new String[] { "date_todo",
                        "eq_id", "pmp_id", "tr_id", "hours" });
        
        this.pmressumInsertDS =
                DataSourceFactory.createDataSourceForFields("pmressum", new String[] { "date_todo",
                        "resource_type", "resource_id", "hours_or_quantity" });
        
    }
    
    /**
     * This method delete all records from temporary forecast table.
     * 
     * By Zhang Yi
     * 
     * @param tablename : specify the name that need to delete records
     * 
     */
    private void forecastDeleteRecords(final String tablename) {
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format("Deleting records from [{0}] ....",
                new Object[] { tablename }));
        }
        final String sql = "DELETE FROM " + tablename;
        
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable(tablename).addQuery(sql);
        ds.executeUpdate();
        //ds.commit();
    }
    
    /**
     * This method execute SQL to insert or update the records. of given table
     * 
     * By Zhang Yi
     * 
     * @param tablename : Table name that need to insert or update records
     * @param insertSql : SQL string to execute
     * 
     */
    private void forecastInsertOrUpdateRecords(final String tablename, final String insertSql) {
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Inserting or Updating records of table [{0}] , sql is [{1}] ...", new Object[] {
                        tablename, insertSql }));
        }
        
        final DataSource ds =
                DataSourceFactory.createDataSource().addTable(tablename).addQuery(insertSql);
        ds.executeUpdate();
        //ds.commit();
    }
    
    /**
     * Forecast trade hours for chosen resource type and period.
     */
    private String monthsBetweenSqlStr = "";
    
    private String weeksBetweenSqlStr = "";
    
    /**
     * This method execute SQL to create trade hours for chosen resource type and period.
     * 
     * By Zhang Yi
     * 
     * @param period : Forecast type that indicates which type of scheduled hours forecast, include
     *            Procedure Weekly, Equipment Weekly, Trade Weekly or Trade monthly.
     * 
     */
    private void createPMForecastTradeHours(final String period) {
        
        String tablePeriod = "";
        String resultsTable = "";
        String andClause = "";
        String selectClause = "";
        String idFields = "", idValues = "";
        int endNum = 0;
        if (period.equalsIgnoreCase("week") || period.equalsIgnoreCase("week proc")
                || period.equalsIgnoreCase("week EQ proc")) {
            tablePeriod = "week";
            resultsTable = "pmforecast_tr";
            endNum = 52;
            idFields = " (eq_id,pmp_id,tr_id) ";
            if (period.equalsIgnoreCase("week EQ proc")) {
                idValues = " eq_id,pmp_id,' ' ";
                andClause = " AND pmpsum.eq_id=" + resultsTable + ".eq_id ";
            }
            if (period.equalsIgnoreCase("week proc")) {
                idValues = " ' ',pmp_id,tr_id ";
                andClause = " AND pmpsum.tr_id=" + resultsTable + ".tr_id ";
            }
            if (period.equalsIgnoreCase("week")) {
                idValues = " ' ',' ',tr_id ";
            }
        }
        
        if (period.equalsIgnoreCase("month")) {
            endNum = 12;
            tablePeriod = "month";
            resultsTable = "pmforecast_trm";
            idFields = " (tr_id) ";
            idValues = " tr_id ";
        }
        
        if (this.log.isDebugEnabled()) {
            this.log.debug(MessageFormat.format(
                "Start to forecast trade hours of period [{0}] , temp table is [{1}].",
                new Object[] { tablePeriod, resultsTable }));
        }
        
        // ---- Delete data
        this.forecastDeleteRecords(resultsTable);
        
        if (period.equalsIgnoreCase("week proc") || period.equalsIgnoreCase("week EQ proc")) {
            final String insertSql =
                    " INSERT INTO " + resultsTable + idFields + " SELECT DISTINCT " + idValues
                            + " FROM pmpsum ";
            this.forecastInsertOrUpdateRecords(resultsTable, insertSql);
            selectClause =
                    "(SELECT SUM(hours) FROM pmpsum" + " WHERE pmpsum.pmp_id=" + resultsTable
                            + ".pmp_id" + andClause;
        }
        if (period.equalsIgnoreCase("week") || period.equalsIgnoreCase("month")) {
            final String insertSql =
                    " INSERT INTO " + resultsTable + idFields + " SELECT " + idValues + " FROM tr ";
            this.forecastInsertOrUpdateRecords(resultsTable, insertSql);
            selectClause =
                    "(SELECT SUM(hours_or_quantity) FROM pmressum" + " WHERE resource_id=tr_id ";
        }
        
        String strOfJ = "";
        int j = 0;
        final String actualWeeksBetweenSqlStr =
                this.weeksBetweenSqlStr.replaceAll("'date_todo'", "date_todo");
        final String actualMonthsBetweenSqlStr =
                this.monthsBetweenSqlStr.replaceAll("'date_todo'", "date_todo");
        for (int i = 0; i < endNum; i++) {
            j = i + 1;
            if (j < 10) {
                strOfJ = "0" + String.valueOf(j);
            } else {
                strOfJ = String.valueOf(j);
            }
            
            String updateSql =
                    "UPDATE " + resultsTable + " SET " + tablePeriod + "_" + strOfJ + " = "
                            + selectClause + "AND ";
            if (period.startsWith("week")) {
                updateSql =
                        updateSql + actualWeeksBetweenSqlStr + "<" + String.valueOf(i + 1) + "*7"
                                + " AND " + actualWeeksBetweenSqlStr + ">=" + String.valueOf(i)
                                + "*7)";
            } else {
                updateSql = updateSql + actualMonthsBetweenSqlStr + "=" + String.valueOf(i) + ")";
            }
            
            this.forecastInsertOrUpdateRecords(resultsTable, updateSql);
        }
    }
}
