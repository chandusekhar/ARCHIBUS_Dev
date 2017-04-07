package com.archibus.service;

import java.text.MessageFormat;
import java.util.*;

import com.archibus.utility.*;

/**
 * Describes a date period used in calculations.
 * <p>
 * Supported period types:
 * <li>Week
 * <li>Month
 * <li>Quarter
 * <li>Year
 * <li>Custom period (N days)
 * <p>
 * DatePeriod objects are immutable - their properties cannot be changed after construction.
 */
public class Period implements Immutable {
    
    /**
     * Interface that Period clients can implement to iterate through the date range.
     */
    public static interface Callback {
        /**
         * Called for each date within the period, starting at dateStart and ending at dateEnd.
         *
         * @param currentDate
         * @return true to continue, false to stop the iteration.
         */
        public boolean call(Date currentDate);
    }
    
    /**
     * Constant: interval type (N days).
     */
    public static final String CUSTOM = "CUSTOM";
    
    /**
     * Constant: interval type.
     */
    public static final String MONTH = "MONTH";
    
    /**
     * Constant: interval type.
     */
    public static final String QUARTER = "QUARTER";
    
    /**
     * Constant: interval type.
     */
    public static final String WEEK = "WEEK";
    
    /**
     * Constant: interval type.
     */
    public static final String YEAR = "YEAR";
    
    /**
     * End date of the period (inclusive).
     */
    private final Date dateEnd;
    
    /**
     * Start date of the period.
     */
    private final Date dateStart;
    
    /**
     * Interval (in intervalType units).
     */
    private final int interval;
    
    /**
     * Number of intervals that are added.
     */
    private int noOfIntervals;
    
    /**
     * Interval type: week, month, quarter, year or custom (in days).
     */
    private final String intervalType;
    
    /**
     * Constructor, can be used for non-custom periods.
     *
     * @param period
     * @param dateStart
     */
    public Period(final String period, final Date dateStart) {
        this(period, 1, dateStart);
    }
    
    /**
     * Constructor that is used for custom periods.
     *
     * @param period - period type "CUSTOM"
     * @param dateStart - range start date
     * @param dateEnd - range end date
     */
    public Period(final String period, final Date dateStart, final Date dateEnd) {
        this(period, DateTime.getElapsedDays(dateStart, dateEnd), dateStart);
    }
    
    /**
     * Constructor, can be used for custom and non-custom periods.
     *
     * @param intervalType interval type; Values: d - Custom interval (N Days), ww - Week, m -
     *            Month, q - Quarter and yyyy - Year
     * @param interval interval, in intervalType units
     * @param dateStart start date
     */
    public Period(final String intervalType, final int interval, final Date dateStart) {
        // 0 in database is used for all interval types except CUSTOM
        // in calculations it means "use one period, e.g. WEEK, MONTH, QUARTER, or YEAR"
        this.interval = interval > 0 ? interval : 1;
        this.dateStart = dateStart;
        this.noOfIntervals = 1;
        
        if (intervalType.equals("d")) {
            this.intervalType = CUSTOM;
        } else if (intervalType.equals("ww")) {
            this.intervalType = WEEK;
        } else if (intervalType.equals("m")) {
            this.intervalType = MONTH;
        } else if (intervalType.equals("q")) {
            this.intervalType = QUARTER;
        } else if (intervalType.equals("yyyy")) {
            this.intervalType = YEAR;
        } else {
            this.intervalType = intervalType;
        }
        
        // determine end date
        final Calendar c = Calendar.getInstance();
        c.setTime(dateStart);
        addPeriodToCalendar(c);
        c.add(Calendar.DAY_OF_YEAR, -1);
        
        this.dateEnd = c.getTime();
    }
    
    /**
     * Increments the start date by specified interval, until it is greater than target date.
     *
     * @param dateStart start date
     * @param dateTarget target date
     * @param intervalType interval type
     * @param interval interval
     * @return date
     */
    public static Date getDateAfter(final Date dateStart, final Date dateTarget,
            final String intervalType, final int interval) {
        final Period p = new Period(intervalType, interval, dateStart);
        final Calendar c = Calendar.getInstance();
        c.setTime(p.getDateStart());
        
        while (!c.getTime().after(dateTarget)) {
            p.addPeriodToCalendar(c);
        }
        
        return c.getTime();
    }
    
    /**
     * Increment number of intervals that are added to start date until resulting date is greater
     * than target date. Fix issue with February month or last days from month (30, 31 ...).
     *
     *
     * @param dateStart start date
     * @param dateTarget target date
     * @param intervalType interval type
     * @param interval interval
     * @return date
     */
    public static Date getDateAfter2(final Date dateStart, final Date dateTarget,
            final String intervalType, final int interval) {
        final Period p = new Period(intervalType, interval, dateStart);
        final Calendar c = Calendar.getInstance();
        c.setTime(p.getDateStart());
        
        while (!c.getTime().after(dateTarget)) {
            // keep original start date as reference
            c.setTime(p.getDateStart());
            // increment number of intervals
            p.incrementNoOfIntervals();
            // add intervals to reference date
            p.addPeriodToCalendar(c);
        }
        
        return c.getTime();
    }
    
    /**
     * Increments the start date by specified interval.
     *
     * @param dateStart
     * @param intervalType
     * @param interval
     * @return
     */
    public static Date incrementDate(final Date dateStart, final String intervalType,
            final int interval) {
        final Period p = new Period(intervalType, interval, dateStart);
        final Calendar c = Calendar.getInstance();
        c.setTime(p.getDateStart());
        p.addPeriodToCalendar(c);
        return c.getTime();
    }
    
    /**
     * Adds one period (month, quarter, year, or custom number of days) to specified calendar. This
     * method does not change the DatePeriod object itself.
     *
     * @param c Calendar
     */
    public void addPeriodToCalendar(final Calendar c) {
        if (this.intervalType.equals(Period.WEEK)) {
            c.add(Calendar.WEEK_OF_YEAR, this.interval * this.noOfIntervals);
        } else if (this.intervalType.equals(Period.MONTH)) {
            c.add(Calendar.MONTH, this.interval * this.noOfIntervals);
        } else if (this.intervalType.equals(Period.QUARTER)) {
            c.add(Calendar.MONTH, this.interval * 3 * this.noOfIntervals);
        } else if (this.intervalType.equals(Period.YEAR)) {
            c.add(Calendar.YEAR, this.interval * this.noOfIntervals);
        } else if (this.intervalType.equals(Period.CUSTOM)) {
            c.add(Calendar.DAY_OF_YEAR, this.interval * this.noOfIntervals);
        }
    }
    
    /**
     * Increment no of intervals.
     *
     */
    public void incrementNoOfIntervals() {
        this.noOfIntervals++;
    }
    
    /**
     * Setter for the noOfIntervals property.
     *
     * @see noOfIntervals
     * @param noOfIntervals the noOfIntervals to set
     */
    
    public void setNoOfIntervals(final int noOfIntervals) {
        this.noOfIntervals = noOfIntervals;
    }
    
    /**
     * Adds one period (month, quarter, year, or custom number of days) to specified date and
     * returns the result. This method does not change the DatePeriod object itself.
     *
     * @param date date value
     * @return date
     */
    public Date addPeriodToDate(final Date date) {
        final Calendar c = Calendar.getInstance();
        c.setTime(date);
        addPeriodToCalendar(c);
        return c.getTime();
    }
    
    /**
     * Checks whether this period contains specified date.
     *
     * @param date date value
     * @return boolean
     */
    public boolean containsDate(final Date date) {
        return (!this.dateStart.after(date) && !this.dateEnd.before(date));
    }
    
    /**
     * Getter.
     *
     * @return date
     */
    public Date getDateEnd() {
        return this.dateEnd;
    }
    
    /**
     * Getter.
     *
     * @return date
     */
    public Date getDateStart() {
        return this.dateStart;
    }
    
    /**
     * Getter.
     *
     * @return string
     */
    public String getPeriod() {
        return this.intervalType;
    }
    
    /**
     * Getter.
     *
     * @return int
     */
    public int getPeriodCustom() {
        return this.interval;
    }
    
    /**
     * Iterates through the date range until dateNext is after dateTo.
     *
     * @param dateFrom start date
     * @param dateTo end date
     * @param callback callback method
     */
    public void iterate(final Date dateFrom, final Date dateTo, final Callback callback) {
        final Calendar c = Calendar.getInstance();
        c.setTime(getDateStart());
        // increment date, starting from dateStart, until it is on or after dateFrom
        while (c.getTime().before(dateFrom)) {
            c.setTime(getDateStart());
            incrementNoOfIntervals();
            addPeriodToCalendar(c);
        }
        
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        
        // while date is not after dateTo, increment date and call the callback on each increment
        while (!c.getTime().after(dateTo)) {
            
            if (!callback.call(c.getTime())) {
                break;
            }
            c.setTime(getDateStart());
            incrementNoOfIntervals();
            addPeriodToCalendar(c);
        }
    }

    /**
     * Iterates through the date range until dateNext is equal of after dateTo.
     *
     * @param dateFrom start date
     * @param dateTo end date
     * @param callback callback method
     */
    public void iterate2(final Date dateFrom, final Date dateTo, final Callback callback) {
        final Calendar c = Calendar.getInstance();
        c.setTime(getDateStart());
        // increment date, starting from dateStart, until it is on or after dateFrom
        while (c.getTime().before(dateFrom)) {
            c.setTime(getDateStart());
            incrementNoOfIntervals();
            addPeriodToCalendar(c);
        }
        
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
        
        // while date is not after dateTo, increment date and call the callback on each increment
        while (c.getTime().before(dateTo)) {
            
            if (!callback.call(c.getTime())) {
                break;
            }
            c.setTime(getDateStart());
            incrementNoOfIntervals();
            addPeriodToCalendar(c);
        }
    }
    
    /**
     * Return correction factor if asset period is interval fraction.
     *
     * @param dateFrom asset start date
     * @param dateTo asset end date
     * @param interval interval type
     * @return correction factor
     */
    public double getCorrectionFactor(final Date dateFrom, final Date dateTo, final String interval) {
        final int periodLength = DateTime.getElapsedMonths(this.dateStart, this.dateEnd);
        Date start = this.dateStart;
        if (StringUtil.notNullOrEmpty(dateFrom) && dateFrom.after(this.dateStart)) {
            start = dateFrom;
        }
        Date end = this.dateEnd;
        if (StringUtil.notNullOrEmpty(dateTo) && this.dateEnd.after(dateTo)) {
            end = dateTo;
            if (QUARTER.equals(interval) || YEAR.equals(interval)) {
            }
        }
        final int intervalLength = DateTime.getElapsedMonths(start, end);
        double result = 1;
        if (periodLength > 0 && intervalLength > 0) {
            result =
                    Integer.valueOf(intervalLength).doubleValue()
                            / Integer.valueOf(periodLength).doubleValue();
        }
        
        return result;
    }
    
    @Override
    public String toString() {
        return MessageFormat.format("[{0, date} - {1, date}]", new Object[] { this.dateStart,
                this.dateEnd });
    }
    
}
