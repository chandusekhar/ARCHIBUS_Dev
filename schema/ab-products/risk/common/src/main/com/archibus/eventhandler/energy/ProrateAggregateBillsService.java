package com.archibus.eventhandler.energy;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobBase;

/**
 * ProrateAggregateBillsService - This class handles proration need for bills entered for multiple
 * buildings
 *
 * History:
 * <li>21.3 Initial implementation.
 *
 * Suppress PMD warning "AvoidUsingSql".
 * <p>
 * Justification: Case #1: SQL statements with subqueries.
 *
 * @author Razvan Croitoru
 */

@SuppressWarnings({ "PMD.AvoidUsingSql" })
public class ProrateAggregateBillsService extends JobBase {

    /**
     * Field conversion factor from bill_unit table.
     */
    public static final String BILL_UNIT_CONVERSION_FACTOR = "bill_unit.conversion_factor";

    /**
     * Energy string.
     */
    public static final String ENERGY = "Energy";

    /**
     * ELECTRIC String.
     */
    public static final String ELECTRIC = "ELECTRIC";

    /**
     * conversion_factor string.
     */
    public static final String CONVERSION_FACTOR = "conversion_factor";

    /**
     * bill_unit_id.
     */
    public static final String BILL_UNIT_ID = "bill_unit_id";

    /**
     * Number 100 000.
     */
    public static final int NO_100000 = 100000;

    /**
     * Field rollup_type.
     */
    public static final String ROLLUP_TYPE = "rollup_type";

    /**
     * Field is_dflt.
     */
    public static final String IS_DFLT = "is_dflt";

    /**
     * Table bill_unit.
     */
    public static final String BILL_UNIT = "bill_unit";

    /**
     * Prorated-location.
     */
    public static final String PRORATED_LOCATION = "PRORATED-LOCATION";

    /**
     * bill.prorated_aggregated.
     */
    public static final String BILL_PRORATED_AGGREGATED = "bill.prorated_aggregated";

    /**
     * bill.reference_bill_id.
     */
    public static final String BILL_REFERENCE_BILL_ID = "bill.reference_bill_id";

    /**
     * bill.bill_id.
     */
    public static final String BILL_BILL_ID = "bill.bill_id";

    /**
     * bill type id.
     */
    public static final String BILL_TYPE_ID = "bill_type_id";

    /**
     * Minus.
     */
    public static final String STRING_MINUS = "-";

    /**
     * Number 1.
     */
    public static final int NO_1 = 1;

    /**
     * Quantity volume field.
     */
    public static final String BILL_QTY_VOLUME = "bill.qty_volume";

    /**
     * Quantity power field.
     */
    public static final String BILL_QTY_POWER = "bill.qty_power";

    /**
     * Quantity Energy field.
     */
    public static final String BILL_QTY_ENERGY = "bill.qty_energy";

    /**
     * Amount expense field.
     */
    public static final String BILL_AMOUNT_EXPENSE = "bill.amount_expense";

    /**
     * Amount income field.
     */
    public static final String BILL_AMOUNT_INCOME = "bill.amount_income";

    /**
     * bl_id field from bill.
     */
    public static final String BILL_BL_ID = "bill.bl_id";

    /**
     * Fields array.
     */
    public static final String[] BILL_FLDS = { "bill_id", BILL_TYPE_ID, "bl_id", "amount_income",
            "amount_expense", "cost_kwh", "cost_mmbtu", "date_due", "date_service_end",
            "date_service_start", "qty_energy", "qty_kwh", "qty_power", "qty_volume", "site_id",
            "time_period", "vn_ac_id", "vn_id", "reference_bill_id", "prorated_aggregated" };

    /**
     *
     * prorateBillsToBildingsManual - prorate bills for groups of building having proration_action =
     * manual.
     *
     * @param billId - the bill id for the main bill ( the one for multiple buildings)
     * @param dataSetList - the records needed to be created
     * @return - true or false depending on totals
     */
    public boolean prorateBillsToBildingsManual(final String billId,
            final DataSetList dataSetList) {
        final DataSource billDs =
                DataSourceFactory.createDataSourceForFields(Constants.TABLE_BILL, BILL_FLDS);
        billDs
            .addRestriction(Restrictions.eq(Constants.TABLE_BILL, Constants.FIELD_BILL_ID, billId));
        final DataRecord rec = billDs.getRecord();

        final String[] unitsFlds =
                { BILL_TYPE_ID, BILL_UNIT_ID, CONVERSION_FACTOR, ROLLUP_TYPE, IS_DFLT };
        final DataSource unitsDs =
                DataSourceFactory.createDataSourceForFields(BILL_UNIT, unitsFlds);
        unitsDs.addRestriction(Restrictions.eq(BILL_UNIT, BILL_TYPE_ID, ELECTRIC));
        unitsDs.addRestriction(Restrictions.eq(BILL_UNIT, ROLLUP_TYPE, ENERGY));
        unitsDs.addRestriction(Restrictions.eq(BILL_UNIT, IS_DFLT, NO_1));
        final DataRecord unitsRecord = unitsDs.getRecord();
        final Double conversionFactor =
                Double.parseDouble(unitsRecord.getValue(BILL_UNIT_CONVERSION_FACTOR).toString());

        Double sumIncome = 0.0;
        Double sumExpense = 0.0;
        Double sumQtyEnergy = 0.0;
        Double sumQtyPower = 0.0;
        Double sumQtyVolume = 0.0;
        for (final DataRecord record : dataSetList.getRecords()) {
            sumIncome =
                    sumIncome + Double.parseDouble(record.getValue(BILL_AMOUNT_INCOME).toString());
            sumExpense = sumExpense
                    + Double.parseDouble(record.getValue(BILL_AMOUNT_EXPENSE).toString());
            sumQtyEnergy =
                    sumQtyEnergy + Double.parseDouble(record.getValue(BILL_QTY_ENERGY).toString());
            sumQtyPower =
                    sumQtyPower + Double.parseDouble(record.getValue(BILL_QTY_POWER).toString());
            sumQtyVolume =
                    sumQtyVolume + Double.parseDouble(record.getValue(BILL_QTY_VOLUME).toString());
        }

        boolean ret = true;
        if (checkTotals(sumIncome, sumExpense, sumQtyEnergy, sumQtyPower, sumQtyVolume, rec)) {
            for (final DataRecord record : dataSetList.getRecords()) {
                rec.setValue(BILL_BILL_ID,
                    billId + STRING_MINUS + record.getValue(BILL_BL_ID).toString());
                rec.setValue(BILL_BL_ID, record.getValue(BILL_BL_ID).toString());
                rec.setValue(BILL_REFERENCE_BILL_ID, billId);
                rec.setValue(BILL_AMOUNT_INCOME,
                    Double.parseDouble(record.getValue(BILL_AMOUNT_INCOME).toString()));
                rec.setValue(BILL_AMOUNT_EXPENSE,
                    Double.parseDouble(record.getValue(BILL_AMOUNT_EXPENSE).toString()));
                rec.setValue(BILL_QTY_ENERGY,
                    (Double.parseDouble(record.getValue(BILL_QTY_ENERGY).toString())
                            * conversionFactor));
                rec.setValue(BILL_QTY_POWER,
                    Double.parseDouble(record.getValue(BILL_QTY_POWER).toString()));
                rec.setValue(BILL_QTY_VOLUME,
                    Double.parseDouble(record.getValue(BILL_QTY_VOLUME).toString()));
                rec.setValue(BILL_PRORATED_AGGREGATED, PRORATED_LOCATION);
                rec.setNew(true);
                billDs.saveRecord(rec);
            }
        } else {
            ret = false;
        }

        return ret;

    }

    /**
     *
     * prorateBillsToBildingsByOccupancyOrArea - prorate bills for groups of building by occupancy
     * or area .
     *
     * @param billId - the bill id for the main bill ( the one for multiple buildings)
     * @param dataSetList - the records needed to be created
     * @return true or false
     */
    public boolean prorateBillsToBildingsByOccupancyOrArea(final String billId,
            final DataSetList dataSetList) {
        final DataSource billDs =
                DataSourceFactory.createDataSourceForFields(Constants.TABLE_BILL, BILL_FLDS);
        billDs
            .addRestriction(Restrictions.eq(Constants.TABLE_BILL, Constants.FIELD_BILL_ID, billId));
        final DataRecord rec = billDs.getRecord();

        for (final DataRecord record : dataSetList.getRecords()) {
            rec.setValue(BILL_BILL_ID,
                billId + STRING_MINUS + record.getValue(BILL_BL_ID).toString());
            rec.setValue(BILL_BL_ID, record.getValue(BILL_BL_ID).toString());
            rec.setValue(BILL_REFERENCE_BILL_ID, billId);
            rec.setValue(BILL_AMOUNT_INCOME,
                Double.parseDouble(record.getValue(BILL_AMOUNT_INCOME).toString()));
            rec.setValue(BILL_AMOUNT_EXPENSE,
                Double.parseDouble(record.getValue(BILL_AMOUNT_EXPENSE).toString()));
            rec.setValue(BILL_QTY_ENERGY,
                Double.parseDouble(record.getValue(BILL_QTY_ENERGY).toString()));
            rec.setValue(BILL_QTY_POWER,
                Double.parseDouble(record.getValue(BILL_QTY_POWER).toString()));
            rec.setValue(BILL_QTY_VOLUME,
                Double.parseDouble(record.getValue(BILL_QTY_VOLUME).toString()));
            rec.setValue(BILL_PRORATED_AGGREGATED, PRORATED_LOCATION);
            rec.setNew(true);
            billDs.saveRecord(rec);
        }
        return true;
    }

    /**
     *
     * prorateBillsToBildingsByPercentage - prorate bills for groups of building by percentage .
     *
     * @param billId - the bill id for the main bill ( the one for multiple buildings)
     * @param dataSetList - the records needed to be created
     * @return true or false
     */
    public boolean prorateBillsToBildingsByPercentage(final String billId,
            final DataSetList dataSetList) {
        final DataSource billDs =
                DataSourceFactory.createDataSourceForFields(Constants.TABLE_BILL, BILL_FLDS);
        billDs
            .addRestriction(Restrictions.eq(Constants.TABLE_BILL, Constants.FIELD_BILL_ID, billId));
        Double total = 0.0;
        boolean ret = true;
        for (final DataRecord record : dataSetList.getRecords()) {
            total = total + Double.parseDouble(record.getValue(BILL_AMOUNT_EXPENSE).toString());
        }
        if (Math.ceil(total) == NO_1) {
            for (final DataRecord record : dataSetList.getRecords()) {
                final DataRecord rec = billDs.getRecord();
                final Double percent = record.getDouble(BILL_AMOUNT_EXPENSE);
                rec.setValue(BILL_BILL_ID,
                    billId + STRING_MINUS + record.getValue(BILL_BL_ID).toString());
                rec.setValue(BILL_BL_ID, record.getValue(BILL_BL_ID).toString());
                rec.setValue(BILL_REFERENCE_BILL_ID, billId);
                rec.setValue(BILL_AMOUNT_INCOME,
                    Double.parseDouble(rec.getValue(BILL_AMOUNT_INCOME).toString()) * percent);
                rec.setValue(BILL_AMOUNT_EXPENSE,
                    Double.parseDouble(rec.getValue(BILL_AMOUNT_EXPENSE).toString()) * percent);
                rec.setValue(BILL_QTY_ENERGY,
                    Double.parseDouble(rec.getValue(BILL_QTY_ENERGY).toString()) * percent);
                rec.setValue(BILL_QTY_POWER,
                    Double.parseDouble(rec.getValue(BILL_QTY_POWER).toString()) * percent);
                rec.setValue(BILL_QTY_VOLUME,
                    Double.parseDouble(rec.getValue(BILL_QTY_VOLUME).toString()) * percent);
                rec.setValue(BILL_PRORATED_AGGREGATED, PRORATED_LOCATION);
                rec.setNew(true);
                billDs.saveRecord(rec);
            }
        } else {
            ret = false;

        }
        return ret;
    }

    /**
     *
     * checkTotals - checks if the totals on the input are the same with the total on the bill.
     *
     * @param sumIncome - total
     * @param sumExpense - total
     * @param sumQtyEnergy - total
     * @param sumQtyPower - total
     * @param sumQtyVolume - total
     * @param rec - record to be compared with
     * @return - true if they are equal, false if not
     */
    private boolean checkTotals(final Double sumIncome, final Double sumExpense,
            final Double sumQtyEnergy, final Double sumQtyPower, final Double sumQtyVolume,
            final DataRecord rec) {
        boolean ret = true;
        final String[] unitsFlds =
                { BILL_TYPE_ID, BILL_UNIT_ID, CONVERSION_FACTOR, ROLLUP_TYPE, IS_DFLT };
        final DataSource unitsDs =
                DataSourceFactory.createDataSourceForFields(BILL_UNIT, unitsFlds);
        unitsDs.addRestriction(Restrictions.eq(BILL_UNIT, BILL_TYPE_ID, ELECTRIC));
        unitsDs.addRestriction(Restrictions.eq(BILL_UNIT, ROLLUP_TYPE, ENERGY));
        unitsDs.addRestriction(Restrictions.eq(BILL_UNIT, IS_DFLT, "1"));
        final DataRecord unitsRecord = unitsDs.getRecord();

        final Double conversionFactor =
                Double.parseDouble(unitsRecord.getValue(BILL_UNIT_CONVERSION_FACTOR).toString());
        if (sumIncome != rec.getDouble(BILL_AMOUNT_INCOME)
                || sumExpense != rec.getDouble(BILL_AMOUNT_EXPENSE)
                || (Math.round(sumQtyEnergy * NO_100000) != Math
                    .round((rec.getDouble(BILL_QTY_ENERGY) / conversionFactor) * NO_100000))
                || sumQtyPower != rec.getDouble(BILL_QTY_POWER)) {
            ret = false;
        }
        if (sumQtyVolume != rec.getDouble(BILL_QTY_VOLUME)) {
            ret = false;
        }
        return ret;
    }
}