package com.archibus.app.common.metrics.dao.datasource;

import java.util.List;

import com.archibus.app.common.metrics.DbConstants;
import com.archibus.app.common.metrics.dao.IGranularityDao;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * DataSouce for Metric Granularity.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class GranularityDataSource extends ObjectDataSourceImpl<Granularity> implements
        IGranularityDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { DbConstants.METRIC_NAME, "metricName" }, { "collect_group_by", "groupByFields" },
            { "tables_required", "requiredTables" }, { "dflt_view", "drillDownView" } };
    
    /**
     * Constructs GranularityDataSource, mapped to <code>afm_metric_grans</code> table, using
     * <code>granularity</code> bean.
     */
    public GranularityDataSource() {
        super("granularity", "afm_metric_grans");
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Granularity> getGranularitiesForMetric(final String metricName) {
        return getGranularitiesForMetric(metricName, null);
    }
    
    /**
     * {@inheritDoc}
     */
    public List<Granularity> getGranularitiesForMetric(final String metricName,
            final String collectGroupBy) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(Restrictions.eq(this.tableName, DbConstants.METRIC_NAME,
            metricName));
        if (StringUtil.notNullOrEmpty(collectGroupBy)) {
            dataSource.addRestriction(Restrictions.eq(this.tableName, DbConstants.COLLECT_GROUP_BY,
                collectGroupBy));
        }
        final List<DataRecord> records = dataSource.getRecords();
        final List<Granularity> result =
                new DataSourceObjectConverter<Granularity>().convertRecordsToObjects(records,
                    this.beanName, this.fieldToPropertyMapping, null);
        
        // load granularity definition
        for (final Granularity granularity : result) {
            final GranularityDef granularityDef = getGranularityDef(granularity.getGroupByFields());
            granularity.loadDefinition(granularityDef);
        }
        return result;
    }
    
    /**
     * {@inheritDoc}
     */
    public Granularity getGranularity(final String groupByFields) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(Restrictions.eq(this.tableName, DbConstants.COLLECT_GROUP_BY,
            groupByFields));
        final DataRecord record = dataSource.getRecord();
        
        final Granularity granularity =
                new DataSourceObjectConverter<Granularity>().convertRecordToObject(record,
                    this.beanName, this.fieldToPropertyMapping, null);
        
        final GranularityDef granularityDef = getGranularityDef(groupByFields);
        granularity.loadDefinition(granularityDef);
        
        return granularity;
    }
    
    /**
     * {@inheritDoc}
     */
    public GranularityDef getGranularityDef(final String groupByFields) {
        final GranularityDefDataSource granDefDataSource = new GranularityDefDataSource();
        return granDefDataSource.getGranularityDef(groupByFields);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
