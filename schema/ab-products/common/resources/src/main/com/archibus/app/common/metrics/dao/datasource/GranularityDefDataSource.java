package com.archibus.app.common.metrics.dao.datasource;

import com.archibus.app.common.metrics.DbConstants;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * DataSource for Granularity Definition.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class GranularityDefDataSource extends ObjectDataSourceImpl<GranularityDef> implements
        IDao<GranularityDef> {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { DbConstants.COLLECT_GROUP_BY, "groupByFields" },
            { "fields_present", "fieldPresence" }, { "fields_required", "requiredFields" },
            { "granularity_title", "title" } };
    
    /**
     * Constructs GranularityDataSource, mapped to <code>afm_metric_grans</code> table, using
     * <code>granularity</code> bean.
     */
    public GranularityDefDataSource() {
        super("granularityDef", DbConstants.AFM_METRIC_GRAN_DEFS);
    }
    
    /**
     * {@inheritDoc}
     */
    public GranularityDef getGranularityDef(final String groupByFields) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(Restrictions.eq(DbConstants.AFM_METRIC_GRAN_DEFS,
            DbConstants.COLLECT_GROUP_BY, groupByFields));
        final DataRecord record = dataSource.getRecord();
        return new DataSourceObjectConverter<Granularity>().convertRecordToObject(record,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
