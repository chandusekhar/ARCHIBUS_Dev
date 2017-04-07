package com.archibus.eventhandler.energy;

import java.util.*;

import org.json.JSONObject;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * BillMeterCommon - This class contains common methods for the BillMeterReconciliationService and
 * the BillProrationService
 *
 * History:
 * <li>22.1 Initial implementation.
 *
 *
 * @author Kaori Emery
 */

public class BillMeterCommon {

    /**
     * Hidden constructor.
     */
    protected BillMeterCommon() {
        // prevents calls from subclass
        throw new UnsupportedOperationException();
    }

    /**
     * getRecordsBills - Get bill records.
     *
     * @param vnId String
     * @param billId String
     * @param status String
     * @param tableName String - 'bill' or 'bill_archive'
     * @param restriction String
     * @return billRecords List<DataRecord>
     */

    public static List<DataRecord> getRecordsBills(final String vnId, final String billId,
            final String status, final String tableName, final String restriction) {
        final DataSource dataSource = getDataSourceBill(tableName);
        if (!"".equals(billId)) {
            dataSource.addRestriction(Restrictions.eq(tableName, Constants.FIELD_VN_ID, vnId));
            dataSource.addRestriction(Restrictions.eq(tableName, Constants.FIELD_BILL_ID, billId));
        }
        if (!"".equals(status)) {
            dataSource.addRestriction(Restrictions.eq(tableName, Constants.FIELD_STATUS, status));
        }
        List<DataRecord> billRecords = null;
        if ("".equals(restriction)) {
            billRecords = dataSource.getRecords();
        } else {
            billRecords = dataSource.getRecords(restriction);
        }
        return billRecords;
    }

    /**
     * getRecordsBillLines - Get energy/power/volume bill line records for bill.
     *
     * @param vnId String
     * @param billId String
     * @param billLineId String, can be empty String
     * @param billLineIdDesc String, can be empty String
     * @param getAllRollupTypes boolean
     * @param tableName String - bill, bill_line, bill_archive or bill_line_archive
     * @return billLineRecords
     */

    public static List<DataRecord> getRecordsBillLines(final String vnId, final String billId,
            final String billLineId, final String billLineIdDesc, final boolean getAllRollupTypes,
            final String tableName) {

        String billLineTable = Constants.TABLE_BILL_LINE;
        if (tableName.equals(Constants.TABLE_BILL_ARCHIVE)
                || tableName.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
            billLineTable = Constants.TABLE_BILL_LINE_ARCHIVE;
        }

        final DataSource dataSource = getDataSourceBillLine(tableName);
        dataSource.addRestriction(Restrictions.eq(billLineTable, Constants.FIELD_VN_ID, vnId));
        dataSource.addRestriction(Restrictions.eq(billLineTable, Constants.FIELD_BILL_ID, billId));
        if (!"".equals(billLineId)) {
            dataSource.addRestriction(
                Restrictions.eq(billLineTable, Constants.FIELD_BILL_LINE_ID, billLineId));
        }
        if (!"".equals(billLineIdDesc)) {
            dataSource.addRestriction(
                Restrictions.eq(billLineTable, Constants.FIELD_BILL_LINE_ID_DESC, billLineIdDesc));
        }
        if (!getAllRollupTypes) {
            dataSource.addRestriction(Restrictions.sql(billLineTable + Constants.STRING_PERIOD
                    + Constants.FIELD_ROLLUP_TYPE + " IN ('Energy','Volume','Power')"));
        }
        return dataSource.getAllRecords();
    }

    /**
     * getDataSourceBillLine - Get bill line data source.
     *
     * @param tableName String bill, bill_line, bill_archive or bill_line_archive
     * @return billLineDataSource
     */

    private static DataSource getDataSourceBillLine(final String tableName) {
        String billTable = Constants.TABLE_BILL;
        String billLineTable = Constants.TABLE_BILL_LINE;
        String dataSourceId = "energyBillVsMeterCommon_dsBillLineBase";
        if (tableName.equals(Constants.TABLE_BILL_ARCHIVE)
                || tableName.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
            dataSourceId = "energyBillVsMeterCommon_dsBillLineBaseArch";
            billTable = Constants.TABLE_BILL_ARCHIVE;
            billLineTable = Constants.TABLE_BILL_LINE_ARCHIVE;
        }
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(Constants.VIEW_COMMON, dataSourceId);

        final String[] billLineFields = { Constants.FIELD_BILL_LINE_ID, Constants.FIELD_VN_METER_ID,
                Constants.FIELD_QTY, Constants.FIELD_QTY_ENERGY, Constants.FIELD_AMOUNT_EXPENSE,
                Constants.FIELD_BILL_UNIT_ID, Constants.FIELD_DESCRIPTION,
                Constants.FIELD_QTY_POWER, Constants.FIELD_QTY_VOLUME };
        final String[] billUnitFields =
                { Constants.FIELD_ROLLUP_TYPE, Constants.FIELD_CONVERSION_FACTOR };
        final String[] billFields = { Constants.FIELD_VN_ID, Constants.FIELD_VN_AC_ID,
                Constants.FIELD_BILL_ID, Constants.FIELD_DATE_SERVICE_START,
                Constants.FIELD_DATE_SERVICE_END, Constants.FIELD_STATUS };
        final String[] vnRateFields = { "vn_rate_type", Constants.FIELD_VN_RATE_ID,
                Constants.FIELD_VN_RATE_DESC, "cost_unit", Constants.FIELD_BLOCK,
                Constants.FIELD_LOWER_THRESHOLD, Constants.FIELD_UPPER_THRESHOLD,
                Constants.FIELD_MONTHS, Constants.FIELD_HOURS };
        final String[] vnSvcsContractFields =
                { Constants.FIELD_DATE_SERVICE_START, Constants.FIELD_DATE_SERVICE_END };
        dataSource.addTable(billLineTable, DataSource.ROLE_MAIN);
        dataSource.addTable(billTable, DataSource.ROLE_STANDARD);
        dataSource.addTable(Constants.TABLE_BILL_UNIT, DataSource.ROLE_STANDARD);
        dataSource.addTable(Constants.TABLE_VN_RATE, DataSource.ROLE_STANDARD);
        dataSource.addTable(Constants.TABLE_VN_SVCS_CONTRACT, DataSource.ROLE_STANDARD);
        dataSource.addField(billLineTable, billLineFields);
        dataSource.addField(billTable, billFields);
        dataSource.addField(Constants.TABLE_BILL_UNIT, billUnitFields);
        dataSource.addField(Constants.TABLE_VN_RATE, vnRateFields);
        dataSource.addField(Constants.TABLE_VN_SVCS_CONTRACT, vnSvcsContractFields);
        dataSource.addVirtualField(billLineTable, Constants.FIELD_QTY_MEASURED,
            DataSource.DATA_TYPE_DOUBLE, Constants.SIXTEEN, Constants.SIX);
        dataSource.addVirtualField(billLineTable, Constants.FIELD_DISCREPANCY,
            DataSource.DATA_TYPE_DOUBLE, Constants.EIGHT, Constants.TWO);
        return dataSource;
    }

    /**
     * getDataSourceBill - Get bill data source.
     *
     * @param tableName String - 'bill' or 'bill_archive'
     * @return dataSource DataSource
     */

    private static DataSource getDataSourceBill(final String tableName) {
        final String[] billFields = { Constants.FIELD_VN_ID, Constants.FIELD_VN_AC_ID,
                Constants.FIELD_BILL_ID, Constants.FIELD_BILL_TYPE_ID,
                Constants.FIELD_DATE_SERVICE_START, Constants.FIELD_DATE_SERVICE_END,
                Constants.FIELD_QTY_ENERGY, Constants.FIELD_QTY_POWER, Constants.FIELD_QTY_VOLUME,
                Constants.FIELD_SITE_ID, Constants.FIELD_BL_ID, Constants.FIELD_AMOUNT_EXPENSE,
                "amount_income", "date_issued", "date_due", Constants.FIELD_STATUS,
                Constants.FIELD_DESCRIPTION, "count_lines", Constants.FIELD_TIME_PERIOD };
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(tableName, DataSource.ROLE_MAIN);
        dataSource.addField(tableName, billFields);

        dataSource.addCalculatedField(
            getCustomFieldDef(tableName, Constants.FIELD_VN_BILL_ID, DataSource.DATA_TYPE_TEXT, 0,
                0, tableName + ".vn_id ${sql.concat} '-' ${sql.concat} " + tableName + ".bill_id"));

        dataSource.addCalculatedField(getCustomFieldDef(tableName,
            Constants.FIELD_QTY_ENERGY_MEASURED, DataSource.DATA_TYPE_DOUBLE, Constants.SIXTEEN,
            Constants.SIX, Constants.STRING_ZERO_DOUBLE));
        dataSource.addCalculatedField(getCustomFieldDef(tableName,
            Constants.FIELD_QTY_ENERGY_BILLED, DataSource.DATA_TYPE_DOUBLE, Constants.SIXTEEN,
            Constants.SIX, Constants.STRING_ZERO_DOUBLE));
        dataSource.addCalculatedField(getCustomFieldDef(tableName,
            Constants.FIELD_DISCREPANCY_ENERGY, DataSource.DATA_TYPE_DOUBLE, Constants.EIGHT,
            Constants.TWO, Constants.STRING_ZERO_DOUBLE));

        dataSource.addCalculatedField(getCustomFieldDef(tableName,
            Constants.FIELD_QTY_POWER_MEASURED, DataSource.DATA_TYPE_DOUBLE, Constants.SIXTEEN,
            Constants.SIX, Constants.STRING_ZERO_DOUBLE));
        dataSource.addCalculatedField(getCustomFieldDef(tableName, Constants.FIELD_QTY_POWER_BILLED,
            DataSource.DATA_TYPE_DOUBLE, Constants.SIXTEEN, Constants.SIX,
            Constants.STRING_ZERO_DOUBLE));
        dataSource.addCalculatedField(getCustomFieldDef(tableName,
            Constants.FIELD_DISCREPANCY_POWER, DataSource.DATA_TYPE_DOUBLE, Constants.EIGHT,
            Constants.TWO, Constants.STRING_ZERO_DOUBLE));

        dataSource.addCalculatedField(getCustomFieldDef(tableName,
            Constants.FIELD_QTY_VOLUME_MEASURED, DataSource.DATA_TYPE_DOUBLE, Constants.SIXTEEN,
            Constants.SIX, Constants.STRING_ZERO_DOUBLE));
        dataSource.addCalculatedField(getCustomFieldDef(tableName,
            Constants.FIELD_QTY_VOLUME_BILLED, DataSource.DATA_TYPE_DOUBLE, Constants.SIXTEEN,
            Constants.SIX, Constants.STRING_ZERO_DOUBLE));
        dataSource.addCalculatedField(getCustomFieldDef(tableName,
            Constants.FIELD_DISCREPANCY_VOLUME, DataSource.DATA_TYPE_DOUBLE, Constants.EIGHT,
            Constants.TWO, Constants.STRING_ZERO_DOUBLE));

        dataSource.addCalculatedField(getCustomFieldDef(tableName, Constants.FIELD_MAX_DISCREPANCY,
            DataSource.DATA_TYPE_DOUBLE, Constants.EIGHT, Constants.TWO,
            Constants.STRING_ZERO_DOUBLE));

        dataSource.addSort(tableName, Constants.FIELD_TIME_PERIOD);

        return dataSource;
    }

    /**
     * getCustomFieldDef - Return virtual field definition.
     *
     * @param tableName String
     * @param fieldName String
     * @param dataType String
     * @param size int
     * @param decimals int
     * @param sql String
     * @return fieldDef VirtualFieldDef
     */
    static VirtualFieldDef getCustomFieldDef(final String tableName, final String fieldName,
            final String dataType, final int size, final int decimals, final String sql) {
        VirtualFieldDef fieldDef = null;
        if (dataType.equals(DataSource.DATA_TYPE_DOUBLE)) {
            fieldDef = new VirtualFieldDef(tableName, fieldName, dataType, size, decimals);
        } else {
            fieldDef = new VirtualFieldDef(tableName, fieldName, dataType);
        }
        final Map<String, String> sqlExpressions = new HashMap<String, String>();
        sqlExpressions.put(SqlExpressions.DIALECT_GENERIC, sql);
        fieldDef.addSqlExpressions(sqlExpressions);
        return fieldDef;
    }

    /**
     * getQtyInBilledUnits - Convert quantity from common unit to billed unit.
     *
     * If the tableName is bill_line or bill_line_archive, then use the unit for the bill line
     * record. If the recordType is bill or bill_archive, find the billed unit for the first bill
     * line returned for the bill for the rollupType passed.
     *
     * Determine the conversion_factor used to convert the quantity value to the billed unit.
     *
     * @param qtyCommon double
     * @param record DataRecord - bill, bill line, bill_archive, or bill_line_archive record
     * @param rollupType String
     * @param tableName String - bill, bill line, bill_archive, or bill_line_archive
     * @return quantity double
     */

    public static double getQtyInBilledUnits(final double qtyCommon, final DataRecord record,
            final String rollupType, final String tableName) {
        double conversionFactor = 1.00;
        String billLineTable = Constants.TABLE_BILL_LINE;
        if (tableName.equals(Constants.TABLE_BILL_ARCHIVE)
                || tableName.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
            billLineTable = Constants.TABLE_BILL_LINE_ARCHIVE;
        }

        if (tableName.equals(Constants.TABLE_BILL_LINE)
                || tableName.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
            conversionFactor = (Double) record.getValue(Constants.TABLE_BILL_UNIT
                    + Constants.STRING_PERIOD + Constants.FIELD_CONVERSION_FACTOR);
        } else {
            final String vnId =
                    record.getString(tableName + Constants.STRING_PERIOD + Constants.FIELD_VN_ID);
            final String billId =
                    record.getString(tableName + Constants.STRING_PERIOD + Constants.FIELD_BILL_ID);
            final String billTypeId = record
                .getString(tableName + Constants.STRING_PERIOD + Constants.FIELD_BILL_TYPE_ID);
            final String[] billLineFields = { Constants.FIELD_VN_ID, Constants.FIELD_BILL_ID,
                    Constants.FIELD_BILL_TYPE_ID, Constants.FIELD_BILL_UNIT_ID };
            final String[] billUnitFields =
                    { Constants.FIELD_ROLLUP_TYPE, Constants.FIELD_CONVERSION_FACTOR };

            String dataSourceId = "energyBillVsMeterCommon_dsUnitBilled";
            if (billLineTable.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
                dataSourceId = "energyBillVsMeterCommon_dsUnitBilledArch";
            }
            final DataSource dataSource =
                    DataSourceFactory.loadDataSourceFromFile(Constants.VIEW_COMMON, dataSourceId);
            dataSource.addTable(billLineTable, DataSource.ROLE_MAIN);
            dataSource.addTable(Constants.TABLE_BILL_UNIT, DataSource.ROLE_STANDARD);
            dataSource.addField(billLineTable, billLineFields);
            dataSource.addField(Constants.TABLE_BILL_UNIT, billUnitFields);
            dataSource.addRestriction(Restrictions.eq(billLineTable, Constants.FIELD_VN_ID, vnId));
            dataSource
                .addRestriction(Restrictions.eq(billLineTable, Constants.FIELD_BILL_ID, billId));
            dataSource.addRestriction(
                Restrictions.eq(billLineTable, Constants.FIELD_BILL_TYPE_ID, billTypeId));
            dataSource.addRestriction(Restrictions.sql("rollup_type  = '" + rollupType + "' "));
            final List<DataRecord> billUnitRecords = dataSource.getAllRecords();
            if (!billUnitRecords.isEmpty()) {
                conversionFactor =
                        (Double) billUnitRecords.get(0).getValue(Constants.TABLE_BILL_UNIT
                                + Constants.STRING_PERIOD + Constants.FIELD_CONVERSION_FACTOR);
            }
        }
        return qtyCommon / conversionFactor;
    }

    /**
     * getQtyMeasuredForBillOrBillLine - Get Measured Quantity (energy, power or volume) for all
     * meters linked to a bill or bill line record.
     *
     * Note that for the bill calculation, we are likely returning multiple meters for each bill,
     * and some may be virtual and some may not. We are finding the SUM or MAX of all of the meters
     * linked with a bill.
     *
     * @param record DataRecord - Bill or Bill Line record
     * @param rollupType String - Energy, Power or Volume
     * @param tableName String - bill or bill_line
     * @return qtyMeasured double - measured quantity in common units
     */

    public static double getQtyMeasuredForBillOrBillLine(final DataRecord record,
            final String rollupType, final String tableName) {

        final String vnId = record
            .getString(Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_VN_ID);
        final String vnAcId = record
            .getString(Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_VN_AC_ID);

        final DataSource dsDataPoint = getDataSourceDataPoint();
        dsDataPoint.addRestriction(
            Restrictions.eq(Constants.TABLE_BAS_DATA_POINT, Constants.FIELD_VN_ID, vnId));
        dsDataPoint.addRestriction(
            Restrictions.eq(Constants.TABLE_BAS_DATA_POINT, Constants.FIELD_VN_AC_ID, vnAcId));
        dsDataPoint.addRestriction(Restrictions.sql(Constants.TABLE_BAS_DATA_POINT
                + Constants.STRING_PERIOD + Constants.FIELD_ROLLUP_TYPE + Constants.STRING_EQUALS
                + Constants.STRING_SINGLE_QUOTE + rollupType + Constants.STRING_SINGLE_QUOTE));
        if (tableName.equals(Constants.TABLE_BILL_LINE)) {
            final String vnMeterId = record.getString(
                Constants.TABLE_BILL_LINE + Constants.STRING_PERIOD + Constants.FIELD_VN_METER_ID);
            dsDataPoint.addRestriction(Restrictions.eq(Constants.TABLE_BAS_DATA_POINT,
                Constants.FIELD_VN_METER_ID, vnMeterId));
        }
        final List<DataRecord> dataPointRecords = dsDataPoint.getAllRecords();

        return getQtyMeasuredForDataPoints(dataPointRecords, record, tableName, rollupType);
    }

    /**
     * getQtyMeasuredForDataPoints - Get measured quantity (energy, power or volume) from a bill or
     * bill line record. Determines the Measured Quantity (SUM for Energy/Volume or MAX for Demand)
     * for passed meter(s). If a Virtual Meter is linked with the bill line, separately calculates
     * the SUM or MAX quantity for the associated Virtual Meter(s). For Energy/Volume meters, adds
     * the Virtual Meter "Meters to Include" quantity and subtracts the "Meters to Exclude"
     * quantity. For Power meters, returns the max of the Measured Quantity or Meters to Include
     * quantity, whichever is greater.
     *
     * Note that for the bill calculation, we are likely returning multiple meters for each bill,
     * and some may be virtual and some may not. We are finding the SUM or MAX of all of the meters
     * linked with a bill.
     *
     * @param dataPointRecords <List>DataRecord
     * @param record DataRecord - Bill or Bill Line record
     * @param tableName String - bill, bill_line, bill_archive, or bill_line_archive
     * @param rollupType String - Energy, Power or Volume
     * @return qtyMeasured double - measured quantity in common units
     */
    public static double getQtyMeasuredForDataPoints(final List<DataRecord> dataPointRecords,
            final DataRecord record, final String tableName, final String rollupType) {
        final JSONObject meters = getMeters(dataPointRecords);
        final List<Integer> metersToInclude =
                (List<Integer>) meters.get(Constants.STRING_METERS_TO_INCLUDE);
        final List<Integer> metersToExclude =
                (List<Integer>) meters.get(Constants.STRING_METERS_TO_EXCLUDE);

        final DataSource dsQtyMeasuredInclude =
                getDataSourceQtyMeasured(record, tableName, rollupType, metersToInclude);
        double qtyMeasured = 0.00;
        final DataRecord recordInclude = dsQtyMeasuredInclude.getRecord();
        final double qtyMeasuredInclude = recordInclude.getDouble(Constants.TABLE_BAS_DATA_CLEAN_NUM
                + Constants.STRING_PERIOD + Constants.FIELD_QTY_MEASURED);

        if (rollupType.equals(Constants.ENERGY) || rollupType.equals(Constants.VOLUME)) {
            final DataSource dsQtyMeasuredExclude =
                    getDataSourceQtyMeasured(record, tableName, rollupType, metersToExclude);
            final DataRecord recordExclude = dsQtyMeasuredExclude.getRecord();
            final double qtyMeasuredExclude =
                    recordExclude.getDouble(Constants.TABLE_BAS_DATA_CLEAN_NUM
                            + Constants.STRING_PERIOD + Constants.FIELD_QTY_MEASURED);
            qtyMeasured = qtyMeasuredInclude - qtyMeasuredExclude;
        } else if (rollupType.equals(Constants.POWER)) {
            qtyMeasured = qtyMeasuredInclude;
        }
        return qtyMeasured;
    }

    /**
     * getRecordsDataPoints - Return records for data points linked to Bill or Bill Line for
     * "Meter Readings" dialog. Include measured quantity for each data point between bill start and
     * end dates. Return only Energy / Consumption data points for Prorate Utility View drilldown
     *
     * @param billOrBillLineRecord DataRecord
     * @param tableName String 'bill', 'bill_line', 'bill_archive', or 'bill_line_archive'
     * @param groupField String
     * @param groupFieldValue String
     * @return dataPointRecords List<DataRecord>
     */
    public static List<DataRecord> getRecordsDataPoints(final DataRecord billOrBillLineRecord,
            final String tableName, final String groupField, final String groupFieldValue) {
        String billTable = Constants.TABLE_BILL;
        if (tableName.equals(Constants.TABLE_BILL_ARCHIVE)
                || tableName.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
            billTable = Constants.TABLE_BILL_ARCHIVE;
        }

        final DataSource dataSource = getDataSourceDataPoint();
        dataSource.addRestriction(Restrictions.eq(Constants.TABLE_BAS_DATA_POINT,
            Constants.FIELD_VN_ID, billOrBillLineRecord
                .getString(billTable + Constants.STRING_PERIOD + Constants.FIELD_VN_ID)));
        dataSource.addRestriction(Restrictions.eq(Constants.TABLE_BAS_DATA_POINT,
            Constants.FIELD_VN_AC_ID, billOrBillLineRecord
                .getString(billTable + Constants.STRING_PERIOD + Constants.FIELD_VN_AC_ID)));
        if (Constants.TABLE_BILL_LINE.equals(tableName)
                || Constants.TABLE_BILL_LINE_ARCHIVE.equals(tableName)) {
            final String rollupType = billOrBillLineRecord.getString(
                Constants.TABLE_BILL_UNIT + Constants.STRING_PERIOD + Constants.FIELD_ROLLUP_TYPE);
            dataSource.addRestriction(Restrictions.sql(Constants.FIELD_ROLLUP_TYPE
                    + Constants.STRING_EQUALS + Constants.STRING_SINGLE_QUOTE + rollupType
                    + Constants.STRING_SINGLE_QUOTE));
            dataSource.addRestriction(Restrictions.eq(Constants.TABLE_BAS_DATA_POINT,
                Constants.FIELD_VN_METER_ID, billOrBillLineRecord
                    .getString(tableName + Constants.STRING_PERIOD + Constants.FIELD_VN_METER_ID)));
            // set bill line vn_rate.block to 0. do not display readings as separate blocks in case
            // there are multiple meters.
            billOrBillLineRecord.setValue(
                Constants.TABLE_VN_RATE + Constants.STRING_PERIOD + Constants.FIELD_BLOCK, 0.0);
        }
        if (!"".equals(groupFieldValue)) {
            dataSource.addRestriction(Restrictions
                .sql(groupField + Constants.STRING_EQUALS + Constants.STRING_SINGLE_QUOTE
                        + groupFieldValue + Constants.STRING_SINGLE_QUOTE));
        }
        if (tableName.equals(Constants.TABLE_BILL_ARCHIVE)
                || tableName.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
            dataSource.addRestriction(Restrictions
                .sql(Constants.FIELD_ROLLUP_TYPE + " IN " + " ( " + "'Energy','Volume'" + " ) "));
        }
        final List<DataRecord> dataPointRecords = dataSource.getAllRecords();

        DataRecord dataPointRecord = null;
        String recordRollupType = "";
        List<DataRecord> records = null;
        double qtyMeasured = 0.00;

        for (int i = 0; i < dataPointRecords.size(); i++) {
            dataPointRecord = dataPointRecords.get(i);
            recordRollupType = dataPointRecord.getString(Constants.TABLE_BAS_DATA_POINT
                    + Constants.STRING_PERIOD + Constants.FIELD_ROLLUP_TYPE);
            records = new ArrayList<DataRecord>();
            records.add(dataPointRecord);
            qtyMeasured = getQtyMeasuredForDataPoints(records, billOrBillLineRecord, tableName,
                recordRollupType);
            qtyMeasured = getQtyInBilledUnits(qtyMeasured, billOrBillLineRecord, recordRollupType,
                tableName);
            dataPointRecord.setValue(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                    + Constants.FIELD_QTY_MEASURED,
                qtyMeasured);
        }
        return dataPointRecords;
    }

    /**
     * getDataSourceDataPoint - Return dataSource for bas data points joined with bas measurement
     * scope table.
     *
     * @return dataSource DataSource
     */
    private static DataSource getDataSourceDataPoint() {
        final DataSource dataSource = DataSourceFactory
            .loadDataSourceFromFile(Constants.VIEW_COMMON, "energyBillVsMeterCommon_dsDataPoint");
        return dataSource;
    }

    /**
     * getDataSourceQtyMeasured - Get data source for Measured Quantity.
     *
     * @param record DataRecord
     * @param tableName String - bill, bill line, bill_archive, or bill_line_archive
     * @param rollupType String
     * @param meters List<Integer>
     * @return dataSource
     */
    private static DataSource getDataSourceQtyMeasured(final DataRecord record,
            final String tableName, final String rollupType, final List<Integer> meters) {
        String months = "1,2,3,4,5,6,7,8,9,10,11,12";
        String hours = "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23";
        double block = 0;
        double lowerThreshold = 0.00;
        Object upperThreshold = null;
        double billedUnitsConversionFactor = 1;
        String billTable = Constants.TABLE_BILL;
        if (tableName.equals(Constants.TABLE_BILL_ARCHIVE)
                || tableName.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
            billTable = Constants.TABLE_BILL_ARCHIVE;
        }

        if (tableName.equals(Constants.TABLE_BILL_LINE)
                || tableName.equals(Constants.TABLE_BILL_LINE_ARCHIVE)) {
            months = formatMonthsOrHours(months, record.getString(
                Constants.TABLE_VN_RATE + Constants.STRING_PERIOD + Constants.FIELD_MONTHS));
            hours = formatMonthsOrHours(hours, record.getString(
                Constants.TABLE_VN_RATE + Constants.STRING_PERIOD + Constants.FIELD_HOURS));

            block = record.getDouble(
                Constants.TABLE_VN_RATE + Constants.STRING_PERIOD + Constants.FIELD_BLOCK);
            lowerThreshold = record.getDouble(Constants.TABLE_VN_RATE + Constants.STRING_PERIOD
                    + Constants.FIELD_LOWER_THRESHOLD);
            upperThreshold = record.getValue(Constants.TABLE_VN_RATE + Constants.STRING_PERIOD
                    + Constants.FIELD_UPPER_THRESHOLD);
            billedUnitsConversionFactor = record.getDouble(Constants.TABLE_BILL_UNIT
                    + Constants.STRING_PERIOD + Constants.FIELD_CONVERSION_FACTOR);

        }

        final Date dateServiceStart = record
            .getDate(billTable + Constants.STRING_PERIOD + Constants.FIELD_DATE_SERVICE_START);
        final Date dateServiceEnd = record
            .getDate(billTable + Constants.STRING_PERIOD + Constants.FIELD_DATE_SERVICE_END);

        final DataSource dataSource = DataSourceFactory
            .loadDataSourceFromFile(Constants.VIEW_COMMON, "energyBillVsMeterCommon_dsQtyMeasured");
        dataSource.addTable(Constants.TABLE_BAS_DATA_CLEAN_NUM, DataSource.ROLE_MAIN);
        dataSource.addVirtualField(Constants.TABLE_BAS_DATA_CLEAN_NUM, Constants.FIELD_QTY_MEASURED,
            DataSource.DATA_TYPE_DOUBLE, Constants.SIXTEEN, Constants.SIX);
        dataSource.addParameter("dateServiceStart", dateServiceStart, DataSource.DATA_TYPE_DATE);
        dataSource.addParameter("dateServiceEnd", dateServiceEnd, DataSource.DATA_TYPE_DATE);
        dataSource.addParameter(Constants.FIELD_MONTHS, months, DataSource.DATA_TYPE_VERBATIM);
        dataSource.addParameter(Constants.FIELD_HOURS, hours, DataSource.DATA_TYPE_VERBATIM);
        dataSource.addParameter(Constants.FIELD_BLOCK, block, DataSource.DATA_TYPE_DOUBLE);
        dataSource.addParameter(Constants.FIELD_LOWER_THRESHOLD, lowerThreshold,
            DataSource.DATA_TYPE_DOUBLE);
        dataSource.addParameter(Constants.FIELD_UPPER_THRESHOLD, upperThreshold,
            DataSource.DATA_TYPE_DOUBLE);
        if (upperThreshold == null) {
            dataSource.addParameter(Constants.LOWER_THRESHOLD_NULL_CASE, 0,
                DataSource.DATA_TYPE_INTEGER);
        } else {
            dataSource.addParameter(Constants.LOWER_THRESHOLD_NULL_CASE, lowerThreshold,
                DataSource.DATA_TYPE_DOUBLE);
        }
        dataSource.addParameter("billed_units_conversion_factor", billedUnitsConversionFactor,
            DataSource.DATA_TYPE_DOUBLE);
        dataSource.addParameter(Constants.FIELD_ROLLUP_TYPE, rollupType, DataSource.DATA_TYPE_TEXT);
        dataSource.addParameter(Constants.FIELD_METERS, getStrMeters(meters),
            DataSource.DATA_TYPE_VERBATIM);
        return dataSource;

    }

    /**
     * formatMonthsOrHours - Return comma-delimited list of months or hours.
     *
     * @param defaultValue String
     * @param list String
     * @return list String
     */

    private static String formatMonthsOrHours(final String defaultValue, final String list) {
        String value = defaultValue;
        if (StringUtil.notNullOrEmpty(list)) {
            value = list.replaceAll("\\;", Constants.STRING_COMMA);
        }
        return value;
    }

    /**
     * getMeters - Add meters to ArrayList of meters to include. Add virtual meters and nested
     * virtual meters up to one level of nesting.
     *
     * @param dataPointRecords List<DataRecord>
     * @return meters JSONObject
     */
    private static JSONObject getMeters(final List<DataRecord> dataPointRecords) {
        int meterId = 0;
        DataRecord dataPointRecord = null;
        DataSource dataSource;
        List<Integer> metersToInclude = new ArrayList<Integer>();
        List<Integer> metersToExclude = new ArrayList<Integer>();
        JSONObject meters = new JSONObject();
        meters.put(Constants.STRING_METERS_TO_INCLUDE, metersToInclude);
        meters.put(Constants.STRING_METERS_TO_EXCLUDE, metersToExclude);

        for (int i = 0; i < dataPointRecords.size(); i++) {
            dataPointRecord = dataPointRecords.get(i);
            metersToInclude = (List<Integer>) meters.get(Constants.STRING_METERS_TO_INCLUDE);
            metersToExclude = (List<Integer>) meters.get(Constants.STRING_METERS_TO_EXCLUDE);

            meterId = dataPointRecord.getInt(Constants.TABLE_BAS_DATA_POINT
                    + Constants.STRING_PERIOD + Constants.FIELD_DATA_POINT_ID);
            metersToInclude.add(meterId);
            dataSource = getDataSourceDataPoint();
            dataSource.addRestriction(Restrictions.eq(Constants.TABLE_BAS_DATA_POINT,
                Constants.FIELD_DATA_POINT_ID, meterId));
            dataPointRecord = dataSource.getRecord();

            meters = new JSONObject();
            meters.put(Constants.STRING_METERS_TO_INCLUDE, metersToInclude);
            meters.put(Constants.STRING_METERS_TO_EXCLUDE, metersToExclude);
            meters = addMetersToIncludeOrExclude(dataPointRecord, meters, Constants.INCLUDE);
            meters = addMetersToIncludeOrExclude(dataPointRecord, meters, Constants.EXCLUDE);
        }
        return meters;
    }

    /**
     * addMetersToIncludeOrExclude - Set ArrayList of meters to include or exclude for a virtual
     * meter. Include nested virtual meters up to one level of nesting.
     *
     * @param dataPointRecord DataRecord
     * @param currentMeters JSONObject
     * @param type String - include or exclude
     * @return meters JSONObject
     */
    private static JSONObject addMetersToIncludeOrExclude(final DataRecord dataPointRecord,
            final JSONObject currentMeters, final String type) {
        int meterId = 0;
        List<Integer> metersToInclude =
                (List<Integer>) currentMeters.get(Constants.STRING_METERS_TO_INCLUDE);
        List<Integer> metersToExclude =
                (List<Integer>) currentMeters.get(Constants.STRING_METERS_TO_EXCLUDE);
        JSONObject meters = new JSONObject();
        meters.put(Constants.STRING_METERS_TO_INCLUDE, metersToInclude);
        meters.put(Constants.STRING_METERS_TO_EXCLUDE, metersToExclude);

        final String fieldValue = dataPointRecord.getString(
            Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD + "meters_to_" + type);
        final StringTokenizer metersTokenizer =
                new StringTokenizer(fieldValue == null ? "" : fieldValue, Constants.STRING_COMMA);
        while (metersTokenizer.hasMoreTokens()) {
            metersToInclude = (List<Integer>) meters.get(Constants.STRING_METERS_TO_INCLUDE);
            metersToExclude = (List<Integer>) meters.get(Constants.STRING_METERS_TO_EXCLUDE);

            meterId = Integer.parseInt(
                metersTokenizer.nextToken().replaceAll(Constants.STRING_SPECIAL_CHARS, ""));
            if (Constants.INCLUDE.equals(type)) {
                metersToInclude.add(meterId);
            } else if (Constants.EXCLUDE.equals(type)) {
                metersToExclude.add(meterId);
            }
            meters = new JSONObject();
            meters.put(Constants.STRING_METERS_TO_INCLUDE, metersToInclude);
            meters.put(Constants.STRING_METERS_TO_EXCLUDE, metersToExclude);
            meters = addNestedMetersToIncludeOrExclude(meterId, meters, type);
        }
        return meters;
    }

    /**
     * addNestedMetersToIncludeOrExclude - Add nested virtual meters to ArrayList of meters to
     * include or exclude for a virtual meter.
     *
     * @param meterId integer
     * @param currentMeters JSONObject
     * @param type String - include or exclude
     * @return meters JSONObject
     */
    private static JSONObject addNestedMetersToIncludeOrExclude(final int meterId,
            final JSONObject currentMeters, final String type) {

        final List<Integer> metersToInclude =
                (List<Integer>) currentMeters.get(Constants.STRING_METERS_TO_INCLUDE);
        final List<Integer> metersToExclude =
                (List<Integer>) currentMeters.get(Constants.STRING_METERS_TO_EXCLUDE);
        JSONObject meters = new JSONObject();
        meters.put(Constants.STRING_METERS_TO_INCLUDE, metersToInclude);
        meters.put(Constants.STRING_METERS_TO_EXCLUDE, metersToExclude);

        final DataSource dataSource = getDataSourceDataPoint();
        dataSource.addRestriction(Restrictions.eq(Constants.TABLE_BAS_DATA_POINT,
            Constants.FIELD_DATA_POINT_ID, meterId));
        final DataRecord record = dataSource.getRecord();

        String fieldValue = record.getString(Constants.TABLE_BAS_DATA_POINT
                + Constants.STRING_PERIOD + Constants.FIELD_METERS_TO_INCLUDE);
        final StringTokenizer nestedMetersToInclude =
                new StringTokenizer(fieldValue == null ? "" : fieldValue, Constants.STRING_COMMA);

        fieldValue = record.getString(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                + Constants.FIELD_METERS_TO_EXCLUDE);
        final StringTokenizer nestedMetersToExclude =
                new StringTokenizer(fieldValue == null ? "" : fieldValue, Constants.STRING_COMMA);

        int nestedMeterId = 0;
        while (nestedMetersToInclude.hasMoreTokens()) {
            nestedMeterId = Integer.parseInt(
                nestedMetersToInclude.nextToken().replaceAll(Constants.STRING_SPECIAL_CHARS, ""));
            meters = addNestedMeter(nestedMeterId, meters, type, Constants.INCLUDE);
        }
        while (nestedMetersToExclude.hasMoreTokens()) {
            nestedMeterId = Integer.parseInt(
                nestedMetersToExclude.nextToken().replaceAll(Constants.STRING_SPECIAL_CHARS, ""));
            meters = addNestedMeter(nestedMeterId, meters, type, Constants.EXCLUDE);
        }
        return meters;
    }

    /**
     * addNestedMeter - Add nested virtual meter to ArrayList of meters to include or exclude for a
     * virtual meter.
     *
     * For an included meter, add a nested include to the include list, and add a nested exclude to
     * the exclude list.
     *
     * For an excluded meter, add a nested include to the exclude list, and add a nested exclude to
     * the include list.
     *
     *
     * @param nestedMeterId integer
     * @param currentMeters JSONObject
     * @param type String - include or exclude
     * @param nestedType String - include or exclude
     * @return meters JSONObject
     */
    private static JSONObject addNestedMeter(final int nestedMeterId,
            final JSONObject currentMeters, final String type, final String nestedType) {
        final List<Integer> metersToInclude =
                (List<Integer>) currentMeters.get(Constants.STRING_METERS_TO_INCLUDE);
        final List<Integer> metersToExclude =
                (List<Integer>) currentMeters.get(Constants.STRING_METERS_TO_EXCLUDE);

        if (Constants.INCLUDE.equals(type)) {
            if (Constants.INCLUDE.equals(nestedType)) {
                metersToInclude.add(nestedMeterId);
            } else {
                metersToExclude.add(nestedMeterId);
            }
        } else {
            if (Constants.INCLUDE.equals(nestedType)) {
                metersToExclude.add(nestedMeterId);
            } else {
                metersToInclude.add(nestedMeterId);
            }
        }
        final JSONObject meters = new JSONObject();
        meters.put(Constants.STRING_METERS_TO_INCLUDE, metersToInclude);
        meters.put(Constants.STRING_METERS_TO_EXCLUDE, metersToExclude);
        return meters;
    }

    /**
     * getStrMeters - Get meters list as string to pass as a parameter to IN clause. Returns "0", a
     * valid but non-existent data_point_id, if list is empty.
     *
     * @param meters ArrayList<Integer>
     * @return fieldValue String
     */
    private static String getStrMeters(final List<Integer> meters) {
        String fieldValue = "";
        for (int i = 0; i < meters.size(); i++) {
            if (!"".equals(fieldValue)) {
                fieldValue += Constants.STRING_COMMA;
            }
            fieldValue += meters.get(i);
        }
        if ("".equals(fieldValue)) {
            fieldValue = Constants.STRING_ZERO_INT;
        }
        return fieldValue;
    }

}
