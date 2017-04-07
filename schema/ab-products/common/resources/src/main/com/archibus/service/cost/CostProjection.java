package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.service.Period;
import com.archibus.utility.DateTime;

/**
 * Contains cash flow or financial projection data for specified assets, cost categories, and date
 * periods.
 * 
 * <pre>
 * Building HQ
 *     PEST CONTROL
 *         January 2009:  $500
 *         February 2009: $650
 *         March 2009:    $700
 * Building JFK A
 *     PEST CONTROL
 *         January 2009:  $450
 *         February 2009: $400
 *         March 2009:    $450
 * </pre>
 */
public class CostProjection {
    
    // ----------------------- constants ----------------------------------------------------------
    
    public static final String ASSET_KEY_ACCOUNT = "ac_id";
    
    public static final String ASSET_KEY_BUILDING = "bl_id";
    
    public static final String ASSET_KEY_DEPARTMENT = "dp_id";
    
    public static final String ASSET_KEY_DIVISION = "dv_id";
    
    public static final String ASSET_KEY_LEASE = "ls_id";
    
    public static final String ASSET_KEY_PARCEL = "pa_id";
    
    public static final String ASSET_KEY_PROPERTY = "pr_id";
    
    public static final String CALCTYPE_EXPENSE = "EXPENSE";
    
    public static final String CALCTYPE_INCOME = "INCOME";
    
    public static final String CALCTYPE_NETINCOME = "NETINCOME";
    
    public static final String DEFAULT_COST_CATEGORY = "All cost categories";
    
    // ----------------------- data variables -----------------------------------------------------
    
    /**
     * Name of the key field representing an asset.
     */
    private final String assetKey;
    
    /**
     * Cost periods grouped by asset and cost category.
     * <p>
     * The asset ID is a key in the outer Map.
     * <p>
     * The cost category is a key in the inner Map.
     * <p>
     * The List contains cost values for all date periods between the start date and the end date.
     */
    private final Map<String, Map<String, List<CostPeriod>>> assetsToCostCategoriesToPeriods =
            new HashMap<String, Map<String, List<CostPeriod>>>();
    
    /**
     * Projection end date.
     */
    private final Date dateEnd;
    
    /**
     * Projection start date.
     */
    private final Date dateStart;
    
    /**
     * Date period between projection values: month, quarter, or year. The values are defined as
     * constants in the Period class.
     */
    private final String period;
    
    // ----------------------- public methods -----------------------------------------------------
    
    /**
     * Constructor. Creates a new empty projection for specified type of asset and date range.
     */
    public CostProjection(final String assetKey, final Date dateStart, final Date dateEnd,
            final String period) {
        this.assetKey = assetKey;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
        this.period = period;
    }
    
    /**
     * Constructor. Creates a new empty projection for specified type of asset and year range.
     */
    public CostProjection(final String assetKey, final int yearStart, final int yearEnd) {
        this.assetKey = assetKey;
        this.dateStart = DateTime.getFirstDayOfYear(yearStart);
        this.dateEnd = DateTime.getLastDayOfYear(yearEnd);
        this.period = Period.YEAR;
    }
    
    /**
     * Returns a set of all assets IDs stored in this projection.
     * 
     * @return
     */
    public List<String> getAssetIds() {
        // create a copy of the asset ID list
        final List<String> assetIds =
                new ArrayList<String>(this.assetsToCostCategoriesToPeriods.keySet());
        // sort asset IDs alphabetically
        Collections.sort(assetIds);
        return assetIds;
    }
    
    /**
     * Returns asset key property.
     * 
     * @return
     */
    public String getAssetKey() {
        return this.assetKey;
    }
    
    /**
     * Returns a set of all cost categories stored in this projection for specified asset.
     * 
     * @return
     */
    public List<String> getCostCategories(final String assetId) {
        final Map<String, List<CostPeriod>> costCategoriesToPeriods =
                this.assetsToCostCategoriesToPeriods.get(assetId);
        if (costCategoriesToPeriods != null) {
            // create a copy of the cost category list for specified asset
            final List<String> costCategories =
                    new ArrayList<String>(costCategoriesToPeriods.keySet());
            // sort cost categories alphabetically
            Collections.sort(costCategories);
            return costCategories;
        } else {
            return new ArrayList<String>();
        }
    }
    
    /**
     * @return the dateEnd
     */
    public Date getDateEnd() {
        return this.dateEnd;
    }
    
    /**
     * @return the dateStart
     */
    public Date getDateStart() {
        return this.dateStart;
    }
    
    /**
     * Returns the number of date periods in the projection.
     * 
     * @return
     */
    public int getNumberOfPeriods() {
        int periods = 0;
        
        final Period datePeriod = new Period(getPeriod(), this.dateStart);
        
        final Calendar c = Calendar.getInstance();
        c.setTime(this.dateStart);
        while (c.getTime().before(this.dateEnd)) {
            periods++;
            
            datePeriod.addPeriodToCalendar(c);
        }
        return periods;
    }
    
    /**
     * @return the period
     */
    public String getPeriod() {
        return this.period;
    }
    
    /**
     * Returns list of periods for specified asset and default cost category. This method should be
     * used by calculations that do not group costs by cost category.
     * 
     * @return List<CostPeriod>
     */
    public List<CostPeriod> getPeriodsForAsset(final String assetId) {
        return getPeriodsForAssetAndCostCategory(assetId, DEFAULT_COST_CATEGORY);
    }
    
    /**
     * Returns list of periods for specified asset and specified cost category. This method should
     * be used by calculations that group costs by cost category.
     * 
     * @return List<CostPeriod>
     */
    public List<CostPeriod> getPeriodsForAssetAndCostCategory(final String assetId,
            final String costCategoryId) {
        final Map<String, List<CostPeriod>> costCategoriesToPeriods =
                this.assetsToCostCategoriesToPeriods.get(assetId);
        List<CostPeriod> result = new ArrayList<CostPeriod>();
        if (costCategoriesToPeriods != null) {
            result = costCategoriesToPeriods.get(costCategoryId);
        }
        return result;
    }
    
    /**
     * Create and returns list of periods for specified asset and default cost category.
     * 
     * @param assetId asset id
     * @return List<CostPeriod>
     */
    public List<CostPeriod> createPeriodsForAsset(final String assetId) {
        Map<String, List<CostPeriod>> costCategoriesToPeriods =
                this.assetsToCostCategoriesToPeriods.get(assetId);
        if (costCategoriesToPeriods == null) {
            costCategoriesToPeriods = new HashMap<String, List<CostPeriod>>();
            this.assetsToCostCategoriesToPeriods.put(assetId, costCategoriesToPeriods);
        }
        List<CostPeriod> periods = costCategoriesToPeriods.get(DEFAULT_COST_CATEGORY);
        if (periods == null) {
            periods = createPeriods();
            costCategoriesToPeriods.put(DEFAULT_COST_CATEGORY, periods);
        }
        return costCategoriesToPeriods.get(DEFAULT_COST_CATEGORY);
    }
    
    /**
     * Returns printable string representation of the data.
     */
    @Override
    public String toString() {
        final StringBuffer sb = new StringBuffer();
        
        for (final String assetId : getAssetIds()) {
            sb.append("Asset = " + assetId + "\n");
            
            final List<CostPeriod> periods = getPeriodsForAsset(assetId);
            for (final CostPeriod period : periods) {
                sb.append("    " + period + "\n");
            }
        }
        
        return sb.toString();
    }
    
    /**
     * Updates stored cost for specified asset, cost category, and date.
     * 
     * @param assetId
     * @param costCategory
     * @param date
     * @param cost value to add to the stored cost for asset, cost category, and date.
     */
    public void updateCost(final String assetId, final Date date, final double cost) {
        updateCost(assetId, DEFAULT_COST_CATEGORY, date, cost);
    }
    
    /**
     * Updates stored cost for specified asset, cost category, and date.
     * 
     * @param assetId
     * @param costCategory
     * @param date
     * @param cost value to add to the stored cost for asset, cost category, and date.
     */
    public void updateCost(final String assetId, final String costCategory, final Date date,
            final double cost) {
        Map<String, List<CostPeriod>> costCategoriesToPeriods =
                this.assetsToCostCategoriesToPeriods.get(assetId);
        if (costCategoriesToPeriods == null) {
            costCategoriesToPeriods = new HashMap<String, List<CostPeriod>>();
            this.assetsToCostCategoriesToPeriods.put(assetId, costCategoriesToPeriods);
        }
        
        List<CostPeriod> periods = costCategoriesToPeriods.get(costCategory);
        if (periods == null) {
            periods = createPeriods();
            costCategoriesToPeriods.put(costCategory, periods);
        }
        
        // find one period onto which the date falls
        for (final CostPeriod period : periods) {
            if (period.containsDate(date)) {
                // update found period cost
                final BigDecimal costHolder = period.getCost();
                final BigDecimal newCostHolder = costHolder.add(new BigDecimal(cost));
                period.setCost(newCostHolder);
                break;
            }
        }
    }
    
    /**
     * Updates stored cost for specified asset, cost category, and year.
     * 
     * @param assetId
     * @param costCategory
     * @param year
     * @param cost value to add to the stored cost for asset, cost category, and year.
     */
    public void updateCost(final String assetId, final String costCategory, final int year,
            final double cost) {
        final Date date = DateTime.getFirstDayOfYear(year);
        updateCost(assetId, costCategory, date, cost);
    }
    
    // ----------------------- private methods ----------------------------------------------------
    
    /**
     * Creates a list of periods for costs, starting at dateStart, ending at or before dateEnd.
     * 
     * @return List<CostPeriod>
     */
    private List<CostPeriod> createPeriods() {
        final List<CostPeriod> values = new ArrayList<CostPeriod>();
        
        final Calendar c = Calendar.getInstance();
        c.setTime(this.dateStart);
        while (c.getTime().before(this.dateEnd)) {
            if (this.period.equals(Period.MONTH)) {
                values.add(new CostPeriod(Period.MONTH, c.getTime()));
                c.add(Calendar.MONTH, 1);
            } else if (this.period.equals(Period.QUARTER)) {
                values.add(new CostPeriod(Period.QUARTER, c.getTime()));
                c.add(Calendar.MONTH, 3);
            } else if (this.period.equals(Period.YEAR)) {
                values.add(new CostPeriod(Period.YEAR, c.getTime()));
                c.add(Calendar.YEAR, 1);
            } else if (this.period.equals(Period.CUSTOM)) {
                values.add(new CostPeriod(Period.CUSTOM, this.dateStart, this.dateEnd));
                c.setTime(this.dateEnd);
            }
        }
        
        return values;
    }
}
