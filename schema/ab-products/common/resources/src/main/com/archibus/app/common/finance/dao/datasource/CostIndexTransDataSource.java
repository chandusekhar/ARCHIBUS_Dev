package com.archibus.app.common.finance.dao.datasource;

import java.util.*;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.finance.domain.CostIndexTrans;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Data source for Cost index transaction.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class CostIndexTransDataSource extends AbstractCostIndexDataSource<CostIndexTrans> {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { Constants.DATE_INDEX, "dateIndex" },
            { "date_index_last", "dateIndexLast" },
            { "date_index_value_new", "dateIndexValueNew" },
            { "index_pct_change", "indexPctChange" }, { "index_value_new", "indexValueNew" },
            { "rent_indexed", "rentIndexed" }, { "rent_new", "rentNew" },
            { "rent_pct_change_act", "rentPctChangeAct" },
            { "rent_pct_change_calc", "rentPctChangeCalc" },
            { "cost_tran_recur_id", "costTranRecurId" } };
    
    /**
     * Constructs CostIndexTransDataSource, mapped to <code>ls_index_profile</code> table, using
     * <code>costIndexProfile</code> bean.
     * 
     */
    public CostIndexTransDataSource() {
        super("costIndexTrans", "cost_index_trans");
    }
    
    /**
     * Get last cost index transaction for specified lease.
     * 
     * @param lsId lease code
     * @return cost index transaction object
     */
    public CostIndexTrans getLastTransactionForLease(final String lsId) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.LS_ID, lsId));
        dataSource.addSort(this.tableName, "cost_index_trans_id", DataSource.SORT_DESC);
        final List<DataRecord> transactions = dataSource.getRecords();
        DataRecord lastTransaction = null;
        CostIndexTrans lastCostTrans = null;
        if (!transactions.isEmpty()) {
            lastTransaction = transactions.get(0);
            lastCostTrans =
                    new DataSourceObjectConverter<CostIndexTrans>().convertRecordToObject(
                        lastTransaction, this.beanName, this.fieldToPropertyMapping, null);
        }
        return lastCostTrans;
    }
    
    /**
     * 
     * Check if exists transaction for lease on date.
     * 
     * @param lsId lease code
     * @param date date value
     * @return boolean
     */
    public boolean isTransactionRequiredForLeaseOnDate(final String lsId, final Date date) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.LS_ID, lsId));
        dataSource.addRestriction(Restrictions.eq(this.tableName, Constants.DATE_INDEX, date));
        final DataRecord record = dataSource.getRecord();
        return StringUtil.isNullOrEmpty(record);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        // merge fieldsToProperties from the base class with FIELDS_TO_PROPERTIES in this class
        final String[][] fieldsToPropertiesMerged =
                (String[][]) ArrayUtils.addAll(super.getFieldsToProperties(), FIELDS_TO_PROPERTIES);
        
        return fieldsToPropertiesMerged;
    }
}
