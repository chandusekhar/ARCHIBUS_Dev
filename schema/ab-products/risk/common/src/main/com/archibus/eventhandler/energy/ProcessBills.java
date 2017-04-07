package com.archibus.eventhandler.energy;

import java.text.*;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

/**
 * ProcessBills - This class handles all bill related logic
 *
 * History:
 * <li>19.1 Initial implementation.
 *
 * @author Winston Lagos
 */

public class ProcessBills extends JobBase {

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_ERR_NO_LINES =
            "There are no Lines on the Bill ({0}) you are sending for approval. Please add Lines prior to sending for approval.";

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_ERR_APP_PARENT =
            "Please approve the parent Bill of the Bill ({0}) before sending this one approval.";

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_CALCULATE_VARIANCE_VALUES =
            "Error attempting to calculate the bill variance values for bill ({0}).";

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_CHECK_ARCHIVE_SERVICE_GAP =
            "The bill ({0}) doesn't fit the monthly bills constraint, please review your existing bills periods and correct the situation as required.";

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_APPROVE_BILL = "Unable to approve bill ({0}).";

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_ARCHIVE_BILL = "Unable to archive bill ({0}).";

    /**
     * addNewBillLineItem - when a new bill_line is inserted, updated or deleted this wfr updates
     * the bill totals accordingly
     *
     * @param billId
     * @param vnId
     * @param billLineId
     */

    public Boolean addNewBillLineItem(final String billId, final String vnId,
            final Integer billLineId) {
        populateQTYs(billId, vnId, billLineId);
        sumBillTotals(billId, vnId);
        return true;
    }

    /**
     * populateQTYs looks at the qty and the measurement units fields of any given bill line,
     * mutiplys the qty times the conversion factor associated by the unit, and updates the qty
     * field associated for the type of utility.
     *
     * @param billId
     * @param vnId
     * @param billLineId Value -1 means to treat all bill lines of the bill
     */

    protected void populateQTYs(final String billId, final String vnId, final Integer billLineId) {
        // get bill_line record
        final String qtySQL = ""
                + "SELECT qty, bill_type_id, bill_unit_id, bill_id, vn_id, bill_line_id, qty_power, qty_energy, qty_volume "
                + " FROM   bill_line "
                + " WHERE  bill_id = ${parameters['billId']} AND vn_id = ${parameters['vnId']}";

        final String[] qtyFlds = { "qty", "bill_type_id", "bill_unit_id", "bill_id", "vn_id",
                "bill_line_id", "qty_power", "qty_energy", "qty_volume" };
        final DataSource qtyDs = DataSourceFactory.createDataSourceForFields("bill_line", qtyFlds);
        qtyDs.addQuery(qtySQL);
        qtyDs.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
        qtyDs.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        if (billLineId != -1) {
            qtyDs.addRestriction(Restrictions.eq("bill_line", "bill_line_id", billLineId));
        }
        final List<DataRecord> qtyRecords = qtyDs.getRecords();

        for (final DataRecord qtyRecord : qtyRecords) {
            // get bill_line record values
            // final DataRecord qtyRecord = qtyRecords.get(0);
            final Double qty = Double.parseDouble(qtyRecord.getValue("bill_line.qty").toString());
            final String bill_type_id = qtyRecord.getValue("bill_line.bill_type_id").toString();
            final String bill_unit_id = qtyRecord.getValue("bill_line.bill_unit_id").toString();

            // get bill_unit values
            final String[] unitsFlds =
                    { "bill_type_id", "bill_unit_id", "conversion_factor", "rollup_type" };
            final DataSource unitsDs =
                    DataSourceFactory.createDataSourceForFields("bill_unit", unitsFlds);
            unitsDs.addRestriction(Restrictions.eq("bill_unit", "bill_type_id", bill_type_id));
            unitsDs.addRestriction(Restrictions.eq("bill_unit", "bill_unit_id", bill_unit_id));
            final DataRecord unitsRecord = unitsDs.getRecord();

            final Double conversion_factor = Double
                .parseDouble(unitsRecord.getValue("bill_unit.conversion_factor").toString());
            final String rollup_type = unitsRecord.getValue("bill_unit.rollup_type").toString();

            if (!rollup_type.equals("None")) {
                // calculate total
                final Double qtyTotal = qty * conversion_factor;

                // determine what bill_line qty field to update
                String qtyFld = null;
                if (rollup_type.equals("Power")) {
                    qtyFld = "bill_line.qty_power";
                } else if (rollup_type.equals("Volume")) {
                    qtyFld = "bill_line.qty_volume";
                } else if (rollup_type.equals("Energy")) {
                    qtyFld = "bill_line.qty_energy";
                } else {
                    new ExceptionBase("No match found for rollup_type : " + rollup_type);
                }

                // update bill_line record with new total
                qtyRecord.setValue("bill_line.qty_power", 0.0);
                qtyRecord.setValue("bill_line.qty_volume", 0.0);
                qtyRecord.setValue("bill_line.qty_energy", 0.0);
                qtyRecord.setValue(qtyFld, qtyTotal);
                qtyDs.saveRecord(qtyRecord);
            }
        }
    }

    /**
     * sumBillTotals updates the bill provided with the recalculated total amounts
     *
     * @param billId
     * @param vnId
     */

    protected void sumBillTotals(final String billId, final String vnId) {
        // get bill_line totals
        final DataRecord totalsRecord = sumBillLineTotals(billId, vnId);

        // get the bill_line count
        final Integer count = getBillLineCount(billId, vnId);

        // Update totals
        final String[] billFlds = { "amount_expense", "amount_income", "qty_energy", "qty_power",
                "qty_volume", "bill_id", "vn_id", "count_lines" };
        final DataSource updateDs = DataSourceFactory.createDataSourceForFields("bill", billFlds);
        updateDs.addRestriction(Restrictions.eq("bill", "bill_id", billId));
        updateDs.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
        // VPA - avoid error trying to add a bill line to a bill outside the VPA
        updateDs.setApplyVpaRestrictions(false);
        final DataRecord billRecord = updateDs.getRecord();
        if (count == 0) {
            billRecord.setValue("bill.amount_expense", 0.0);
            billRecord.setValue("bill.amount_income", 0.0);
            billRecord.setValue("bill.qty_energy", 0.0);
            billRecord.setValue("bill.qty_power", 0.0);
            billRecord.setValue("bill.qty_volume", 0.0);
            billRecord.setValue("bill.count_lines", 0.0);
            updateDs.updateRecord(billRecord);
        } else {
            final Double amount_expense = Double
                .parseDouble(totalsRecord.getValue("bill_line.count_amount_expense").toString());
            final Double amount_income = Double
                .parseDouble(totalsRecord.getValue("bill_line.count_amount_income").toString());
            final Double qty_energy = Double
                .parseDouble(totalsRecord.getValue("bill_line.count_qty_energy").toString());
            final Double qty_power = Double
                .parseDouble(totalsRecord.getValue("bill_line.count_qty_power").toString());
            final Double qty_volume = Double
                .parseDouble(totalsRecord.getValue("bill_line.count_qty_volume").toString());
            billRecord.setValue("bill.amount_expense", amount_expense);
            billRecord.setValue("bill.amount_income", amount_income);
            billRecord.setValue("bill.qty_energy", qty_energy);
            billRecord.setValue("bill.qty_power", qty_power);
            billRecord.setValue("bill.qty_volume", qty_volume);
            billRecord.setValue("bill.count_lines", Double.parseDouble(count.toString()));
            updateDs.updateRecord(billRecord);
        }
    }

    /**
     * sumBillLineTotals sums up all the total fields for all the bill_lines associated to the bill
     * provided.
     *
     * @param billId
     * @param vnId
     */

    protected DataRecord sumBillLineTotals(final String billId, final String vnId) {
        // get totals
        final String totalsSQL = "SELECT SUM(amount_expense) AS count_amount_expense, "
                + "       SUM(amount_income)  AS count_amount_income , "
                + "       SUM(qty_energy)     AS count_qty_energy    , "
                + "       SUM(qty_power)      AS count_qty_power     , "
                + "       SUM(qty_volume)     AS count_qty_volume " + " FROM   bill_line "
                + " WHERE  bill_id = ${parameters['billId']} AND vn_id = ${parameters['vnId']}";

        final String billLineTable = "bill_line";
        final String[] billLineFlds = { "amount_expense", "amount_income", "qty_energy",
                "qty_power", "qty_volume", "bill_id", "vn_id", "bill_line_id" };
        final DataSource sumDs =
                DataSourceFactory.createDataSourceForFields(billLineTable, billLineFlds);
        sumDs.addQuery(totalsSQL);
        sumDs.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
        sumDs.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        sumDs.addVirtualField("bill_line", "count_amount_expense", DataSource.DATA_TYPE_NUMBER);
        sumDs.addVirtualField("bill_line", "count_amount_income", DataSource.DATA_TYPE_NUMBER);
        sumDs.addVirtualField("bill_line", "count_qty_energy", DataSource.DATA_TYPE_NUMBER);
        sumDs.addVirtualField("bill_line", "count_qty_power", DataSource.DATA_TYPE_NUMBER);
        sumDs.addVirtualField("bill_line", "count_qty_volume", DataSource.DATA_TYPE_NUMBER);
        final DataRecord totalsRecord = sumDs.getRecord();

        return totalsRecord;
    }

    /**
     * Returns the count of bill lines associated to a specific bill
     *
     * @param billId
     * @param vnId
     */

    public Integer getBillLineCount(final String billId, final String vnId) {
        // get count
        String countSQL = "" + "SELECT COUNT (bill_line_id) AS count " + "FROM   bill_line "
                + "WHERE  bill_id = ${parameters['billId']} AND vn_id = ${parameters['vnId']}";
        final String billLineTable = "bill_line";
        final String[] billLineFlds = { "amount_expense", "amount_income", "qty_energy",
                "qty_power", "qty_volume", "bill_id", "vn_id", "bill_line_id" };
        DataSource countDs =
                DataSourceFactory.createDataSourceForFields(billLineTable, billLineFlds);
        countDs.addQuery(countSQL);
        countDs.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
        countDs.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        countDs.addVirtualField("bill_line", "count", DataSource.DATA_TYPE_INTEGER);
        DataRecord countRecord = countDs.getRecord();
        Object sCount = countRecord.getValue("bill_line.count");
        Integer count = Integer.parseInt(sCount.toString());
        if (count < 1) {
            countSQL = "" + "SELECT COUNT (bill_line_id) AS count " + "FROM   bill_line_archive "
                    + "WHERE  bill_id = ${parameters['billId']} AND vn_id = ${parameters['vnId']}";
            final String billLineArchiveTable = "bill_line_archive";
            countDs =
                    DataSourceFactory.createDataSourceForFields(billLineArchiveTable, billLineFlds);
            countDs.addQuery(countSQL);
            countDs.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
            countDs.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
            countDs.addVirtualField("bill_line_archive", "count", DataSource.DATA_TYPE_INTEGER);
            countRecord = countDs.getRecord();
            sCount = countRecord.getValue("bill_line_archive.count");
            count = Integer.parseInt(sCount.toString());
        }

        return count;
    }

    /**
     * Returns the count of bill lines associated to a parent bill
     *
     * @param billId
     * @param vnId
     */

    public Integer getProratedAggregatedBillLineCount(final String billId, final String vnId) {
        final String bill = "bill";
        final String billArchive = "bill_archive";
        final String[] billFlds = { "bill_id", "vn_id", "reference_bill_id" };
        DataSource countDs = DataSourceFactory.createDataSourceForFields(bill, billFlds);
        countDs.addRestriction(Restrictions.eq("bill", "bill_id", billId));
        countDs.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
        // VPA - avoid error trying to get the count of bill lines of a parent bill outside the VPA
        countDs.setApplyVpaRestrictions(false);
        DataRecord countRecord = countDs.getRecord();
        Integer count = 0;
        if (countRecord.getValue("bill.reference_bill_id") != null) {
            count = getBillLineCount(countRecord.getValue("bill.reference_bill_id").toString(),
                vnId);
        } else {
            countDs.clearRestrictions();
            countDs.addRestriction(Restrictions.eq("bill", "reference_bill_id", billId));
            countDs.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
            countRecord = countDs.getRecord();
            if (countRecord != null) {
                count = getBillLineCount(countRecord.getValue("bill.bill_id").toString(), vnId);
            } else {
                countDs = DataSourceFactory.createDataSourceForFields(billArchive, billFlds);
                countDs.clearRestrictions();
                countDs
                    .addRestriction(Restrictions.eq("bill_archive", "reference_bill_id", billId));
                countDs.addRestriction(Restrictions.eq("bill_archive", "vn_id", vnId));
                countRecord = countDs.getRecord();
                if (countRecord != null) {
                    count = getBillLineCount(
                        countRecord.getValue("bill_archive.bill_id").toString(), vnId);
                }
            }
        }

        return count;
    }

    /**
     *
     * checkProrateAggregatedParentApproved - Returns true if the parent/parents of an
     * aggregated/prorated bill are archived, false otherwise.
     *
     * @param billId
     * @param vnId
     * @return
     */
    public boolean checkProrateAggregatedParentApproved(final String billId, final String vnId) {
        final String bill = "bill";
        final String[] billFlds =
                { "bill_id", "vn_id", "reference_bill_id", "prorated_aggregated" };
        final DataSource billDs = DataSourceFactory.createDataSourceForFields(bill, billFlds);
        billDs.addRestriction(Restrictions.eq("bill", "bill_id", billId));
        billDs.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
        // VPA - avoid error trying to get the count of bill lines of a parent bill outside the VPA
        billDs.setApplyVpaRestrictions(false);
        DataRecord billRecord = billDs.getRecord();
        if (!billRecord.getValue("bill.prorated_aggregated").toString().equals("NO")) {
            if (billRecord.getValue("bill.prorated_aggregated").toString().equals("AGGREGATED")) {
                billDs.clearRestrictions();
                billDs.addRestriction(Restrictions.eq("bill", "reference_bill_id", billId));
                billDs.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
                final List<DataRecord> billRecords = billDs.getRecords();
                if (billRecords.isEmpty()) {
                    return true;
                } else {
                    return false;
                }
            } else {
                billDs.clearRestrictions();
                billDs.addRestriction(Restrictions.eq("bill", "bill_id",
                    (billRecord.getValue("bill.reference_bill_id").toString())));
                billDs.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
                billRecord = billDs.getRecord();
                if (billRecord != null) {
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            return true;
        }
    }

    /**
     * Returns the count of bill children associated to a prorated by location bill
     *
     * @param billId
     *
     */

    public Integer getChildrenBillCountForProratedByLocationBills(final String billId) {
        // get count
        final String countSQL = "" + "SELECT COUNT (bill_id) AS count " + "FROM   bill "
                + "WHERE  reference_bill_id = ${parameters['billId']} AND prorated_aggregated ='PRORATED-LOCATION'";
        final String billLineTable = "bill_line";
        final String[] billLineFlds = { "amount_expense", "amount_income", "qty_energy",
                "qty_power", "qty_volume", "bill_id", "vn_id", "bill_line_id", "reference_bill_id",
                "prorated_aggregated" };
        final DataSource countDs =
                DataSourceFactory.createDataSourceForFields(billLineTable, billLineFlds);
        countDs.addQuery(countSQL);
        countDs.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
        countDs.addVirtualField("bill", "count", DataSource.DATA_TYPE_INTEGER);
        final DataRecord countRecord = countDs.getRecord();
        final Object sCount = countRecord.getValue("bill.count");
        final Integer count = Integer.parseInt(sCount.toString());

        return count;
    }

    /**
     * Returns the count of bill vn_id and vn_ac_id
     *
     * @param vnAcId
     * @param vnId
     */

    public Integer getBillCount(final String vnAcId, final String vnId) {
        // get count
        final String countSQL = "" + "SELECT COUNT (bill_id) AS count " + "FROM   bill "
                + "WHERE  vn_ac_id = ${parameters['vnAcId']} AND vn_id = ${parameters['vnId']}";
        final String[] billFlds = { "bill_id", "vn_id", "vn_ac_id" };
        final DataSource countDs = DataSourceFactory.createDataSourceForFields("bill", billFlds);
        countDs.addQuery(countSQL);
        countDs.addParameter("vnAcId", vnAcId, DataSource.DATA_TYPE_TEXT);
        countDs.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        countDs.addVirtualField("bill", "count", DataSource.DATA_TYPE_INTEGER);
        // VPA - avoid error trying to enter a bill if a site outside the VPA is selected
        countDs.setApplyVpaRestrictions(false);
        final DataRecord countRecord = countDs.getRecord();
        final Object sCount = countRecord.getValue("bill.count");
        final Integer count = Integer.parseInt(sCount.toString());

        return count;
    }

    /**
     * Returns the count of bill vn_id and vn_ac_id
     *
     * @param vnAcId
     * @param vnId
     */
    public Integer getBillArchiveCount(final String vnAcId, final String vnId) {
        // get count
        final String countSQL = "" + "SELECT COUNT (bill_id) AS count " + "FROM   bill_archive "
                + "WHERE  vn_ac_id = ${parameters['vnAcId']} AND vn_id = ${parameters['vnId']}";
        final String[] billFlds = { "bill_id", "vn_id", "vn_ac_id" };
        final DataSource countDs =
                DataSourceFactory.createDataSourceForFields("bill_archive", billFlds);
        countDs.addQuery(countSQL);
        countDs.addParameter("vnAcId", vnAcId, DataSource.DATA_TYPE_TEXT);
        countDs.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        countDs.addVirtualField("bill_archive", "count", DataSource.DATA_TYPE_INTEGER);
        final DataRecord countRecord = countDs.getRecord();
        final Object sCount = countRecord.getValue("bill_archive.count");
        final Integer count = Integer.parseInt(sCount.toString());

        return count;
    }

    /**
     * Checks if the bill provided start date and previous bill end date match
     *
     * @param billId
     * @param vnId
     * @param vnAcId
     * @param sdate_service_start
     * @param start_time_period
     * @throws ParseException
     */
    public Boolean checkServiceGap(final String billId, final String vnId, final String vnAcId,
            final String sdate_service_start, final String start_time_period)
                    throws ExceptionBase, ParseException {
        final Integer billCount = getBillCount(vnAcId, vnId);
        if (billCount > 0) {
            DateFormat df = new SimpleDateFormat("MM/dd/yyyy");

            // current bill
            final Date date_service_start = df.parse(sdate_service_start);
            final Integer startIndex =
                    TimePeriodUtilService.convertTimePeriodToIndex(start_time_period);
            final Integer endIndex = startIndex - 1;
            final String end_time_period = TimePeriodUtilService.convertIndexToTimePeriod(endIndex);

            // first bill
            final String[] billFields = { "date_service_start", "date_service_end", "time_period",
                    "vn_id", "bill_id", "vn_ac_id" };
            final DataSource bill_ds =
                    DataSourceFactory.createDataSourceForFields("bill", billFields);
            bill_ds.clearRestrictions();
            bill_ds.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
            bill_ds.addRestriction(Restrictions.eq("bill", "vn_ac_id", vnAcId));
            bill_ds.addSort("date_service_start");
            // VPA - avoid error trying to update a bill outside the VPA
            bill_ds.setApplyVpaRestrictions(false);
            final DataRecord firstBillRecord = bill_ds.getRecord();
            final String firstBillId = firstBillRecord.getValue("bill.bill_id").toString();
            if ((firstBillId.equals(billId))) {
                // the current bill is the first bill
                return true;
            } else {

                // previous bills
                bill_ds.clearRestrictions();
                bill_ds.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
                bill_ds.addRestriction(Restrictions.eq("bill", "vn_ac_id", vnAcId));
                bill_ds.addRestriction(Restrictions.eq("bill", "time_period", end_time_period));
                final List<DataRecord> previousBillRecords = bill_ds.getRecords();
                if (previousBillRecords.size() == 1) {
                    final DataRecord previousBillRecord = previousBillRecords.get(0);
                    df = new SimpleDateFormat("yyyy-MM-dd");
                    final Date date_service_end = df
                        .parse(previousBillRecord.getValue("bill.date_service_end").toString());
                    if (date_service_start.equals(date_service_end)) {
                        return true;
                    } else {
                        // start and end date don't match
                        return false;
                    }
                } else {
                    // more than one bill with the same time period or no bill with that time period
                    // exists
                    return false;
                }
            }
        } else {
            // the current bill is the first bill
            return true;
        }
    }

    /**
     * Checks if the bill provided start date and previous archive bill end date match OR if the
     * current bill immediately precedes the first archived bill OR if the time period falls between
     * two existing archived bills with an existing gap between them
     *
     * @param billId
     * @param vnId
     * @param vnAcId
     * @param sdate_service_start
     * @param start_time_period
     * @throws ParseException
     */
    public Boolean checkArchiveServiceGap(final String billId, final String vnId,
            final String vnAcId, final String sdate_service_start, final String start_time_period)
                    throws ExceptionBase, ParseException {

        final DataSource dataSource =
                DataSourceFactory.createDataSourceForTable("afm_activity_params");
        final List<DataRecord> records = dataSource.getRecords();
        String[] billsExcludedTypes = null;
        DataRecord record = null;
        for (int i = 0; i < records.size(); i++) {
            record = records.get(i);
            final String name = (String) record.getValue("afm_activity_params.param_id");
            if ("CheckForMonthlyBills".equals(name)) {
                if (Integer
                    .parseInt(record.getValue("afm_activity_params.param_value").toString()) == 0) {
                    return true;
                }
            }
            if ("CheckForMonthlyBillsExcludeTypes".equals(name)) {
                final String excludedTypes =
                        record.getValue("afm_activity_params.param_value").toString();
                billsExcludedTypes = excludedTypes.split(",");
            }
        }

        final Integer billArchiveCount = getBillArchiveCount(vnAcId, vnId);
        if (billArchiveCount > 0) {
            DateFormat df = new SimpleDateFormat("MM/dd/yy");

            // current bill
            final Date date_service_start = df.parse(sdate_service_start);
            final Integer startIndex =
                    TimePeriodUtilService.convertTimePeriodToIndex(start_time_period);
            final Integer endIndex = startIndex - 1;
            final String end_time_period = TimePeriodUtilService.convertIndexToTimePeriod(endIndex);
            final Integer subsequentIndex = startIndex + 1;
            final String subsequent_time_period =
                    TimePeriodUtilService.convertIndexToTimePeriod(subsequentIndex);

            // retrieve the first bill for this account from bill_archive
            final String[] billFields = { "date_service_start", "date_service_end", "time_period",
                    "vn_id", "bill_id", "vn_ac_id", "bill_type_id" };
            final DataSource bill_ds =
                    DataSourceFactory.createDataSourceForFields("bill_archive", billFields);
            bill_ds.clearRestrictions();
            bill_ds.addRestriction(Restrictions.eq("bill_archive", "vn_id", vnId));
            bill_ds.addRestriction(Restrictions.eq("bill_archive", "vn_ac_id", vnAcId));
            bill_ds.addSort("date_service_start");
            final DataRecord firstBillRecord = bill_ds.getRecord();
            final String firstBillId = firstBillRecord.getValue("bill_archive.bill_id").toString();
            final String firstBillTimePeriod =
                    firstBillRecord.getValue("bill_archive.time_period").toString();

            if (billsExcludedTypes != null) {
                final String firstBillTypeId =
                        firstBillRecord.getValue("bill_archive.bill_type_id").toString();
                for (final String billsExcludedType : billsExcludedTypes) {
                    if (billsExcludedType.toUpperCase().equals(firstBillTypeId) || billsExcludedType
                        .substring(1).toUpperCase().equals(firstBillTypeId)) {
                        return true;
                    }
                }
            }

            if ((firstBillId.equals(billId))) {
                // the current bill is the first bill
                return true;
            } else if (firstBillTimePeriod.equals(subsequent_time_period)) {
                // the current bill's time period immediately precedes the first archived bill
                // so it is ok to archive it
                return true;
            } else {

                // retrieve previous bills and compare with current bill
                bill_ds.clearRestrictions();
                bill_ds.addRestriction(Restrictions.eq("bill_archive", "vn_id", vnId));
                bill_ds.addRestriction(Restrictions.eq("bill_archive", "vn_ac_id", vnAcId));
                bill_ds.addRestriction(
                    Restrictions.eq("bill_archive", "time_period", end_time_period));
                final List<DataRecord> previousBillRecords = bill_ds.getRecords();
                if (previousBillRecords.size() == 1) {
                    final DataRecord previousBillRecord = previousBillRecords.get(0);
                    df = new SimpleDateFormat("yyyy-MM-dd");
                    final Date date_service_end = df.parse(
                        previousBillRecord.getValue("bill_archive.date_service_end").toString());
                    if (date_service_start.equals(date_service_end)) {
                        return true;
                    } else {
                        // start and end date don't match
                        return false;
                    }
                } else {
                    // more than one bill with the same time period or no bill with that time period
                    // exists
                    return false;
                }
            }
        } else {
            return true;
        }
    }

    /**
     * approveBill - This WFR will change the status of the selected Bill(s) to �Approved� and
     * transfer the newly approved bill into the approved bills table.
     *
     * @param billId
     * @param vnId
     */
    public Boolean approveBill(final String billId, final String vnId) {

        // get bill record
        final String billTable = "bill";
        final String[] billFields = { "amount_expense", "amount_income", "date_due", "description",
                "cost_tran_sched_id", "vn_id", "bill_id", "amount_expense", "qty_energy", "qty_kwh",
                "cost_kwh", "cost_mmbtu", "status", "bill_type_id", "bl_id", "prorated_aggregated",
                "date_approved" };
        final DataSource bill_ds =
                DataSourceFactory.createDataSourceForFields(billTable, billFields);
        bill_ds.addRestriction(Restrictions.eq("bill", "bill_id", billId));
        bill_ds.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
        DataRecord billRecord = bill_ds.getRecord();

        // get bill data
        final Double amount_expense =
                Double.parseDouble(billRecord.getValue("bill.amount_expense").toString());
        final Double amount_income =
                Double.parseDouble(billRecord.getValue("bill.amount_income").toString());
        // final String description = (billRecord.getValue("bill.description") != null)
        // ? billRecord.getValue("bill.description").toString() : "";
        final String bl_id = billRecord.getValue("bill.bl_id").toString();
        final String cost_cat = billRecord.getValue("bill.bill_type_id").toString();
        final String cost_cat_id = getCostCat(cost_cat);
        final String prorated_aggregated =
                billRecord.getValue("bill.prorated_aggregated").toString();
        final Date today = new Date();
        final DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        Date date_due = null;
        try {
            date_due = df.parse(billRecord.getValue("bill.date_due").toString());
        } catch (final ParseException e) {
            new ExceptionBase("date_due value is invalid");
        }

        if (prorated_aggregated.equals("NO")) {
            // insert new cost_tran_sched record
            final String costTranSchedTable = "cost_tran_sched";
            final String[] costTranSchedFields = { "amount_expense", "amount_income", "date_due",
                    "description", "cost_cat_id", "status", "date_trans_created", "bl_id" };
            final DataSource costTranSched_ds = DataSourceFactory
                .createDataSourceForFields(costTranSchedTable, costTranSchedFields);
            final DataRecord costTranSchedRecord = costTranSched_ds.createNewRecord();
            costTranSchedRecord.setValue("cost_tran_sched.amount_expense", amount_expense);
            costTranSchedRecord.setValue("cost_tran_sched.amount_income", amount_income);
            costTranSchedRecord.setValue("cost_tran_sched.date_due", date_due);
            costTranSchedRecord.setValue("cost_tran_sched.description",
                "Created from Energy Management bill record for vendor|bill: " + vnId + "|"
                        + billId);
            costTranSchedRecord.setValue("cost_tran_sched.date_trans_created", today);
            costTranSchedRecord.setValue("cost_tran_sched.cost_cat_id", cost_cat_id);
            costTranSchedRecord.setValue("cost_tran_sched.status", "PLANNED");
            costTranSchedRecord.setValue("cost_tran_sched.bl_id", bl_id);
            final DataRecord primaryKeyRecord = costTranSched_ds.saveRecord(costTranSchedRecord);

            // calculate building costs
            billRecord = calculateCostPerEnergy(billRecord);

            // update the bill
            final Integer costTranSchedPK = Integer.parseInt(
                primaryKeyRecord.getValue("cost_tran_sched.cost_tran_sched_id").toString());
            billRecord.setValue("bill.cost_tran_sched_id", costTranSchedPK);
        }
        billRecord.setValue("bill.date_approved", today);
        billRecord.setValue("bill.status", "Approved");
        bill_ds.saveRecord(billRecord);

        return true;
    }

    /**
     * calculateCostPerEnergy - Calculates the qty_kwh, cost_kwh, cost_mmbtu fields
     *
     * @param billId
     * @param vnId
     */
    protected DataRecord calculateCostPerEnergy(final DataRecord billRecord) {

        // get bill data
        final Double amount_expense =
                Double.parseDouble(billRecord.getValue("bill.amount_expense").toString());
        final Double qty_energy =
                Double.parseDouble(billRecord.getValue("bill.qty_energy").toString());

        // get conversion factor
        final String[] unitsFlds =
                { "bill_type_id", "bill_unit_id", "conversion_factor", "rollup_type" };
        final DataSource unitsDs =
                DataSourceFactory.createDataSourceForFields("bill_unit", unitsFlds);
        unitsDs.addRestriction(Restrictions.eq("bill_unit", "bill_type_id", "ELECTRIC"));
        unitsDs.addRestriction(Restrictions.eq("bill_unit", "bill_unit_id", "KWH"));
        final DataRecord unitsRecord = unitsDs.getRecord();
        final Double conversion_factor =
                Double.parseDouble(unitsRecord.getValue("bill_unit.conversion_factor").toString());

        // calculate
        if (conversion_factor > 0) {
            final Double qty_kwh = qty_energy / conversion_factor;
            final Double cost_kwh = amount_expense / qty_kwh;
            final Double cost_mmbtu = amount_expense / qty_energy;

            if (amount_expense > 0 && qty_energy > 0) {
                // set values
                billRecord.setValue("bill.qty_kwh", qty_kwh);
                billRecord.setValue("bill.cost_kwh", cost_kwh);
                billRecord.setValue("bill.cost_mmbtu", cost_mmbtu);

            }
        }
        return billRecord;
    }

    /**
     * provides the bill_type.cost_cat_id based on the bill_type_id provided
     *
     * @param billTypeId
     */
    protected String getCostCat(final String billTypeId) {
        final String[] billTypeFlds = { "cost_cat_id", "bill_type_id", "description" };
        final DataSource billTypeDS =
                DataSourceFactory.createDataSourceForFields("bill_type", billTypeFlds);
        billTypeDS.addRestriction(Restrictions.eq("bill_type", "bill_type_id", billTypeId));
        final DataRecord record = billTypeDS.getRecord();
        String costCatId = record.getString("bill_type.cost_cat_id");
        if (costCatId == null) {
            costCatId = "";
        }

        return costCatId;
    }

    /**
     * approveAndArchiveSelectedBills - This WFR copies the values or a specified record from bill
     * to bill_archive and all the bill_lines tied to that bill to the bill_line_archive and then
     * deletes the bill and bill_line records.
     *
     * @param billId
     * @param vnId
     */
    public boolean archiveBill(final String billId, final String vnId) {

        final String afmFieldsTable = "afm_flds";
        final String[] afmFieldsNames = { "field_name" };

        /*
         * Process BILL_LINE
         */

        // get field name list for bill line
        final String billLineAfmFieldsSql =
                "SELECT field_name FROM afm_flds WHERE table_name = 'bill_line'";
        final List<DataRecord> billLineAfmFieldsRecords =
                SqlUtils.executeQuery(afmFieldsTable, afmFieldsNames, billLineAfmFieldsSql);
        final String[] billLineFieldNames = new String[billLineAfmFieldsRecords.size()];
        int billLineIndex = 0;
        for (final DataRecord afmFieldsRecord : billLineAfmFieldsRecords) {
            final String fieldName = afmFieldsRecord.getString("afm_flds.field_name");
            billLineFieldNames[billLineIndex++] = fieldName;
        }

        // get record from bill line
        final String billLineSQL = "SELECT * from bill_line"
                + " WHERE bill_id = ${parameters['billId']} AND vn_id = ${parameters['vnId']}";
        final DataSource billLineDS =
                DataSourceFactory.createDataSourceForFields("bill_line", billLineFieldNames);
        billLineDS.addQuery(billLineSQL);
        billLineDS.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
        billLineDS.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        final List<DataRecord> billLineRecords = billLineDS.getAllRecords();
        final DataSource billLineArchiveDS = DataSourceFactory
            .createDataSourceForFields("bill_line_archive", billLineFieldNames);

        for (final DataRecord billLineRecord : billLineRecords) {
            // create new bill line archive record
            final DataRecord billLineArchiveRecord = billLineArchiveDS.createNewRecord();
            // set values for bill line archive record
            for (final String fieldName : billLineFieldNames) {
                final Object genericValue = billLineRecord.getValue("bill_line." + fieldName);
                billLineArchiveRecord.setValue("bill_line_archive." + fieldName, genericValue);
            }
            billLineArchiveDS.saveRecord(billLineArchiveRecord);
            billLineDS.deleteRecord(billLineRecord);
        }

        /*
         * Process BILL
         */

        // get field name list for bill
        final String billAfmFieldsSql = "SELECT field_name FROM afm_flds WHERE table_name = 'bill'";
        final List<DataRecord> billAfmFieldsRecords =
                SqlUtils.executeQuery(afmFieldsTable, afmFieldsNames, billAfmFieldsSql);
        final String[] billFieldNames = new String[billAfmFieldsRecords.size()];
        int billIndex = 0;
        for (final DataRecord afmFieldsRecord : billAfmFieldsRecords) {
            final String fieldName = afmFieldsRecord.getString("afm_flds.field_name");
            billFieldNames[billIndex++] = fieldName;
        }

        // get record from bill
        final String SQL = "SELECT * from bill"
                + " WHERE bill_id = ${parameters['billId']} AND vn_id = ${parameters['vnId']}";
        final DataSource billDS =
                DataSourceFactory.createDataSourceForFields("bill", billFieldNames);
        billDS.addQuery(SQL);
        billDS.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
        billDS.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        final DataRecord billRecord = billDS.getRecord();

        // create new bill archive record
        final DataSource billArchiveDS =
                DataSourceFactory.createDataSourceForFields("bill_archive", billFieldNames);
        final DataRecord billArchiveRecord = billArchiveDS.createNewRecord();

        // set values for bill archive record
        for (final String fieldName : billFieldNames) {
            final Object genericValue = billRecord.getValue("bill." + fieldName);
            billArchiveRecord.setValue("bill_archive." + fieldName, genericValue);
        }
        billArchiveDS.saveRecord(billArchiveRecord);
        billDS.deleteRecord(billRecord);

        updateBillDoc(billId, vnId);

        return true;
    }

    /**
     * unArchiveAndRejectSelectedBills - This WFR copies the values for a specified record from
     * bill_archive to bill and all the bill_lines tied to that bill from the bill_line_archive.
     *
     * @param billId
     * @param vnId
     */
    public boolean unArchiveBill(final String billId, final String vnId) {

        final String afmFieldsTable = "afm_flds";
        final String[] afmFieldsNames = { "field_name" };

        /*
         * Process BILL_ARCHIVE (unlike when archiving, here we need to create the bill record
         * before the child bill line records)
         */

        // get field name list for bill archive
        final String billArchiveAfmFieldsSql =
                "SELECT field_name FROM afm_flds WHERE table_name = 'bill_archive'";
        final List<DataRecord> billArchiveAfmFieldsRecords =
                SqlUtils.executeQuery(afmFieldsTable, afmFieldsNames, billArchiveAfmFieldsSql);
        final String[] billArchiveFieldNames = new String[billArchiveAfmFieldsRecords.size()];
        int billIndex = 0;
        for (final DataRecord afmFieldsRecord : billArchiveAfmFieldsRecords) {
            final String fieldName = afmFieldsRecord.getString("afm_flds.field_name");
            billArchiveFieldNames[billIndex++] = fieldName;
        }

        // get record from bill_archive
        final String SQL = "SELECT * from bill_archive"
                + " WHERE bill_id = ${parameters['billId']} AND vn_id = ${parameters['vnId']}";
        final DataSource billArchiveDS =
                DataSourceFactory.createDataSourceForFields("bill_archive", billArchiveFieldNames);
        billArchiveDS.addQuery(SQL);
        billArchiveDS.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
        billArchiveDS.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        final DataRecord billArchiveRecord = billArchiveDS.getRecord();

        // create new bill record
        final DataSource billDS =
                DataSourceFactory.createDataSourceForFields("bill", billArchiveFieldNames);
        final DataRecord billRecord = billDS.createNewRecord();

        // set values for bill record
        for (final String fieldName : billArchiveFieldNames) {
            final Object genericValue = billArchiveRecord.getValue("bill_archive." + fieldName);
            billRecord.setValue("bill." + fieldName, genericValue);
        }
        billRecord.setValue("bill.status", "Pending Approval");
        billDS.saveRecord(billRecord);

        updateBillArchiveDoc(billId, vnId);

        /*
         * Process BILL_LINE_ARCHIVE
         */

        // get field name list for bill line
        final String billLineAfmFieldsSql =
                "SELECT field_name FROM afm_flds WHERE table_name = 'bill_line'";
        final List<DataRecord> billLineAfmFieldsRecords =
                SqlUtils.executeQuery(afmFieldsTable, afmFieldsNames, billLineAfmFieldsSql);
        final String[] billLineFieldNames = new String[billLineAfmFieldsRecords.size()];
        int billLineIndex = 0;
        for (final DataRecord afmFieldsRecord : billLineAfmFieldsRecords) {
            final String fieldName = afmFieldsRecord.getString("afm_flds.field_name");
            billLineFieldNames[billLineIndex++] = fieldName;
        }

        // get record from bill line archive
        final String billLineArchiveSQL = "SELECT * from bill_line_archive"
                + " WHERE bill_id = ${parameters['billId']} AND vn_id = ${parameters['vnId']}";
        final DataSource billLineArchiveDS = DataSourceFactory
            .createDataSourceForFields("bill_line_archive", billLineFieldNames);
        billLineArchiveDS.addQuery(billLineArchiveSQL);
        billLineArchiveDS.addParameter("billId", billId, DataSource.DATA_TYPE_TEXT);
        billLineArchiveDS.addParameter("vnId", vnId, DataSource.DATA_TYPE_TEXT);
        final List<DataRecord> billLineArchiveRecords = billLineArchiveDS.getAllRecords();

        final DataSource billLineDS =
                DataSourceFactory.createDataSourceForFields("bill_line", billLineFieldNames);

        for (final DataRecord billLineArchiveRecord : billLineArchiveRecords) {
            // create new bill line record
            final DataRecord billLineRecord = billLineDS.createNewRecord();
            // set values for bill line record
            for (final String fieldName : billLineFieldNames) {
                final Object genericValue =
                        billLineArchiveRecord.getValue("bill_line_archive." + fieldName);
                billLineRecord.setValue("bill_line." + fieldName, genericValue);
            }
            billLineDS.saveRecord(billLineRecord);
            billLineArchiveDS.deleteRecord(billLineArchiveRecord);
        }

        /*
         * Clean up: delete archived bill & bill line records
         */
        billArchiveDS.deleteRecord(billArchiveRecord);

        return true;
    }

    /**
     * updateBillDoc - This WFR updates table_name of the afm_docs and afm_docvers records
     * associated with the bill_archive record provided
     *
     * @param billId
     * @param vnId
     */
    public boolean updateBillDoc(final String billId, final String vnId) {
        final String[] billArchiveFlds = { "bill_id", "vn_id", "doc" };
        final DataSource updateDs =
                DataSourceFactory.createDataSourceForFields("bill_archive", billArchiveFlds);
        updateDs.addRestriction(Restrictions.eq("bill_archive", "bill_id", billId));
        updateDs.addRestriction(Restrictions.eq("bill_archive", "vn_id", vnId));
        final DataRecord billArchiveRecord = updateDs.getRecord();
        final String document = billArchiveRecord.getString("bill_archive.doc");
        if (document != null) {
            // Using sqlUpdate() since updating a PK value via DataSource inserts
            // a new record instead of updating the existing one

            String docSQL = "INSERT " + "INTO   afm_docs " + "       ( "
                    + "              lock_date      , " + "              lock_time      , "
                    + "              locked_by      , " + "              deleted        , "
                    + "              description    , " + "              transfer_status, "
                    + "              field_name     , " + "              pkey_value     , "
                    + "              table_name " + "       ) " + " SELECT lock_date      , "
                    + "       lock_time      , " + "       locked_by      , "
                    + "       deleted        , " + "       description    , "
                    + "       transfer_status, " + "       field_name     , "
                    + "       pkey_value     , " + "       'bill_archive' " + " FROM   afm_docs "
                    + "             WHERE pkey_value = '" + vnId + "|" + billId + "' "
                    + "     AND     table_name = 'bill'";
            SqlUtils.executeUpdate("afm_docs", docSQL);

            final String docVersSQL =
                    "" + "UPDATE afm_docvers " + "SET table_name = 'bill_archive' "
                            + "        WHERE pkey_value = '" + vnId + "|" + billId + "' " // These
            // are
            // safe
            // strings.
                            + "        AND table_name = 'bill'";
            SqlUtils.executeUpdate("afm_docvers", docVersSQL);

            docSQL = " DELETE FROM afm_docs   " + "    WHERE pkey_value = '" + vnId + "|" + billId
                    + "' " // These are safe strings.
                    + " AND table_name = 'bill'";
            SqlUtils.executeUpdate("afm_docs", docSQL);

            /**********************
             * This code does not work, working alternative is above String docSQL = "" +
             * "UPDATE afm_docs " + "SET table_name = 'bill_archive' " + "WHERE pkey_value = '" +
             * vnId + "|" + billId + "' " // These are safe // strings. + "AND table_name = 'bill'";
             * SqlUtils.executeUpdate("afm_docs", docSQL);
             *
             * String docVersSQL = "" + "UPDATE afm_docvers " + "SET table_name = 'bill_archive' " +
             * "WHERE pkey_value = '" + vnId + "|" + billId + "' " // These are safe // strings. +
             * "AND table_name = 'bill'"; SqlUtils.executeUpdate("afm_docvers", docVersSQL);
             *********/

            /*
             * does't work String[] afmDocsFlds = {"table_name","field_name","pkey_value" };
             * DataSource afmDocsDs = DataSourceFactory.createDataSourceForFields("afm_docs",
             * afmDocsFlds); afmDocsDs.addRestriction(Restrictions.eq("afm_docs", "pkey_value", vnId
             * + "|" + billId)); afmDocsDs.addRestriction(Restrictions.eq("afm_docs", "table_name",
             * "bill")); DataRecord amfDocsRecord = afmDocsDs.getRecord();
             * amfDocsRecord.setValue("afm_docs.table_name", "bill_archive");
             * afmDocsDs.updateRecord(amfDocsRecord);
             *
             * String[] afmDocVersFlds = {"table_name","field_name","pkey_value","version"};
             * DataSource afmDocVersDs = DataSourceFactory.createDataSourceForFields("afm_docvers",
             * afmDocVersFlds); afmDocVersDs.addRestriction(Restrictions.eq("afm_docvers",
             * "pkey_value", vnId + "|" + billId));
             * afmDocVersDs.addRestriction(Restrictions.eq("afm_docvers", "table_name", "bill"));
             * DataRecord amfDocVersRecord = afmDocVersDs.getRecord();
             * amfDocVersRecord.setValue("afm_docvers.table_name", "bill_archive");
             * afmDocVersDs.updateRecord(amfDocVersRecord);
             */
        }
        return true;
    }

    /**
     * updateBillDoc - This WFR updates table_name of the afm_docs and afm_docvers records
     * associated with the bill_archive record provided
     *
     * @param billId
     * @param vnId
     */
    public boolean updateBillArchiveDoc(final String billId, final String vnId) {
        final String[] billFlds = { "bill_id", "vn_id", "doc" };
        final DataSource updateDs = DataSourceFactory.createDataSourceForFields("bill", billFlds);
        updateDs.addRestriction(Restrictions.eq("bill", "bill_id", billId));
        updateDs.addRestriction(Restrictions.eq("bill", "vn_id", vnId));
        // VPA - avoid error trying to update a bill outside the VPA
        updateDs.setApplyVpaRestrictions(false);
        final DataRecord billRecord = updateDs.getRecord();
        final String document = billRecord.getString("bill.doc");
        if (document != null) {
            // Using sqlUpdate() since updating a PK value via DataSource inserts
            // a new record instead of updating the existing one

            String docSQL = "INSERT " + "INTO   afm_docs " + "       ( "
                    + "              lock_date      , " + "              lock_time      , "
                    + "              locked_by      , " + "              deleted        , "
                    + "              description    , " + "              transfer_status, "
                    + "              field_name     , " + "              pkey_value     , "
                    + "              table_name " + "       ) " + " SELECT lock_date      , "
                    + "       lock_time      , " + "       locked_by      , "
                    + "       deleted        , " + "       description    , "
                    + "       transfer_status, " + "       field_name     , "
                    + "       pkey_value     , " + "       'bill' " + " FROM   afm_docs "
                    + "             WHERE pkey_value = '" + vnId + "|" + billId + "' "
                    + "     AND     table_name = 'bill'";
            SqlUtils.executeUpdate("afm_docs", docSQL);

            final String docVersSQL = "" + "UPDATE afm_docvers " + "SET table_name = 'bill' "
                    + "        WHERE pkey_value = '" + vnId + "|" + billId + "' " // These
            // are
            // safe
            // strings.
                    + "        AND table_name = 'bill_archive'";
            SqlUtils.executeUpdate("afm_docvers", docVersSQL);

            docSQL = " DELETE FROM afm_docs   " + "    WHERE pkey_value = '" + vnId + "|" + billId
                    + "' " // These are safe strings.
                    + " AND table_name = 'bill_archive'";
            SqlUtils.executeUpdate("afm_docs", docSQL);

            /**********************
             * This code does not work, working alternative is above String docSQL = "" +
             * "UPDATE afm_docs " + "SET table_name = 'bill_archive' " + "WHERE pkey_value = '" +
             * vnId + "|" + billId + "' " // These are safe // strings. + "AND table_name = 'bill'";
             * SqlUtils.executeUpdate("afm_docs", docSQL);
             *
             * String docVersSQL = "" + "UPDATE afm_docvers " + "SET table_name = 'bill_archive' " +
             * "WHERE pkey_value = '" + vnId + "|" + billId + "' " // These are safe // strings. +
             * "AND table_name = 'bill'"; SqlUtils.executeUpdate("afm_docvers", docVersSQL);
             *********/

            /*
             * does't work String[] afmDocsFlds = {"table_name","field_name","pkey_value" };
             * DataSource afmDocsDs = DataSourceFactory.createDataSourceForFields("afm_docs",
             * afmDocsFlds); afmDocsDs.addRestriction(Restrictions.eq("afm_docs", "pkey_value", vnId
             * + "|" + billId)); afmDocsDs.addRestriction(Restrictions.eq("afm_docs", "table_name",
             * "bill")); DataRecord amfDocsRecord = afmDocsDs.getRecord();
             * amfDocsRecord.setValue("afm_docs.table_name", "bill_archive");
             * afmDocsDs.updateRecord(amfDocsRecord);
             *
             * String[] afmDocVersFlds = {"table_name","field_name","pkey_value","version"};
             * DataSource afmDocVersDs = DataSourceFactory.createDataSourceForFields("afm_docvers",
             * afmDocVersFlds); afmDocVersDs.addRestriction(Restrictions.eq("afm_docvers",
             * "pkey_value", vnId + "|" + billId));
             * afmDocVersDs.addRestriction(Restrictions.eq("afm_docvers", "table_name", "bill"));
             * DataRecord amfDocVersRecord = afmDocVersDs.getRecord();
             * amfDocVersRecord.setValue("afm_docvers.table_name", "bill_archive");
             * afmDocVersDs.updateRecord(amfDocVersRecord);
             */
        }
        return true;
    }

    /**
     * Invokes the methods that calculate the income_variance_avg, income_variance_month,
     * income_variance_year, expense_variance_avg, expense_variance_month, expense_variance_year.
     *
     * @param billId
     * @param vnId
     */

    public boolean calculateVarianceValues(final String billId, final String vnId) {
        CalculateVarianceValuesService.run(billId, vnId);
        return true;
    }

    /**
     * processRegressionModel - orchestrates all the processes associated with the regression
     * calculations
     */

    public boolean processRegressionModel() {
        this.status.setTotalNumber(10);
        this.status.setCurrentNumber(1);
        final ProcessRegressionModel prm = new ProcessRegressionModel();
        prm.run();
        this.status.setCurrentNumber(10);
        this.status.setCode(JobStatus.JOB_COMPLETE);
        return true;
    }

    /**
     * processImportedBills - For newly imported bills (status=IMPORTED), perform the new bill calcs
     * and rollups, and optionally auto approve and archive them. Change the status flag to reflect
     * the correct final state.
     *
     * @param autoApproveAndArchive
     */

    public boolean processImportedBills(final boolean autoApproveAndArchive) {

        final String[] billFlds = { "bill_id", "vn_id", "status" };
        final DataSource importedBillsDs =
                DataSourceFactory.createDataSourceForFields("bill", billFlds);
        importedBillsDs.addRestriction(Restrictions.eq("bill", "status", "Imported"));
        final List<DataRecord> billRecords = importedBillsDs.getRecords();

        for (final DataRecord billRecord : billRecords) {
            final String billId = billRecord.getValue("bill.bill_id").toString();
            final String vnId = billRecord.getValue("bill.vn_id").toString();

            populateQTYs(billId, vnId, -1);
            sumBillTotals(billId, vnId);

            if (autoApproveAndArchive) {
                approveBill(billId, vnId);
                archiveBill(billId, vnId);
            } else {
                billRecord.setValue("bill.status", "Created");
                importedBillsDs.saveRecord(billRecord);
            }
        }

        return true;
    }

    /**
     *
     * approveArchiveBills - Iterates through the list of records and calls for each of them the
     * methods required to approve and archive that bill.
     *
     * @param recordsIds - List of Ids for the Bill records that will be approved and archived
     * @param recordsVnIds - List of Ids for the Vendors of the Bill records that will be approved
     *            and archived
     * @throws ExceptionBase
     * @throws ParseException
     */
    public void approveArchiveBills(final List<String> recordsIds, final List<String> recordsVnIds)
            throws ExceptionBase, ParseException {
        final String[] billFlds = { "bill_id", "vn_id", "vn_ac_id", "time_period",
                "date_service_start", "reference_bill_id" };
        final DataSource billsDs = DataSourceFactory.createDataSourceForFields("bill", billFlds);
        this.status.setTotalNumber(recordsIds.size());
        this.status.setCode(JobStatus.JOB_STARTED);
        this.status.setCurrentNumber(0);
        for (int i = 0; i < recordsIds.size(); i++) {
            this.status.setCurrentNumber(i + 1);
            billsDs.clearRestrictions();
            billsDs.addRestriction(Restrictions.eq("bill", "bill_id", recordsIds.get(i)));
            billsDs.addRestriction(Restrictions.eq("bill", "vn_id", recordsVnIds.get(i)));
            final DataRecord record = billsDs.getRecord();
            final String billId = record.getValue("bill.bill_id").toString();
            final String vnId = record.getValue("bill.vn_id").toString();
            final String vnAcId = record.getValue("bill.vn_ac_id").toString();
            final String timePeriod = record.getValue("bill.time_period").toString();

            final Date dateSvcStartDate = record.getDate("bill.date_service_start");
            final Calendar cal = Calendar.getInstance();
            cal.setTime(dateSvcStartDate);
            final String dateSvcStart = Integer.toString(cal.get(Calendar.MONTH) + 1) + "/"
                    + Integer.toString(cal.get(Calendar.DAY_OF_MONTH)) + "/"
                    + Integer.toString(cal.get(Calendar.YEAR));

            if ((getBillLineCount(billId, vnId) < 1)
                    && (getProratedAggregatedBillLineCount(billId, vnId) < 1)) {
                final ExceptionBase exception = ExceptionBaseFactory
                    .newTranslatableException(MESSAGE_ERR_NO_LINES, new Object[] { billId });
                throw exception;
            }
            if (!checkProrateAggregatedParentApproved(billId, vnId)) {
                final ExceptionBase exception = ExceptionBaseFactory
                    .newTranslatableException(MESSAGE_ERR_APP_PARENT, new Object[] { billId });
                throw exception;
            }
            if (!calculateVarianceValues(billId, vnId)) {
                final ExceptionBase exception = ExceptionBaseFactory.newTranslatableException(
                    MESSAGE_CALCULATE_VARIANCE_VALUES, new Object[] { billId });
                throw exception;
            }
            if (!checkArchiveServiceGap(billId, vnId, vnAcId, dateSvcStart, timePeriod)) {
                final ExceptionBase exception = ExceptionBaseFactory.newTranslatableException(
                    MESSAGE_CHECK_ARCHIVE_SERVICE_GAP, new Object[] { billId });
                throw exception;
            }
            if (!approveBill(billId, vnId)) {
                final ExceptionBase exception = ExceptionBaseFactory
                    .newTranslatableException(MESSAGE_APPROVE_BILL, new Object[] { billId });
                throw exception;
            }
            if (!archiveBill(billId, vnId)) {
                final ExceptionBase exception = ExceptionBaseFactory
                    .newTranslatableException(MESSAGE_ARCHIVE_BILL, new Object[] { billId });
                throw exception;
            }
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                break;
            }
        }
    }

}