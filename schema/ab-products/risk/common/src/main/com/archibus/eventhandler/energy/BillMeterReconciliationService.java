package com.archibus.eventhandler.energy;

import java.util.*;

import com.archibus.app.common.metrics.Messages;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.app.common.metrics.provider.MetricValuesProvider;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

/**
 * BillMeterReconciliationService - This class detects Bill errors by comparing billed quantities
 * with meter readings
 *
 * History:
 * <li>22.1 Initial implementation.
 *
 *
 * @author Kaori Emery
 */

public class BillMeterReconciliationService extends JobBase implements MetricValuesProvider {

    /**
     * Metric definition.
     */
    private Metric metric;

    /**
     * getBillDiscrepancyRecordsForMetricAlert - Return map of a single max discrepancy in billed vs
     * measured readings by bill. Compare Energy, Power and Volume Discrepancies for each bill and
     * record the largest discrepancy calculated per bill.
     *
     * @return discrepancyValues Map<String, Double>
     * @throws ExceptionBase exception
     */
    public Map<String, Double> getBillDiscrepancyRecordsForMetricAlert() throws ExceptionBase {
        final List<DataRecord> billRecords = BillMeterCommon.getRecordsBills("", "",
            Constants.STATUS_PENDING_APPROVAL, Constants.TABLE_BILL, "");

        if (StringUtil.isNullOrEmpty(billRecords)) {
            final ExceptionBase newException = ExceptionBaseFactory.newTranslatableException(
                Messages.ERROR_NO_DATA_AVAILABLE, new Object[] { this.metric.getTitle() });
            throw newException;
        }

        double billedValue = 0.00;
        double measuredValue = 0.00;
        double discrepancy = 0.00;
        double maxDiscrepancy = 0.00;
        String vnBillId = "";
        String maxVnBillId = "";
        double maxBillLineDiscrepancy = 0.00;
        String billRecordVnId = "";
        String billRecordBillId = "";

        DataRecord billRecord = null;

        final Map<String, Double> discrepancyValues = new HashMap<String, Double>();
        for (int i = 0; i < billRecords.size(); i++) {
            billRecord = billRecords.get(i);
            vnBillId = billRecord.getString(
                Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_VN_BILL_ID);

            billedValue = billRecord.getDouble(
                Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_QTY_ENERGY);
            measuredValue = BillMeterCommon.getQtyMeasuredForBillOrBillLine(billRecord,
                Constants.ENERGY, Constants.TABLE_BILL);
            discrepancy = getDiscrepancy(billedValue, measuredValue);
            if (Math.abs(discrepancy) > Math.abs(maxDiscrepancy)) {
                maxDiscrepancy = discrepancy;
                maxVnBillId = vnBillId;
            }

            billedValue = billRecord.getDouble(
                Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_QTY_POWER);
            measuredValue = BillMeterCommon.getQtyMeasuredForBillOrBillLine(billRecord,
                Constants.POWER, Constants.TABLE_BILL);
            discrepancy = getDiscrepancy(billedValue, measuredValue);
            if (Math.abs(discrepancy) > Math.abs(maxDiscrepancy)) {
                maxDiscrepancy = discrepancy;
                maxVnBillId = vnBillId;
            }

            billedValue = billRecord.getDouble(
                Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_QTY_VOLUME);
            measuredValue = BillMeterCommon.getQtyMeasuredForBillOrBillLine(billRecord,
                Constants.VOLUME, Constants.TABLE_BILL);
            discrepancy = getDiscrepancy(billedValue, measuredValue);
            if (Math.abs(discrepancy) > Math.abs(maxDiscrepancy)) {
                maxDiscrepancy = discrepancy;
                maxVnBillId = vnBillId;
            }

            billRecordVnId = billRecord
                .getString(Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_VN_ID);
            billRecordBillId = billRecord.getString(
                Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_BILL_ID);
            maxBillLineDiscrepancy = getMaxBillLineDiscrepancy(billRecordVnId, billRecordBillId);
            if (Math.abs(maxBillLineDiscrepancy) > Math.abs(maxDiscrepancy)) {
                maxDiscrepancy = maxBillLineDiscrepancy;
                maxVnBillId = vnBillId;
            }
        }
        discrepancyValues.put(maxVnBillId, maxDiscrepancy / Constants.HUNDRED);
        return discrepancyValues;
    }

    /**
     * getBillDiscrepancyRecordsForGrid - Return records with energy/power/volume discrepancies and
     * max discrepancy in billed vs measured readings by bill. Also returns billed and measured
     * quantities. These values are converted from the common unit to the billed unit. The max
     * discrepancy is taken from the max of the bill's demand or consumption or volume discrepancies
     * OR the max bill line discrepancy, whichever is greatest.
     *
     * @param vnId String
     * @param billId String
     * @param restrictionJSON String
     * @throws ExceptionBase exception
     */
    public void getBillDiscrepancyRecordsForGrid(final String vnId, final String billId,
            final String restrictionJSON) throws ExceptionBase {
        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);

            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                final List<DataRecord> billRecords = BillMeterCommon.getRecordsBills(vnId, billId,
                    Constants.STATUS_PENDING_APPROVAL, Constants.TABLE_BILL, restrictionJSON);

                DataRecord billRecord = null;
                double maxBillLineDiscrepancy = 0.00;
                double billedValue = 0.00;
                double measuredValue = 0.00;
                double discrepancy = 0.00;
                double maxDiscrepancy = 0.00;
                String rollupType = "";
                String suffix = "";

                final Map<String, String> discrepancyFields = new HashMap<String, String>();
                discrepancyFields.put("energy", Constants.ENERGY);
                discrepancyFields.put("power", Constants.POWER);
                discrepancyFields.put("volume", Constants.VOLUME);

                for (int i = 0; i < billRecords.size(); i++) {
                    maxDiscrepancy = 0.00;
                    billRecord = billRecords.get(i);

                    for (int j = 0; j < discrepancyFields.size(); j++) {
                        suffix = (String) discrepancyFields.keySet().toArray()[j];
                        rollupType = discrepancyFields.get(suffix);
                        billedValue = billRecord
                            .getDouble(Constants.TABLE_BILL + Constants.STRING_PERIOD
                                    + Constants.FIELD_QTY + Constants.STRING_UNDERSCORE + suffix);
                        measuredValue = BillMeterCommon.getQtyMeasuredForBillOrBillLine(billRecord,
                            rollupType, Constants.TABLE_BILL);
                        discrepancy = getDiscrepancy(billedValue, measuredValue);
                        billRecord.setValue(
                            Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_QTY
                                    + Constants.STRING_UNDERSCORE + suffix + "_billed",
                            BillMeterCommon.getQtyInBilledUnits(billedValue, billRecord, rollupType,
                                Constants.TABLE_BILL));
                        billRecord.setValue(
                            Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_QTY
                                    + Constants.STRING_UNDERSCORE + suffix + "_measured",
                            BillMeterCommon.getQtyInBilledUnits(measuredValue, billRecord,
                                rollupType, Constants.TABLE_BILL));
                        billRecord.setValue(Constants.TABLE_BILL + Constants.STRING_PERIOD
                                + "discrepancy_" + suffix,
                            discrepancy);

                        maxDiscrepancy = compareMaxDiscrepancy(maxDiscrepancy, discrepancy);

                    }

                    maxBillLineDiscrepancy = getMaxBillLineDiscrepancy(
                        billRecord.getString(
                            Constants.TABLE_BILL + Constants.STRING_PERIOD + Constants.FIELD_VN_ID),
                        billRecord.getString(Constants.TABLE_BILL + Constants.STRING_PERIOD
                                + Constants.FIELD_BILL_ID));

                    maxDiscrepancy = compareMaxDiscrepancy(maxBillLineDiscrepancy, maxDiscrepancy);

                    billRecord.setValue(Constants.TABLE_BILL + Constants.STRING_PERIOD
                            + Constants.FIELD_MAX_DISCREPANCY,
                        maxDiscrepancy);
                }
                this.status.setDataSet(new DataSetList(billRecords));
                this.status.setCurrentNumber(Constants.PROGRESS_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {

            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(Messages.ERROR_NO_DATA_AVAILABLE, e);
        }
    }

    /**
     * getBillLineDiscrepancyRecordsForGrid - Get bill line records with measured quantities and
     * discrepancies in billed vs measured readings. Add records to status to refresh Bill Line List
     * grid.
     *
     * @param vnId - Vendor Code for Bill Restriction
     * @param billId - Bill ID
     * @throws ExceptionBase exception
     */
    public void getBillLineDiscrepancyRecordsForGrid(final String vnId, final String billId)
            throws ExceptionBase {
        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);

            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {

                final List<DataRecord> billLineRecords =
                        getRecordsBillLinesDiscrepancy(vnId, billId);
                this.status.setDataSet(new DataSetList(billLineRecords));
                this.status.setCurrentNumber(Constants.PROGRESS_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {

            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(Messages.ERROR_NO_DATA_AVAILABLE, e);
        }
    }

    /**
     * getLinkedMetersForGrid - Return records for data points linked to Vendor Account for
     * "Linked Meters" dialog. Include measured quantity for each data point between bill start and
     * end dates.
     *
     * @param vnId String
     * @param billId String
     * @param tableName String - bill or bill_archive
     * @throws ExceptionBase exception
     */
    public void getLinkedMetersForGrid(final String vnId, final String billId,
            final String tableName) throws ExceptionBase {
        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);

            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                final DataRecord billRecord =
                        BillMeterCommon.getRecordsBills(vnId, billId, "", tableName, "").get(0);

                final List<DataRecord> dataPointRecords =
                        BillMeterCommon.getRecordsDataPoints(billRecord, tableName, "", "");
                this.status.setDataSet(new DataSetList(dataPointRecords));
                this.status.setCurrentNumber(Constants.PROGRESS_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {

            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(Messages.ERROR_NO_DATA_AVAILABLE, e);
        }
    }

    /**
     * getMeterReadingsForGrid - Return records for data points linked to Bill or Bill Line for
     * "Meter Readings" dialog. Include measured quantity for each data point between bill start and
     * end dates.
     *
     * @param tableName String - bill, bill_line, bill_archive, or bill_line_archive
     * @param vnId String
     * @param billId String
     * @param billLineId String
     * @param groupField String
     * @param groupFieldValue String
     * @throws ExceptionBase exception
     */
    public void getMeterReadingsForGrid(final String tableName, final String vnId,
            final String billId, final String billLineId, final String groupField,
            final String groupFieldValue) throws ExceptionBase {
        try {
            this.status.setTotalNumber(Constants.PROGRESS_100);
            this.status.setCode(JobStatus.JOB_STARTED);
            this.status.setCurrentNumber(0);

            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
            } else {
                List<DataRecord> billOrBillLineRecords = null;
                if (Constants.TABLE_BILL.equals(tableName)
                        || Constants.TABLE_BILL_ARCHIVE.equals(tableName)) {
                    billOrBillLineRecords =
                            BillMeterCommon.getRecordsBills(vnId, billId, "", tableName, "");
                } else {
                    billOrBillLineRecords = BillMeterCommon.getRecordsBillLines(vnId, billId,
                        billLineId, "", false, tableName);
                }

                final List<DataRecord> dataPointRecords = BillMeterCommon.getRecordsDataPoints(
                    billOrBillLineRecords.get(0), tableName, groupField, groupFieldValue);

                this.status.setDataSet(new DataSetList(dataPointRecords));
                this.status.setCurrentNumber(Constants.PROGRESS_100);
                this.status.setCode(JobStatus.JOB_COMPLETE);
            }
        } catch (final ExceptionBase e) {

            this.status.setCode(JobStatus.JOB_FAILED);
            // @non-translatable
            throw new ExceptionBase(Messages.ERROR_NO_DATA_AVAILABLE, e);
        }
    }

    /**
     * getMaxBillLineDiscrepancy - Get max discrepancy among bill line records for a bill.
     *
     * @param vnId String
     * @param billId String
     * @return maxDiscrepancy double
     */
    private double getMaxBillLineDiscrepancy(final String vnId, final String billId) {
        double maxDiscrepancy = 0.00;
        double discrepancy = 0.00;
        DataRecord billLineRecord = null;

        final List<DataRecord> billLineRecords = getRecordsBillLinesDiscrepancy(vnId, billId);

        for (int i = 0; i < billLineRecords.size(); i++) {
            billLineRecord = billLineRecords.get(i);
            discrepancy = billLineRecord.getDouble(
                Constants.TABLE_BILL_LINE + Constants.STRING_PERIOD + Constants.FIELD_DISCREPANCY);

            maxDiscrepancy = compareMaxDiscrepancy(maxDiscrepancy, discrepancy);
        }
        return maxDiscrepancy;
    }

    /**
     * getRecordsBillLinesDiscrepancy - Return bill line records with measured quantities and
     * discrepancies in billed vs measured readings. Measured Quantities are returned in the same
     * units as the bill line is reported.
     *
     * @param vnId - Vendor Code for Bill Restriction
     * @param billId - Bill ID
     * @return billLineRecords = List<DataRecord>
     */
    private List<DataRecord> getRecordsBillLinesDiscrepancy(final String vnId,
            final String billId) {
        final List<DataRecord> billLineRecords = BillMeterCommon.getRecordsBillLines(vnId, billId,
            "", "", false, Constants.TABLE_BILL_LINE);

        double billedValue = 0.00;
        double measuredValue = 0.00;
        double discrepancy = 0.00;
        DataRecord billLineRecord = null;
        Object vnRateId = null;
        String rollupType = "";

        for (int i = 0; i < billLineRecords.size(); i++) {
            billLineRecord = billLineRecords.get(i);
            vnRateId = billLineRecord.getValue(
                Constants.TABLE_VN_RATE + Constants.STRING_PERIOD + Constants.FIELD_VN_RATE_ID);
            rollupType = billLineRecord.getString(
                Constants.TABLE_BILL_UNIT + Constants.STRING_PERIOD + Constants.FIELD_ROLLUP_TYPE);
            if (StringUtil.isNullOrEmpty(vnRateId)
                    || (!Constants.POWER.equals(rollupType) && !Constants.ENERGY.equals(rollupType)
                            && !Constants.VOLUME.equals(rollupType))) {
                billLineRecord.setValue(Constants.TABLE_BILL_LINE + Constants.STRING_PERIOD
                        + Constants.FIELD_QTY_MEASURED,
                    0.0);
                billLineRecord.setValue(Constants.TABLE_BILL_LINE + Constants.STRING_PERIOD
                        + Constants.FIELD_DISCREPANCY,
                    0.0);
                continue;
            }

            billedValue = billLineRecord.getDouble(
                Constants.TABLE_BILL_LINE + Constants.STRING_PERIOD + Constants.FIELD_QTY);
            measuredValue = BillMeterCommon.getQtyMeasuredForBillOrBillLine(billLineRecord,
                rollupType, Constants.TABLE_BILL_LINE);
            measuredValue = BillMeterCommon.getQtyInBilledUnits(measuredValue, billLineRecord,
                rollupType, Constants.TABLE_BILL_LINE);
            discrepancy = getDiscrepancy(billedValue, measuredValue);

            billLineRecord.setValue(
                Constants.TABLE_BILL_LINE + Constants.STRING_PERIOD + Constants.FIELD_QTY_MEASURED,
                measuredValue);
            billLineRecord.setValue(
                Constants.TABLE_BILL_LINE + Constants.STRING_PERIOD + Constants.FIELD_DISCREPANCY,
                discrepancy);
        }
        return billLineRecords;
    }

    /**
     * getCompareMaxDiscrepancy - Get max absolute value between two values.
     *
     * @param maxDiscrepancy String
     * @param discrepancy String
     * @return maxValue double
     */
    private double compareMaxDiscrepancy(final double maxDiscrepancy, final double discrepancy) {
        double maxValue = maxDiscrepancy;
        if (Math.abs(discrepancy) > Math.abs(maxDiscrepancy)) {
            maxValue = discrepancy;
        }
        return maxValue;
    }

    /**
     * getDiscrepancy - Get discrepancy(%) between billed and measured values.
     *
     * @param billedValue double
     * @param measuredValue double
     * @return double discrepancy - %
     */

    private double getDiscrepancy(final double billedValue, final double measuredValue) {
        double discrepancy = 0;
        if (measuredValue != 0) {
            discrepancy = (billedValue - measuredValue) * Constants.HUNDRED / measuredValue;
        }
        return discrepancy;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, Double> getValues(final Granularity granularity, final Date fromDate,
            final Date toDate) throws ExceptionBase {
        try {
            return getBillDiscrepancyRecordsForMetricAlert();
        } catch (final ExceptionBase originalException) {
            final ExceptionBase newException = ExceptionBaseFactory.newTranslatableException(
                Messages.ERROR_GENERIC_MESSAGE, new Object[] { this.metric.getTitle() });
            newException.setStackTrace(originalException.getStackTrace());
            throw newException;
        }
    }

    /**
     * Setter for metric object.
     *
     * @param metric the metric to set
     */
    @Override
    public void setMetric(final Metric metric) {
        this.metric = metric;
    }
}
