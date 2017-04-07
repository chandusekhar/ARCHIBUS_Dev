package com.archibus.app.common.depreciation.dao.datasource;

import com.archibus.app.common.depreciation.dao.IDepreciationDao;
import com.archibus.datasource.ObjectDataSourceImpl;

/**
 * Data source for depreciation object.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <Depreciation> type of the persistent object
 */
public abstract class AbstractDepreciationDataSource<Depreciation>
        extends ObjectDataSourceImpl<Depreciation> implements IDepreciationDao<Depreciation> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Fields common for all depreciation data sources are specified here.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "report_id", "reportId" },
            { "value_accum_dep", "valueAccumDep" }, { "value_current", "valueCurrent" },
            { "value_current_dep", "valueCurrentDep" } };

    /**
     * Constructs AbstractDepreciationDataSource, mapped to <code>tableName</code> table, using
     * <code>beanName</code> bean.
     *
     * @param tableName Table name to map to.
     * @param beanName Bean name to use.
     */
    protected AbstractDepreciationDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
