package com.archibus.app.common.finanal.dao.datasource;

import java.util.List;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.finanal.dao.IFinancialMetricDao;
import com.archibus.app.common.finanal.domain.FinancialMetric;
import com.archibus.app.common.finanal.impl.Constants;
import com.archibus.app.common.metrics.CalculationType;
import com.archibus.app.common.metrics.dao.datasource.MetricDataSource;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Financial metric datasource object. Mapped to afm_metric_definitions database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialMetricDataSource extends MetricDataSource<FinancialMetric>
        implements IFinancialMetricDao<FinancialMetric> {
    /**
     * Only new fields for SFA are added here.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { Constants.CALC_TYPE, "calculationType" },
            { Constants.ANALYSIS_CALC_ORDER, "calculationOrder" },
            { "analysis_display_chart", "displayChart" },
            { "analysis_display_color", "displayColor" },
            { "analysis_display_icon", "displayIcon" }, { "analysis_field_cat", "fieldCategory" },
            { "analysis_result_field", "resultField" } };

    /**
     * Constructs FinancialMetricDataSource, mapped to <code>afm_metric_definitions</code> table,
     * using <code>financialMetric</code> bean.
     */
    public FinancialMetricDataSource() {
        super("financialMetric", "afm_metric_definitions");
    }

    /** {@inheritDoc} */

    @Override
    public List<FinancialMetric> getActiveMetrics() {
        final DataSource dataSource = this.createCopy();
        dataSource.setMaxRecords(0);
        dataSource.addRestriction(Restrictions.and(
            Restrictions.eq(Constants.AFM_METRIC_DEFINITIONS, Constants.CALC_TYPE,
                CalculationType.ANALYSIS),
            Restrictions.eq(Constants.AFM_METRIC_DEFINITIONS, Constants.METRIC_STATUS,
                Constants.STATUS_ACTIVE)));

        dataSource.addSort(Constants.AFM_METRIC_DEFINITIONS, Constants.ANALYSIS_CALC_ORDER,
            DataSource.SORT_ASC);
        final List<DataRecord> activeMetrics = dataSource.getRecords();

        return new DataSourceObjectConverter<FinancialMetric>().convertRecordsToObjects(
            activeMetrics, this.beanName, this.fieldToPropertyMapping, null);
    }

    @Override
    protected String[][] getFieldsToProperties() {
        // merge fieldsToProperties from the base class with FIELDS_TO_PROPERTIES in this class
        final String[][] fieldsToPropertiesMerged =
                (String[][]) ArrayUtils.addAll(super.getFieldsToProperties(), FIELDS_TO_PROPERTIES);

        return fieldsToPropertiesMerged;
    }

}
