package com.archibus.app.common.recurring;

import java.util.*;

import com.archibus.utility.StringUtil;

/**
 * RecurringServicePattern Object class.
 *
 * @author Zhang Yi
 *
 * @since 20.2
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public class RecurringSchedulePattern {
    
    /**
     * Constant: Day of Month Out of range exception message.
     */
    public static final String DAY_OUT_OF_RANGE =
            "Day Of Month parameter is out of valid range (0-31)";
    
    /**
     * Constant: Week of Month Out of range exception message.
     */
    public static final String WEEK_OUT_OF_RANGE =
            "Week Of Month parameter is out of valid range (1-5)";
    
    /**
     * Constant: Month Of Year Out of range exception message.
     */
    public static final String MONTH_OUT_OF_RANGE =
            "Month Of Year parameter is out of valid range (0-12)";
    
    /**
     * Constant: max weeks in a month.
     */
    public static final int WEEKS_PER_MONTH = 5;
    
    /**
     * Constant: max days in a month.
     */
    public static final int DAYS_PER_MONTH = 31;
    
    /**
     * Constant: months in a year.
     */
    public static final int MONTHS_PER_YEAR = 12;
    
    /**
     * Constant: first.
     */
    public static final String FIRST = "1st";
    
    /**
     * Constant: forth.
     */
    public static final String FORTH = "4th";
    
    /**
     * Constant: last.
     */
    public static final String LAST = "last";
    
    /**
     * Arrays of Month values used in pattern.
     */
    public static final String[] MONTH_VALUE_ARRAY = new String[] { "jan", "feb", "mar", "apr",
            "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec" };
    
    /**
     * Constant: second.
     */
    public static final String SECOND = "2nd";
    
    /**
     * Constant: third.
     */
    public static final String THIRD = "3rd";
    
    /**
     * Arrays of week of month values used in pattern.
     */
    public static final String[] WEEK_NUMBER_VALUE_ARRAY = new String[] { FIRST, SECOND, THIRD,
            FORTH, LAST };
    
    /**
     * Constant: weekday.
     */
    public static final String WEEKDAY = "weekday";
    
    /**
     * Constant: weekendday.
     */
    public static final String WEEKENDDAY = "weekendday";
    
    /**
     * Constant: recurring type "day".
     */
    public static final String TYPE_DAY = "day";
    
    /**
     * Constant: recurring type "month".
     */
    public static final String TYPE_MONTH = "month";
    
    /**
     * Constant: recurring type "once".
     */
    public static final String TYPE_ONCE = "once";
    
    /**
     * Constant: recurring type "week".
     */
    public static final String TYPE_WEEK = "week";
    
    /**
     * Constant: recurring type "year".
     */
    public static final String TYPE_YEAR = "year";
    
    /**
     * Arrays of Month values used in pattern.
     */
    public static final String[] WEEK_VALUE_ARRAY = new String[] { "sun", "mon", "tue", "wed",
            "thu", "fri", "sat" };
    
    /**
     * Constant: Maximum Number of Occurrences.
     */
    public static final int MAX_OCCURRENCES = 999;

    /**
     * Constant: string of digit one.
     */
    public static final String NUMBER_ONE = "1";

    /**
     * Constant: string of digit zero.
     */
    public static final String NUMBER_ZERO = "0";
    
    /**
     * Constant: character ','.
     */
    public static final String SINGLE_SIMICOLON = ",";
    
    /**
     * End date to calculate date list.
     */
    private Date dateEnd;
    
    /**
     * Initial dates list.
     */
    private List<Date> datesList = new ArrayList<Date>();
    
    /**
     * Start date to calculate date list.
     */
    private Date dateStart;
    
    /**
     * Recurring Pattern interval.
     */
    private int interval = -1;
    
    /**
     * Recurring rule type.
     */
    private String recurringType = "";
    
    /**
     * Recurring rule total Occurs. KB 3040333 - Enforce 999 Outlook limit
     */
    private int total = MAX_OCCURRENCES;
    
    /**
     * Recurring rule total string value.
     */
    private String totalStr = "";
    
    /**
     * Recurring rule value 1.
     */
    private String value1 = "";
    
    /**
     * Recurring rule value 2.
     */
    private String value2 = "";
    
    /**
     * Recurring rule value 3.
     */
    private String value3 = "";
    
    /**
     * Recurring rule value 4.
     */
    private String value4 = "";
    
    /**
     * Recurring Pattern day(s) of the week.
     */
    private String daysOfWeek = "";
    
    /**
     * Recurring Pattern day of the month (0-31).
     */
    private int dayOfMonth = -1;
    
    /**
     * Recurring Pattern week of the month (0-5).
     */
    private int weekOfMonth = -1;
    
    /**
     * Recurring Pattern month of the year (0-12).
     */
    private int monthOfYear = -1;
    
    /**
     * Constructor: initial dateStart and dateEnd.
     *
     * @param dateStart the start date
     * @param dateEnd the end date
     */
    public RecurringSchedulePattern(final Date dateStart, final Date dateEnd) {
        super();
        
        // set values of start date and end date
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        
        // if date start is null , set today as default
        if (dateStart == null) {
            this.dateStart = new Date();
        }
    }
    
    /**
     * Get date list base on the recurring type of the rule.
     *
     */
    public void calculateDatesList() {
        
        final Calendar calendar = CalendarUtil.getInitialStartCalendar(this.dateStart);
        
        // KB3034635 if there empty value in xml pattern, get value from data start
        this.checkPatternForEmptyValue(calendar);
        if (TYPE_ONCE.equals(this.recurringType)) {
            // just add date start to the list for type 'once' if date start<=date end
            this.datesList.add(this.dateStart);

        } else {
            this.calculateListByOtherPatternType(calendar, this.recurringType);
        }
    }
    
    /**
     * Calculate the date according to type.
     *
     * @param calendar the result
     * @param type the recurring type
     */
    private void calculateListByOtherPatternType(final Calendar calendar, final String type) {
        if (type.equals(TYPE_DAY)) {
            this.interval = Integer.parseInt(this.value1);
            while (!calendar.getTime().after(this.dateEnd) && this.datesList.size() < this.total) {
                this.datesList.add(calendar.getTime());
                // get next day to test
                calendar.add(Calendar.DAY_OF_YEAR, this.interval);
            }
        } else if (type.equals(TYPE_WEEK)) {
            this.interval = Integer.parseInt(this.value2);
            this.calculateDateListByWeek(calendar);
        } else if (type.equals(TYPE_MONTH)) {
            this.interval = Integer.parseInt(this.value3);
            if ("".equals(this.value2)) {

                this.calculateDateListByMonthDay(calendar);

            } else {
                
                this.calculateDateListByMonthWeekIndex(calendar);
            }
        } else if (type.equals(TYPE_YEAR)) {
            if ("".equals(this.value4)) {
                this.interval = Integer.parseInt(this.value3);
                this.calculateDateListByYear(calendar);
            } else {
                this.interval = Integer.parseInt(this.value4);
                this.calculateDateListByYearWeekIndex(calendar);
            }
        }
        
    }

    /**
     * Calculate period start date for given end date.
     *
     * @param endDate period end date
     */
    public void calculateDateStart(final Date endDate) {
        this.dateEnd = endDate;
        final Calendar calendar = CalendarUtil.getInitialStartCalendar(endDate);
        if (TYPE_ONCE.equals(this.recurringType)) {
            setDateStart(null);
        } else if (TYPE_DAY.equals(this.recurringType)) {
            this.interval = Integer.parseInt(this.value1);
            calendar.add(Calendar.DAY_OF_YEAR, (-1) * this.interval);
            setDateStart(calendar.getTime());
        } else if (TYPE_WEEK.equals(this.recurringType)) {
            this.interval = Integer.parseInt(this.value2);
            calendar.add(Calendar.WEEK_OF_YEAR, (-1) * this.interval);
            setDateStart(calendar.getTime());
        } else if (TYPE_MONTH.equals(this.recurringType)) {
            this.interval = Integer.parseInt(this.value3);
            calendar.add(Calendar.MONTH, (-1) * this.interval);
            calendar.set(Calendar.DATE, 1);
            setDateStart(calendar.getTime());
            calculateDatesList();
            final List<Date> dates = getDatesList();
            setDateStart(dates.get(0));
        } else if (TYPE_YEAR.equals(this.recurringType)) {
            if ("".equals(this.value4)) {
                this.interval = Integer.parseInt(this.value3);
                
            } else {
                this.interval = Integer.parseInt(this.value4);
            }
            calendar.add(Calendar.YEAR, (-1) * this.interval);
            setDateStart(calendar.getTime());
        }
    }
    
    /**
     * Getter for the dateEnd property.
     *
     * @see dateEnd
     * @return the dateEnd property.
     */
    public Date getDateEnd() {
        return this.dateEnd == null ? null : (Date) this.dateEnd.clone();
    }
    
    /**
     * Getter for the datesList property.
     *
     * @see datesList
     * @return the datesList property.
     */
    public List<Date> getDatesList() {
        
        // sort the date ascending
        Collections.sort(this.datesList);
        
        // get sublist if the list exceed the total occurs
        List<Date> result;
        if (this.datesList.size() > this.total) {
            result = this.datesList.subList(0, this.total);
        } else {
            result = this.datesList;
        }
        
        return result;
    }
    
    /**
     * Getter for the dateStart property.
     *
     * @see dateStart
     * @return the dateStart property.
     */
    public Date getDateStart() {
        return this.dateStart;
    }
    
    /**
     * Getter for the interval property.
     *
     * @see interval
     * @return the interval property.
     */
    public int getInterval() {
        return this.interval;
    }
    
    /**
     * Getter for the recurringType property.
     *
     * @see recurringType
     * @return the recurringType property.
     */
    public String getRecurringType() {
        return this.recurringType;
    }
    
    /**
     * Getter for the total property.
     *
     * @see total
     * @return the total property.
     */
    public int getTotal() {
        return this.total;
    }
    
    /**
     * Getter for the totalStr property.
     *
     * @see totalStr
     * @return the totalStr property.
     */
    public String getTotalStr() {
        return this.totalStr;
    }
    
    /**
     * Getter for the value1 property.
     *
     * @see value1
     * @return the value1 property.
     */
    public String getValue1() {
        return this.value1;
    }
    
    /**
     * Getter for the value2 property.
     *
     * @see value2
     * @return the value2 property.
     */
    public String getValue2() {
        return this.value2;
    }
    
    /**
     * Getter for the value3 property.
     *
     * @see value3
     * @return the value3 property.
     */
    public String getValue3() {
        return this.value3;
    }
    
    /**
     * Getter for the value4 property.
     *
     * @see value4
     * @return the value4 property.
     */
    public String getValue4() {
        return this.value4;
    }
    
    /**
     * Getter for the daysOfWeek property.
     *
     * @see daysOfWeek
     * @return the daysOfWeek property.
     */
    public String getDaysOfWeek() {
        return this.daysOfWeek;
    }
    
    /**
     * Getter for the dayOfMonth property.
     *
     * @see dayOfMonth
     * @return the dayOfMonth property.
     */
    public int getDayOfMonth() {
        return this.dayOfMonth;
    }
    
    /**
     * Getter for the weekOfMonth property.
     *
     * @see weekOfMonth
     * @return the weekOfMonth property.
     */
    public int getWeekOfMonth() {
        return this.weekOfMonth;
    }
    
    /**
     * Getter for the monthOfYear property.
     *
     * @see monthOfYear
     * @return the monthOfYear property.
     */
    public int getMonthOfYear() {
        return this.monthOfYear;
    }
    
    /**
     * Setter for the dateEnd property.
     *
     * @see dateEnd
     * @param dateEnd the dateEnd to set
     */
    
    public void setDateEnd(final Date dateEnd) {
        this.dateEnd = dateEnd;
    }
    
    /**
     * Setter for the datesList property.
     *
     * @see datesList
     * @param datesList the datesList to set
     */
    
    public void setDatesList(final List<Date> datesList) {
        this.datesList = datesList;
    }
    
    /**
     * Setter for the dateStart property.
     *
     * @see dateStart
     * @param dateStart the dateStart to set
     */
    
    public void setDateStart(final Date dateStart) {
        this.dateStart = dateStart;
    }
    
    /**
     * Setter for the interval property.
     *
     * @see interval
     * @param interval the interval to set
     */
    
    public void setInterval(final int interval) {
        this.interval = interval;
    }
    
    /**
     * Setter for the recurringType property.
     *
     * @see recurringType
     * @param recurringType the recurringType to set
     */
    
    public void setRecurringType(final String recurringType) {
        this.recurringType = recurringType;
    }
    
    /**
     * Setter for the total property.
     *
     * @see total
     * @param totalVal the total to set
     */
    
    public void setTotal(final int totalVal) {
        /* KB 3040333 - Enforce 999 Outlook limit */
        this.total = (totalVal >= 1 && totalVal <= MAX_OCCURRENCES) ? totalVal : MAX_OCCURRENCES;
        this.totalStr = (totalVal == 0) ? "" : Integer.toString(totalVal);
    }
    
    /**
     * Setter for the total property.
     *
     * @see total
     * @param totalVal the total to set
     */
    
    public void setTotal(final String totalVal) {
        if (StringUtil.notNullOrEmpty(totalVal)) {
            this.setTotal(Integer.parseInt(totalVal));
        } else {
            this.setTotal(0);
        }
    }
    
    /**
     * Setter for the value1 property.
     *
     * @see value1
     * @param value1 the value1 to set
     */
    
    public void setValue1(final String value1) {
        this.value1 = value1 == null ? "" : value1;
    }
    
    /**
     * Setter for the value2 property.
     *
     * @see value2
     * @param value2 the value2 to set
     */
    
    public void setValue2(final String value2) {
        this.value2 = value2 == null ? "" : value2;
    }
    
    /**
     * Setter for the value3 property.
     *
     * @see value3
     * @param value3 the value3 to set
     */
    
    public void setValue3(final String value3) {
        this.value3 = value3 == null ? "" : value3;
    }
    
    /**
     * Setter for the value4 property.
     *
     * @see value4
     * @param value4 the value4 to set
     */
    
    public void setValue4(final String value4) {
        this.value4 = value4 == null ? "" : value4;
    }
    
    /**
     * translate pattern XML values to daysOfWeek, weekOfMonth, dayOfMonth, monthOfYear, interval.
     *
     */
    public void setPatternValues() {
        // initialize values
        this.interval = -1;
        this.daysOfWeek = "";
        this.dayOfMonth = -1;
        this.weekOfMonth = -1;
        this.monthOfYear = -1;
        
        if (TYPE_DAY.equals(this.recurringType)) {
            
            this.interval = "".equals(this.value1) ? 1 : Integer.parseInt(this.value1);
            
        } else if (TYPE_WEEK.equals(this.recurringType)) {
            
            this.daysOfWeek = RecurringScheduleHelper.getDaysOfWeekFromXML(this.value1);
            this.interval = "".equals(this.value2) ? 1 : Integer.parseInt(this.value2);
            
        } else if (TYPE_MONTH.equals(this.recurringType)) {

            this.parsePatternValueMonthType();

        } else if (TYPE_YEAR.equals(this.recurringType)) {
            this.parsePatternValueYearType();
        }
    }

    /**
     *
     * Parse the value when it is month type to avoid complexity.
     */
    private void parsePatternValueMonthType() {
        
        if ("".equals(this.value2)) {
            
            this.dayOfMonth = "".equals(this.value1) ? 0 : Integer.parseInt(this.value1);
            
        } else {
            
            this.weekOfMonth = Arrays.asList(WEEK_NUMBER_VALUE_ARRAY).indexOf(this.value1) + 1;
        }
        this.daysOfWeek = this.value2;
        this.interval = "".equals(this.value3) ? 1 : Integer.parseInt(this.value3);
        
    }

    /**
     *
     * Parse the value when it is year type to avoid complexity.
     */
    private void parsePatternValueYearType() {
        if ("".equals(this.value4)) {
            
            this.dayOfMonth = "".equals(this.value1) ? 0 : Integer.parseInt(this.value1);
            this.monthOfYear = Arrays.asList(MONTH_VALUE_ARRAY).indexOf(this.value2) + 1;
            this.interval = "".equals(this.value3) ? 1 : Integer.parseInt(this.value3);
            
        } else {
            
            this.weekOfMonth = Arrays.asList(WEEK_NUMBER_VALUE_ARRAY).indexOf(this.value1) + 1;
            this.daysOfWeek = this.value2;
            this.monthOfYear = Arrays.asList(MONTH_VALUE_ARRAY).indexOf(this.value3) + 1;
            this.interval = "".equals(this.value4) ? 1 : Integer.parseInt(this.value4);
        }
    }
    
    /**
     * Sets the XML pattern values constructed from the parameter values.
     *
     * @param pRecurringType Recurring type (once, day, week, month, year)
     * @param pInterval Recurring interval number
     * @param totalOccurrences Maximum occurrences (0=blank)
     * @param pDaysOfWeek Days of the week in comma delimited
     * @param pDayOfMonth Day of month (0-31)
     * @param pWeekOfMonth Week of month (0-5, 5 is for last)
     * @param pMonthOfYear Month of the year (0-12)
     *
     */
    
    public void setPatternValues(final String pRecurringType, final int pInterval,
            final int totalOccurrences, final String pDaysOfWeek, final int pDayOfMonth,
            final int pWeekOfMonth, final int pMonthOfYear) {
        
        RecurringScheduleHelper.validateRecurrenceValues(pRecurringType, pDaysOfWeek, pDayOfMonth,
            pWeekOfMonth, pMonthOfYear);
        
        final String intervalStr = Integer.toString(pInterval);
        final String dayOfMonthStr = pDayOfMonth == 0 ? "" : Integer.toString(pDayOfMonth);
        
        // initialize values
        this.value1 = "";
        this.value2 = "";
        this.value3 = "";
        this.value4 = "";
        this.recurringType = pRecurringType;
        this.interval = pInterval;
        this.setTotal(totalOccurrences);
        this.daysOfWeek = pDaysOfWeek;
        this.dayOfMonth = pDayOfMonth;
        this.weekOfMonth = pWeekOfMonth;
        this.monthOfYear = pMonthOfYear;
        
        if (TYPE_DAY.equals(pRecurringType)) {
            this.value1 = intervalStr;
            
        } else if (TYPE_WEEK.equals(pRecurringType)) {
            
            this.value1 = RecurringScheduleHelper.getXMLdaysOfWeek(pDaysOfWeek);
            this.value2 = intervalStr;
            
        } else if (TYPE_MONTH.equals(pRecurringType)) {
            
            if (StringUtil.isNullOrEmpty(pDaysOfWeek)) {
                
                this.value1 = dayOfMonthStr;
                
            } else {
                
                this.value1 = WEEK_NUMBER_VALUE_ARRAY[pWeekOfMonth - 1];
                this.value2 = pDaysOfWeek;
            }
            
            this.value3 = intervalStr;
            
        } else if (TYPE_YEAR.equals(pRecurringType)) {
            
            final String monthOfYearStr =
                    pMonthOfYear == 0 ? "" : MONTH_VALUE_ARRAY[pMonthOfYear - 1];
            
            if (StringUtil.isNullOrEmpty(pDaysOfWeek)) {
                
                this.value1 = dayOfMonthStr;
                this.value2 = monthOfYearStr;
                this.value3 = intervalStr;
                
            } else {
                
                this.value1 = WEEK_NUMBER_VALUE_ARRAY[pWeekOfMonth - 1];
                this.value2 = pDaysOfWeek;
                this.value3 = monthOfYearStr;
                this.value4 = intervalStr;
            }
            
        }
    }
    
    /**
     * Returns readable form of recurring pattern.
     *
     * @return string
     */
    public String getDescription() {
        String description = null;
        if (TYPE_ONCE.equals(this.getRecurringType())) {
            description =
                    RecurringMessages.getLocalizedMessage(RecurringMessages.MESSAGE_TYPE_ONCE);
        } else if (TYPE_DAY.equals(this.getRecurringType())) {
            description =
                    RecurringScheduleHelper.getDailyDescription(this.getValue1(), this.getTotal());
        } else if (TYPE_WEEK.equals(this.getRecurringType())) {
            description =
                    RecurringScheduleHelper.getWeeklyDescription(this.getValue1(),
                        this.getValue2(), this.getTotal());
        } else if (TYPE_MONTH.equals(this.getRecurringType())) {
            description =
                    RecurringScheduleHelper.getMonthlyDescription(this.getValue1(),
                        this.getValue2(), this.getValue3(), this.getTotal());
        } else if (TYPE_YEAR.equals(this.getRecurringType())) {
            if (StringUtil.notNullOrEmpty(this.getValue4())) {
                description =
                        RecurringScheduleHelper.getYearlyDescription(this.getValue1(),
                            this.getValue2(), this.getValue3(), this.getValue4(), this.getTotal());
            } else {
                description =
                        RecurringScheduleHelper.getYearlyDescription(this.getValue1(),
                            this.getValue2(), this.getValue3(), this.getTotal());
            }
        }
        // if message start with comma - remove
        if (description != null && description.indexOf(RecurringMessages.COMMA_SEPARATOR) == 0) {
            description = description.substring(RecurringMessages.COMMA_SEPARATOR.length());
        }
        return description;
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is "".
     *
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByMonthDay(final Calendar calendar) {
        
        this.dayOfMonth = Integer.parseInt(this.value1);
        
        Date date = CalendarUtil.getNextIntervalMonthly(calendar.getTime(), this.dayOfMonth, 0);
        
        if (date.before(this.dateStart)) {
            date = CalendarUtil.getNextIntervalMonthly(date, this.dayOfMonth, this.interval);
        }
        
        while (!date.after(this.dateEnd) && this.datesList.size() < this.total) {
            this.datesList.add(date);
            date = CalendarUtil.getNextIntervalMonthly(date, this.dayOfMonth, this.interval);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is "day" and value1 is
     * from 1st|2nd|3rd|4th|last.
     *
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByMonthDayIndex(final Calendar calendar) {
        
        boolean isAfterEndDate = false;
        while (!isAfterEndDate && this.datesList.size() < this.total) {
            
            calendar.set(Calendar.DAY_OF_MONTH, 1);
            final String weekIndex = this.value1;
            
            if (SECOND.equals(weekIndex)) {
                
                // get 2nd date of parameter 'week'
                calendar.add(Calendar.DATE, 1);
                
            } else if (THIRD.equals(weekIndex)) {
                
                // get 3rd date of parameter 'week'
                calendar.add(Calendar.DATE, 2);
                
            } else if (FORTH.equals(weekIndex)) {
                
                // get 4th date of parameter 'week'
                calendar.add(Calendar.DATE, 2 + 1);
                
            } else if (LAST.equals(weekIndex)) {
                
                // get last date of parameter 'week'
                calendar.add(Calendar.MONTH, 1);
                calendar.add(Calendar.DAY_OF_YEAR, -1);
            }
            
            isAfterEndDate =
                    CalendarUtil.compareDates(calendar.getTime(), this.dateEnd, this.dateStart,
                        this.datesList);
            
            calendar.add(Calendar.MONTH, this.interval);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is from
     * mon|tue|wed|thu|fri|sat|sun and value1 is from 1st|2nd|3rd|4th|last.
     *
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByMonthSpecificDayIndex(final Calendar calendar) {
        
        final Map<String, Integer> weekMap = new HashMap<String, Integer>();
        for (int i = 0; i < WEEK_VALUE_ARRAY.length; i++) {
            weekMap.put(WEEK_VALUE_ARRAY[i], i + 1);
            
        }
        
        final int dayDiff = Integer.parseInt("7");
        boolean isAfterEndDate = false;
        while (!isAfterEndDate && this.datesList.size() < this.total) {
            
            calendar.set(Calendar.DAY_OF_MONTH, 1);
            final int monthIndex = calendar.get(Calendar.MONTH);
            final int yearIndex = calendar.get(Calendar.YEAR);
            
            calendar.set(Calendar.DAY_OF_WEEK, weekMap.get(this.value2));
            if (calendar.get(Calendar.MONTH) != monthIndex) {
                calendar.add(Calendar.DATE, dayDiff);
            }
            
            final String weekIndex = this.value1;
            
            CalendarUtil.moveCalendarToWeekIndex(calendar, dayDiff, monthIndex, yearIndex,
                weekIndex);
            
            isAfterEndDate =
                    CalendarUtil.compareDates(calendar.getTime(), this.dateEnd, this.dateStart,
                        this.datesList);
            
            calendar.add(Calendar.MONTH, this.interval);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is "weekday" or
     * "weekendday" and value1 is from 1st|2nd|3rd|4th|last.
     *
     * @param calendar Calendar object set to start date
     * @param isWeekend indicate if for calculating of specified weekend day index
     */
    private void calculateDateListByMonthWeekDayIndex(final Calendar calendar,
            final boolean isWeekend) {
        
        boolean isAfterEndDate = false;
        while (!isAfterEndDate && this.datesList.size() < this.total) {
            
            final String weekIndex = this.value1;
            calendar.set(Calendar.DAY_OF_MONTH, 1);
            
            if (LAST.equals(weekIndex)) {
                // get last date of parameter 'week'
                calendar.add(Calendar.MONTH, 1);
                calendar.add(Calendar.DAY_OF_YEAR, -1);
                
                if (isWeekend) {
                    CalendarUtil.moveCalenderToPreviousWeekendDay(calendar);
                    
                } else {
                    CalendarUtil.moveCalenderToPreviousWeekDay(calendar);
                }
                
            } else {
                
                CalendarUtil.moveCalenderToNextSequenceDayOfWeek(calendar, weekIndex, !isWeekend);
            }
            
            isAfterEndDate =
                    CalendarUtil.compareDates(calendar.getTime(), this.dateEnd, this.dateStart,
                        this.datesList);
            
            calendar.add(Calendar.MONTH, this.interval);
        }
        
    }
    
    /**
     * Get date list base IF recurring type of the rule is month and value2 is not "" and value1 is
     * from 1st|2nd|3rd|4th|last.
     *
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByMonthWeekIndex(final Calendar calendar) {
        
        if (TYPE_DAY.equals(this.value2)) {
            
            calculateDateListByMonthDayIndex(calendar);
            
        } else if (WEEKDAY.equals(this.value2)) {
            
            calculateDateListByMonthWeekDayIndex(calendar, false);
            
        } else if (WEEKENDDAY.equals(this.value2)) {
            
            calculateDateListByMonthWeekDayIndex(calendar, true);
            
        } else {
            
            calculateDateListByMonthSpecificDayIndex(calendar);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is week.
     *
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByWeek(final Calendar calendar) {
        
        final String[] matchArray = this.value1.split(SINGLE_SIMICOLON);
        
        calendar.setFirstDayOfWeek(Calendar.MONDAY);
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY);
        Date date = calendar.getTime();
        
        while (!date.after(this.dateEnd) && this.datesList.size() < this.total) {
            for (final String element : matchArray) {
                if (NUMBER_ONE.equals(element) && !date.before(this.dateStart)
                        && !date.after(this.dateEnd) && this.datesList.size() < this.total) {
                    this.datesList.add(date);
                    
                }
                
                calendar.add(Calendar.DAY_OF_YEAR, 1);
                date = calendar.getTime();
            }
            // We already moved forward 1 week in loop above, now move additional weeks if
            // interval>1
            calendar.add(Calendar.WEEK_OF_YEAR, this.interval - 1);
            date = calendar.getTime();
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is year.
     *
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByYear(final Calendar calendar) {
        
        final int day = Integer.parseInt(this.value1);
        final String month = this.value2;
        
        final Map<String, Integer> monthMap = new HashMap<String, Integer>();
        for (int i = 0; i < MONTH_VALUE_ARRAY.length; i++) {
            monthMap.put(MONTH_VALUE_ARRAY[i], i);
            
        }
        final Integer monthVal = monthMap.get(month);
        
        Date date = CalendarUtil.getNextIntervalYearly(calendar.getTime(), day, monthVal, 0);
        
        if (date.before(this.dateStart)) {
            date = CalendarUtil.getNextIntervalYearly(date, day, monthVal, this.interval);
        }
        
        while (!date.after(this.dateEnd) && this.datesList.size() < this.total) {
            this.datesList.add(date);
            date = CalendarUtil.getNextIntervalYearly(date, day, monthVal, this.interval);
        }
    }
    
    /**
     * Get date list base IF recurring type of the rule is year and value4 is not "".
     *
     * @param calendar Calendar object set to start date
     */
    private void calculateDateListByYearWeekIndex(final Calendar calendar) {
        
        final Map<String, Integer> monthMap = new HashMap<String, Integer>();
        for (int i = 0; i < MONTH_VALUE_ARRAY.length; i++) {
            monthMap.put(MONTH_VALUE_ARRAY[i], i);
            
        }
        
        calendar.set(Calendar.DAY_OF_MONTH, 1);
        calendar.set(Calendar.MONTH, monthMap.get(this.value3));
        // Temporarily set interval in months
        this.interval *= MONTHS_PER_YEAR;
        
        calculateDateListByMonthWeekIndex(calendar);
        
        // Restore interval in years
        this.interval /= MONTHS_PER_YEAR;
    }
    
    /**
     * Check pattern value if there exists empty value , get value from date start.
     *
     * @param calendar Calendar object set to start date
     */
    private void checkPatternForEmptyValue(final Calendar calendar) {
        
        boolean calcValues = true;
        
        if (TYPE_WEEK.equals(this.getRecurringType())) {
            
            RecurringScheduleHelper.calculateValue1OfWeekly(this, calendar);
            
        } else if (TYPE_MONTH.equals(this.getRecurringType())
                && StringUtil.isNullOrEmpty(this.getValue1())
                && StringUtil.isNullOrEmpty(this.getValue2())) {
            
            this.setValue1(String.valueOf(calendar.get(Calendar.DAY_OF_MONTH)));
            
        } else if (TYPE_YEAR.equals(this.getRecurringType())
                && (StringUtil.isNullOrEmpty(this.getValue1()) || StringUtil.isNullOrEmpty(this
                    .getValue2()))) {
            
            this.setValue1(String.valueOf(calendar.get(Calendar.DAY_OF_MONTH)));
            
            this.setValue2(MONTH_VALUE_ARRAY[calendar.get(Calendar.MONTH)]);
            
        } else {
            calcValues = false;
        }
        if (calcValues) {
            this.setPatternValues();
        }
    }
    
}