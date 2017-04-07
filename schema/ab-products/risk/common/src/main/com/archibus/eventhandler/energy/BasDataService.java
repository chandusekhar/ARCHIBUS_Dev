package com.archibus.eventhandler.energy;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * BasDataService - This class handles processing of BAS (Building Automation Systems) data
 *
 * History: <li>21.3 Initial implementation.
 *
 * Suppress PMD warning "AvoidUsingSql".
 * <p>
 * Justification: Case #1: SQL statements with subqueries.
 *
 * @author Kaori Emery
 */

@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class BasDataService extends JobBase {
    /**
     * processAllBasDataRecords - Retrieve all year-month groupings for bas_data_clean_num data for
     * selected data point.
     *
     * For each month, call updateBasDataCleanNum to update the bas_data_clean_num table with delta
     * values and update process_status to 'PROCESSED' or 'ANOMALY'.
     *
     * Call updateBasDataTimeNormNumHourly and updateBasDataTimeNormNumCumulative to update the
     * bas_data_time_norm_num table.
     *
     * @param dataPointId Data_point_id
     */
    public void processAllBasDataRecords(final String dataPointId) {
        try {
            this.status.setTotalNumber(BasConstants.NO_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);

            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                this.status.setCurrentNumber(BasConstants.NO_25);

                final DataSource dataSource =
                        DataSourceFactory.loadDataSourceFromFile(BasConstants.EDIT_VIEW_NAME,
                            BasConstants.ENERGY_BAS_EDIT_DS2);

                dataSource.addParameter(BasConstants.ID_STRING, dataPointId,
                    DataSource.DATA_TYPE_INTEGER);
                final List<DataRecord> records = dataSource.getRecords();

                String yearMonth = "";
                int index = 0;
                for (final DataRecord record : records) {
                    yearMonth = record.getString(BasConstants.FIELD_YEAR_MONTH);
                    updateBasDataCleanNum(dataPointId, yearMonth, true);
                    setBasDataTimeNormUntilWeek(dataPointId, yearMonth, true, null);
                    index++;
                    this.status.setCurrentNumber(BasConstants.NO_25
                            + (index * BasConstants.NO_90 / records.size()));
                    if (this.status.isStopRequested()
                            || this.status.getCode() == JobStatus.JOB_STOPPED
                            || this.status.getCode() == JobStatus.JOB_STOP_ACKNOWLEDGED) {
                        this.status.setCode(JobStatus.JOB_STOPPED);
                        break;
                    }
                }

                String firstYearMonth = "";
                if (!records.isEmpty()) {
                    firstYearMonth = records.get(0).getString(BasConstants.FIELD_YEAR_MONTH);
                    setBasDataTimeNormUntilYear(dataPointId, firstYearMonth, null);

                    setVirtualMetersForSelectedMeter(dataPointId, records, firstYearMonth, true);
                }

                if (this.status.getCode() != JobStatus.JOB_STOPPED) {
                    this.status.setCurrentNumber(BasConstants.NO_100);
                    this.status.setCode(JobStatus.JOB_COMPLETE);
                }
            }
        } catch (final ExceptionBase e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(BasConstants.FAILED_UPDATE, e);
        }
    }

    /**
     *
     * setBasDataTimeNormUntilYear calls updateBasDatatimeCumulatiive for each interval starting
     * with week.
     *
     * getInterval returns the following values: 3: Weekly Meter. 4: Monthly Meter. 5: Quarterly
     * Meter. 6: Yearly Meter. Default: 0: 1: 2: 15-Min/Hourly/Daily Meters.
     *
     * Find any virtual meters which include or exclude the passed data point ID. Call
     * updateBasDataTimeNormUntilWeek for these virtual meters.
     *
     * 23.1 Add parameter yearMonth to give earliest month to process.
     *
     * @param dataPointId - Data_point_id
     * @param yearMonth - earliest year-month to process
     * @param virtualMeterRecord - Virtual meter
     */
    public void setBasDataTimeNormUntilYear(final String dataPointId, final String yearMonth,
            final DataRecord virtualMeterRecord) {
        final int interval = TimePeriodUtilService.getInterval(dataPointId);
        switch (interval) {
            case BasConstants.NO_3:
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.WEEK, yearMonth,
                    virtualMeterRecord);
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.MONTH, yearMonth,
                    virtualMeterRecord);
                updateCumulativeFromMonthlyAggs(dataPointId, BasConstants.QUARTER, yearMonth,
                    virtualMeterRecord);
                updateCumulativeFromMonthlyAggs(dataPointId, BasConstants.YEAR, yearMonth,
                    virtualMeterRecord);
                break;
            case BasConstants.NO_4:
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.MONTH, yearMonth,
                    virtualMeterRecord);
                updateCumulativeFromMonthlyAggs(dataPointId, BasConstants.QUARTER, yearMonth,
                    virtualMeterRecord);
                updateCumulativeFromMonthlyAggs(dataPointId, BasConstants.YEAR, yearMonth,
                    virtualMeterRecord);
                break;
            case BasConstants.NO_5:
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.QUARTER, yearMonth,
                    virtualMeterRecord);
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.YEAR, yearMonth,
                    virtualMeterRecord);
                break;
            case BasConstants.NO_6:
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.YEAR, yearMonth,
                    virtualMeterRecord);
                break;
            default:
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.WEEK, yearMonth,
                    virtualMeterRecord);
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.MONTH, yearMonth,
                    virtualMeterRecord);
                updateCumulativeFromMonthlyAggs(dataPointId, BasConstants.QUARTER, yearMonth,
                    virtualMeterRecord);
                updateCumulativeFromMonthlyAggs(dataPointId, BasConstants.YEAR, yearMonth,
                    virtualMeterRecord);
                break;
        }
    }

    /**
     *
     * setBasDataTimeNormUntilWeek calls updateBasDataTimeNormNumFifteenMinutes for 15-MIN
     * processing , updateBasDataTimeNormNumHourly for Hourly processing and
     * updateBasDataTimeNormNumCumulative for daily processing.
     *
     * Find any virtual meters which include or exclude the passed data point ID. Call
     * updateBasDataTimeNormUntilWeek for these virtual meters.
     *
     * @param dataPointId -Data_point_id
     * @param yearMonth - The year and the month
     * @param isAll - process all or not
     * @param virtualMeterRecord - DataRecord Virtual meter
     */
    public void setBasDataTimeNormUntilWeek(final String dataPointId, final String yearMonth,
            final boolean isAll, final DataRecord virtualMeterRecord) {
        final int interval = TimePeriodUtilService.getInterval(dataPointId);
        switch (interval) {
            case 0:
                updateBasDataTimeNormNumFifteenMinutes(dataPointId, yearMonth, isAll,
                    virtualMeterRecord);
                updateBasDataTimeNormNumHourly(dataPointId, yearMonth, isAll, virtualMeterRecord);
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.DAY, yearMonth,
                    virtualMeterRecord);
                break;
            case 1:
                updateBasDataTimeNormNumHourly(dataPointId, yearMonth, isAll, virtualMeterRecord);
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.DAY, yearMonth,
                    virtualMeterRecord);
                break;
            case 2:
                updateBasDataTimeNormNumCumulative(dataPointId, BasConstants.DAY, yearMonth,
                    virtualMeterRecord);
                break;
            default:
                break;
        }
    }

    /**
     * processBasDataRecords - Call updateBasDataCleanNum to update the bas_data_clean_num table
     * with delta values and update process_status to 'PROCESSED' or 'ANOMALY'.
     *
     * Call updateBasDataTimeNormNumHourly and updateBasDataTimeNormNumCumulative to update the
     * bas_data_time_norm_num table.
     *
     * @param dataPointId Data_point_id
     * @param yearMonth Year-Month grouping to process
     */
    public void processBasDataRecords(final String dataPointId, final String yearMonth) {
        try {
            this.status.setTotalNumber(BasConstants.NO_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);

            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                this.status.setCurrentNumber(BasConstants.NO_25);
                updateBasDataCleanNum(dataPointId, yearMonth, false);
                this.status.setCurrentNumber(BasConstants.NO_50);
                setBasDataTimeNormUntilWeek(dataPointId, yearMonth, false, null);
                this.status.setCurrentNumber(BasConstants.NO_90);
                setBasDataTimeNormUntilYear(dataPointId, yearMonth, null);

                setVirtualMetersForSelectedMeter(dataPointId, null, yearMonth, false);

                this.status.setCurrentNumber(BasConstants.NO_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(BasConstants.FAILED_UPDATE, e);
        }
    }

    /**
     * updateBasDataTimeNormNumFifteenMinutes - Delete select month records, if existing, and next
     * date_hour record of first date outside that month. Then insert these records. (Do for all
     * process_status values).
     *
     * Copy values directly from clean_num table, only if data point interval is exactly 900 seconds
     * (15 minutes). Convert values to common unit and save in time_norm_num value_common field.
     *
     * For a virtual meter, get insert sql from buildVirtualMeterSqlInsert
     *
     * @param dataPointId Data_point_id
     * @param yearMonth Year-Month grouping to process
     * @param isAll - process all or not
     * @param virtualMeterRecord - DataRecord of virtual meter
     */
    public void updateBasDataTimeNormNumFifteenMinutes(final String dataPointId,
            final String yearMonth, final boolean isAll, final DataRecord virtualMeterRecord) {
        final StringBuilder sqlDeleteFifteenMinutes =
                getSqlDeleteHourly(dataPointId, yearMonth, BasConstants.FIFTEENMIN);
        SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, sqlDeleteFifteenMinutes.toString());

        String srcField = BasConstants.BAS_DATA_CLEAN_NUM_DELTA;
        final DataRecord dataPointRecord = getDataPointRecord(dataPointId);
        if ((dataPointRecord.getString(BasConstants.BAS_DATA_POINT_BILL_TYPE_ID))
            .equals(BasConstants.ELECTRIC)
                && (dataPointRecord.getString(BasConstants.BILL_UNIT_ROLLUP_TYPE))
                    .equals(BasConstants.POWER)) {
            srcField = BasConstants.BAS_DATA_CLEAN_NUM_VALUE_REPORTED;
        }
        final double conversionFactor =
                dataPointRecord.getDouble(BasConstants.BILL_UNIT_CONVERSION_FACTOR);

        StringBuilder sql = new StringBuilder();
        if (virtualMeterRecord == null) {
            sql.append("INSERT INTO   bas_data_time_norm_num (data_point_id, date_measured, time_measured, interval, delta, value_common) ");
            sql.append(" SELECT    " + dataPointId
                    + ", date_measured, time_measured, '15MIN', delta, ");
            sql.append(srcField);
            sql.append(" * " + conversionFactor);
            sql.append(" FROM bas_data_clean_num ");
            sql.append(" LEFT OUTER JOIN bas_data_point ON bas_data_point.data_point_id = bas_data_clean_num.data_point_id ");
            sql.append(" WHERE bas_data_point.sampling_interval = 900 ");
            sql.append(" AND bas_data_clean_num.data_point_id =  " + dataPointId);
            sql.append(" AND (${sql.yearMonthOf('bas_data_clean_num.date_measured')} = '"
                    + yearMonth + "'     ");
            sql.append(" OR  bas_data_clean_num.date_measured = (${sql.dateAdd('month', 1, sql.date('" + yearMonth + BasConstants.DAY_01 + "'))})  )  ");
        } else {
            sql =
                    getSqlUpdateVirtualMeter(dataPointId, yearMonth, BasConstants.FIFTEENMIN,
                        virtualMeterRecord);
        }
        SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, sql.toString());
    }

    /**
     * getSqlUpdateVirtualMeter - get sql for inserting records into bas_date_time_norm_num table
     * for virtual meters. SUM meters_to_include - meters_to_exclude or MAX(meters_to_include) only
     * for Power meters. Convert delta to value_common using conversion factor.
     *
     * @param dataPointId Data_point_id
     * @param yearMonth Year-Month grouping to process
     * @param interval - interval
     * @param virtualMeterRecord - DataRecord
     * @return sql - StringBuilder
     */

    private StringBuilder getSqlUpdateVirtualMeter(final String dataPointId,
            final String yearMonth, final String interval, final DataRecord virtualMeterRecord) {
        String agg = BasConstants.SUM;
        if ((virtualMeterRecord.getString(BasConstants.BAS_DATA_POINT_BILL_TYPE_ID))
            .equals(BasConstants.ELECTRIC)
                && (virtualMeterRecord.getString(BasConstants.BILL_UNIT_ROLLUP_TYPE))
                    .equals(BasConstants.POWER)) {
            agg = BasConstants.MAX;
        }
        final String metersToInclude =
                virtualMeterRecord.getString(BasConstants.BAS_DATA_POINT_METERS_TO_INCLUDE);
        String metersToExclude =
                virtualMeterRecord.getString(BasConstants.BAS_DATA_POINT_METERS_TO_EXCLUDE);
        if (metersToExclude == null || "".equals(metersToExclude)) {
            metersToExclude = BasConstants.STRING_0;
        }

        String yrMoRestriction = "";
        if (BasConstants.FIFTEENMIN.equals(interval) || BasConstants.HOUR.equals(interval)
                || BasConstants.DAY.equals(interval)) {
            yrMoRestriction =
                    " AND (${sql.yearMonthOf('bas_data_time_norm_num.date_measured')} = '"
                            + yearMonth
                            + "' OR  bas_data_time_norm_num.date_measured = (${sql.dateAdd('month', 1, sql.date('" + yearMonth + BasConstants.DAY_01 + "'))}) )  ";
        }

        final StringBuilder sql = new StringBuilder();
        sql.append(" INSERT INTO bas_data_time_norm_num (data_point_id, date_measured, time_measured, interval, value_common) ");
        sql.append("SELECT   " + dataPointId
                + ", bas_data_time_norm_num.date_measured, bas_data_time_norm_num.time_measured, ");
        sql.append(" '" + interval + "', ");
        sql.append(" (value_common_include - ${sql.isNull('value_common_exclude', 0)})  ${sql.as}  value_common  ");

        sql.append("FROM (   ");
        sql.append("SELECT " + agg + "(value_common) ${sql.as} value_common_include, ");
        sql.append(" (SELECT SUM(value_common)  ");
        sql.append("FROM bas_data_time_norm_num   ${sql.as}  bas_data ");
        sql.append("WHERE bas_data.interval = '" + interval + "'        ");
        sql.append("AND (bas_data.date_measured = bas_data_time_norm_num.date_measured AND bas_data.time_measured = bas_data_time_norm_num.time_measured)    ");
        sql.append("AND bas_data.data_point_id IN ( " + metersToExclude + ")      ");
        sql.append(")  ${sql.as}  value_common_exclude, ");
        sql.append(" bas_data_time_norm_num.date_measured, ");
        sql.append(" bas_data_time_norm_num.time_measured  ");
        sql.append(" FROM bas_data_time_norm_num ");
        sql.append(" WHERE bas_data_time_norm_num.interval = '" + interval);
        sql.append(" ' AND bas_data_time_norm_num.data_point_id IN (" + metersToInclude);
        sql.append(" )     " + yrMoRestriction);
        sql.append(" GROUP BY bas_data_time_norm_num.date_measured, bas_data_time_norm_num.time_measured)  ${sql.as}  bas_data_time_norm_num ");
        return sql;
    }

    /**
     * updateBasDataCleanNum - update bas_data_clean_num table with delta values. Delta = meter
     * reading minus previous meter reading. Very first reading for the meter gets delta = 0. Do not
     * set the delta of the first record in the clean num table. It should either be zero or, if
     * previous months have been deleted, its value should be retained.
     *
     * Records with a negative delta (due to meter flip) are assigned the same value as the previous
     * delta for a smooth line. Update selected month records and first record outside that month to
     * cover any newly-inserted data which affects the delta of the next record outside the selected
     * month. Do for records with process_status NOT PROCESSED, PROCESSED, or ANOMALY. Do not update
     * deltas if process_status = MANUAL.
     *
     * Update bas_data_clean_num table to set process_status = 'PROCESSED' or 'ANOMALY' (for
     * would-be negative delta records) for selected month only. Do for records that have
     * process_status NOT PROCESSED, PROCESSED or ANOMALY.
     *
     * @param dataPointId Data_point_id
     * @param yearMonth Year-Month grouping to process
     * @param isAll - process all or not
     */

    public void updateBasDataCleanNum(final String dataPointId, final String yearMonth,
            final boolean isAll) {

        final DataSource dsYearMo =
                DataSourceFactory.loadDataSourceFromFile(BasConstants.EDIT_VIEW_NAME,
                    "energyBasEdit_ds1");
        dsYearMo.addRestriction(Restrictions.eq(BasConstants.CLEAN_NUM, BasConstants.DATA_POINT_ID,
            dataPointId));
        final List<DataRecord> recordsYearMo = dsYearMo.getRecords();

        final DataSource editDs =
                DataSourceFactory.loadDataSourceFromFile(BasConstants.EDIT_VIEW_NAME,
                    "energyBasEdit_ds4");
        editDs.addRestriction(Restrictions.eq(BasConstants.CLEAN_NUM, BasConstants.DATA_POINT_ID,
            dataPointId));
        final List<DataRecord> records = editDs.getRecords();

        final DataRecord dataPointRecord = getDataPointRecord(dataPointId);

        String recYrMo = "";
        String prevRecYrMo = "";
        DataRecord record = null;
        String recProcessStat = "";
        final String billType = dataPointRecord.getString(BasConstants.BAS_DATA_POINT_BILL_TYPE_ID);
        final String billRollupType = dataPointRecord.getString(BasConstants.BILL_UNIT_ROLLUP_TYPE);

        for (int i = 0; i < records.size(); i++) {
            record = records.get(i);
            recYrMo = recordsYearMo.get(i).getString(BasConstants.FIELD_YEAR_MONTH);

            /* Update records in the selected month and the first record beyond the selected month */
            if (recYrMo.compareTo(yearMonth) > 0) {
                prevRecYrMo = recordsYearMo.get(i - 1).getString(BasConstants.FIELD_YEAR_MONTH);
                if (prevRecYrMo.compareTo(yearMonth) > 0) {
                    break;
                }
            }
            if (recYrMo.compareTo(yearMonth) < 0) {
                continue;
            }

            recProcessStat =
                    recordsYearMo.get(i).getString(BasConstants.BAS_DATA_CLEAN_NUM_PROCESS_STATUS);
            if (BasConstants.MANUAL.equals(recProcessStat)) {
                continue;
            }
            if (i == 0 && !BasConstants.NOT_PROCESSED.equals(recProcessStat)) {
                continue;
            }
            record = processRecord(i, records, billType, billRollupType, recYrMo, yearMonth);

            editDs.saveRecord(record);
            if (!isAll) {
                this.status.setCurrentNumber(BasConstants.NO_25
                    + (i * BasConstants.NO_50 / records.size()));
            }
        }
    }

    /**
     *
     * processRecord - calculate delta and the status of the process .
     *
     * @param pos - position in the records
     * @param records - list of record
     * @param billType - bill type of the records
     * @param billRollupType - bill unit rollup type for the records
     * @param recYrMo - the year and the month for the records
     * @param yearMonth - the year and the month for which we want to process the information
     * @return the data record updated with delta and status
     */
    public DataRecord processRecord(final int pos, final List<DataRecord> records,
            final String billType, final String billRollupType, final String recYrMo,
            final String yearMonth) {
        final DataRecord rec = records.get(pos);
        String processStat = "PROCESSED";
        double delta = rec.getDouble(BasConstants.BAS_DATA_CLEAN_NUM_DELTA);
        double valReported = 0.000000;
        double valReportedPrev = 0.000000;
        if ((pos != 0)
                && !(BasConstants.ELECTRIC.equals(billType) && BasConstants.POWER
                        .equals(billRollupType))) {
            valReported = rec.getDouble(BasConstants.BAS_DATA_CLEAN_NUM_VALUE_REPORTED);
            valReportedPrev =
                    records.get(pos - 1).getDouble(BasConstants.BAS_DATA_CLEAN_NUM_VALUE_REPORTED);
            delta = valReported - valReportedPrev;
            if (delta < 0) {
                delta = records.get(pos - 1).getDouble(BasConstants.BAS_DATA_CLEAN_NUM_DELTA);
                processStat = "ANOMALY";
            }
        }
        rec.setValue(BasConstants.BAS_DATA_CLEAN_NUM_DELTA, delta);
        /* Update process_status for selected month only */
        if (recYrMo.compareTo(yearMonth) == 0) {
            rec.setValue(BasConstants.BAS_DATA_CLEAN_NUM_PROCESS_STATUS, processStat);
        }

        return rec;
    }

    /**
     * setVirtualMetersForSelectedMeter - process data for virtual meters which include or exclude
     * the passed data point ID.
     *
     * Do not process a virtual meter if any component meters are Not Processed. This will postpone
     * virtual meter processing until all component meters have been processed.
     *
     * @param dataPointId Data_point_id
     * @param yearMonthRecords List <DataRecord> of year-months to process
     * @param yearMonth String yearMonth
     * @param isAll process all
     */
    public void setVirtualMetersForSelectedMeter(final String dataPointId,
            final List<DataRecord> yearMonthRecords, final String yearMonth, final boolean isAll) {
        final DataSource virtualMeterDs =
                DataSourceFactory.loadDataSourceFromFile(BasConstants.EDIT_VIEW_NAME,
                        "energyBasEdit_ds9");

        virtualMeterDs.addParameter(BasConstants.ID_STRING, dataPointId, DataSource.DATA_TYPE_TEXT);
        final List<DataRecord> virtualMeterRecords = virtualMeterDs.getRecords();

        for (final DataRecord virtualMeterRecord : virtualMeterRecords) {
            if (!isNotProcessedComponentMeter(virtualMeterRecord, yearMonth, isAll)) {
                setVirtualMeter(virtualMeterRecord, yearMonthRecords, yearMonth, isAll);
            }
        }
    }

    /**
     * setVirtualMeter - process data for a virtual meter.
     *
     *
     * @param virtualMeterRecord DataRecord
     * @param yearMonthRecords List <DataRecord> of year-months to process
     * @param yearMonth String selected or first yearMonth
     * @param isAll process all
     */
    public void setVirtualMeter(final DataRecord virtualMeterRecord,
            final List<DataRecord> yearMonthRecords, final String yearMonth, final boolean isAll) {

        String yearMo = yearMonth;
        final String firstYearMonth = yearMonth;

        final String virtualMeterId =
                String.valueOf(virtualMeterRecord.getInt(BasConstants.POINT + "."
                        + BasConstants.DATA_POINT_ID));
        this.status.setMessage(BasConstants.MESSAGE_PROCESSING_VIRTUAL_METER);

        if (isAll) {
            for (final DataRecord record : yearMonthRecords) {
                yearMo = record.getString(BasConstants.FIELD_YEAR_MONTH);
                this.status.setMessage(BasConstants.MESSAGE_PROCESSING_VIRTUAL_METER);
                setBasDataTimeNormUntilWeek(virtualMeterId, yearMo, isAll, virtualMeterRecord);
            }
        } else {
            setBasDataTimeNormUntilWeek(virtualMeterId, yearMo, isAll, virtualMeterRecord);
        }
        setBasDataTimeNormUntilYear(virtualMeterId, firstYearMonth, virtualMeterRecord);
    }

    /**
     * existsNotProcessedComponentMeter - Return true if a virtual meter contains a component meter
     * which is not yet processed.
     *
     * @param virtualMeterRecord DataRecord for a virtual meter
     * @param yearMonth Year-Month grouping to process
     * @param isAll boolean
     * @return existsNotProcessedComponentMeter boolean
     */
    private boolean isNotProcessedComponentMeter(final DataRecord virtualMeterRecord,
            final String yearMonth, final boolean isAll) {
        boolean existsNotProcessedComponentMeter = false;

        final String metersToInclude =
                virtualMeterRecord.getString(BasConstants.BAS_DATA_POINT_METERS_TO_INCLUDE);
        final String metersToExclude =
                virtualMeterRecord.getString(BasConstants.BAS_DATA_POINT_METERS_TO_EXCLUDE);
        String componentMeterIds = metersToInclude;
        if (metersToExclude != null && !"".equals(metersToExclude)) {
            componentMeterIds += BasConstants.COMMA + metersToExclude;
        }

        final DataSource dsNotProcessed =
                DataSourceFactory.loadDataSourceFromFile(BasConstants.EDIT_VIEW_NAME,
                    BasConstants.ENERGY_BAS_EDIT_DS2);
        dsNotProcessed.addParameter(BasConstants.ID_STRING, componentMeterIds,
            DataSource.DATA_TYPE_VERBATIM);
        if (!isAll) {
            dsNotProcessed.addRestriction(Restrictions.sql("bas_data_clean_num.year_month = '"
                    + yearMonth + "'"));
        }
        dsNotProcessed.addRestriction(Restrictions.eq(BasConstants.CLEAN_NUM,
            BasConstants.PROCESS_STATUS, BasConstants.NOT_PROCESSED));
        final List<DataRecord> notProcessedMonths = dsNotProcessed.getRecords();
        if (!notProcessedMonths.isEmpty()) {
            existsNotProcessedComponentMeter = true;
        }
        return existsNotProcessedComponentMeter;
    }

    /**
     * updateBasDataTimeNormNumHourly - Delete select month records, if existing, and next date_hour
     * record of first date outside that month. Then insert these records. (Do for all
     * process_status values).
     *
     * If a virtual meter, get insert sql from buildVirtualMeterSqlInsert.
     *
     * @param dataPointId Data_point_id
     * @param yearMonth Year-Month grouping to process
     * @param isAll - process all or not
     * @param virtualMeterRecord - DataRecord Virtual meter
     */

    public void updateBasDataTimeNormNumHourly(final String dataPointId, final String yearMonth,
            final boolean isAll, final DataRecord virtualMeterRecord) {
        final StringBuilder sqlDelete =
                getSqlDeleteHourly(dataPointId, yearMonth, BasConstants.HOUR);
        SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, sqlDelete.toString());

        StringBuilder sql = null;

        if (virtualMeterRecord == null) {
                sql = getSqlUpdateHourly(dataPointId, yearMonth);
                SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, sql.toString());
        } else {
            final StringBuilder virtualSql =
                    getSqlUpdateVirtualMeter(dataPointId, yearMonth, BasConstants.HOUR,
                        virtualMeterRecord);
            SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, virtualSql.toString());
        }
    }

    /**
     * getSqlDeleteHourly - Return sql statement to delete select month records, if existing, and
     * next date_hour record of first date outside that month.
     *
     * @param dataPointId Data_point_id
     * @param yearMonth Year-Month grouping to process
     * @param interval HOUR or 15MIN
     * @return sql statement
     */
    private StringBuilder getSqlDeleteHourly(final String dataPointId, final String yearMonth,
            final String interval) {
        final StringBuilder sqlDelete = new StringBuilder();
        sqlDelete
        .append(" DELETE FROM bas_data_time_norm_num WHERE data_point_id = " + dataPointId);
        sqlDelete.append("  AND interval =  '" + interval + Constants.STRING_SINGLE_QUOTE);
        sqlDelete.append(" AND ((${sql.yearMonthOf('bas_data_time_norm_num.date_measured')} ) ");
        sqlDelete.append(" =  '" + yearMonth + Constants.STRING_SINGLE_QUOTE);
        sqlDelete.append(" OR   date_measured = (${sql.dateAdd('month', 1, sql.date('" + yearMonth + BasConstants.DAY_01 + "'))} )     ");
        sqlDelete.append(" )    ");
        return sqlDelete;
    }

    /**
     * getSqlUpdateHourly - Return sql statement to update select month records.
     *
     * SUM the bas_data_clean_num.delta values for consumption meters and MAX the
     * bas_data_clean_num.value_reported values for demand meters.
     *
     *
     * @param dataPointId Data_point_id
     * @param yearMonth Year-Month grouping to process
     * @return sql - statement
     */

    private StringBuilder getSqlUpdateHourly(final String dataPointId, final String yearMonth) {

        String agg = BasConstants.SUM;
        String srcField = BasConstants.BAS_DATA_CLEAN_NUM_DELTA;

        final DataRecord dataPointRecord = getDataPointRecord(dataPointId);
        if (dataPointRecord.getString(BasConstants.BAS_DATA_POINT_BILL_TYPE_ID).equals(
            BasConstants.ELECTRIC)
            && dataPointRecord.getString(BasConstants.BILL_UNIT_ROLLUP_TYPE).equals(
                BasConstants.POWER)) {
            agg = BasConstants.MAX;
            srcField = BasConstants.BAS_DATA_CLEAN_NUM_VALUE_REPORTED;
        }
        final double conversionFactor =
                dataPointRecord.getDouble(BasConstants.BILL_UNIT_CONVERSION_FACTOR);

        String hour = "";
        // pc if Oracle database
        if (SqlUtils.isOracle()) {
        // Oracle seems to return '01' for hours like 01:00
        // For Oracle need to convert to full date-time stamp the time value
            hour = "${sql.yearMonthDayOf('bas_data_clean_num.date_measured')} ${sql.concat} ' ' ${sql.concat} "
                            + " TO_CHAR(bas_data_clean_num.time_measured, 'HH24') ";
            hour += " ${sql.concat}  ':00'";
            hour = " TO_DATE( " + hour + ", 'YYYY-MM-DD HH24:MI') ";
        // pc if SQL Server or Sybase
        } else {
        // Sybase and SQL server seem to return '1' for hours like 01:00
            hour    = " (CASE WHEN ${sql.datePart('hour', 'bas_data_clean_num.time_measured')}/10 < 1 THEN '0' ELSE '' END) "
                    + " ${sql.concat} "
                    + " LTRIM(RTRIM((STR(${sql.datePart('hour', 'bas_data_clean_num.time_measured')})))) ";        
            hour += " ${sql.concat} ':00'";
        }
        

        final StringBuilder sql = new StringBuilder();
        sql.append(" INSERT INTO bas_data_time_norm_num (data_point_id, date_measured, time_measured, interval, delta, value_common) ");
        sql.append(" SELECT   "
                + dataPointId
                + ", bas_data_clean_num.date_measured, bas_data_clean_num.time_measured, 'HOUR', ${sql.isNull('delta', 0)}, ${sql.isNull('value_common', 0)} * "
                + conversionFactor);

        sql.append(" FROM (SELECT  SUM(delta) ${sql.as} delta, " + agg + "( " + srcField
                + ") ${sql.as} value_common,  bas_data_clean_num.date_measured, ");
        sql.append(hour + " ${sql.as} time_measured ");
        sql.append("  FROM bas_data_clean_num   WHERE bas_data_clean_num.data_point_id = "
                + dataPointId);
        sql.append(" AND ((${sql.yearMonthOf('bas_data_clean_num.date_measured')} ) ");
        sql.append(" = '" + yearMonth + Constants.STRING_SINGLE_QUOTE);
        sql.append(" OR  date_measured = (${sql.dateAdd('month', 1, sql.date('" + yearMonth + BasConstants.DAY_01 + "'))} )    ");
        sql.append(" )   ");
        sql.append(" GROUP BY  bas_data_clean_num.date_measured,  ");
        sql.append(hour);        
        sql.append(")");
        sql.append(" ${sql.as} bas_data_clean_num  ");

        return sql;
    }

    /**
     * updateBasDataTimeNormNumCumulative - Delete any existing daily cumulative records for
     * selected month and first day beyond selected month, if existing. Then insert these records.
     * (Do for all process_status values).
     *
     * 23.1 - For weekly aggregation, delete any existing weekly values for weeks whose start date
     * falls within the selected month and all following months, than insert those values. This is
     * avoid reprocessing a partial week at the beginning of the month, especially if the previous
     * month's data has been deleted.
     *
     * For month/quarter/year aggs, delete all cumulative records for selected and all following
     * months/quarters/years (rather than both before and after). Calculate max cal_date for date
     * grouping and check that first day of selected month falls before the max date of group.
     *
     * @param dataPointId Data_point_id
     * @param interval Cumulative interval (DAY, WEEK, MONTH, QUARTER, YEAR) to delete and insert.
     * @param yearMonth Selected or earliest year_month processed.
     * @param virtualMeterRecord DataRecordVirtual meter
     */

    public void updateBasDataTimeNormNumCumulative(final String dataPointId, final String interval,
            final String yearMonth, final DataRecord virtualMeterRecord) {

        String agg = BasConstants.SUM;
        String srcField = BasConstants.BAS_DATA_CLEAN_NUM_DELTA;

        final DataRecord dataPointRecord = getDataPointRecord(dataPointId);
        if (dataPointRecord.getString(BasConstants.BAS_DATA_POINT_BILL_TYPE_ID).equals(
            BasConstants.ELECTRIC)
                && dataPointRecord.getString(BasConstants.BILL_UNIT_ROLLUP_TYPE).equals(
                    BasConstants.POWER)) {
            agg = BasConstants.MAX;
            srcField = BasConstants.BAS_DATA_CLEAN_NUM_VALUE_REPORTED;
        }
        final double conversionFactor =
                dataPointRecord.getDouble(BasConstants.BILL_UNIT_CONVERSION_FACTOR);

        String group = "yearWeekOf";
        if (BasConstants.MONTH.equals(interval)) {
            group = "yearMonthOf";
        } else if (BasConstants.QUARTER.equals(interval)) {
            group = BasConstants.YEAR_QUARTER_OF;
        } else if (BasConstants.YEAR.equals(interval)) {
            group = BasConstants.YEAR_OF;
        }

        String dateMeasuredGroup = "bas_data_clean_num.date_measured";
        String calDateGroup = "afm_cal_dates.cal_date";
        String deleteYrMoRest =
                " AND ((${sql.yearMonthOf('bas_data_time_norm_num.date_measured')}) = '"
                        + yearMonth
                        + "'  OR bas_data_time_norm_num.date_measured = (${sql.dateAdd('month', 1, sql.date('" + yearMonth + BasConstants.DAY_01 + "'))}) )";

        String dateMeasuredYrMoRest =
                " AND ((${sql.yearMonthOf('bas_data_clean_num.date_measured')}) = '"
                        + yearMonth
                        + "' OR bas_data_clean_num.date_measured = (${sql.dateAdd('month', 1, sql.date('" + yearMonth + BasConstants.DAY_01 + "'))}) ) ";
        String dateGroupRest = " 1=1 ";

        if (!BasConstants.DAY.equals(interval)) {
            dateMeasuredGroup = "    ${sql." + group + "('bas_data_clean_num.date_measured')}  ";
            calDateGroup = "   ${sql." + group + "('afm_cal_dates.cal_date')}  ";
            deleteYrMoRest =
                    "  AND ((SELECT MAX(afm_cal_dates.cal_date) FROM afm_cal_dates WHERE (${sql."
                            + group + "('afm_cal_dates.cal_date')}) = (${sql." + group
                            + "('bas_data_time_norm_num.date_measured')})) >=  ${sql.date('"
                            + yearMonth + BasConstants.DAY_01 + "')})  ";
            dateMeasuredYrMoRest = "";
            dateGroupRest =
                    " max_cal_date >=  ${sql.date('" + yearMonth + BasConstants.DAY_01 + "')}   ";
            if (BasConstants.WEEK.equals(interval)) {
                deleteYrMoRest =
                        " AND ((SELECT MIN(afm_cal_dates.cal_date) FROM afm_cal_dates WHERE (${sql.yearWeekOf('afm_cal_dates.cal_date')}) = (${sql.yearWeekOf('bas_data_time_norm_num.date_measured')})) >=  ${sql.date('"
                                + yearMonth + BasConstants.DAY_01 + "')})";
                dateGroupRest =
                        " afm_cal_dates.min_cal_date >= ${sql.date('" + yearMonth
                                + BasConstants.DAY_01 + "')}";
            }
        }

        final StringBuilder sqlDelete =
                getSqlDeleteCumulativeRecords(dataPointId, interval, deleteYrMoRest);
        SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, sqlDelete.toString());

        StringBuilder sql = new StringBuilder();
        if (virtualMeterRecord == null) {
            sql.append("INSERT INTO  bas_data_time_norm_num (data_point_id, date_measured, time_measured, interval, delta, value_common) ");
            sql.append(" SELECT  " + dataPointId
                    + ",  afm_cal_dates.min_cal_date, ${sql.time('00:00')}, '" + interval
                    + "', ${sql.isNull('delta', 0)}, ${sql.isNull('value_common', 0)} * "
                    + conversionFactor);
            sql.append(" FROM  (SELECT SUM(delta) ${sql.as} delta, " + agg + "(" + srcField
                    + ") ${sql.as}  value_common, " + dateMeasuredGroup
                    + " ${sql.as}    date_measured_group ");
            sql.append(" FROM  bas_data_clean_num  WHERE  bas_data_clean_num.data_point_id = "
                    + dataPointId);
            sql.append(dateMeasuredYrMoRest);
            sql.append(" GROUP BY  " + dateMeasuredGroup + " )  ");
            sql.append(" ${sql.as}  bas_data_clean_num");

            sql.append(" LEFT OUTER JOIN (SELECT MIN(cal_date) ${sql.as} min_cal_date, MAX(cal_date) AS max_cal_date, ");
            sql.append(calDateGroup + "  ${sql.as} cal_date_group ");
            sql.append(" FROM  afm_cal_dates ");
            sql.append("  GROUP BY  "
                    + calDateGroup
                    + ")  ${sql.as}  afm_cal_dates  ON (bas_data_clean_num.date_measured_group = afm_cal_dates.cal_date_group) ");
            sql.append(" WHERE  " + dateGroupRest);
        } else {
            sql = getSqlUpdateVirtualMeter(dataPointId, yearMonth, interval, virtualMeterRecord);
        }
        SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, sql.toString());
    }

    /**
     * updateCumulativeFromMonthlyAggs - Copy updateBasDataTimeNormNumCumulative, but instead of
     * aggregating from clean data, use the monthly aggregates from the bas_data_time__norm_num
     * table. Used to calculate interval='QUARTER' and 'YEAR' aggregates for 15-Min, Daily, Weekly
     * and Monthly meters. Reason is that clean data may be on a scheduled deletion.
     *
     * @param dataPointId Data_point_id
     * @param interval Cumulative interval (QUARTER, YEAR) to delete and insert.
     * @param yearMonth Selected or earliest year_month to process.
     * @param virtualMeterRecord DataRecordVirtual meter
     */

    public void updateCumulativeFromMonthlyAggs(final String dataPointId, final String interval,
            final String yearMonth, final DataRecord virtualMeterRecord) {

        String agg = BasConstants.SUM;

        final DataRecord dataPointRecord = getDataPointRecord(dataPointId);
        if (dataPointRecord.getString(BasConstants.BAS_DATA_POINT_BILL_TYPE_ID).equals(
            BasConstants.ELECTRIC)
                && dataPointRecord.getString(BasConstants.BILL_UNIT_ROLLUP_TYPE).equals(
                    BasConstants.POWER)) {
            agg = BasConstants.MAX;
        }

        String group = BasConstants.YEAR_QUARTER_OF;
        if (BasConstants.YEAR.equals(interval)) {
            group = BasConstants.YEAR_OF;
        }

        final String dateMeasuredGroup =
                "  ${sql." + group + "('bas_data_time_norm_num.date_measured')} ";
        final String calDateGroup = " ${sql." + group + "('afm_cal_dates.cal_date')} ";
        final String deleteYrMoRest =
                " AND ((SELECT MAX(afm_cal_dates.cal_date) FROM afm_cal_dates WHERE ${sql." + group
                + "('afm_cal_dates.cal_date')} = ${sql." + group
                + "('bas_data_time_norm_num.date_measured')}) >=  ${sql.date('" + yearMonth
                + BasConstants.DAY_01 + "')}) ";
        final String dateGroupRest =
                " max_cal_date >= ${sql.date('" + yearMonth + BasConstants.DAY_01 + "')} ";

        final StringBuilder sqlDelete =
                getSqlDeleteCumulativeRecords(dataPointId, interval, deleteYrMoRest);
        SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, sqlDelete.toString());

        StringBuilder sql = new StringBuilder();
        if (virtualMeterRecord == null) {
            sql.append("INSERT INTO bas_data_time_norm_num (data_point_id, date_measured, time_measured, interval, delta, value_common) ");
            sql.append(" SELECT " + dataPointId
                    + ", afm_cal_dates.min_cal_date, ${sql.time('00:00')}, '" + interval
                    + "', ${sql.isNull('delta', 0)}, ${sql.isNull('value_common', 0)} ");
            sql.append(" FROM (SELECT SUM(delta) ${sql.as} delta, " + agg
                    + "(bas_data_time_norm_num.value_common) ${sql.as}  value_common, "
                    + dateMeasuredGroup + " ${sql.as}   date_measured_group ");
            sql.append(" FROM  bas_data_time_norm_num  WHERE  bas_data_time_norm_num.data_point_id = "
                    + dataPointId);
            sql.append(" AND interval = 'MONTH' ");
            sql.append(" GROUP BY " + dateMeasuredGroup + " ) ");
            sql.append(" ${sql.as}  bas_data_time_norm_num");

            sql.append(" LEFT OUTER JOIN  (SELECT MIN(cal_date) ${sql.as} min_cal_date, MAX(cal_date) AS  max_cal_date,"
                    + calDateGroup + " ${sql.as} cal_date_group ");
            sql.append(" FROM afm_cal_dates ");
            sql.append("  GROUP BY "
                    + calDateGroup
                    + ")  ${sql.as}  afm_cal_dates  ON (bas_data_time_norm_num.date_measured_group = afm_cal_dates.cal_date_group) ");
            sql.append(" WHERE " + dateGroupRest);
        } else {
            sql = getSqlUpdateVirtualMeter(dataPointId, yearMonth, interval, virtualMeterRecord);
        }
        SqlUtils.executeUpdate(BasConstants.TIME_NORM_NUM, sql.toString());
    }

    /**
     * scheduledProcessBasDataRecords - Process BAS records that are NOT PROCESSED for all data
     * points
     *
     * Call processBasDataRecords for all data points and years and months that are not processed
     * yet.
     *
     */
    public void scheduledProcessBasDataRecords() {
        try {
            final String dataPointsSQL = "SELECT data_point_id FROM bas_data_point";
            final String[] dataPointsFlds = { BasConstants.DATA_POINT_ID };

            final DataSource dataPointsDs =
                    DataSourceFactory.createDataSourceForFields(BasConstants.POINT, dataPointsFlds);
            dataPointsDs.addQuery(dataPointsSQL);

            final List<DataRecord> dataPointsRecords = dataPointsDs.getRecords();

            for (final DataRecord dataPointsRecord : dataPointsRecords) {
                final String dataPointID =
                        dataPointsRecord.getValue("bas_data_point.data_point_id").toString();
                final DataSource yearMonthDs =
                        DataSourceFactory.loadDataSourceFromFile(BasConstants.EDIT_VIEW_NAME,
                            BasConstants.ENERGY_BAS_EDIT_DS2);
                yearMonthDs.addParameter(BasConstants.ID_STRING, dataPointID,
                    DataSource.DATA_TYPE_INTEGER);
                yearMonthDs.addRestriction(Restrictions.eq(BasConstants.CLEAN_NUM,
                    BasConstants.PROCESS_STATUS, BasConstants.NOT_PROCESSED));
                final List<DataRecord> yearMonthRecords = yearMonthDs.getRecords();

                for (final DataRecord yearMonthRecord : yearMonthRecords) {
                    final String yearMonth =
                            yearMonthRecord.getString(BasConstants.FIELD_YEAR_MONTH);
                    processBasDataRecords(dataPointID, yearMonth);
                }
            }

        } catch (final ExceptionBase e) {
            // @non-translatable
            throw new ExceptionBase(BasConstants.FAILED_UPDATE, e);
        }
    }

    /**
     * getDataPointRecord - Return data point record.
     *
     * @param dataPointId - data point id
     * @return dataPointRecord - DataRecord
     *
     */
    private DataRecord getDataPointRecord(final String dataPointId) {
        final DataSource dataPointUnitDs =
                DataSourceFactory.loadDataSourceFromFile(BasConstants.EDIT_VIEW_NAME,
                    BasConstants.ENERGY_BAS_EDIT_DS7);
        dataPointUnitDs.addRestriction(Restrictions.eq(BasConstants.POINT,
            BasConstants.DATA_POINT_ID, dataPointId));
        return dataPointUnitDs.getRecords().get(0);
    }

    /**
     * deleteCumulativeRecords - Delete cumulative records.
     *
     * @param dataPointId - data point id
     * @param interval - WEEK, MONTH, QUARTER, or YEAR
     * @param deleteYrMoRest - restriction
     * @return sqlDelete - StringBuilder
     *
     */
    private StringBuilder getSqlDeleteCumulativeRecords(final String dataPointId,
            final String interval, final String deleteYrMoRest) {
        final StringBuilder sqlDelete = new StringBuilder();
        sqlDelete
        .append("DELETE FROM  bas_data_time_norm_num WHERE data_point_id = " + dataPointId);
        sqlDelete.append(" AND  interval = '" + interval + "'  ");
        sqlDelete.append(deleteYrMoRest);
        return sqlDelete;
    }
}
