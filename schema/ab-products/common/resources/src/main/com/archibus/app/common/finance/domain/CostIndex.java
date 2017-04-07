package com.archibus.app.common.finance.domain;

import java.util.*;

import com.archibus.utility.StringUtil;

/**
 * Base class for Cost inde profile and Cost index transaction. Contains common properties and
 * methods.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class CostIndex {
    /**
     * Class name constant.
     */
    static final String CLASS_COST_INDEX = "CostIndex";
    
    /**
     * Constant: to avoid checkstyle magic number warning.
     */
    static final int QUARTER_MONTH_NO = 3;
    
    /**
     * Constant: to avoid checkstyle magic number warning.
     */
    static final int SEMI_ANNUAL_MONTH_NO = 6;
    
    /**
     * Constant: to avoid checkstyle magic number warning.
     */
    static final int ANNUAL_MONTH_NO = 12;
    
    /**
     * Constant: to avoid checkstyle magic number warning.
     */
    static final int BI_ANNUAL_MONTH_NO = 24;
    
    /**
     * Lease code.
     */
    private String lsId;
    
    /**
     * Cost index code.
     */
    private String costIndexId;
    
    /**
     * Field.
     */
    private Date dateIndexNext;
    
    /**
     * Field.
     */
    private double indexValueInitial;
    
    /**
     * Field.
     */
    private String indexingFrequency;
    
    /**
     * Field.
     */
    private double pctChangeAdjust;
    
    /**
     * Field.
     */
    private int rentRoundTo;
    
    /**
     * Field.
     */
    private int resetInitialValues;
    
    /**
     * Field.
     */
    private double rentInitial;
    
    /**
     * Getter for the lsId property.
     * 
     * @see lsId
     * @return the lsId property.
     */
    public String getLsId() {
        return this.lsId;
    }
    
    /**
     * Setter for the lsId property.
     * 
     * @see lsId
     * @param lsId the lsId to set
     */
    
    public void setLsId(final String lsId) {
        this.lsId = lsId;
    }
    
    /**
     * Getter for the costIndexId property.
     * 
     * @see costIndexId
     * @return the costIndexId property.
     */
    public String getCostIndexId() {
        return this.costIndexId;
    }
    
    /**
     * Setter for the costIndexId property.
     * 
     * @see costIndexId
     * @param costIndexId the costIndexId to set
     */
    
    public void setCostIndexId(final String costIndexId) {
        this.costIndexId = costIndexId;
    }
    
    /**
     * Getter for the dateIndexNext property.
     * 
     * @see dateIndexNext
     * @return the dateIndexNext property.
     */
    public Date getDateIndexNext() {
        return this.dateIndexNext;
    }
    
    /**
     * Setter for the dateIndexNext property.
     * 
     * @see dateIndexNext
     * @param dateIndexNext the dateIndexNext to set
     */
    
    public void setDateIndexNext(final Date dateIndexNext) {
        this.dateIndexNext = dateIndexNext;
    }
    
    /**
     * Getter for the indexValueInitial property.
     * 
     * @see indexValueInitial
     * @return the indexValueInitial property.
     */
    public double getIndexValueInitial() {
        return this.indexValueInitial;
    }
    
    /**
     * Setter for the indexValueInitial property.
     * 
     * @see indexValueInitial
     * @param indexValueInitial the indexValueInitial to set
     */
    
    public void setIndexValueInitial(final double indexValueInitial) {
        this.indexValueInitial = indexValueInitial;
    }
    
    /**
     * Getter for the indexingFrequency property.
     * 
     * @see indexingFrequency
     * @return the indexingFrequency property.
     */
    public String getIndexingFrequency() {
        return this.indexingFrequency;
    }
    
    /**
     * Setter for the indexingFrequency property.
     * 
     * @see indexingFrequency
     * @param indexingFrequency the indexingFrequency to set
     */
    
    public void setIndexingFrequency(final String indexingFrequency) {
        this.indexingFrequency = indexingFrequency;
    }
    
    /**
     * Getter for the pctChangeAdjust property.
     * 
     * @see pctChangeAdjust
     * @return the pctChangeAdjust property.
     */
    public double getPctChangeAdjust() {
        return this.pctChangeAdjust;
    }
    
    /**
     * Setter for the pctChangeAdjust property.
     * 
     * @see pctChangeAdjust
     * @param pctChangeAdjust the pctChangeAdjust to set
     */
    
    public void setPctChangeAdjust(final double pctChangeAdjust) {
        this.pctChangeAdjust = pctChangeAdjust;
    }
    
    /**
     * Getter for the rentRoundTo property.
     * 
     * @see rentRoundTo
     * @return the rentRoundTo property.
     */
    public int getRentRoundTo() {
        return this.rentRoundTo;
    }
    
    /**
     * Setter for the rentRoundTo property.
     * 
     * @see rentRoundTo
     * @param rentRoundTo the rentRoundTo to set
     */
    
    public void setRentRoundTo(final int rentRoundTo) {
        this.rentRoundTo = rentRoundTo;
    }
    
    /**
     * Getter for the resetInitialValues property.
     * 
     * @see resetInitialValues
     * @return the resetInitialValues property.
     */
    public int getResetInitialValues() {
        return this.resetInitialValues;
    }
    
    /**
     * Setter for the resetInitialValues property.
     * 
     * @see resetInitialValues
     * @param resetInitialValues the resetInitialValues to set
     */
    
    public void setResetInitialValues(final int resetInitialValues) {
        this.resetInitialValues = resetInitialValues;
    }
    
    /**
     * Getter for the rentInitial property.
     * 
     * @see rentInitial
     * @return the rentInitial property.
     */
    public double getRentInitial() {
        return this.rentInitial;
    }
    
    /**
     * Setter for the rentInitial property.
     * 
     * @see rentInitial
     * @param rentInitial the rentInitial to set
     */
    
    public void setRentInitial(final double rentInitial) {
        this.rentInitial = rentInitial;
    }
    
    /**
     * Add indexing interval to date.
     * 
     * @param date specified date
     * @param count number of intervals to add
     * @return new date
     */
    public Date addIntervalsToDate(final Date date, final int count) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        final int interval = getDateInterval();
        calendar.add(Calendar.MONTH, interval * count);
        return calendar.getTime();
    }
    
    /**
     * Calculate and update new index date if is earlier than end date.
     * 
     * @param currentDate system date
     * @param endDate end date
     */
    public void updateDateIndexNext(final Date currentDate, final Date endDate) {
        final Date newIndexDate = addIntervalsToDate(currentDate, 1);
        if (StringUtil.isNullOrEmpty(endDate)
                || (StringUtil.notNullOrEmpty(endDate) && !newIndexDate.after(endDate))) {
            this.dateIndexNext = newIndexDate;
        } else {
            this.dateIndexNext = currentDate;
        }
    }
    
    /**
     * Get interval value in months.
     * 
     * @return interval value
     */
    private int getDateInterval() {
        int interval = 1;
        if ("q".equals(this.indexingFrequency)) {
            interval = QUARTER_MONTH_NO;
        } else if ("s".equals(this.indexingFrequency)) {
            interval = SEMI_ANNUAL_MONTH_NO;
        } else if ("y".equals(this.indexingFrequency)) {
            interval = ANNUAL_MONTH_NO;
        } else if ("b".equals(this.indexingFrequency)) {
            interval = BI_ANNUAL_MONTH_NO;
        }
        return interval;
    }
    
}
