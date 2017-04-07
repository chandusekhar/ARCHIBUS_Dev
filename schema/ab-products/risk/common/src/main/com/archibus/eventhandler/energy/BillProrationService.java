package com.archibus.eventhandler.energy;

import java.util.List;

import org.json.*;

import com.archibus.app.common.metrics.Messages;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * BillMeterReconciliationService - This class detects Bill errors by comparing billed quantities
 * with meter readings
 *
 * History: <li>22.1 Initial implementation.
 *
 *
 * @author Kaori Emery
 */

public class BillProrationService extends JobBase {

    /**
     * getBillProrationRecordsForGrid - Set data set for the bill proration grid. Get the
     * consumption data points linked to the vendor account, grouped by the grouping field (Site,
     * Building, Floor, Zone or Meter). Calculate the consumption qty_measured for each data point
     * grouping. Sum the qty_measured to get the total consumption qty_measured, needed eventually
     * to derive the proration factor for each data point grouping.
     *
     * Call getRecordsProrationGrid to get the records for the grid, passing the total consumption
     * qty_measured value for calculation of each grouping's proration factor.
     *
     * @param vnId String
     * @param billId String
     * @param groupField String
     * @throws ExceptionBase exception
     */
    public void getBillProrationRecordsForGrid(final String vnId, final String billId,
            final String groupField) throws ExceptionBase {

        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);
            
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                final List<DataRecord> groupRecords = getRecordsGroup(vnId, billId, groupField);
                
                final double qtyMeasuredConsumpTotal = getTotalConsump(groupRecords);

                final List<DataRecord> prorationRecords =
                        getRecordsProrationGrid(vnId, billId, groupField, groupRecords,
                            qtyMeasuredConsumpTotal);
                
                this.status.setCurrentNumber(Constants.HUNDRED);
                this.status.setCode(JobStatus.JOB_COMPLETE);
                this.status.setDataSet(new DataSetList(prorationRecords));
            }
        } catch (final ExceptionBase e) {
            
            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(Messages.ERROR_NO_DATA_AVAILABLE, e);
        }
    }
    
    /**
     * getBillProrationRecordsForChart - get chart proration records for bill.
     *
     *
     * @param context Context.
     */
    public void getBillProrationRecordsForChart(final EventHandlerContext context) {
        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCurrentNumber(0);
            this.status.setCode(JobStatus.JOB_STARTED);
            
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                final String groupField = context.getString("group_field");
                final String vnId = context.getString("vn_id");
                final String billId = context.getString("bill_id");
                
                final List<DataRecord> groupRecords = getRecordsGroup(vnId, billId, groupField);
                
                final double qtyMeasuredConsumpTotal = getTotalConsump(groupRecords);

                final List<DataRecord> prorationRecords =
                        getRecordsProrationGrid(vnId, billId, groupField, groupRecords,
                            qtyMeasuredConsumpTotal);
                
                String groupFieldValue = "";
                double qtyMeasured = 0.00;
                double prorationFactor = 0.00;
                double amountProrated = 0.00;
                DataRecord record = null;
                
                final JSONArray jsonRecords = new JSONArray();
                for (int i = 0; i < prorationRecords.size(); i++) {

                    record = prorationRecords.get(i);
                    groupFieldValue =
                            record.getString(Constants.TABLE_BAS_DATA_POINT
                                + Constants.STRING_PERIOD + Constants.FIELD_GROUP_FIELD);
                    qtyMeasured =
                            record.getDouble(Constants.TABLE_BAS_DATA_POINT
                                + Constants.STRING_PERIOD + Constants.FIELD_QTY_MEASURED);
                    prorationFactor =
                            record.getDouble(Constants.TABLE_BAS_DATA_POINT
                                + Constants.STRING_PERIOD + Constants.FIELD_PRORATION_FACTOR);
                    amountProrated =
                            record.getDouble(Constants.TABLE_BAS_DATA_POINT
                                + Constants.STRING_PERIOD + Constants.FIELD_AMOUNT_PRORATED);
                    
                    final JSONObject data = new JSONObject();
                    data.put(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                        + Constants.FIELD_GROUP_FIELD, groupFieldValue);
                    data.put(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                        + Constants.FIELD_QTY_MEASURED, qtyMeasured);
                    data.put(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                        + Constants.FIELD_PRORATION_FACTOR, prorationFactor);
                    data.put(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                        + Constants.FIELD_AMOUNT_PRORATED, amountProrated);
                    
                    jsonRecords.put(data);
                }
                
                context.addResponseParameter("jsonExpression", jsonRecords.toString());
                this.status.setCurrentNumber(Constants.PROGRESS_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {
            this.status.setCode(JobStatus.JOB_FAILED);
            throw new ExceptionBase(Messages.ERROR_NO_DATA_AVAILABLE, e);
        }
    }

    /**
     * getRecordsGroup - Return records for data point groups.
     *
     * @param vnId String
     * @param billId String
     * @param groupField String
     * @return groupRecords List<DataRecord>
     */
    private List<DataRecord> getRecordsGroup(final String vnId, final String billId,
            final String groupField) {
        List<DataRecord> dataPointRecords = null;
        DataRecord groupRecord = null;
        String groupFieldValue = "";
        double qtyMeasuredConsump = 0.00;

        final DataRecord billRecord =
                BillMeterCommon.getRecordsBills(vnId, billId, "", Constants.TABLE_BILL_ARCHIVE, "")
                .get(0);
        final List<DataRecord> groupRecords = getRecordsDataPointsGroup(groupField);
        for (int i = 0; i < groupRecords.size(); i++) {
            groupRecord = groupRecords.get(i);
            groupFieldValue =
                    groupRecord.getString(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                        + Constants.FIELD_GROUP_FIELD);
            dataPointRecords =
                    BillMeterCommon.getRecordsDataPoints(billRecord, Constants.TABLE_BILL_ARCHIVE,
                        groupField, groupFieldValue);
            qtyMeasuredConsump =
                    BillMeterCommon.getQtyMeasuredForDataPoints(dataPointRecords, billRecord,
                        Constants.TABLE_BILL_ARCHIVE, Constants.ENERGY);
            qtyMeasuredConsump =
                    BillMeterCommon.getQtyInBilledUnits(qtyMeasuredConsump, billRecord,
                        Constants.ENERGY, Constants.TABLE_BILL_ARCHIVE);
            groupRecord.setValue(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                + Constants.FIELD_QTY_MEASURED, qtyMeasuredConsump);
        }
        return groupRecords;
    }

    /**
     * getTotalConsump - Return total consump for group records.
     *
     * @param groupRecords List<DataRecord>
     * @return qtyMeasuredConsumpTotal double
     */
    private double getTotalConsump(final List<DataRecord> groupRecords) {
        DataRecord groupRecord = null;
        double qtyMeasuredConsump = 0.00;
        double qtyMeasuredConsumpTotal = 0.00;

        for (int i = 0; i < groupRecords.size(); i++) {
            groupRecord = groupRecords.get(i);
            qtyMeasuredConsump =

                    groupRecord.getDouble(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                        + Constants.FIELD_QTY_MEASURED);

            qtyMeasuredConsumpTotal += qtyMeasuredConsump;
        }
        return qtyMeasuredConsumpTotal;
    }

    /**
     * getRecordsProrationGrid - Return records for proration table. The datasource from the axvw
     * groups each bill line value by data point group (Site, Building, Floor, Zone or Meter). The
     * axvw datasource returns zero values for qty_measured, proration factor and amount_prorated.
     * The record's grouping value (e.g. "JFK A - 01" as Bl-Fl-Id) is matched with those in the
     * groupRecords to get the consumption qty_measured for that data point group. The Proration
     * Factor for the data point group is calculated by dividing the consumption qty_measured for
     * the data point group by the total consumption qty_measured. That Proration Factor is used to
     * prorate the cost of the bill line.
     *
     * @param vnId String
     * @param billId String
     * @param groupField String
     * @param groupRecords List<DataRecord>
     * @param qtyMeasuredConsumpTotal double
     * @return records List<DataRecord>
     */
    private List<DataRecord> getRecordsProrationGrid(final String vnId, final String billId,
            final String groupField, final List<DataRecord> groupRecords,
            final double qtyMeasuredConsumpTotal) {

        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile("ab-energy-bill-prorate.axvw",
                    "energyBillProrate_ds2");
        dataSource.addParameter(Constants.FIELD_GROUP_FIELD, groupField,
            DataSource.DATA_TYPE_VERBATIM);
        dataSource.addParameter(Constants.FIELD_VN_ID, vnId, DataSource.DATA_TYPE_TEXT);
        dataSource.addParameter(Constants.FIELD_BILL_ID, billId, DataSource.DATA_TYPE_TEXT);
        final List<DataRecord> records = dataSource.getRecords();
        
        DataRecord record = null;
        String groupFieldValue = "";
        final double amountBilled = getAmountBilledForBill(vnId, billId);
        double qtyMeasuredConsump = 0.00;
        double prorationFactor = 1.000;
        
        if (qtyMeasuredConsumpTotal > 0) {
            for (int i = 0; i < records.size(); i++) {
                prorationFactor = 1.000;
                qtyMeasuredConsump = 0.00;
                record = records.get(i);
                groupFieldValue =
                        record.getString(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                                + Constants.FIELD_GROUP_FIELD);

                if (!"".equals(groupFieldValue)) {
                    qtyMeasuredConsump =
                            getQtyMeasuredForDataPointGroup(groupRecords, groupFieldValue);
                    prorationFactor = qtyMeasuredConsump / qtyMeasuredConsumpTotal;
                }
                record.setValue(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                    + Constants.FIELD_QTY_MEASURED, qtyMeasuredConsump);
                record.setValue(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                    + Constants.FIELD_PRORATION_FACTOR, prorationFactor);
                record.setValue(Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                    + Constants.FIELD_AMOUNT_PRORATED, amountBilled * prorationFactor);
            }
        }
        return records;
    }
    
    /**
     * getQtyMeasuredForDataPointGroup - Return qty measured from the groupRecords list for the data
     * point group by matching the groupFieldValue.
     *
     * @param groupRecords List<DataRecord>
     * @param groupFieldValue String
     * @return qtyMeasured double
     */
    private double getQtyMeasuredForDataPointGroup(final List<DataRecord> groupRecords,
            final String groupFieldValue) {
        double qtyMeasured = 0.00;
        String thisGroupFieldValue = "";
        

        for (int i = 0; i < groupRecords.size(); i++) {
            if (groupFieldValue == null) { 
                break; 
            }
            thisGroupFieldValue =
                    groupRecords.get(i).getString(
                        Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                        + Constants.FIELD_GROUP_FIELD);
            if (thisGroupFieldValue == null) { 
                continue; 
            }
            if (thisGroupFieldValue.equals(groupFieldValue)) {
                qtyMeasured =
                        groupRecords.get(i).getDouble(
                            Constants.TABLE_BAS_DATA_POINT + Constants.STRING_PERIOD
                            + Constants.FIELD_QTY_MEASURED);
                break;
            }
        }
        return qtyMeasured;
    }
    
    /**
     * getRecordsDataPointsGroup - Return data point groupings.
     *
     * @param groupField String
     * @return groupRecords List<DataRecord>
     */
    private List<DataRecord> getRecordsDataPointsGroup(final String groupField) {
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(Constants.VIEW_COMMON,
                    "energyBillVsMeterCommon_dsDataPointGroup");
        dataSource.addTable(Constants.TABLE_BAS_DATA_POINT, DataSource.ROLE_MAIN);
        dataSource.addParameter(Constants.FIELD_GROUP_FIELD, groupField,
            DataSource.DATA_TYPE_VERBATIM);
        dataSource.addVirtualField(Constants.TABLE_BAS_DATA_POINT, Constants.FIELD_GROUP_FIELD,
            DataSource.DATA_TYPE_TEXT);
        dataSource.addVirtualField(Constants.TABLE_BAS_DATA_POINT, Constants.FIELD_QTY_MEASURED,
            DataSource.DATA_TYPE_NUMBER, Constants.SIXTEEN, Constants.SIX);
        return dataSource.getRecords();
    }
    
    /**
     * getAmountBilledForBill - Return amount_expense.
     *
     * @param vnId String
     * @param billId String
     * @return amountExpense double
     */
    private double getAmountBilledForBill(final String vnId, final String billId) {
        double amountBilled = 0.00;
        final List<DataRecord> records =
                BillMeterCommon.getRecordsBills(vnId, billId, "", Constants.TABLE_BILL_ARCHIVE, "");
        final DataRecord record = records.get(0);
        amountBilled =
                record.getDouble(Constants.TABLE_BILL_ARCHIVE + Constants.STRING_PERIOD
                    + Constants.FIELD_AMOUNT_EXPENSE);
        return amountBilled;
    }
}
