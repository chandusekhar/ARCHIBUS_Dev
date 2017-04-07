package com.archibus.service.cost;

import com.archibus.app.common.finance.domain.Cost;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;

/**
 *
 * Utility class. Provides methods to handle Tax Added Value.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 21.1
 *
 */
public final class VatUtil {
    /**
     *
     * VAT Cost enumeration.
     * <p>
     *
     * @author Ioan Draghici
     * @since 21.3
     *
     */
    public enum VatCost {
        /**
         * VAT cost.
         */
        BASE, VAT, TOTAL;
        /**
         * VAT cost definition.
         */
        private static final Object[][] STRINGS_TO_ENUMS =
                { { "base", BASE }, { "vat", VAT }, { "total", TOTAL } };

        /**
         *
         * Convert from string.
         *
         * @param source string value
         * @return vat type
         */
        public static VatCost fromString(final String source) {
            return (VatCost) EnumTemplate.fromString(source, STRINGS_TO_ENUMS, VatCost.class);
        }

        @Override
        public String toString() {
            return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
        }
    }

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_VAT_NO_COST_CATEG =
            "Unable to find VAT percent value, the Cost Category is not defined.";

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_VAT_NO_COUNTRY =
            "Unable to find VAT percent value, the User Country is not defined.";

    /**
     * Message.
     */
    // @translatable
    private static final String MESSAGE_VAT_NOT_DEFINED =
            "The system didn't find the VAT Percentage value for provided User Country ({0}) and Cost Category ({1}). A value of 0.00 will be used instead.";

    /**
     * Constant: table name.
     */
    private static final String VAT_PERCENT_TABLE = "vat_percent";

    /**
     * Constant: field name.
     */
    private static final String COST_CAT_ID = "cost_cat_id";

    /**
     * Constant: field name.
     */
    private static final String CTRY_ID = "ctry_id";

    /**
     * Constant: field name.
     */
    private static final String IS_EXCEPTION = "is_exception";

    /**
     * Constant: table name.
     */
    private static final String LS_TABLE = "ls";

    /**
     * Constant: field name.
     */
    private static final String LS_ID = "ls_id";

    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private VatUtil() {
    }

    /**
     * Returns VAT percent for specified country and cost category.
     *
     * @param ctryId country code
     * @param costCategory cost category
     * @return double value
     * @throws ExceptionBase exception base
     */
    public static double getVatPercent(final String ctryId, final String costCategory)
            throws ExceptionBase {
        return getVatPercent(ctryId, costCategory, false);
    }

    /**
     * Returns VAT percent for specified country and cost category.
     *
     * @param ctryId country code
     * @param costCategory cost category
     * @param isException if is VAT exception value
     * @return double value
     * @throws ExceptionBase exception base
     */
    public static double getVatPercent(final String ctryId, final String costCategory,
            final boolean isException) throws ExceptionBase {
        boolean isVatDefined = true;
        String errorMessage = null;
        if (StringUtil.isNullOrEmpty(ctryId)) {
            isVatDefined = false;
            errorMessage = MESSAGE_VAT_NO_COUNTRY;
        }

        if (StringUtil.isNullOrEmpty(costCategory)) {
            isVatDefined = false;
            errorMessage = MESSAGE_VAT_NO_COST_CATEG;
        }

        final DataRecord record = getRecord(ctryId, costCategory, isException);
        if (StringUtil.isNullOrEmpty(record)) {
            isVatDefined = false;
        }

        if (isVatDefined) {
            return record.getDouble("vat_percent.vat_percent_value");
        } else {
            if (StringUtil.isNullOrEmpty(errorMessage)) {
                errorMessage = MESSAGE_VAT_NOT_DEFINED;
            }

            final ExceptionBase exception = ExceptionBaseFactory
                .newTranslatableException(errorMessage, new Object[] { ctryId, costCategory });
            throw exception;
        }
    }

    /**
     * Check if VAt is excluded for specified lease.
     *
     * @param leaseId lease code
     * @return boolean
     */
    public static boolean isVatExcludedForLease(final String leaseId) {
        boolean result = false;
        if (StringUtil.notNullOrEmpty(leaseId)) {
            final DataSource dataSource = DataSourceFactory.createDataSourceForFields(LS_TABLE,
                new String[] { LS_ID, "vat_exclude" });
            dataSource.addRestriction(Restrictions.eq(LS_TABLE, LS_ID, leaseId));
            final DataRecord record = dataSource.getRecord();
            result = record.getInt("ls.vat_exclude") == 1;
        }
        return result;
    }

    /**
     * Calculate VAT for cost object.
     *
     * @param cost cost object (recurring , scheduled or actual cost)
     */
    public static void calculateVatForCost(final Cost cost) {
        // check if vatPercentOverride is ON
        boolean vatPercentOverrideOn = true;
        if (cost.getVatPercentOverride() == 0.0) {
            // vatPercentOverride is OFF
            vatPercentOverrideOn = false;
        }

        // check if vatAmountOverride is ON
        boolean vatAmountOverrideOn = true;
        if (cost.getVatAmountOverride() == -1.0) {
            // vatAmountOverride is OFF
            vatAmountOverrideOn = false;
        }

        // if vat is excluded
        final boolean isVatExcluded = isVatExcludedForLease(cost.getLeaseId());
        if (isVatExcluded) {
            vatPercentOverrideOn = false;
            vatAmountOverrideOn = false;
        }
        double amountIncomeVatPayment = 0.0;
        double amountExpenseVatPayment = 0.0;

        if (vatPercentOverrideOn) {
            amountIncomeVatPayment = cost.getAmountIncomeBasePayment()
                    * cost.getVatPercentOverride() / Constants.ONE_HUNDRED;
            amountExpenseVatPayment = cost.getAmountExpenseBasePayment()
                    * cost.getVatPercentOverride() / Constants.ONE_HUNDRED;
        } else if (vatAmountOverrideOn) {
            final boolean isIncome = cost.getAmountIncomeBasePayment() != 0.0;
            final boolean isExpense = cost.getAmountExpenseBasePayment() != 0.0;
            if (isIncome) {
                amountIncomeVatPayment = cost.getVatAmountOverride();
                amountExpenseVatPayment = 0.0;
            } else if (isExpense) {
                amountIncomeVatPayment = 0.0;
                amountExpenseVatPayment = cost.getVatAmountOverride();
            }

        } else if (isVatExcluded) {
            amountIncomeVatPayment = 0.0;
            amountExpenseVatPayment = 0.0;
        } else {
            amountIncomeVatPayment = cost.getAmountIncomeBasePayment() * cost.getVatPercentValue()
                    / Constants.ONE_HUNDRED;
            amountExpenseVatPayment = cost.getAmountExpenseBasePayment() * cost.getVatPercentValue()
                    / Constants.ONE_HUNDRED;
        }
        cost.setAmountIncomeVatPayment(amountIncomeVatPayment);
        cost.setAmountExpenseVatPayment(amountExpenseVatPayment);
        cost.setAmountIncomeTotalPayment(
            cost.getAmountIncomeBasePayment() + amountIncomeVatPayment);
        cost.setAmountExpenseTotalPayment(
            cost.getAmountExpenseBasePayment() + amountExpenseVatPayment);
    }

    /**
     * Get VAT data record.
     *
     * @param ctryId country code
     * @param costCategory cost category
     * @param isException is exception
     * @return data record
     */
    private static DataRecord getRecord(final String ctryId, final String costCategory,
            final boolean isException) {
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields(VAT_PERCENT_TABLE,
            new String[] { COST_CAT_ID, CTRY_ID, IS_EXCEPTION, "vat_percent_value" });
        dataSource.addRestriction(
            Restrictions.and(Restrictions.eq(VAT_PERCENT_TABLE, COST_CAT_ID, costCategory),
                Restrictions.eq(VAT_PERCENT_TABLE, CTRY_ID, ctryId)));
        if (isException) {
            dataSource.addRestriction(Restrictions.eq(VAT_PERCENT_TABLE, IS_EXCEPTION, 1));
        }
        dataSource.addSort(VAT_PERCENT_TABLE, IS_EXCEPTION, DataSource.SORT_ASC);

        return dataSource.getRecord();
    }

}
