package com.archibus.app.common.depreciation.impl;

import java.util.*;

import com.archibus.app.common.depreciation.Constants;

/**
 * Utility class. Provides methods to process depreciation dates.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public final class DepreciationDatesHelper {
    /**
     * Constant : month number.
     */
    private static final int MONTH_NO = 12;

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private DepreciationDatesHelper() {

    }

    /**
     * Returns depreciation period for time span.
     *
     * @param monthlyPeriod monthly depreciation period
     * @param timeSpan time span
     * @return int
     */
    public static int getDepreciationLifeTime(final int monthlyPeriod, final String timeSpan) {
        Double deprecPeriods = Double.valueOf(monthlyPeriod);
        if (Constants.TIME_SPAN_YEAR.equals(timeSpan)) {
            deprecPeriods = deprecPeriods / MONTH_NO;
        }
        return (int) Math.floor(deprecPeriods.doubleValue());
    }

    /**
     * Calculate number of periods between received date and calculation date.
     *
     * @param field date interval to add
     * @param dateFrom start date
     * @param dateTo end date
     * @return int
     */
    public static int getDateDiff(final int field, final Date dateFrom, final Date dateTo) {
        final Calendar tmpDate = Calendar.getInstance();
        final Calendar endDate = Calendar.getInstance();
        endDate.setTime(dateTo);
        tmpDate.setTime(dateFrom);
        int amount = 0;
        while (tmpDate.before(endDate)) {
            tmpDate.setTime(dateFrom);
            amount++;
            tmpDate.add(field, amount);
        }
        tmpDate.setTime(dateFrom);
        boolean isFraction = false;
        if (Calendar.MONTH == field) {
            isFraction = endDate.get(Calendar.DATE) > tmpDate.get(Calendar.DATE);
        } else if (Calendar.YEAR == field) {
            isFraction = (endDate.get(Calendar.MONTH) > tmpDate.get(Calendar.MONTH))
                    || (endDate.get(Calendar.MONTH) == tmpDate.get(Calendar.MONTH)
                            && endDate.get(Calendar.DATE) > tmpDate.get(Calendar.DATE));
        }

        if (isFraction) {
            amount--;
        }

        return amount;
    }

    /**
     * Returns list with calculation dates for specified time range and time span.
     *
     * @param dateFrom date start
     * @param dateTo date end
     * @param timeSpan time span
     * @return List<Date>
     */
    public static List<Date> getCalculationDates(final Date dateFrom, final Date dateTo,
            final String timeSpan) {
        final List<Date> calculationDates = new ArrayList<Date>();
        final int field =
                Constants.TIME_SPAN_YEAR.equals(timeSpan) ? Calendar.YEAR : Calendar.MONTH;
        final Calendar currentDate = Calendar.getInstance();
        final Calendar endDate = Calendar.getInstance();
        endDate.setTime(dateTo);
        currentDate.setTime(dateFrom);
        while (!currentDate.after(endDate)) {
            calculationDates.add(currentDate.getTime());
            currentDate.add(field, 1);
        }
        return calculationDates;
    }

    /**
     * Calculate period end date.
     *
     * @param date start date
     * @param timeSpan time span
     * @return Date
     */
    public static Date getPeriodEndDate(final Date date, final String timeSpan) {
        final int field =
                Constants.TIME_SPAN_YEAR.equals(timeSpan) ? Calendar.YEAR : Calendar.MONTH;
        final Calendar currentDate = Calendar.getInstance();
        currentDate.setTime(date);
        currentDate.add(field, 1);
        currentDate.add(Calendar.DATE, -1);
        return currentDate.getTime();
    }

}
