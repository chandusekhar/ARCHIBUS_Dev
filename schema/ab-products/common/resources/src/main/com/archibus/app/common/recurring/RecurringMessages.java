package com.archibus.app.common.recurring;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * Define translatable messages for recurring pattern.
 * 
 * @author Ioan Draghici
 * @since v21.2
 * 
 *        <p>
 *        Suppress Warning: PMD.AvoidStaticFields
 *        <p>
 *        Justification: I use this variables to avoid long if else if clauses.
 * 
 * 
 */
@SuppressWarnings({ "PMD.AvoidStaticFields" })
public final class RecurringMessages {
    
    /**
     * Recurring type.
     */
    // @translatable
    public static final String MESSAGE_TYPE_ONCE = "Occurs Once on Start Date";
    
    /**
     * Recurring type.
     */
    // @translatable
    public static final String MESSAGE_TYPE_DAILY = "Daily";
    
    /**
     * Recurring type.
     */
    // @translatable
    public static final String MESSAGE_TYPE_WEEKLY = "Weekly";
    
    /**
     * Recurring type.
     */
    // @translatable
    public static final String MESSAGE_TYPE_MONTHLY = "Monthly";
    
    /**
     * Recurring type.
     */
    // @translatable
    public static final String MESSAGE_TYPE_YEARLY = "Yearly";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_DAY = "Every {0} days";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_WEEK = "Every {0} weeks";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_MONTH = "Every {0} months";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_DAY_OF_MONTH = "On Day {0} of month";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_WEEKDAY_OF_MONTH = "On The {0} {1} of month";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_YEAR = "Every {0} years";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_MONTH_OF_YEAR = "on {1} {0}";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_DAY_OF_SPECIFIED_MONTH = "On Day {0} of {1}";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DETAILS_WEEKDAY_OF_SPECIFIED_MONTH = "On The {0} {1} of {2}";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_ON = "On";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_END = "End After: {0} Occurrences";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_MONDAY = "Monday";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_TUESDAY = "Tuesday";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_WEDNESDAY = "Wednesday";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_THURSDAY = "Thursday";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_FRIDAY = "Friday";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_SATURDAY = "Saturday";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_SUNDAY = "Sunday";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DAY = "Day";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_WEEKDAY = "WeekDay";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_WEEKENDDAY = "WeekendDay";
    
    /**
     * Recurring details.
     */
    // CHECKSTYLE:OFF Justification: same value is used as constant and localized message
    // @translatable
    public static final String MESSAGE_FIRST = "1st";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_SECOND = "2nd";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_THIRD = "3rd";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_FOURTH = "4th";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_LAST = "last";
    
    // CHECKSTYLE:ON
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_JANUARY = "January";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_FEBRUARY = "February";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_MARCH = "March";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_APRIL = "April";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_MAY = "May";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_JUNE = "June";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_JULY = "July";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_AUGUST = "August";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_SEPTEMBER = "September";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_OCTOBER = "October";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_NOVEMBER = "November";
    
    /**
     * Recurring details.
     */
    // @translatable
    public static final String MESSAGE_DECEMBER = "December";
    
    /**
     * Variable.
     */
    public static final String VARIABLE_0 = "{0}";
    
    /**
     * Variable.
     */
    public static final String VARIABLE_1 = "{1}";
    
    /**
     * Variable.
     */
    public static final String VARIABLE_2 = "{2}";
    
    /**
     * Constant.
     */
    public static final String COMMA_SEPARATOR = ", ";
    
    /**
     * Constant.
     */
    public static final String SPACE_SEPARATOR = " ";
    
    /**
     * Class name.
     */
    public static final String CLASS_NAME = "com.archibus.app.common.recurring.RecurringMessages";
    
    /**
     * Days by index map.
     */
    private static Map<String, String> daysByIndex = new HashMap<String, String>();
    static {
        daysByIndex.put("1", MESSAGE_MONDAY);
        daysByIndex.put("2", MESSAGE_TUESDAY);
        daysByIndex.put("3", MESSAGE_WEDNESDAY);
        daysByIndex.put("4", MESSAGE_THURSDAY);
        daysByIndex.put("5", MESSAGE_FRIDAY);
        daysByIndex.put("6", MESSAGE_SATURDAY);
        daysByIndex.put("7", MESSAGE_SUNDAY);
    }
    
    /**
     * Month by short name.
     */
    private static Map<String, String> monthByShortName = new HashMap<String, String>();
    static {
        monthByShortName.put("jan", MESSAGE_JANUARY);
        monthByShortName.put("feb", MESSAGE_FEBRUARY);
        monthByShortName.put("mar", MESSAGE_MARCH);
        monthByShortName.put("apr", MESSAGE_APRIL);
        monthByShortName.put("may", MESSAGE_MAY);
        monthByShortName.put("jun", MESSAGE_JUNE);
        monthByShortName.put("jul", MESSAGE_JULY);
        monthByShortName.put("aug", MESSAGE_AUGUST);
        monthByShortName.put("sep", MESSAGE_SEPTEMBER);
        monthByShortName.put("oct", MESSAGE_OCTOBER);
        monthByShortName.put("nov", MESSAGE_NOVEMBER);
        monthByShortName.put("dec", MESSAGE_DECEMBER);
    }
    
    /**
     * Localized values by short name.
     */
    private static Map<String, String> valuesByShortName = new HashMap<String, String>();
    static {
        valuesByShortName.put("1st", MESSAGE_FIRST);
        valuesByShortName.put("2nd", MESSAGE_SECOND);
        valuesByShortName.put("3rd", MESSAGE_THIRD);
        valuesByShortName.put("4th", MESSAGE_FOURTH);
        valuesByShortName.put("last", MESSAGE_LAST);
        valuesByShortName.put("mon", MESSAGE_MONDAY);
        valuesByShortName.put("tue", MESSAGE_TUESDAY);
        valuesByShortName.put("wed", MESSAGE_WEDNESDAY);
        valuesByShortName.put("thu", MESSAGE_THURSDAY);
        valuesByShortName.put("fri", MESSAGE_FRIDAY);
        valuesByShortName.put("sat", MESSAGE_SATURDAY);
        valuesByShortName.put("sun", MESSAGE_SUNDAY);
        valuesByShortName.put("day", MESSAGE_DAY);
        valuesByShortName.put("weekday", MESSAGE_WEEKDAY);
        valuesByShortName.put("weekendday", MESSAGE_WEEKENDDAY);
    }
    
    /**
     * Private constructor.
     */
    private RecurringMessages() {
        
    }
    
    /**
     * Return localized day name by day index.
     * 
     * @param dayIndex day index
     * @return localized name
     */
    public static String getDayNameByIndex(final int dayIndex) {
        return getLocalizedMessage(daysByIndex.get(String.valueOf(dayIndex)));
    }
    
    /**
     * Return localized month name by short name.
     * 
     * @param name day index
     * @return localized name
     */
    public static String getMonthByShortName(final String name) {
        return getLocalizedMessage(monthByShortName.get(String.valueOf(name)));
    }
    
    /**
     * Return localized month name by short name.
     * 
     * @param name day index
     * @return localized name
     */
    public static String getValueByShortName(final String name) {
        return getLocalizedMessage(valuesByShortName.get(String.valueOf(name)));
    }
    
    /**
     * Returns localized string.
     * 
     * @param message message name
     * @return string
     */
    public static String getLocalizedMessage(final String message) {
        return EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
            message, CLASS_NAME);
    }
}
