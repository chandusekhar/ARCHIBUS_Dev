package com.archibus.service.space.metrics;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.JobBase;
import com.archibus.service.space.*;
import com.archibus.service.space.helper.SpaceTransactionUtil;
import com.archibus.utility.StringUtil;

/**
 * <p>
 * Class for calculating Trend Metric values for Space Transaction application.<br>
 * 
 * <p>
 * Justification: constant name "BL" reflects table name.
 * 
 */
@SuppressWarnings({ "PMD.ShortVariable" })
public final class SpaceTrendMetricsCollector extends JobBase {
    
    /**
     * Indicates table "bl".
     * 
     */
    private static final String BL = "bl";
    
    /**
     * Indicates field "bl_id".
     * 
     */
    private static final String BL_ID = "bl_id";
    
    /**
     * Indicates month interval.
     * 
     */
    private static final String INTERVAL_MONTH = "M";
    
    /**
     * Indicates quarter interval.
     * 
     */
    private static final String INTERVAL_QUARTER = "Q";
    
    /**
     * Indicates year interval.
     * 
     */
    private static final String INTERVAL_YEAR = "Y";
    
    /**
     * Indicates last date of November of year.
     * 
     */
    private static final int LAST_DAY_OF_YEAR = 31;
    
    /**
     * Indicates field name "metric_name".
     * 
     */
    private static final String METRIC_NAME = "metric_name";
    
    /**
     * Indicates array for metrics of 20.1 Space.
     * 
     */
    private static final String[] METRICS = { "department_area_x_month",
            "department_area_x_quarter", "department_area_x_year", "occupancy_count_x_bl_x_month",
            "occupancy_count_x_bl_x_quarter", "occupancy_count_x_bl_x_year",
            "em_capacity_x_bl_x_month" };
    
    /**
     * Indicates numbers of month within one year.
     * 
     */
    private static final int MONTH_NUMBERS = 12;
    
    /**
     * Indicates count of month within a quarter.
     * 
     */
    private static final int MONTH_OF_QUARTERS = 3;
    
    /**
     * Indicates int value 100.
     * 
     */
    private static final int NUMBER_100 = 100;
    
    /**
     * Indicates number 3.
     * 
     */
    private static final int NUMBER_3 = 3;
    
    /**
     * Indicates 100.
     * 
     */
    private static final int ONE_HUNDRED = 100;
    
    /**
     * Indicates table field "rm.area".
     * 
     */
    private static final String RM_AREA = "rm.area";
    
    /**
     * Indicates table field "rmpct.area_rm".
     * 
     */
    private static final String RMPCT_AREA_RM = "rmpct.area_rm";
    
    /**
     * Indicates table field "rmpct.bl_id".
     * 
     */
    private static final String RMPCT_BL_ID = "rmpct.bl_id";
    
    /**
     * Indicates table field "rmpct.dp_id".
     * 
     */
    private static final String RMPCT_DP_ID = "rmpct.dp_id";
    
    /**
     * Indicates table field "rmpct.dv_id".
     * 
     */
    private static final String RMPCT_DV_ID = "rmpct.dv_id";
    
    /**
     * Indicates table field "rmpct.em_id".
     * 
     */
    private static final String RMPCT_EM_ID = "rmpct.em_id";
    
    /**
     * Indicates table field "rmpct.pct_time".
     * 
     */
    private static final String RMPCT_PCT_TIME = "rmpct.pct_time";
    
    /**
     * Indicates table field "rmpct.status".
     * 
     */
    private static final String RMPCT_STATUS = "rmpct.status";
    
    /**
     * Indicates char "_".
     * 
     */
    private static final String SLASH = "|";
    
    /**
     * Indicates start year for collection.
     * 
     */
    private final int fromYear;
    
    /**
     * Indicates metric definition datasource.
     * 
     */
    private final DataSource metricDs;
    
    /**
     * Indicates metric value datasource.
     * 
     */
    private final DataSource metricValueDs;
    
    /**
     * Indicates metric value datasource.
     * 
     */
    private final DataSource rmpctJoinBlAndRmAndRmcatDs;
    
    /**
     * Indicates end year for collection.
     * 
     */
    private final int toYear;
    
    /**
     * Indicates the number of status increase for each year.
     * 
     */
    private final int yearStep;
    
    /**
     * Constructor.
     * 
     * @param fromYear int start year for collection
     * @param toYear int end year for collection
     */
    public SpaceTrendMetricsCollector(final String fromYear, final String toYear) {
        
        super();
        
        this.fromYear = Integer.valueOf(fromYear);
        this.toYear = Integer.valueOf(toYear);
        
        final int totalYears = this.toYear > this.fromYear ? this.toYear - this.fromYear + 1 : 1;
        this.yearStep = ONE_HUNDRED / totalYears;
        
        this.metricDs =
                DataSourceFactory.createDataSourceForFields("afm_metric_definitions", new String[] {
                        METRIC_NAME, "collect_frequency" });
        
        this.metricValueDs =
                DataSourceFactory.createDataSourceForFields("afm_metric_trend_values",
                    new String[] { METRIC_NAME, "metric_date", BL_ID, "dv_id", "dp_id",
                            "metric_value" });
        
        this.rmpctJoinBlAndRmAndRmcatDs =
                SpaceTransactionUtil.getRmpctHrmpctJoinBlAndRmAndRmcat(SpaceConstants.RMPCT);
    }
    
    /**
     * Return a Boolean indicates that if assignment contains null value for given fields.
     * 
     * 
     * @return a map that contains calculation results.
     * 
     *         Justification: Case#1 : Statement with SELECT ... sub queries pattern.
     * 
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private static Map<String, Double> getCalculationResultsForBuildingCapcity() {
        
        final DataSource blDS =
                DataSourceFactory.createDataSourceForFields(BL, new String[] { BL_ID });
        
        blDS.addQuery(
            " select bl.bl_id,(select sum(rm.cap_em) from rm where rm.bl_id=bl.bl_id) ${sql.as} cap from bl ")
            .addVirtualField(BL, "cap", DataSource.DATA_TYPE_INTEGER);
        final List<DataRecord> calculatedRecords = blDS.getRecords();
        final Map<String, Double> resultMap = new HashMap<String, Double>();
        
        for (final DataRecord record : calculatedRecords) {
            
            final String building = record.getString("bl.bl_id");
            resultMap.put(building, (double) record.getInt("bl.cap"));
        }
        return resultMap;
    }
    
    /**
     * Return a Boolean indicates that if assignment contains null value for given fields.
     * 
     * @param calculatedRmpcts List of calculated rmpct records.
     * 
     * @return a map that contains calculation results.
     */
    private static Map<String, Double> getCalculationResultsForBuildingOccupant(
    
    final List<DataRecord> calculatedRmpcts) {
        
        final Map<String, Double> resultMap = new HashMap<String, Double>();
        
        /*
         * "rmpct",
         * "UPDATE rm SET count_em = ${sql.isNull('(SELECT 1.00* SUM(rmpct.pct_time)/100 FROM rmpct "
         * +
         * " WHERE rmpct.bl_id = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND rmpct.em_id IS NOT NULL AND (rmpct.status=1 OR rmpct.status=3) )', 0)}"
         * );
         */
        for (final DataRecord record : calculatedRmpcts) {
            
            final String building = record.getString(RMPCT_BL_ID);
            if (!StringUtil.notNullOrEmpty(building)) {
                continue;
            }
            // final String[] key = new String[] { building, division, department };
            if (StringUtil.notNullOrEmpty(record.getString(RMPCT_EM_ID))
                    && record.getInt(RMPCT_STATUS) == 1) {
                
                if (resultMap.containsKey(building)) {
                    resultMap.put(building,
                        resultMap.get(building) + record.getDouble(RMPCT_PCT_TIME) / NUMBER_100);
                } else {
                    resultMap.put(building, record.getDouble(RMPCT_PCT_TIME) / NUMBER_100);
                }
            }
        }
        return resultMap;
    }
    
    /**
     * Return a Boolean indicates that if assignment contains null value for given fields.
     * 
     * @param calculatedRmpcts List of calculated rmpct records.
     * 
     * @return a map that contains calculation results.
     */
    private static Map<String, Double> getCalculationResultsForDepartmentArea(
    
    final List<DataRecord> calculatedRmpcts) {
        
        final Map<String, Double> resultMap = new HashMap<String, Double>();
        
        for (final DataRecord record : calculatedRmpcts) {
            
            final String building = record.getString(RMPCT_BL_ID);
            final String division = record.getString(RMPCT_DV_ID);
            final String department = record.getString(RMPCT_DP_ID);
            if (StringUtil.isNullOrEmpty(building) || StringUtil.isNullOrEmpty(division)
                    || StringUtil.isNullOrEmpty(department)) {
                continue;
            }
            // final String[] key = new String[] { building, division, department };
            final String key = building + SLASH + division + SLASH + department;
            if (resultMap.containsKey(key)) {
                resultMap.put(key, resultMap.get(key) + record.getDouble(RMPCT_AREA_RM));
            } else {
                resultMap.put(key, record.getDouble(RMPCT_AREA_RM));
            }
            
        }
        return resultMap;
    }
    
    /**
     * @return a date range contains a date value pair of start date and end date.
     * 
     * @param intervalType String frequency type: "m", "q" or "y"
     * @param calendar calculated date
     */
    private static Interval getInterval(final String intervalType, final Calendar calendar) {
        
        final Interval interval = new Interval();
        
        final int month = calendar.get(Calendar.MONTH);
        final int quarter = month / MONTH_OF_QUARTERS;
        final int year = calendar.get(Calendar.YEAR);
        
        interval.setYear(year);
        interval.setMonth(month);
        
        final boolean yearCondition =
                interval.getMonth() == Calendar.DECEMBER
                        && INTERVAL_YEAR.equalsIgnoreCase(intervalType);
        
        final boolean quarterCondition =
                interval.getMonth() % NUMBER_3 == 2
                        && INTERVAL_QUARTER.equalsIgnoreCase(intervalType);
        
        if (yearCondition) {
            
            calendar.set(year, Calendar.JANUARY, 1);
            interval.setFromDate(calendar.getTime());
            calendar.set(year, Calendar.DECEMBER, LAST_DAY_OF_YEAR);
            interval.setToDate(calendar.getTime());
            
        } else if (quarterCondition) {
            
            calendar.set(year, MONTH_OF_QUARTERS * quarter, 1);
            interval.setFromDate(calendar.getTime());
            calendar.set(Calendar.YEAR, year);
            calendar.set(Calendar.MONTH, MONTH_OF_QUARTERS * quarter + 2);
            calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
            interval.setToDate(calendar.getTime());
            
        } else if (INTERVAL_MONTH.equalsIgnoreCase(intervalType)) {
            calendar.set(year, month, 1);
            interval.setFromDate(calendar.getTime());
            calendar.set(year, month, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
            interval.setToDate(calendar.getTime());
            
        }
        calendar.set(Calendar.YEAR, interval.getYear());
        calendar.set(Calendar.MONTH, interval.getMonth());
        
        return interval;
    }
    
    /**
     * Return a date array contains a lot of date value pair of start date and end date.
     * 
     * @param calculationDS DataSource
     * @param restriction String restriction from console
     * @param interval Interval the date range interval object
     * @param tableName "rmpct" or "hrmpct" to calculate on
     * 
     * @return calculated rmpct records list
     */
    private static List<DataRecord> performSpaceTimeCalculation(final DataSource calculationDS,
            final String restriction, final Interval interval, final String tableName) {
        
        final List<DataRecord> records = calculationDS.getRecords(restriction);
        
        for (final DataRecord record : records) {
            // kb#3035702:make pct_time = 0 for records where status = 0
            if (record.getInt(RMPCT_STATUS) == 0) {
                record.setValue(RMPCT_PCT_TIME, 0.0);
            } else {
                AllRoomPercentageUpdate.updateSpaceTimeToRmpctHrmpctRecord(interval.getFromDate(),
                    interval.getToDate(), record, tableName);
            }
            
            final double pctSpace =
                    record.getDouble(tableName + SpaceConstants.DOT + SpaceConstants.PCT_SPACE);
            record.setValue(
                tableName + SpaceConstants.DOT + SpaceConstants.AREA_RM,
                pctSpace
                        * (record.getDouble(tableName + SpaceConstants.DOT
                                + SpaceConstants.PCT_TIME) / SpaceConstants.ONE_HUNDRED)
                        * record.getDouble(RM_AREA) / SpaceConstants.ONE_HUNDRED);
            
        }
        
        return records;
    }
    
    /**
     * Collect calculation result for trend metrics of Space Transaction application defined in
     * table afm_metric_definitions and store the values to afm_metric_trend_values.
     * 
     * @param calendar collect date
     * 
     */
    public void collectTrendMetrics(final Calendar calendar) {
        
        final int metricStep = this.yearStep / (METRICS.length * MONTH_NUMBERS);
        
        for (final String metric : METRICS) {
            
            final DataRecord metricRecord =
                    this.metricDs.getRecord(METRIC_NAME + "='" + metric + "'");
            
            final String frequency =
                    metricRecord.getString("afm_metric_definitions.collect_frequency");
            
            final int month = calendar.get(Calendar.MONTH);
            final boolean yearCondition =
                    month == Calendar.DECEMBER && INTERVAL_YEAR.equalsIgnoreCase(frequency);
            
            final boolean quarterCondition =
                    month % NUMBER_3 == 2 && INTERVAL_QUARTER.equalsIgnoreCase(frequency);
            
            if (yearCondition || quarterCondition || INTERVAL_MONTH.equalsIgnoreCase(frequency)) {
                final Interval interval = getInterval(frequency, calendar);
                
                // call existed method to calculate rmpct.area_alloc values to use to roll up values
                // per time period; as well as rm.count_em.
                final List<DataRecord> calculatedRmpcts =
                        performSpaceTimeCalculation(this.rmpctJoinBlAndRmAndRmcatDs, "", interval,
                            SpaceConstants.RMPCT);
                
                Map<String, Double> results = null;
                if (metric.lastIndexOf("area") > -1) {
                    
                    results = getCalculationResultsForDepartmentArea(calculatedRmpcts);
                    
                } else if (metric.lastIndexOf("count") > -1) {
                    // calculate bl.count_em by SUM(rmpct.pct_time)/100 FROM rmpct WHERE rmpct.bl_id
                    // = rm.bl_id AND rmpct.fl_id = rm.fl_id AND rmpct.rm_id = rm.rm_id AND
                    // rmpct.em_id IS NOT NULL AND (rmpct.status=1 OR rmpct.status=3) )', 0)}"
                    results = getCalculationResultsForBuildingOccupant(calculatedRmpcts);
                    
                } else if (metric.lastIndexOf("capacity") > -1) {
                    
                    results = getCalculationResultsForBuildingCapcity();
                }
                
                deleteDuplicatedRecords(metric, interval);
                
                saveMetricValueRecords(metric, results, interval);
                
            }
            this.status.setCurrentNumber(this.status.getCurrentNumber() + metricStep);
        }
        
    }
    
    /**
     * Runs the work order generation process.
     */
    @Override
    public void run() {
        
        this.status.setTotalNumber(ONE_HUNDRED);
        
        this.status.setCurrentNumber(0);
        // Called from "Collect" button on client side
        if (this.fromYear > 0) {
            // for each month between from year and to year, collect trend metric values
            for (int year = this.fromYear; year <= this.toYear; year++) {
                
                for (int month = 0; month < MONTH_NUMBERS; month++) {
                    final Calendar calendar = Calendar.getInstance();
                    calendar.set(Calendar.YEAR, year);
                    calendar.set(Calendar.MONTH, month);
                    collectTrendMetrics(calendar);
                }
                
                this.status.setCurrentNumber((year - this.fromYear + 1) * this.yearStep);
                
            }
            
        } else {
            // Called as a schedule workflow rule
            final Calendar calendar = Calendar.getInstance();
            final int month = calendar.get(Calendar.MONTH);
            final int year = calendar.get(Calendar.YEAR);
            // Store
            if (month == Calendar.JANUARY) {
                calendar.set(Calendar.YEAR, year - 1);
                calendar.set(Calendar.MONTH, Calendar.DECEMBER);
                
            } else {
                calendar.set(Calendar.YEAR, year);
                calendar.set(Calendar.MONTH, month - 1);
            }
            
            collectTrendMetrics(calendar);
        }
        
    }
    
    /**
     * Delete previous records that are duplicated creating ones.
     * 
     * @param metric String metric name
     * @param interval Interval the date range interval object
     * 
     *            Justification: Case#2.3 : Statement with DELETE ... WHERE pattern.
     * 
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void deleteDuplicatedRecords(final String metric, final Interval interval) {
        
        final String month =
                interval.getMonth() > Calendar.SEPTEMBER ? String.valueOf(interval.getMonth() + 1)
                        : "0" + (interval.getMonth() + 1);
        
        final String deleteSQL =
                " delete from afm_metric_trend_values where METRIC_NAME='" + metric
                        + "' and ${sql.yearOf('metric_date')}='" + interval.getYear()
                        + "' and ${sql.yearMonthOf('metric_date')}='" + interval.getYear() + "-"
                        + month + "' ";
        
        this.metricValueDs.addQuery(deleteSQL).executeUpdate();
    }
    
    /**
     * Create and save metric value records by calculated results Map from rmpct records.
     * 
     * @param metric String metric name
     * @param results Map calculated results Map from rmpct records.
     * @param interval Interval the date range interval object
     * */
    private void saveMetricValueRecords(final String metric, final Map<String, Double> results,
            final Interval interval) {
        
        final Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.YEAR, interval.getYear());
        calendar.set(Calendar.MONTH, interval.getMonth());
        calendar.set(Calendar.DAY_OF_MONTH, calendar.getActualMaximum(Calendar.DAY_OF_MONTH));
        
        if (results != null) {
            for (final String key : results.keySet()) {
                
                final DataRecord metricValueRecord = this.metricValueDs.createNewRecord();
                
                metricValueRecord
                    .setValue("afm_metric_trend_values.metric_value", results.get(key));
                
                metricValueRecord.setValue("afm_metric_trend_values.metric_name", metric);
                
                metricValueRecord.setValue("afm_metric_trend_values.metric_date",
                    calendar.getTime());
                
                final String[] keys = key.split("\\|");
                
                metricValueRecord.setValue("afm_metric_trend_values.bl_id", keys[0]);
                if (keys.length > 1) {
                    metricValueRecord.setValue("afm_metric_trend_values.dv_id", keys[1]);
                }
                if (keys.length > 2) {
                    metricValueRecord.setValue("afm_metric_trend_values.dp_id", keys[2]);
                }
                
                this.metricValueDs.saveRecord(metricValueRecord);
            }
        }
    }
    
}