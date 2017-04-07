package com.archibus.service.space.metrics;

import java.util.Date;

/**
 * <p>
 * Interval object used in StackAreaChart.
 * 
 */
public class Interval {
    
    /**
     * Indicates year value of interval.
     * 
     */
    private int year;
    
    /**
     * Indicates month value of interval.
     * 
     */
    private int month;
    
    /**
     * Indicates title of interval.
     * 
     */
    private String title;
    
    /**
     * Indicates property "fromDate".
     * 
     */
    private Date fromDate;
    
    /**
     * Indicates property "toDate".
     * 
     */
    private Date toDate;
    
    /**
     * Indicates getter of property "title".
     * 
     * @return property "title".
     */
    public String getTitle() {
        return this.title;
    }
    
    /**
     * Indicates setter of property "title".
     * 
     * @param title String title.
     * 
     */
    public void setTitle(final String title) {
        this.title = title;
    }
    
    /**
     * Indicates getter of property "year".
     * 
     * @return property "year".
     */
    public int getYear() {
        return this.year;
    }
    
    /**
     * Indicates setter of property "year".
     * 
     * @param year int.
     * 
     */
    public void setYear(final int year) {
        this.year = year;
    }
    
    /**
     * Indicates getter of property "month".
     * 
     * @return property "month".
     */
    public int getMonth() {
        return this.month;
    }
    
    /**
     * Indicates setter of property "month".
     * 
     * @param month int.
     * 
     */
    public void setMonth(final int month) {
        this.month = month;
    }
    
    /**
     * Indicates getter of property "fromDate".
     * 
     * @return property "fromDate".
     */
    public Date getFromDate() {
        return this.fromDate;
    }
    
    /**
     * Indicates setter of property "fromDate".
     * 
     * @param fromDate Date from date.
     * 
     */
    public void setFromDate(final Date fromDate) {
        this.fromDate = fromDate;
    }
    
    /**
     * @return property "toDate".
     * 
     */
    public Date getToDate() {
        return this.toDate;
    }
    
    /**
     * Indicates setter of property "toDate".
     * 
     * @param toDate Date to date.
     * 
     */
    public void setToDate(final Date toDate) {
        this.toDate = toDate;
    }
    
}
