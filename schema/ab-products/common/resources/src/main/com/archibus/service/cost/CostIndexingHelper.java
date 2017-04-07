package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.finance.dao.*;
import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.utility.StringUtil;

/**
 * Helper class for Cost indexing service.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 20.1
 * 
 */
public class CostIndexingHelper {
    /**
     * Cost index profile datasource.
     */
    private ICostIndexDao<CostIndexProfile> costIndexProfileDataSource;
    
    /**
     * Cost index transaction datasource.
     */
    private ICostIndexDao<CostIndexTrans> costIndexTransDataSource;
    
    /**
     * Recurring cost data source.
     */
    private ICostDao<RecurringCost> recurringCostDataSource;
    
    /**
     * Recurring cost data source.
     */
    private ICostDao<ScheduledCost> scheduledCostDataSource;
    
    /**
     * Cost index profile.
     */
    private final CostIndexProfile indexProfile;
    
    /**
     * Last cost index transaction for current profile.
     */
    private CostIndexTrans lastCostTransaction;
    
    /**
     * Index new value.
     */
    private double indexValueNew;
    
    /**
     * Date index new value.
     */
    private Date dateIndexValueNew;
    
    /**
     * Base rent cost category alternative name.
     * <p/>
     * Can have multiple values - Clause IN should be used.
     */
    private String baseRentCostCategory;
    
    /**
     * Lease data record.
     */
    private final DataRecord leaseRecord;
    
    /**
     * If multi currency and vat is enabled.
     */
    private final boolean isMcAndVatEnabled;
    
    /**
     * Logger.
     */
    private final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * Constructor.
     * 
     * @param costIndexProfile cost index profile
     */
    public CostIndexingHelper(final CostIndexProfile costIndexProfile) {
        this.indexProfile = costIndexProfile;
        this.leaseRecord = getLeaseRecord(this.indexProfile.getLsId());
        this.isMcAndVatEnabled = ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
    }
    
    /**
     * Apply index on specified indexing date.
     * 
     * @param dateIndexing indexing date.
     * @param systemDate current system date
     */
    public void applyIndexOnDate(final Date dateIndexing, final Date systemDate) {
        
        final boolean blnIsIndexValue =
                findIndexValue(this.indexProfile.getCostIndexId(), dateIndexing);
        
        final boolean blnIsLsIndexCost =
                this.leaseRecord.getInt(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.COST_INDEX)) == 1;
        final String landlordTenant =
                this.leaseRecord.getString(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.LANDLORD_TENANT));
        final double rentInitial = this.indexProfile.getRentInitial();
        
        // get all Base Rent Recurring costs
        final List<RecurringCost> recurringCosts =
                this.findRecurringCosts(this.indexProfile.getLsId(), this.baseRentCostCategory,
                    dateIndexing);
        for (final RecurringCost recurringCost : recurringCosts) {
            
            final double costRent = getRentInitial(recurringCost, landlordTenant);
            final boolean isRentAmount = costRent != 0 && rentInitial != 0;
            // get first cost occurrence date
            final Date firstOccurenceDate = recurringCost.getDateForOccurence(1);
            
            if (isRentAmount && blnIsLsIndexCost && blnIsIndexValue
                    && !firstOccurenceDate.after(dateIndexing)) {
                // calculate rent limits
                this.indexProfile.calculateRentLimits();
                addDebugMessage("Recurring cost id " + recurringCost.getId());
                // if index new value is different than index initial value
                if (this.indexProfile.getIndexValueInitial() != this.indexValueNew) {
                    applyNewIndex(dateIndexing, recurringCost, systemDate);
                    
                }
                // update date index next
                this.indexProfile.updateDateIndexNext(dateIndexing,
                    this.indexProfile.getDateIndexEnd());
                this.costIndexProfileDataSource.update(this.indexProfile);
                
                addDebugMessage("After cost profile update");
            }
        }
        
    }
    
    /**
     * Setter for the costIndexProfileDataSource property.
     * 
     * @see costIndexProfileDataSource
     * @param costIndexProfileDataSource the costIndexProfileDataSource to set
     */
    
    public void setCostIndexProfileDataSource(
            final ICostIndexDao<CostIndexProfile> costIndexProfileDataSource) {
        this.costIndexProfileDataSource = costIndexProfileDataSource;
    }
    
    /**
     * Setter for the baseRentCostCategory property.
     * 
     * @see baseRentCostCategory
     * @param baseRentCostCategory the baseRentCostCategory to set
     */
    
    public void setBaseRentCostCategory(final String baseRentCostCategory) {
        this.baseRentCostCategory = baseRentCostCategory;
    }
    
    /**
     * Setter for the costIndexTransDataSource property.
     * 
     * @see costIndexTransDataSource
     * @param costIndexTransDataSource the costIndexTransDataSource to set
     */
    
    public void setCostIndexTransDataSource(
            final ICostIndexDao<CostIndexTrans> costIndexTransDataSource) {
        this.costIndexTransDataSource = costIndexTransDataSource;
    }
    
    /**
     * Setter for the lastCostTransaction property.
     * 
     * @see lastCostTransaction
     * @param lastCostTransaction the lastCostTransaction to set
     */
    
    public void setLastCostTransaction(final CostIndexTrans lastCostTransaction) {
        this.lastCostTransaction = lastCostTransaction;
    }
    
    /**
     * Apply new index.
     * 
     * @param dateIndexing indexing date
     * @param recurringCost recurring cost
     * @param systemDate current system date
     */
    private void applyNewIndex(final Date dateIndexing, final RecurringCost recurringCost,
            final Date systemDate) {
        final CostIndexTrans costIndexTrans = CostIndexTrans.createFromProfile(this.indexProfile);
        
        costIndexTrans.setDateIndex(dateIndexing);
        costIndexTrans.setIndexValueNew(this.indexValueNew);
        costIndexTrans.setDateIndexValueNew(this.dateIndexValueNew);
        // if rent initial is not set get this from recurring cost
        final String landlordTenant =
                this.leaseRecord.getString(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.LANDLORD_TENANT));
        if (StringUtil.isNullOrEmpty(costIndexTrans.getRentInitial())) {
            costIndexTrans.setRentInitial(getRentInitial(recurringCost, landlordTenant));
        }
        // apply yearly factor escalation if defined
        final double escalation = recurringCost.calculateYearlyFactorEscalation(dateIndexing);
        final double rentAmount = costIndexTrans.getRentInitial();
        final BigDecimal decimalAmount = new BigDecimal(rentAmount);
        costIndexTrans.setRentInitial(decimalAmount.multiply(new BigDecimal(escalation))
            .doubleValue());
        
        // calculate index percentage change
        costIndexTrans.calculateIndexPercentageChange();
        // calculate new rent value
        final double newRent =
                costIndexTrans.calculateRentNew(this.indexProfile.getMaxRent(),
                    this.indexProfile.getMinRent());
        
        final boolean isVatExcludedForLease =
                this.leaseRecord.getInt(DbConstants.getFieldFullName(DbConstants.LS_TABLE,
                    DbConstants.VAT_EXCLUDE)) == 1;
        // apply index on recurring cost
        final RecurringCost newRecurringCost =
                applyIndexOnRecurringCost(recurringCost, newRent, landlordTenant,
                    isVatExcludedForLease, dateIndexing);
        
        addDebugMessage("Add new recurring cost id " + newRecurringCost.getId());
        
        // apply index on scheduled costs
        applyIndexOnScheduledCosts(recurringCost.getId(), newRecurringCost.getId(), newRent,
            dateIndexing, systemDate, landlordTenant, isVatExcludedForLease);
        
        addDebugMessage("After scheduled costs");
        
        costIndexTrans.setCostTranRecurId(newRecurringCost.getId());
        // update date index next
        costIndexTrans.updateDateIndexNext(dateIndexing, this.indexProfile.getDateIndexEnd());
        
        // save cost transaction record
        if (this.lastCostTransaction != null) {
            costIndexTrans.setDateIndexLast(this.lastCostTransaction.getDateIndex());
        }
        
        this.costIndexTransDataSource.save(costIndexTrans);
        
        addDebugMessage("After cost transaction save");
        
        // reset profile initial values
        this.indexProfile.resetInitialValues(costIndexTrans.getIndexValueNew(), newRent);
    }
    
    /**
     * Read lease data record.
     * 
     * @param lsId lease code
     * @return data record
     */
    private DataRecord getLeaseRecord(final String lsId) {
        final DataSource dsLease =
                DataSourceFactory.createDataSourceForFields(DbConstants.LS_TABLE, new String[] {
                        DbConstants.LS_ID, DbConstants.COST_INDEX, DbConstants.LANDLORD_TENANT,
                        DbConstants.VAT_EXCLUDE });
        dsLease.addRestriction(Restrictions.eq(DbConstants.LS_TABLE, DbConstants.LS_ID, lsId));
        return dsLease.getRecord();
    }
    
    /**
     * Find index value for cost index and indexing date. Return true or false if index value is
     * found or not.
     * 
     * @param costIndexId cost index code
     * @param dateIndexing date indexing
     * @return boolean
     */
    private boolean findIndexValue(final String costIndexId, final Date dateIndexing) {
        boolean result = false;
        final DataSource dsIndexValues =
                DataSourceFactory.createDataSourceForFields(DbConstants.COST_INDEX_VALUES_TABLE,
                    new String[] { DbConstants.COST_INDEX_ID, DbConstants.DATE_INDEX_VALUE,
                            DbConstants.INDEX_VALUE });
        dsIndexValues.addRestriction(Restrictions.and(Restrictions.eq(
            DbConstants.COST_INDEX_VALUES_TABLE, DbConstants.COST_INDEX_ID, costIndexId),
            Restrictions.lte(DbConstants.COST_INDEX_VALUES_TABLE, DbConstants.DATE_INDEX_VALUE,
                dateIndexing)));
        dsIndexValues.addSort(DbConstants.COST_INDEX_VALUES_TABLE, DbConstants.DATE_INDEX_VALUE,
            DataSource.SORT_DESC);
        
        final List<DataRecord> indexValues = dsIndexValues.getRecords();
        if (indexValues.size() > 0) {
            final DataRecord recIndexValue = indexValues.get(0);
            this.indexValueNew =
                    recIndexValue.getDouble(DbConstants.getFieldFullName(
                        DbConstants.COST_INDEX_VALUES_TABLE, DbConstants.INDEX_VALUE));
            this.dateIndexValueNew =
                    recIndexValue.getDate(DbConstants.getFieldFullName(
                        DbConstants.COST_INDEX_VALUES_TABLE, DbConstants.DATE_INDEX_VALUE));
            result = true;
        }
        return result;
    }
    
    /**
     * Get all base rent scheduled cost.
     * 
     * @param recurringCostCode recurring cost code
     * @param dateIndexing date when indexing is applied
     * @param systemDate current systemdate
     * @return scheduled cost list
     */
    private List<ScheduledCost> findScheduledCosts(final int recurringCostCode,
            final Date dateIndexing, final Date systemDate) {
        if (this.scheduledCostDataSource == null) {
            this.scheduledCostDataSource = new ScheduledCostDataSource();
        }
        final Restriction restriction =
                Restrictions.and(Restrictions.eq(DbConstants.COST_TRAN_SCHED_TABLE,
                    DbConstants.COST_TRAN_RECUR_ID, recurringCostCode), Restrictions.gt(
                    DbConstants.COST_TRAN_SCHED_TABLE, DbConstants.DATE_DUE, systemDate));
        return this.scheduledCostDataSource.findByRestriction(restriction);
    }
    
    /**
     * Get all recurring costs for lease and cost category.
     * 
     * @param leaseCode lease code
     * @param costCategoryCode cost category id
     * @param dateIndexing indexing date
     * @return recurring cost list
     */
    private List<RecurringCost> findRecurringCosts(final String leaseCode,
            final String costCategoryCode, final Date dateIndexing) {
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }
        
        final Restriction restriction =
                Restrictions
                    .sql("cost_tran_recur.ls_id = "
                            + SqlUtils.formatValueForSql(leaseCode)
                            + " AND cost_tran_recur.cost_cat_id IN ('"
                            + costCategoryCode.replaceAll(",", "','")
                            + "') AND cost_tran_recur.status_active = 1 AND cost_tran_recur.date_start <= "
                            + SqlUtils.formatValueForSql(dateIndexing)
                            + " AND (cost_tran_recur.date_end IS NULL OR cost_tran_recur.date_end > "
                            + SqlUtils.formatValueForSql(dateIndexing) + ")");
        return this.recurringCostDataSource.findByRestriction(restriction);
    }
    
    /**
     * Get rent initial value.
     * 
     * @param recurringCost recurring cost object
     * @param landlordTenant lease landlord tenant
     * @return rent value
     */
    private double getRentInitial(final RecurringCost recurringCost, final String landlordTenant) {
        Double rentInitial = null;
        if (Constants.TENANT.equals(landlordTenant)) {
            if (this.isMcAndVatEnabled) {
                rentInitial = recurringCost.getAmountExpenseBasePayment();
            } else {
                rentInitial = recurringCost.getAmountExpense();
            }
        } else {
            if (this.isMcAndVatEnabled) {
                rentInitial = recurringCost.getAmountIncomeBasePayment();
            } else {
                rentInitial = recurringCost.getAmountIncome();
            }
        }
        return rentInitial;
    }
    
    /**
     * Set new rent on cost record.
     * 
     * @param cost cost object
     * @param newRent new rent value
     * @param landlordTenant landlord or tenant
     */
    private void setNewRent(final Cost cost, final double newRent, final String landlordTenant) {
        if (Constants.TENANT.equals(landlordTenant)) {
            if (this.isMcAndVatEnabled) {
                cost.setAmountExpenseBasePayment(newRent);
            } else {
                cost.setAmountExpense(newRent);
            }
        } else {
            if (this.isMcAndVatEnabled) {
                cost.setAmountIncomeBasePayment(newRent);
            } else {
                cost.setAmountIncome(newRent);
            }
        }
    }
    
    /**
     * Apply index to recurring costs. Save to new active recurring cost.
     * 
     * @param recurringCost recurring cost object
     * @param newRent new rent value
     * @param landlordTenant landlord tenant
     * @param isVatExcludedForLease if VAT is excluded for lease
     * @param dateIndexing indexing date
     * @return new cost
     */
    private RecurringCost applyIndexOnRecurringCost(final RecurringCost recurringCost,
            final double newRent, final String landlordTenant, final boolean isVatExcludedForLease,
            final Date dateIndexing) {
        
        // create new recurring cost
        RecurringCost newCost = this.recurringCostDataSource.save(recurringCost);
        newCost = this.recurringCostDataSource.getRecord(newCost.getId());
        // update start date
        newCost.setDateStart(dateIndexing);
        // update amounts
        setNewRent(newCost, newRent, landlordTenant);
        if (this.isMcAndVatEnabled) {
            // recalculate amounts
            recalculateCost(newCost, isVatExcludedForLease);
        }
        // set cost Active
        newCost.setCostActive(true);
        this.recurringCostDataSource.update(newCost);
        recurringCost.setDateEnd(addIntervalToDate(dateIndexing, Calendar.DATE, -1));
        this.recurringCostDataSource.update(recurringCost);
        return newCost;
    }
    
    /**
     * Apply index on all scheduled costs.
     * 
     * @param oldRecurringCostId old recurring cost code
     * @param newRecurringCostId new recurring cost code
     * @param newRent new rent value
     * @param dateIndexing date indexing
     * @param systemDate current system date
     * @param landlordTenant landlord tenant
     * @param isVatExcludedForLease is VAT excluded for lease
     */
    private void applyIndexOnScheduledCosts(final int oldRecurringCostId,
            final int newRecurringCostId, final double newRent, final Date dateIndexing,
            final Date systemDate, final String landlordTenant, final boolean isVatExcludedForLease) {
        // update all scheduled costs that must be indexed
        final List<ScheduledCost> scheduledCosts =
                findScheduledCosts(oldRecurringCostId, dateIndexing, systemDate);
        for (final ScheduledCost scheduledCost : scheduledCosts) {
            setNewRent(scheduledCost, newRent, landlordTenant);
            if (this.isMcAndVatEnabled) {
                recalculateCost(scheduledCost, isVatExcludedForLease);
            }
            scheduledCost.setRecurCostId(newRecurringCostId);
            // update scheduled cost
            this.scheduledCostDataSource.update(scheduledCost);
        }
    }
    
    /**
     * Recalculate cost when MC and VAT is enabled.
     * 
     * @param cost cost record
     * @param isVatExcludedForLease is VAT excluded for lease.
     */
    private void recalculateCost(final Cost cost, final boolean isVatExcludedForLease) {
        // we must calculate VAT first
        cost.calculateVAT(isVatExcludedForLease);
        cost.calculatePaymentTotals();
        // we must convert cost amounts
        double exchangeRateOverride = cost.getExchangeRateOverride();
        
        if (exchangeRateOverride == 1.0) {
            cost.applyExchangeRate(cost.getExchangeRateBudget());
        } else {
            if (cost.getCurrencyBudget().equals(cost.getCurrencyPayment())) {
                exchangeRateOverride = 1.0;
            }
            cost.applyExchangeRate(exchangeRateOverride);
        }
    }
    
    /**
     * Add debug messages to log.
     * 
     * @param message debug message
     */
    private void addDebugMessage(final String message) {
        if (this.log.isDebugEnabled()) {
            this.log.debug(message);
        }
    }
    
    /**
     * 
     * Add interval to date.
     * 
     * @param date date value
     * @param field date field
     * @param amount interval to add
     * @return date object
     */
    private Date addIntervalToDate(final Date date, final int field, final int amount) {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        calendar.add(field, amount);
        return calendar.getTime();
    }
    
}
