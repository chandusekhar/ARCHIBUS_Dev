package com.archibus.app.common.finance.dao.datasource;

import com.archibus.app.common.finance.dao.ICostIndexDao;
import com.archibus.datasource.ObjectDataSourceImpl;

/**
 * Base class for cost index data sources.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 * @param <CostIndex> Type of persistent object
 */
public abstract class AbstractCostIndexDataSource<CostIndex> extends
        ObjectDataSourceImpl<CostIndex> implements ICostIndexDao<CostIndex> {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Fields common for all Cost index DataSources are specified here.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "ls_id", "lsId" },
            { "cost_index_id", "costIndexId" }, { "date_index_next", "dateIndexNext" },
            { "index_value_initial", "indexValueInitial" },
            { "indexing_frequency", "indexingFrequency" },
            { "pct_change_adjust", "pctChangeAdjust" }, { "rent_round_to", "rentRoundTo" },
            { "reset_initial_values", "resetInitialValues" }, { "rent_initial", "rentInitial" } };
    
    /**
     * Constructs CostIndexDataSource, mapped to <code>tableName</code> table, using
     * <code>beanName</code> bean.
     * 
     * @param tableName Table name to map to.
     * @param beanName Bean name to use.
     */
    protected AbstractCostIndexDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
