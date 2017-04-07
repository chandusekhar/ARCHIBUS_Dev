package com.archibus.app.common.recurring;

import static com.archibus.app.common.recurring.RecurringSchedulePattern.*;

import java.util.*;

import com.archibus.utility.*;

/**
 * Helper class for RecurringSchedulePattern.
 *
 * @author Zhang Yi
 *
 * @since 20.2 for refactoring
 */
public final class RecurringScheduleHelper {
    
    /**
     * Default weekly pattern value.
     */
    private static final String DEFAULT_WEEKLY_VALUE = "0,0,0,0,0,0,0";
    
    /**
     * Constant: character ','.
     */
    private static final String SINGLE_SEMICOLON = ",";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     *
     * @throws InstantiationException always, since this constructor should never be called.
     */
    private RecurringScheduleHelper() throws InstantiationException {
        throw new InstantiationException("Never instantiate " + this.getClass().getName()
                + "; use static methods!");
    }
    
    /**
     * Calculate the end date of a Recurring Schedule Rule Pattern Object.
     *
     * @param rule Recurring Schedule Rule Pattern Object
     * @param schedulingLimit scheduling limit
     *
     */
    public static void calculateDateEnd(final RecurringSchedulePattern rule,
            final int schedulingLimit) {
        int recurringLimit = schedulingLimit;
        if (schedulingLimit == -1) {
            recurringLimit = RecurringSchedulePattern.MAX_OCCURRENCES;
        }
        Date end = rule.getDateEnd();
        if (rule.getDateEnd() == null
                || CalendarUtil.checkAfterNumberOfYears(rule.getDateEnd(), rule.getDateStart(),
                    recurringLimit)) {
            
            final Calendar start = Calendar.getInstance();
            start.setTime(rule.getDateStart());
            start.add(Calendar.YEAR, recurringLimit);
            // KB 3041013
            start.add(Calendar.DAY_OF_YEAR, -1);
            end = start.getTime();
            
        }
        
        rule.setDateEnd(end);
    }

    /**
     * Calculate String format of value1 of Recurring Schedule Rule Pattern object.
     *
     *
     * @param rule Recurring Schedule Rule Pattern Object
     * @param calendar Calendar object set to start date
     *
     */
    public static void calculateValue1OfWeekly(final RecurringSchedulePattern rule,
            final Calendar calendar) {

        final int[] intValue = { 0, 0, 0, 0, 0, 0, 0 };
        
        if (DEFAULT_WEEKLY_VALUE.equals(rule.getValue1()) || "".equals(rule.getValue1())) {
            
            final int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
            
            final int[] daysArray =
                { Calendar.MONDAY, Calendar.TUESDAY, Calendar.WEDNESDAY, Calendar.THURSDAY,
                    Calendar.FRIDAY, Calendar.SATURDAY, Calendar.SUNDAY };
            
            final StringBuilder weeklyBuilder = new StringBuilder();
            for (int i = 0; i < daysArray.length; i++) {
                if (daysArray[i] == dayOfWeek) {
                    intValue[i] = 1;
                }
                weeklyBuilder.append(intValue[i] + SINGLE_SEMICOLON);
            }
            rule.setValue1(weeklyBuilder.substring(0, weeklyBuilder.length() - 1));
        }
    }

    /**
     * Returns localized string for End after X occurrences.
     *
     * @param total occurrences number
     * @return string
     */
    public static String getEndAfterMessage(final int total) {
        String message = "";
        if (total != RecurringSchedulePattern.MAX_OCCURRENCES) {
            message = RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_END);
            message =
                    RecurringMessages.COMMA_SEPARATOR
                            + message.replace(RecurringMessages.VARIABLE_0, String.valueOf(total));
        }
        return message;
    }
    
    /**
     * Get recurrence description for daily occurrence.
     *
     * @param value1 first parameter
     * @param total occurrences number
     * @return localized string
     */
    public static String getDailyDescription(final String value1, final int total) {
        // String message =
        // RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_TYPE_DAILY);
        String message = "";
        if (StringUtil.notNullOrEmpty(value1)) {
            final String details =
                    RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_DAY);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + details.replace(RecurringMessages.VARIABLE_0, value1);
        }
        message += getEndAfterMessage(total);
        return message;
    }
    
    /**
     * Get localized description for weekly recurrence.
     *
     * @param value1 first parameter
     * @param value2 second parameter
     * @param total occurrences number
     * @return localized description
     */
    public static String getWeeklyDescription(final String value1, final String value2,
            final int total) {
        // String message =
        // RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_TYPE_WEEKLY);
        String message = "";
        if (StringUtil.notNullOrEmpty(value2)) {
            final String details =
                    RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_WEEK);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + details.replace(RecurringMessages.VARIABLE_0, value2);
        }
        if (StringUtil.notNullOrEmpty(value1)) {
            final String daysString = getDaysFromWeeklyValue(value1);
            if (StringUtil.notNullOrEmpty(daysString)) {
                message +=
                        RecurringMessages.COMMA_SEPARATOR
                                + RecurringMessages
                                    .getLocalizedMessage(RecurringMessages.MESSAGE_ON);
                message += RecurringMessages.SPACE_SEPARATOR + daysString;
            }
        }
        message += getEndAfterMessage(total);
        return message;
    }
    
    /**
     * Get localized description for monthly recurrence.
     *
     * @param value1 first parameter
     * @param value2 second parameter
     * @param value3 third parameter
     * @param total occurrences number
     * @return localized description
     */
    public static String getMonthlyDescription(final String value1, final String value2,
            final String value3, final int total) {
        // String message =
        // RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_TYPE_MONTHLY);
        String message = "";
        if (StringUtil.notNullOrEmpty(value3)) {
            final String detail =
                    RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_MONTH);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + detail.replace(RecurringMessages.VARIABLE_0, value3);
        }
        if (StringUtil.notNullOrEmpty(value1) && StringUtil.isNullOrEmpty(value2)) {
            final String detail =
                    RecurringMessages
                        .getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_DAY_OF_MONTH);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + detail.replace(RecurringMessages.VARIABLE_0, value1);
        }
        if (StringUtil.notNullOrEmpty(value1) && StringUtil.notNullOrEmpty(value2)) {
            final String detail =
                    RecurringMessages
                        .getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_WEEKDAY_OF_MONTH);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + detail.replace(RecurringMessages.VARIABLE_0,
                                RecurringMessages.getValueByShortName(value1)).replace(
                                RecurringMessages.VARIABLE_1,
                                RecurringMessages.getValueByShortName(value2));
        }
        message += getEndAfterMessage(total);
        return message;
    }
    
    /**
     * Get localized description for yearly recurrence.
     *
     * @param value1 first parameter
     * @param value2 second parameter
     * @param value3 third parameter
     * @param total occurrences number
     * @return localized description
     */
    public static String getYearlyDescription(final String value1, final String value2,
            final String value3, final int total) {
        // String message =
        // RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_TYPE_YEARLY);
        String message = "";
        if (StringUtil.notNullOrEmpty(value3)) {
            final String detail =
                    RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_YEAR);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + detail.replace(RecurringMessages.VARIABLE_0, value3);
        }
        
        if (StringUtil.notNullOrEmpty(value1) && StringUtil.notNullOrEmpty(value2)) {
            final String detail =
                    RecurringMessages
                        .getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_MONTH_OF_YEAR);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + detail.replace(RecurringMessages.VARIABLE_0, value1).replace(
                                RecurringMessages.VARIABLE_1,
                                RecurringMessages.getMonthByShortName(value2));
        }
        message += getEndAfterMessage(total);
        return message;
    }
    
    /**
     * Get localized description for yearly recurrence.
     *
     * @param value1 first parameter
     * @param value2 second parameter
     * @param value3 third parameter
     * @param value4 fourth parameter
     * @param total occurrences number
     * @return localized description
     */
    public static String getYearlyDescription(final String value1, final String value2,
            final String value3, final String value4, final int total) {
        // String message =
        // RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_TYPE_YEARLY);
        String message = "";
        if (StringUtil.notNullOrEmpty(value4)) {
            final String detail =
                    RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_YEAR);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + detail.replace(RecurringMessages.VARIABLE_0, value4);
        }
        
        if (StringUtil.notNullOrEmpty(value1) && StringUtil.isNullOrEmpty(value2)
                && StringUtil.notNullOrEmpty(value3)) {
            final String detail =
                    RecurringMessages
                        .getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_DAY_OF_SPECIFIED_MONTH);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + detail.replace(RecurringMessages.VARIABLE_0, value1).replace(
                                RecurringMessages.VARIABLE_1,
                                RecurringMessages.getMonthByShortName(value3));
        }
        
        if (StringUtil.notNullOrEmpty(value1) && StringUtil.notNullOrEmpty(value2)
                && StringUtil.notNullOrEmpty(value3)) {
            final String detail =
                    RecurringMessages
                        .getLocalizedMessage(RecurringMessages.MESSAGE_DETAILS_WEEKDAY_OF_SPECIFIED_MONTH);
            message +=
                    RecurringMessages.COMMA_SEPARATOR
                            + detail
                                .replace(RecurringMessages.VARIABLE_0,
                                    RecurringMessages.getValueByShortName(value1))
                                .replace(RecurringMessages.VARIABLE_1,
                                    RecurringMessages.getValueByShortName(value2))
                                .replace(RecurringMessages.VARIABLE_2,
                                    RecurringMessages.getMonthByShortName(value3));
        }
        
        message += getEndAfterMessage(total);
        return message;
    }
    
    /**
     * Returns localized days name from weekly value.
     *
     * @param weeklyValue weekly value
     * @return localized string
     */
    private static String getDaysFromWeeklyValue(final String weeklyValue) {
        final String[] weeklyValuesArray = weeklyValue.split(SINGLE_SEMICOLON);
        String localizedValue = "";
        for (int index = 0; index < weeklyValuesArray.length; index++) {
            if (Integer.parseInt(weeklyValuesArray[index]) == 1) {
                localizedValue +=
                        RecurringMessages.getDayNameByIndex(index + 1)
                                + RecurringMessages.COMMA_SEPARATOR;
            }
        }
        if (localizedValue.length() > 0) {
            localizedValue =
                    localizedValue.substring(0,
                        localizedValue.lastIndexOf(RecurringMessages.COMMA_SEPARATOR));
        }
        return localizedValue;
    }

    /**
     * Validates the parameter values depending on recurrence type.
     *
     * @param recurringType Recurring type (once, day, week, month, year)
     * @param daysOfWeek Days of the week in comma delimited
     * @param dayOfMonth Day of month (0-31)
     * @param weekOfMonth Week of month (1-5, 5 is for last)
     * @param monthOfYear Month of the year (0-12)
     *
     */
    public static void validateRecurrenceValues(final String recurringType,
            final String daysOfWeek, final int dayOfMonth, final int weekOfMonth,
            final int monthOfYear) {
        
        final boolean notValidMonth = monthOfYear < 0 || monthOfYear > MONTHS_PER_YEAR;
        
        if (TYPE_MONTH.equals(recurringType) || TYPE_YEAR.equals(recurringType)) {
            validateDayAndWeek(daysOfWeek, dayOfMonth, weekOfMonth);
        }

        if (TYPE_YEAR.equals(recurringType) && notValidMonth) {
            throw new ExceptionBase(null, MONTH_OUT_OF_RANGE);
        }
    }
    
    /**
     *
     * To validate the day, week and year value of recurrence pattern.
     *
     * @param daysOfWeek day in a week.
     * @param dayOfMonth day in a month.
     * @param weekOfMonth week in a month.
     */
    private static void validateDayAndWeek(final String daysOfWeek, final int dayOfMonth,
            final int weekOfMonth) {
        final boolean notValidDay = dayOfMonth < 0 || dayOfMonth > DAYS_PER_MONTH;
        final boolean notValidWeek = weekOfMonth < 1 || weekOfMonth > WEEKS_PER_MONTH;
        if (StringUtil.isNullOrEmpty(daysOfWeek) && notValidDay) {

            throw new ExceptionBase(null, DAY_OUT_OF_RANGE);

        } else if (StringUtil.notNullOrEmpty(daysOfWeek) && notValidWeek) {

            throw new ExceptionBase(null, WEEK_OUT_OF_RANGE);
            
        }
    }

    /**
     * convert XML days of week (1,0,1,0) to list of day names (mon,wed).
     *
     * @param daysOfWeekXML Days of the week in comma delimited
     * @return string comma delimited list of day names.
     */
    public static String getDaysOfWeekFromXML(final String daysOfWeekXML) {
        final String[] matchArray = daysOfWeekXML.split(SINGLE_SEMICOLON);
        String daysOfWeek = "";
        for (int i = 1; i <= matchArray.length; i++) {
            final int dayIndex = i < matchArray.length ? i : 0;
            if ("1".equals(matchArray[i - 1])) {
                daysOfWeek += WEEK_VALUE_ARRAY[dayIndex];
                if (dayIndex > 0) {
                    daysOfWeek += SINGLE_SEMICOLON;
                }
            }
        }
        return daysOfWeek;
    }
    
    /**
     * Converts comma delimited string of day names to XML pattern format.
     *
     * @param daysOfWeek Days of the week in comma delimited
     * @return string
     *
     */
    public static String getXMLdaysOfWeek(final String daysOfWeek) {

        String value1 = "";
        
        for (int index = 1; index < WEEK_VALUE_ARRAY.length + 1; index++) {
            if (index < WEEK_VALUE_ARRAY.length) {
                value1 +=
                        daysOfWeek.contains(WEEK_VALUE_ARRAY[index]) ? NUMBER_ONE
                                + SINGLE_SIMICOLON : NUMBER_ZERO + SINGLE_SIMICOLON;
            } else {
                value1 += daysOfWeek.contains(WEEK_VALUE_ARRAY[0]) ? NUMBER_ONE : NUMBER_ZERO;
            }
        }
        return value1;
    }
}
