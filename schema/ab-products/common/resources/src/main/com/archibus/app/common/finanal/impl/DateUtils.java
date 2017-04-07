package com.archibus.app.common.finanal.impl;

import java.util.*;

import com.archibus.datasource.DataStatistics;

/**
 * Utility class with date functions.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public final class DateUtils {
    /**
     * Private constructor.
     */
    private DateUtils() {

    }

    /**
     * Calculate aggregation dates and populate aggregationDates list.
     *
     * @param dateFrom interval start date
     * @param dateTo interval end date
     * @return List<Date>
     */
    public static List<Date> calculateAggregationDates(final Date dateFrom, final Date dateTo) {
        final Date startDate = getFirstDayOfMonth(dateFrom);
        final Date endDate = getFirstDayOfMonth(dateTo);
        final List<Date> result = new ArrayList<Date>();
        if (startDate.equals(endDate)) {
            // startDate = incrementDate(endDate, Calendar.MONTH, -1);
            result.add(startDate);
        } else {
            final Calendar currentDate = Calendar.getInstance();
            currentDate.setTime(startDate);
            while (!currentDate.getTime().after(endDate)) {
                result.add(currentDate.getTime());
                currentDate.add(Calendar.MONTH, 1);
            }

        }
        return result;
    }

    /**
     * Return first day of the month for given date.
     *
     * @param date date
     * @return Date
     */
    public static Date getFirstDayOfMonth(final Date date) {
        final Calendar result = Calendar.getInstance();
        result.setTime(getDateWithoutTime(date));
        result.set(Calendar.DATE, 1);
        return result.getTime();
    }

    /**
     * Increment date.
     *
     * @param date date value
     * @param field date interval
     * @param amount amount
     * @return Date
     */
    public static Date incrementDate(final Date date, final int field, final int amount) {
        final Calendar result = Calendar.getInstance();
        result.setTime(date);
        result.add(field, amount);
        return result.getTime();
    }

    /**
     * Get current fiscal year start date. Read from afm_scmpref.
     *
     * @return Date
     */
    public static Date getCurrentFiscalYearStartDate() {
        final int fiscalYear = getCurrentFiscalYear();
        return getFiscalYearStartDate(fiscalYear);
    }

    /**
     * Get current fiscal year end date. Read from afm_scmpref.
     *
     * @return Date
     */
    public static Date getCurrentFiscalYearEndDate() {
        final int fiscalYear = getCurrentFiscalYear();
        return getFiscalYearEndDate(fiscalYear);
    }

    /**
     * Returns fiscal year for current system date.
     *
     * @return int
     */
    public static int getCurrentFiscalYear() {
        return getFiscalYearForDate(new Date());
    }

    /**
     * Get fiscal year start date for specified year. Read from afm_scmpref.
     *
     * @param year year value
     * @return Date
     */
    public static Date getFiscalYearStartDate(final int year) {
        final int day = DataStatistics.getInt(Constants.AFM_SCMPREF, Constants.FISCALYEAR_STARTDAY,
            Constants.FORMULA_MAX);
        final int month = DataStatistics.getInt(Constants.AFM_SCMPREF,
            Constants.FISCALYEAR_STARTMONTH, Constants.FORMULA_MAX);
        final Calendar calendar = Calendar.getInstance();
        calendar.set(year - 1, month - 1, day);
        return getDateWithoutTime(calendar.getTime());
    }

    /**
     * Get fiscal year start date for specified year. Read from afm_scmpref.
     *
     * @param year year value
     * @return Date
     */
    public static Date getFiscalYearEndDate(final int year) {
        final Date fiscalYearStart = getFiscalYearStartDate(year);
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(fiscalYearStart);
        calendar.add(Calendar.YEAR, 1);
        calendar.add(Calendar.DATE, -1);
        return calendar.getTime();
    }

    /**
     * Returns the fiscal year value for specified date.
     *
     * @param date date
     * @return int
     */
    public static int getFiscalYearForDate(final Date date) {
        final Calendar calDate = Calendar.getInstance();
        calDate.setTime(getDateWithoutTime(date));
        int year = calDate.get(Calendar.YEAR);
        final Date fiscalYearEndDate = getFiscalYearEndDate(year);
        if (fiscalYearEndDate.before(calDate.getTime())
                || fiscalYearEndDate.equals(calDate.getTime())) {
            year = year + 1;
        }
        return year;
    }

    /**
     * Get current date without time.
     *
     * @return date object
     */
    public static Date getCurrentDateWithoutTime() {
        return getDateWithoutTime(new Date());
    }

    /**
     * Reset time fields for specified date.
     *
     * @param date date
     * @return Date
     */
    public static Date getDateWithoutTime(final Date date) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    /**
     * Return date field value from specified date.
     *
     * @param field date field
     * @param date date object
     * @return int
     */
    public static int getFieldFromDate(final int field, final Date date) {
        final Calendar calDate = Calendar.getInstance();
        calDate.setTime(date);
        return calDate.get(field);
    }

}
