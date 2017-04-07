package com.archibus.app.common.finance.domain;

import java.util.*;

import com.archibus.utility.StringUtil;

/**
 * 
 * Represents Cost index profile - domain object.
 * <p>
 * Mapped to ls_index_profile
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class CostIndexProfile extends CostIndex {
    /**
     * Class name constant.
     */
    static final String CLASS_COST_INDEX_PROFILE = "CostIndexProfile";
    
    /**
     * Date index end.
     */
    private Date dateIndexEnd;
    
    /**
     * Date index start.
     */
    private Date dateIndexStart;
    
    /**
     * Maximum limit.
     */
    private double limitMax;
    
    /**
     * Minimum limit.
     */
    private double limitMin;
    
    /**
     * Rent maximum value.
     */
    private double maxRent;
    
    /**
     * Rent minimum value.
     */
    private double minRent;
    
    /**
     * Getter for the dateIndexEnd property.
     * 
     * @see dateIndexEnd
     * @return the dateIndexEnd property.
     */
    public Date getDateIndexEnd() {
        return this.dateIndexEnd;
    }
    
    /**
     * Setter for the dateIndexEnd property.
     * 
     * @see dateIndexEnd
     * @param dateIndexEnd the dateIndexEnd to set
     */
    
    public void setDateIndexEnd(final Date dateIndexEnd) {
        this.dateIndexEnd = dateIndexEnd;
    }
    
    /**
     * Getter for the dateIndexStart property.
     * 
     * @see dateIndexStart
     * @return the dateIndexStart property.
     */
    public Date getDateIndexStart() {
        return this.dateIndexStart;
    }
    
    /**
     * Setter for the dateIndexStart property.
     * 
     * @see dateIndexStart
     * @param dateIndexStart the dateIndexStart to set
     */
    
    public void setDateIndexStart(final Date dateIndexStart) {
        this.dateIndexStart = dateIndexStart;
    }
    
    /**
     * Getter for the limitMax property.
     * 
     * @see limitMax
     * @return the limitMax property.
     */
    public double getLimitMax() {
        return this.limitMax;
    }
    
    /**
     * Setter for the limitMax property.
     * 
     * @see limitMax
     * @param limitMax the limitMax to set
     */
    
    public void setLimitMax(final double limitMax) {
        this.limitMax = limitMax;
    }
    
    /**
     * Getter for the limitMin property.
     * 
     * @see limitMin
     * @return the limitMin property.
     */
    public double getLimitMin() {
        return this.limitMin;
    }
    
    /**
     * Setter for the limitMin property.
     * 
     * @see limitMin
     * @param limitMin the limitMin to set
     */
    
    public void setLimitMin(final double limitMin) {
        this.limitMin = limitMin;
    }
    
    /**
     * Getter for the maxRent property.
     * 
     * @see maxRent
     * @return the maxRent property.
     */
    public double getMaxRent() {
        return this.maxRent;
    }
    
    /**
     * Setter for the maxRent property.
     * 
     * @see maxRent
     * @param maxRent the maxRent to set
     */
    
    public void setMaxRent(final double maxRent) {
        this.maxRent = maxRent;
    }
    
    /**
     * Getter for the minRent property.
     * 
     * @see minRent
     * @return the minRent property.
     */
    public double getMinRent() {
        return this.minRent;
    }
    
    /**
     * Setter for the minRent property.
     * 
     * @see minRent
     * @param minRent the minRent to set
     */
    
    public void setMinRent(final double minRent) {
        this.minRent = minRent;
    }
    
    /**
     * Check if indexing is required on specified date.
     * 
     * @param date date value
     * @param leaseEndDate lease end date
     * @return boolean
     */
    public boolean isIndexingRequired(final Date date, final Date leaseEndDate) {
        final Date nextIndexingDate = calculateLastIndexingDate(date);
        boolean blnIndexingRequired = true;
        // check if next indexing is after date index end if this exists
        if (StringUtil.notNullOrEmpty(this.dateIndexEnd)
                && nextIndexingDate.after(this.dateIndexEnd)) {
            blnIndexingRequired = false;
        }
        // check if next indexing date is after lease end date
        if (blnIndexingRequired && StringUtil.notNullOrEmpty(leaseEndDate)
                && nextIndexingDate.after(leaseEndDate)) {
            blnIndexingRequired = false;
        }
        return nextIndexingDate.equals(date) && blnIndexingRequired;
    }
    
    /**
     * Reset index profile initial values.
     * 
     * @param indexNewValue new index value
     * @param rentNewValue new rent value
     */
    public void resetInitialValues(final double indexNewValue, final double rentNewValue) {
        if (this.getResetInitialValues() == 1) {
            this.setIndexValueInitial(indexNewValue);
            this.setRentInitial(rentNewValue);
            this.setMaxRent(rentNewValue * this.limitMax / Constants.ONE_HUNDRED);
            this.setMinRent(rentNewValue * this.limitMin / Constants.ONE_HUNDRED);
        }
    }
    
    /**
     * Calculate min max rent values.
     */
    public void calculateRentLimits() {
        this.maxRent = this.getRentInitial() * this.limitMax / Constants.ONE_HUNDRED;
        this.minRent = this.getRentInitial() * this.limitMin / Constants.ONE_HUNDRED;
    }
    
    /**
     * Return required indexing dates.
     * 
     * @param date current indexing date
     * @param leaseEndDate lease end date
     * @return dates list
     */
    public List<Date> getIndexingDates(final Date date, final Date leaseEndDate) {
        final List<Date> dates = new ArrayList<Date>();
        final Date startDate = getDateIndexStart();
        int counter = 1;
        Date newDate = startDate;
        Date dateLimit = date;
        if (StringUtil.notNullOrEmpty(leaseEndDate) && leaseEndDate.before(date)) {
            dateLimit = leaseEndDate;
        }
        
        while (newDate.before(dateLimit)) {
            newDate = addIntervalsToDate(startDate, counter);
            if (newDate.after(date)) {
                break;
            }
            dates.add(newDate);
            counter++;
        }
        return dates;
    }
    
    /**
     * Calculate max date next indexing that is not greater than specified date.
     * 
     * @param date current system date
     * @return date index next
     */
    private Date calculateLastIndexingDate(final Date date) {
        Date nextIndexingDate = getDateIndexNext();
        // if is null set to start date
        if (nextIndexingDate == null) {
            nextIndexingDate = getDateIndexStart();
        }
        
        int counter = 1;
        Date newDate = nextIndexingDate;
        while (newDate.before(date)) {
            newDate = addIntervalsToDate(nextIndexingDate, counter);
            counter++;
        }
        return newDate;
    }
    
}
