package com.archibus.service.cost;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.StringUtil;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

/**
 * 
 * Provides methods for Cost Indexing.
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class CostIndexingService extends JobBase {
    
    /**
     * Cost index profile datasource.
     */
    private CostIndexProfileDataSource costIndexProfileDataSource;
    
    /**
     * Cost index transaction datasource.
     */
    private CostIndexTransDataSource costIndexTransDataSource;
    
    /**
     * Base rent cost category value.
     */
    private String baseRentCategory;
    
    /**
     * Logger.
     */
    private final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * Start Cost Indexing from Scheduled WFR.
     */
    public void applyIndexes() {
        
        final Date systemDate = getDateWithoutTime();
        appendDebugInfo("Started Cost Indexing Scheduled job at " + systemDate.toString());
        
        applyIndexesForDate(systemDate);
    }
    
    /**
     * 
     * Apply cost indexes for specified date.
     * 
     * @param dateIndexing indexing date
     */
    public void applyIndexesForDate(final Date dateIndexing) {
        applyIndexesForLeaseOnDate(dateIndexing, null);
    }
    
    /**
     * Apply cost indexes for specified date and lease profile.
     * 
     * @param dateIndexing indexing date
     * @param leaseCode lease code
     * 
     *            <p>
     *            Suppress PMD warning "AvoidUsingSql" in this method.
     *            <p>
     *            Justification: Case #1: Restriction with NOT EXISTS condition
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void applyIndexesForLeaseOnDate(final Date dateIndexing, final String leaseCode) {
        initPerRequestState();
        final Date systemDate = getDateWithoutTime();
        Date actualDateIndexing = dateIndexing;
        
        Date lsEndDate = null;
        
        appendDebugInfo("Started Cost Indexing job for date " + actualDateIndexing.toString());
        String leaseRestriction = "";
        if (StringUtil.notNullOrEmpty(leaseCode)) {
            leaseRestriction =
                    "ls_index_profile.ls_id = " + SqlUtils.formatValueForSql(leaseCode) + " AND ";
            lsEndDate = getLeaseEndDate(leaseCode);
        }
        
        if (!StringUtil.isNullOrEmpty(lsEndDate) && lsEndDate.before(systemDate)) {
            actualDateIndexing = lsEndDate;
        }
        
        final String sqlRestriction =
                leaseRestriction
                        + "EXISTS(SELECT ls.ls_id FROM ls WHERE ls.use_as_template = 0 AND ls_index_profile.ls_id = ls.ls_id AND ls.cost_index = 1)  "
                        + "AND NOT EXISTS(SELECT cost_index_trans.cost_index_trans_id FROM cost_index_trans "
                        + "WHERE cost_index_trans.ls_id = ls_index_profile.ls_id  AND cost_index_trans.date_index = "
                        + SqlUtils.formatValueForSql(actualDateIndexing) + ")";
        
        final List<CostIndexProfile> indexProfiles =
                this.costIndexProfileDataSource.findByDate(actualDateIndexing, sqlRestriction);
        for (final CostIndexProfile costIndexProfile : indexProfiles) {
            final List<Date> indexingDates =
                    costIndexProfile.getIndexingDates(actualDateIndexing, lsEndDate);
            for (final Date indexingDate : indexingDates) {
                final boolean blnIsIndexingRequired =
                        costIndexProfile.isIndexingRequired(indexingDate, lsEndDate);
                final boolean blnIsTransactionRequired =
                        this.costIndexTransDataSource.isTransactionRequiredForLeaseOnDate(
                            costIndexProfile.getLsId(), indexingDate);
                if (blnIsTransactionRequired && blnIsIndexingRequired) {
                    applyCostIndex(costIndexProfile, indexingDate, systemDate);
                }
            }
        }
    }
    
    /**
     * Apply cost index.
     * 
     * @param costIndexProfile cost index profile
     * @param dateIndexing indexing date
     * @param systemDate current system date
     */
    private void applyCostIndex(final CostIndexProfile costIndexProfile, final Date dateIndexing,
            final Date systemDate) {
        appendDebugInfo("Index cost for lease " + costIndexProfile.getLsId());
        
        // get last cost transaction for current index profile
        final CostIndexTrans lastCostIndexTransaction =
                this.costIndexTransDataSource
                    .getLastTransactionForLease(costIndexProfile.getLsId());
        
        final CostIndexingHelper costIndexingHelper = new CostIndexingHelper(costIndexProfile);
        costIndexingHelper.setCostIndexProfileDataSource(this.costIndexProfileDataSource);
        costIndexingHelper.setCostIndexTransDataSource(this.costIndexTransDataSource);
        costIndexingHelper.setBaseRentCostCategory(this.baseRentCategory);
        costIndexingHelper.setLastCostTransaction(lastCostIndexTransaction);
        costIndexingHelper.applyIndexOnDate(dateIndexing, systemDate);
    }
    
    /**
     * Initialize state variables.
     */
    private void initPerRequestState() {
        if (StringUtil.isNullOrEmpty(this.baseRentCategory)) {
            this.baseRentCategory =
                    com.archibus.service.Configuration.getActivityParameterString("AbRPLMCosts",
                        "Base_Rent_Category");
        }
        if (StringUtil.isNullOrEmpty(this.baseRentCategory)) {
            this.baseRentCategory = Constants.BASE_RENT_COST_CATEG;
        }
        // we can have multiple values here
        this.baseRentCategory = this.baseRentCategory.replaceAll(";", ",");
        
        if (this.costIndexProfileDataSource == null) {
            this.costIndexProfileDataSource = new CostIndexProfileDataSource();
        }
        if (this.costIndexTransDataSource == null) {
            this.costIndexTransDataSource = new CostIndexTransDataSource();
        }
    }
    
    /**
     * Get current system date without time.
     * 
     * @return date object
     */
    private Date getDateWithoutTime() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }
    
    /**
     * Get lease end date.
     * 
     * @param lsId lease code
     * @return lease end date or null
     */
    private Date getLeaseEndDate(final String lsId) {
        Date result = null;
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(DbConstants.LS_TABLE, new String[] {
                        DbConstants.LS_ID, DbConstants.DATE_END });
        dataSource.addRestriction(Restrictions.eq(DbConstants.LS_TABLE, DbConstants.LS_ID, lsId));
        final DataRecord record = dataSource.getRecord();
        final String lsDateEnd =
                DbConstants.getFieldFullName(DbConstants.LS_TABLE, DbConstants.DATE_END);
        if (StringUtil.notNullOrEmpty(record.getDate(lsDateEnd))) {
            result = record.getDate(lsDateEnd);
        }
        return result;
    }
    
    /**
     * Add debug messages.
     * 
     * @param message debug message
     */
    private void appendDebugInfo(final String message) {
        if (this.log.isDebugEnabled()) {
            this.log.debug(message);
        }
    }
}
