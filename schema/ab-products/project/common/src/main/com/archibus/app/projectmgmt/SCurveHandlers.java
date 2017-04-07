package com.archibus.app.projectmgmt;

import java.util.List;

import org.apache.log4j.Logger;
import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Provides methods for generating cumulative data of Work and Costs from the activity_log table to
 * display in S-Curve charts.
 * 
 * Suppress PMD warning "AvoidUsingSql".
 * <p>
 * Justification: Exception #1: Join with a subquery.
 * 
 */

@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class SCurveHandlers extends JobBase {
    
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Returns Person-Hours and Costs grouped by time period.
     * 
     * @param restriction Activity table restriction.
     * @param minDate Earliest activity_log start date.
     * @param toDate To Date provided by user console input.
     * @param type 0 = Baseline, 1 = Design, 2 = Actual.
     * @param groupingType "date", "week", "month", "quarter", "year"
     * 
     * @return List<DataRecord>.
     */
    private List<DataRecord> getActivityLogTotals(final String restriction,
            final java.sql.Date minDate, final java.sql.Date toDate, final int type,
            final String groupingType) {
        
        final String dateSql = CostsCommon.getDateSql(groupingType);
        final String datePart = CostsCommon.getDatePart();
        final String nvl = CostsCommon.getNvl();
        final String top = CostsCommon.getTop();
        
        final String sql =
                "SELECT   "
                        + top
                        + dateSql
                        + " ${sql.as} date_field,  "
                        + nvl
                        + "(  SUM(CASE WHEN "
                        + Constants.DURATION_FIELDS[type]
                        + " = 0 THEN "
                        + Constants.HOURS_FIELDS[type]
                        + "  ELSE ("
                        + Constants.HOURS_FIELDS[type]
                        + ") / (1.000*"
                        + Constants.DURATION_FIELDS[type]
                        + ") END), 0) ${sql.as} prsnhrs, "
                        + nvl
                        + "(SUM(CASE WHEN "
                        + Constants.DURATION_FIELDS[type]
                        + " = 0 THEN ("
                        + Constants.COSTCAP_FIELDS[type]
                        + " +   "
                        + Constants.COSTEXP_FIELDS[type]
                        + ") ELSE ("
                        + Constants.COSTCAP_FIELDS[type]
                        + " + "
                        + Constants.COSTEXP_FIELDS[type]
                        + ")/(1.000*"
                        + Constants.DURATION_FIELDS[type]
                        + ") END), 0) ${sql.as} costs "
                        + "FROM   afm_cal_dates "
                        + "LEFT OUTER JOIN "
                        + "(SELECT activity_log.activity_log_id, "
                        + Constants.DATESTART_FIELDS[type]
                        + ",      "
                        + Constants.DATEEND_FIELDS[type]
                        + ",  "
                        + Constants.HOURS_FIELDS[type]
                        + ",   "
                        + Constants.DURATION_FIELDS[type]
                        + ",    "
                        + Constants.COSTCAP_FIELDS[type]
                        + ",        "
                        + Constants.COSTEXP_FIELDS[type]
                        + ", "
                        + "(CASE WHEN activity_log.work_pkg_id IS NULL  "
                        + "THEN project.days_per_week ELSE work_pkgs.days_per_week  "
                        + "END) ${sql.as} days_per_week "
                        + "FROM activity_log  "
                        + "LEFT OUTER JOIN work_pkgs ON (work_pkgs.work_pkg_id = activity_log.work_pkg_id AND work_pkgs.project_id = activity_log.project_id) "
                        + "LEFT OUTER JOIN project ON project.project_id = activity_log.project_id "
                        + "LEFT OUTER JOIN site ON site.site_id = project.site_id "
                        + "LEFT OUTER JOIN bl ON bl.bl_id = project.bl_id "
                        + "LEFT OUTER JOIN program ON program.program_id = project.program_id "
                        + "WHERE " + restriction + "    ) ${sql.as} activity_log "
                        + "ON ((afm_cal_dates.cal_date >= " + Constants.DATESTART_FIELDS[type]
                        + " " + "AND afm_cal_dates.cal_date <= " + Constants.DATEEND_FIELDS[type]
                        + " )  " + "AND ((CASE WHEN (" + datePart + ") = 0 THEN 7  " + "WHEN "
                        + Constants.DURATION_FIELDS[type] + " = 0 THEN 1  " + "ELSE (" + datePart
                        + ")  " + "END) <= activity_log.days_per_week)) "
                        + "WHERE (${sql.yearMonthDayOf('afm_cal_dates.cal_date')}   >= '" + minDate
                        + "' " + "AND ${sql.yearMonthDayOf('afm_cal_dates.cal_date')} <= '"
                        + toDate + "')   " + " GROUP BY " + dateSql + "  ORDER BY date_field";
        
        final DataSource dsTotals = DataSourceFactory.createDataSource();
        dsTotals.addTable(Constants.AFM_CAL_DATES_TABLE, DataSource.ROLE_MAIN);
        dsTotals.addVirtualField(Constants.AFM_CAL_DATES_TABLE, Constants.DATE_FIELD,
            DataSource.DATA_TYPE_TEXT);
        dsTotals.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "prsnhrs",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsTotals.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "costs",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsTotals.addSort(Constants.AFM_CAL_DATES_TABLE, Constants.DATE_FIELD);
        dsTotals.addQuery(sql);
        
        return dsTotals.getAllRecords();
    }
    
    /**
     * 
     * Generates cumulative and incremental data for S-Curve charts.
     * 
     * @param context Context.
     */
    public void getChartData(final EventHandlerContext context) {
        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCurrentNumber(0);
            this.status.setCode(JobStatus.JOB_STARTED);
            
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                final String activityRestriction = context.getString("activityRestriction");
                final java.sql.Date minDate = java.sql.Date.valueOf(context.getString("minDate"));
                final java.sql.Date fromDate = java.sql.Date.valueOf(context.getString("fromDate"));
                final java.sql.Date toDate = java.sql.Date.valueOf(context.getString("toDate"));
                final String groupingType = context.getString("groupBy");
                
                final JSONArray jsonRecords =
                        getCumulativeChartData(activityRestriction, fromDate, toDate, minDate,
                            groupingType);
                context.addResponseParameter("jsonExpression", jsonRecords.toString());
                this.status.setCurrentNumber(Constants.PROGRESS_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            throw new ExceptionBase(Constants.MESSAGE_FAILED_RETRIEVE_RECORDS, e);
        }
    }
    
    /**
     * Returns a JSONArray used to display data in a chart. Baseline, Design, and Actual values are
     * calculated separately and copied to a JSONArray. Cumulative results for Baseline, Design, and
     * Actual values are summed from the earliest date in the activity log table for the specified
     * restriction.
     * 
     * @param activityRestriction String Activity table restriction.
     * @param fromDate java.sql.Date From Date provided by user console input.
     * @param toDate java.sql.Date To Date provided by user console input.
     * @param minDate java.sql.Date Earliest Date in activity_log table for restriction.
     * @param groupingType String grouping type "date", "week", "month", "quarter", "year".
     * 
     * @return JSONArray.
     */
    private JSONArray getCumulativeChartData(final String activityRestriction,
            final java.sql.Date fromDate, final java.sql.Date toDate, final java.sql.Date minDate,
            final String groupingType) {
        
        final String fromDateGroup = CostsCommon.getDateGroup(fromDate, groupingType);
        final java.util.Date today = new java.util.Date();
        final String currentDateGroup =
                CostsCommon.getDateGroup(new java.sql.Date(today.getTime()), groupingType);
        
        final List<DataRecord> baselineRecords =
                getActivityLogTotals(activityRestriction, minDate, toDate, 0, groupingType);
        this.status.setCurrentNumber(Constants.PROGRESS_25);
        final List<DataRecord> designRecords =
                getActivityLogTotals(activityRestriction, minDate, toDate, 1, groupingType);
        this.status.setCurrentNumber(Constants.PROGRESS_50);
        final List<DataRecord> actualRecords =
                getActivityLogTotals(activityRestriction, minDate, toDate, 2, groupingType);
        this.status.setCurrentNumber(Constants.PROGRESS_75);
        
        final JSONArray jsonRecords = new JSONArray();
        double cumprsnhrsBase = 0;
        double cumcostsBase = 0;
        double cumprsnhrsDesign = 0;
        double cumcostsDesign = 0;
        double cumprsnhrsAct = 0;
        double cumcostsAct = 0;
        
        for (int i = 0; i < baselineRecords.size(); i++) {
            final DataRecord baselineRecord = baselineRecords.get(i);
            final DataRecord designRecord = designRecords.get(i);
            final DataRecord actualRecord = actualRecords.get(i);
            
            cumprsnhrsBase += baselineRecord.getDouble(Constants.PRSNHRS_FIELD);
            cumcostsBase += baselineRecord.getDouble(Constants.COSTS_FIELD);
            cumprsnhrsDesign += designRecord.getDouble(Constants.PRSNHRS_FIELD);
            cumcostsDesign += designRecord.getDouble(Constants.COSTS_FIELD);
            cumprsnhrsAct += actualRecord.getDouble(Constants.PRSNHRS_FIELD);
            cumcostsAct += actualRecord.getDouble(Constants.COSTS_FIELD);
            
            final String dateField = baselineRecord.getString(Constants.FULL_DATE_FIELD);
            if (dateField.compareTo(fromDateGroup) < 0) {
                continue;
            }
            
            final JSONObject data = new JSONObject();
            data.put(Constants.FULL_DATE_FIELD, dateField);
            data.put(Constants.PRSNHRS_FIELD + Constants.SUFFIX_BASE,
                baselineRecord.getDouble(Constants.PRSNHRS_FIELD));
            data.put(Constants.CUMPRSNHRS_FIELD + Constants.SUFFIX_BASE, cumprsnhrsBase);
            data.put(Constants.PRSNHRS_FIELD + Constants.SUFFIX_DESIGN,
                designRecord.getDouble(Constants.PRSNHRS_FIELD));
            data.put(Constants.CUMPRSNHRS_FIELD + Constants.SUFFIX_DESIGN, cumprsnhrsDesign);
            data.put(Constants.COSTS_FIELD + Constants.SUFFIX_BASE,
                baselineRecord.getDouble(Constants.COSTS_FIELD));
            data.put(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_BASE, cumcostsBase);
            data.put(Constants.COSTS_FIELD + Constants.SUFFIX_DESIGN,
                designRecord.getDouble(Constants.COSTS_FIELD));
            data.put(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_DESIGN, cumcostsDesign);
            
            if (dateField.compareTo(currentDateGroup) <= 0) {
                data.put(Constants.PRSNHRS_FIELD + Constants.SUFFIX_ACT,
                    actualRecord.getDouble(Constants.PRSNHRS_FIELD));
                data.put(Constants.CUMPRSNHRS_FIELD + Constants.SUFFIX_ACT, cumprsnhrsAct);
                data.put(Constants.COSTS_FIELD + Constants.SUFFIX_ACT,
                    actualRecord.getDouble(Constants.COSTS_FIELD));
                data.put(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_ACT, cumcostsAct);
            }
            
            jsonRecords.put(data);
        }
        return jsonRecords;
    }
    
    /**
     * 
     * Generates cumulative data for report grid.
     * 
     * @param activityRestriction String Activity table restriction.
     * @param fromDate java.sql.Date From Date provided by user console input.
     * @param toDate java.sql.Date To Date provided by user console input.
     * @param minDate java.sql.Date Earliest Date in activity_log table for restriction.
     * @param groupingType String grouping type -- Date, Month, Year.
     */
    public void getGridData(final String activityRestriction, final java.sql.Date fromDate,
            final java.sql.Date toDate, final java.sql.Date minDate, final String groupingType) {
        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);
            
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                final List<DataRecord> baselineRecords =
                        getActivityLogTotals(activityRestriction, minDate, toDate, 0, groupingType);
                this.status.setCurrentNumber(Constants.PROGRESS_25);
                final List<DataRecord> designRecords =
                        getActivityLogTotals(activityRestriction, minDate, toDate, 1, groupingType);
                this.status.setCurrentNumber(Constants.PROGRESS_50);
                final List<DataRecord> actualRecords =
                        getActivityLogTotals(activityRestriction, minDate, toDate, 2, groupingType);
                this.status.setCurrentNumber(Constants.PROGRESS_75);
                
                final List<DataRecord> records =
                        getCumulativeGridData(baselineRecords, designRecords, actualRecords,
                            fromDate, toDate, groupingType);
                this.status.setDataSet(new DataSetList(records));
                this.status.setCurrentNumber(Constants.PROGRESS_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {
            
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(Constants.MESSAGE_FAILED_RETRIEVE_RECORDS, e);
        }
    }
    
    /**
     * Returns a list of records used to display data in a report. Baseline, Design, and Actual
     * values are calculated separately and merged into a single record list spanning console date
     * range. Cumulative results for Baseline, Design, and Actual values are summed from the
     * earliest date in the activity log table for the specified restriction.
     * 
     * @param baselineRecords List<DataRecord> Baseline values.
     * @param designRecords List<DataRecord> Design values.
     * @param actualRecords List<DataRecord> Actual values.
     * @param fromDate java.sql.Date From Date provided by user console input.
     * @param toDate java.sql.Date To Date provided by user console input.
     * @param groupingType String grouping type "date", "week", "month", "quarter", "year".
     * 
     * @return List<DataRecord>.
     */
    private List<DataRecord> getCumulativeGridData(final List<DataRecord> baselineRecords,
            final List<DataRecord> designRecords, final List<DataRecord> actualRecords,
            final java.sql.Date fromDate, final java.sql.Date toDate, final String groupingType) {
        final List<DataRecord> records = getEmptyCumulativeRecords(fromDate, toDate, groupingType);
        final java.util.Date today = new java.util.Date();
        final String currentDateGroup =
                CostsCommon.getDateGroup(new java.sql.Date(today.getTime()), groupingType);
        
        double cumprsnhrsBase = 0;
        double cumcostsBase = 0;
        double cumprsnhrsDesign = 0;
        double cumcostsDesign = 0;
        double cumprsnhrsAct = 0;
        double cumcostsAct = 0;
        int position = 0;
        
        for (final DataRecord record : records) {
            
            for (int j = position; j < baselineRecords.size(); j++) {
                final DataRecord baselineRecord = baselineRecords.get(j);
                final DataRecord designRecord = designRecords.get(j);
                final DataRecord actualRecord = actualRecords.get(j);
                
                final String dateField = record.getString(Constants.FULL_DATE_FIELD);
                final String dateFieldBase = baselineRecord.getString(Constants.FULL_DATE_FIELD);
                if (dateFieldBase.compareTo(dateField) > 0) {
                    break;
                }
                
                cumprsnhrsBase += baselineRecord.getDouble(Constants.PRSNHRS_FIELD);
                cumcostsBase += baselineRecord.getDouble(Constants.COSTS_FIELD);
                cumprsnhrsDesign += designRecord.getDouble(Constants.PRSNHRS_FIELD);
                cumcostsDesign += designRecord.getDouble(Constants.COSTS_FIELD);
                cumprsnhrsAct += actualRecord.getDouble(Constants.PRSNHRS_FIELD);
                cumcostsAct += actualRecord.getDouble(Constants.COSTS_FIELD);
                
                if (dateFieldBase.compareTo(dateField) < 0) {
                    continue;
                }
                
                record.setValue(Constants.FULL_DATE_FIELD, dateField);
                record.setValue(Constants.PRSNHRS_FIELD + Constants.SUFFIX_BASE,
                    baselineRecord.getDouble(Constants.PRSNHRS_FIELD));
                record.setValue(Constants.CUMPRSNHRS_FIELD + Constants.SUFFIX_BASE, cumprsnhrsBase);
                record.setValue(Constants.PRSNHRS_FIELD + Constants.SUFFIX_DESIGN,
                    designRecord.getDouble(Constants.PRSNHRS_FIELD));
                record.setValue(Constants.CUMPRSNHRS_FIELD + Constants.SUFFIX_DESIGN,
                    cumprsnhrsDesign);
                record.setValue(Constants.COSTS_FIELD + Constants.SUFFIX_BASE,
                    baselineRecord.getDouble(Constants.COSTS_FIELD));
                record.setValue(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_BASE, cumcostsBase);
                record.setValue(Constants.COSTS_FIELD + Constants.SUFFIX_DESIGN,
                    designRecord.getDouble(Constants.COSTS_FIELD));
                record.setValue(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_DESIGN, cumcostsDesign);
                
                if (dateFieldBase.compareTo(currentDateGroup) <= 0) {
                    record.setValue(Constants.PRSNHRS_FIELD + Constants.SUFFIX_ACT,
                        actualRecord.getDouble(Constants.PRSNHRS_FIELD));
                    record.setValue(Constants.CUMPRSNHRS_FIELD + Constants.SUFFIX_ACT,
                        cumprsnhrsAct);
                    record.setValue(Constants.COSTS_FIELD + Constants.SUFFIX_ACT,
                        actualRecord.getDouble(Constants.COSTS_FIELD));
                    record.setValue(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_ACT, cumcostsAct);
                } else {
                    record.setValue(Constants.PRSNHRS_FIELD + Constants.SUFFIX_ACT, null);
                    record.setValue(Constants.CUMPRSNHRS_FIELD + Constants.SUFFIX_ACT, null);
                    record.setValue(Constants.COSTS_FIELD + Constants.SUFFIX_ACT, null);
                    record.setValue(Constants.CUMCOSTS_FIELD + Constants.SUFFIX_ACT, null);
                }
                position = j + 1;
                break;
            }
        }
        return records;
    }
    
    /**
     * Returns a list of records containing all dates within specified date range grouped by Date,
     * Month or Year.
     * 
     * @param fromDate java.sql.Date From Date provided by user console input.
     * @param toDate java.sql.Date To Date provided by user console input.
     * @param groupingType String grouping type "date", "week", "month", "quarter", "year".
     * 
     * @return List<DataRecord>.
     */
    private List<DataRecord> getEmptyCumulativeRecords(final java.sql.Date fromDate,
            final java.sql.Date toDate, final String groupingType) {
        final String dateSql = CostsCommon.getDateSql(groupingType);
        final String top = CostsCommon.getTop();
        
        final String query =
                "SELECT " + top + dateSql + " ${sql.as} date_field, "
                        + "0 ${sql.as} prsnhrs_base, " + "0 ${sql.as} cumprsnhrs_base, "
                        + "0 ${sql.as} costs_base, " + "0 ${sql.as} cumcosts_base, "
                        + "0 ${sql.as} prsnhrs_design, " + "0 ${sql.as} cumprsnhrs_design, "
                        + "0 ${sql.as} costs_design, " + "0 ${sql.as} cumcosts_design, "
                        + "0 ${sql.as} prsnhrs_act, " + "0 ${sql.as} cumprsnhrs_act, "
                        + "0 ${sql.as} costs_act, " + "0 ${sql.as} cumcosts_act "
                        + "FROM afm_cal_dates "
                        + "WHERE (${sql.yearMonthDayOf('afm_cal_dates.cal_date')} >= '" + fromDate
                        + "') AND (${sql.yearMonthDayOf('afm_cal_dates.cal_date')} <= '" + toDate
                        + "') " + "GROUP BY " + dateSql + " ORDER BY date_field";
        final DataSource dsDates = DataSourceFactory.createDataSource();
        dsDates.addTable(Constants.AFM_CAL_DATES_TABLE, DataSource.ROLE_MAIN);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, Constants.DATE_FIELD,
            DataSource.DATA_TYPE_TEXT);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "prsnhrs_base",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "cumprsnhrs_base",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "costs_base",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "cumcosts_base",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "prsnhrs_design",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "cumprsnhrs_design",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "costs_design",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "cumcosts_design",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "prsnhrs_act",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "cumprsnhrs_act",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "costs_act",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addVirtualField(Constants.AFM_CAL_DATES_TABLE, "cumcosts_act",
            DataSource.DATA_TYPE_NUMBER, Constants.SIZE_18, Constants.DECIMALS_2);
        dsDates.addSort(Constants.AFM_CAL_DATES_TABLE, Constants.DATE_FIELD);
        dsDates.addQuery(query);
        
        return dsDates.getAllRecords();
    }
}
