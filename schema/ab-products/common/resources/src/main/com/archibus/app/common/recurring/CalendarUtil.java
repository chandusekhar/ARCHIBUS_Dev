package com.archibus.app.common.recurring;

import java.util.*;

/**
 *
 * Class for any calendar operation for recurring schedule functions.
 * <p>
 * Only for refactoring purpose:Abstract all the calendar related methods to this class to avoid
 * violating the PMD rule in RecurringScheduleHelper.
 * </p>
 *
 * @author He Qiang
 * @since 21.4
 *
 */
public final class CalendarUtil {

    /**
     * Constant: NUMBER 4.
     */
    private static final int FOUR = 4;
    
    /**
     * Constant: NUMBER 3.
     */
    private static final int THREE = 3;

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private CalendarUtil() {
    }
    
    /**
     * Check if to date is after given number of year of from date.
     *
     * @param dateFrom date from
     * @param dateTo date to
     * @param number number of years for checking date to
     *
     * @return true or false
     */
    public static boolean checkAfterNumberOfYears(final Date dateTo, final Date dateFrom,
            final int number) {
        boolean isAfter = false;
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(dateFrom);
        calendar.add(Calendar.YEAR, number);
        if (dateTo.after(calendar.getTime())) {
            isAfter = true;
        }
        return isAfter;
    }
    
    /**
     * @return calendar set to initial start date.
     *
     * @param dateStart given start date
     */
    public static Calendar getInitialStartCalendar(final Date dateStart) {

        final Calendar calendar = Calendar.getInstance();
        // initial calendar value with start date
        calendar.setTime(dateStart);
        // when set date start, need to clear other time fields
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        return calendar;
    }

    /**
     * Get next interval date.
     *
     * @param date base date
     * @param intevalType inteval type
     * @param diff difference value
     * @return next interval date
     */
    public static Date getNextInterval(final Date date, final int intevalType, final int diff) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(intevalType, diff);
        return calendar.getTime();
    }

    /**
     * get next yearly interval date.
     *
     * @param date base date
     * @param day day of month
     * @param month month of year
     * @param diff difference value
     * @return next interval date
     */
    public static Date getNextIntervalYearly(final Date date, final int day, final Integer month,
            final int diff) {
        final Calendar calendar = Calendar.getInstance();
        Date newDate = date;
        if (diff != 0) {
            newDate = getNextInterval(date, Calendar.YEAR, diff);
        }
        calendar.setTime(newDate);
        calendar.set(Calendar.MONTH, month);
        moveCalendarToDayOfMonth(calendar, day);
        return calendar.getTime();
    }
    
    /**
     * get next monthly interval date.
     *
     * @param date base date
     * @param day day of month
     * @param diff difference value
     * @return next interval date
     */
    public static Date getNextIntervalMonthly(final Date date, final int day, final int diff) {
        final Calendar calendar = Calendar.getInstance();
        Date newDate = date;
        if (diff != 0) {
            newDate = getNextInterval(date, Calendar.MONTH, diff);
        }
        calendar.setTime(newDate);
        moveCalendarToDayOfMonth(calendar, day);
        return calendar.getTime();
    }

    /**
     * Move the calendar to a day of the month, specified via day number.
     *
     * @param calendar the calendar to move
     * @param dayOfMonth explicit numbered day of the month in the pattern
     */
    public static void moveCalendarToDayOfMonth(final Calendar calendar, final int dayOfMonth) {
        // verify the actual maximum (especially for February 29!)
        final int actualMax = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
        if (actualMax < dayOfMonth) {
            calendar.set(Calendar.DAY_OF_MONTH, actualMax);
        } else {
            calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
        }
    }
    
    /**
     * move calendar to week index.
     *
     * @param calendar calendar
     * @param dayDiff dayDiff
     * @param monthIndex monthIndex
     * @param yearIndex yearIndex
     * @param weekIndex weekIndex
     */
    public static void moveCalendarToWeekIndex(final Calendar calendar, final int dayDiff,
            final int monthIndex, final int yearIndex, final String weekIndex) {

        if (RecurringSchedulePattern.SECOND.equals(weekIndex)) {

            // get 2nd date of parameter 'week'
            calendar.add(Calendar.DATE, dayDiff);

        } else if (RecurringSchedulePattern.THIRD.equals(weekIndex)) {

            // get 3rd date of parameter 'week'
            calendar.add(Calendar.DATE, dayDiff + dayDiff);

        } else if (RecurringSchedulePattern.FORTH.equals(weekIndex)) {

            // get 4th date of parameter 'week'
            calendar.add(Calendar.DATE, dayDiff + dayDiff + dayDiff);

        } else if (RecurringSchedulePattern.LAST.equals(weekIndex)) {

            // get last date of parameter 'week'
            calendar.add(Calendar.DATE, dayDiff + dayDiff + dayDiff + dayDiff);

            if (calendar.get(Calendar.YEAR) > yearIndex
                    || (calendar.get(Calendar.YEAR) == yearIndex && calendar.get(Calendar.MONTH) > monthIndex)) {
                calendar.add(Calendar.DATE, -dayDiff);
            }
        }
    }

    /**
     * move given calendar toward until to next Weekendday.
     *
     * @param calendar given calendar
     * @param sequence sequence string of wanted weekday "1st"/"2nd"/"3rd"/"4th"
     * @param isWeekDay indicates move to next week day or weekend day of given sequence number
     *
     */
    public static void moveCalenderToNextSequenceDayOfWeek(final Calendar calendar,
            final String sequence, final boolean isWeekDay) {

        int seq = 0;
        if (RecurringSchedulePattern.FIRST.equals(sequence)) {
            seq = 1;

        } else if (RecurringSchedulePattern.SECOND.equals(sequence)) {

            // get 2nd date of parameter 'week'
            seq = 2;

        } else if (RecurringSchedulePattern.THIRD.equals(sequence)) {

            // get 3rd date of parameter 'week'
            seq = THREE;

        } else if (RecurringSchedulePattern.FORTH.equals(sequence)) {

            // get 4th date of parameter 'week'
            seq = FOUR;

        }

        if (isWeekDay) {

            moveCalenderToNextWeekDay(calendar, seq);

        } else {

            moveCalenderToNextWeekendDay(calendar, seq);
        }

    }

    /**
     * move given calendar toward until to next given order weekday .
     *
     * @param calendar given calendar
     * @param number sequence number of wanted weekday 0/1/2/3
     */
    public static void moveCalenderToNextWeekDay(final Calendar calendar, final int number) {

        while (calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY
                || calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
            calendar.add(Calendar.DAY_OF_MONTH, 1);
        }

        int count = 1;
        while (count < number) {

            calendar.add(Calendar.DAY_OF_MONTH, 1);

            while (calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY
                    || calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
                calendar.add(Calendar.DAY_OF_MONTH, 1);
            }
            count++;
        }

    }

    /**
     * move given calendar toward until to next Weekendday.
     *
     * @param calendar given calendar
     * @param number sequence number of wanted weekday 0/1/2/3
     *
     */
    public static void moveCalenderToNextWeekendDay(final Calendar calendar, final int number) {

        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
                && calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
            calendar.add(Calendar.DAY_OF_MONTH, 1);
        }

        int count = 1;
        while (count < number) {

            calendar.add(Calendar.DAY_OF_MONTH, 1);
            count++;

            while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
                    && calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
                calendar.add(Calendar.DAY_OF_MONTH, 1);
            }

        }

    }

    /**
     * move given calendar back until to previous weekday.
     *
     * @param calendar given calendar
     */
    public static void moveCalenderToPreviousWeekDay(final Calendar calendar) {
        while (calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SATURDAY
                || calendar.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY) {
            calendar.add(Calendar.DAY_OF_MONTH, -1);
        }
    }

    /**
     * move given calendar back until to previous Weekendday.
     *
     * @param calendar given calendar
     */
    public static void moveCalenderToPreviousWeekendDay(final Calendar calendar) {
        while (calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
                && calendar.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY) {
            calendar.add(Calendar.DAY_OF_MONTH, -1);
        }
    }
    
    /**
     * Determine if date of calendar in processing is after end date and return a boolean sign. If
     * no also add processing date value to dates list.
     *
     * @param date date for comparing
     * @param dateEnd end date for comparing
     * @param dateStart start date for comparing
     * @param datesList date list
     *
     * @return boolean sign indicates if date of calendar in processing is after end date.
     */
    public static boolean compareDates(final Date date, final Date dateEnd, final Date dateStart,
            final List<Date> datesList) {
        boolean isAfterEndDate = false;
        if (date.after(dateEnd)) {
            isAfterEndDate = true;
        } else if (!date.before(dateStart)) {
            datesList.add(date);
        }
        return isAfterEndDate;
    }
}
