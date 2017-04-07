package com.archibus.service.cost;

import java.util.Date;

/**
 * This class contains configuration properties for Cost calculations.
 * <p>
 * Default values of configuration properties are defined in the Spring application context file.
 * System administrators can override these values using activity_params table.
 */
public class Configuration extends com.archibus.service.Configuration {
    
    // ----------------------- constants ---------------------------------------
    
    private static final String ACTIVITY_ID = "AbCommonResources";
    
    // ----------------------- configuration properties ------------------------
    
    /**
     * true --> apply YearlyFactor on each Lease Anniversary false --> apply YearlyFactor on January
     * 1st of each year of Lease term
     */
    private boolean applyYearlyFactorAtAnniversary = true;
    
    private Date defaultDateEnd;
    
    private Date defaultDateStart;
    
    private int fiscalYearStartDay;
    
    private int fiscalYearStartMonth;
    
    // ----------------------- methods -----------------------------------------
    
    /**
     * Spring-configured objects should as a rule have public parameterless constructors.
     */
    public Configuration() {
        super(ACTIVITY_ID);
    }
    
    /**
     * @return the defaultEndDate
     */
    public Date getDefaultDateEnd() {
        return this.defaultDateEnd;
    }
    
    /**
     * @return the defaultDateStart
     */
    public Date getDefaultDateStart() {
        return this.defaultDateStart;
    }
    
    public int getFiscalYearStartDay() {
        return this.fiscalYearStartDay;
    }
    
    public int getFiscalYearStartMonth() {
        return this.fiscalYearStartMonth;
    }
    
    public boolean isApplyYearlyFactorAtAnniversary() {
        return this.applyYearlyFactorAtAnniversary;
    }
    
    /**
     * Loads schema preferences used by this activity.
     * <p>
     * This method cannot be called from a constructor, because when Spring singleton beans are
     * instantiated, the Project is not yet loaded.
     * <p>
     * As a workaround, activity services must call this method for each service call.
     */
    public void loadSchemaPreferences() {
        this.fiscalYearStartMonth = Integer.parseInt(getSchemaPreference("fiscalyear_startmonth"));
        this.fiscalYearStartDay = Integer.parseInt(getSchemaPreference("fiscalyear_startday"));
    }
    
    public void setApplyYearlyFactorAtAnniversary(final boolean applyYearlyFactorAtAnniversary) {
        this.applyYearlyFactorAtAnniversary = applyYearlyFactorAtAnniversary;
    }
    
    /**
     * @param defaultDateEnd
     */
    public void setDefaultDateEnd(final Date defaultDateEnd) {
        this.defaultDateEnd = defaultDateEnd;
    }
    
    /**
     * @param defaultDateStart
     */
    public void setDefaultDateStart(final Date defaultDateStart) {
        this.defaultDateStart = defaultDateStart;
    }
    
    public void setFiscalYearStartDay(final int fiscalYearStartDay) {
        this.fiscalYearStartDay = fiscalYearStartDay;
    }
    
    public void setFiscalYearStartMonth(final int fiscalYearStartMonth) {
        this.fiscalYearStartMonth = fiscalYearStartMonth;
    }
}
