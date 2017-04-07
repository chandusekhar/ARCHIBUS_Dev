package com.archibus.app.common.metrics.dao.datasource;

import java.util.List;

import com.archibus.app.common.metrics.DbConstants;
import com.archibus.app.common.metrics.dao.IScorecardDao;
import com.archibus.app.common.metrics.domain.Scorecard;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Data Source for scorecard assignments.
 *
 * @author Sergiy Kuramshyn
 * @since 21.2
 */
public class ScorecardDataSource extends ObjectDataSourceImpl<Scorecard> implements IScorecardDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "metric_name", "metricName" },
            { "scorecard_code", "scorecardCode" }, { "value_disp_decimals_ovr", "decimals" },
        { "display_order", "displayOrder" } };
    
    /**
     * Constructs MetricDataSource, mapped to <code>afm_metric_definitions</code> table, using
     * <code>metric</code> bean.
     */
    public ScorecardDataSource() {
        super("scorecard", DbConstants.AFM_METRIC_SCORECARDS);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public List<Scorecard> getScorecardAssignments(final String scorecardName) {
        final DataSource dataSource = this.createCopy();
        
        // select metric assignments for specified scorecard name
        dataSource.addRestriction(Restrictions.eq(DbConstants.AFM_METRIC_SCORECARDS,
            DbConstants.SCORECARD_CODE, scorecardName));
        // select only active assignments
        dataSource.addRestriction(Restrictions.eq(DbConstants.AFM_METRIC_SCORECARDS,
            DbConstants.IS_DISPLAYED, "1"));
        
        dataSource.addSort(DbConstants.AFM_METRIC_SCORECARDS, DbConstants.DISPLAY_ORDER,
            DataSource.SORT_ASC);
        dataSource.addSort(DbConstants.AFM_METRIC_SCORECARDS, DbConstants.METRIC_NAME,
            DataSource.SORT_ASC);
        
        final List<DataRecord> records = dataSource.getRecords();
        
        return new DataSourceObjectConverter<Scorecard>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
