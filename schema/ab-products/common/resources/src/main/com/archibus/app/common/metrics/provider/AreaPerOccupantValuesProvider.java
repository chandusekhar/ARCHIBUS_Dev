package com.archibus.app.common.metrics.provider;

import java.util.*;

import com.archibus.app.common.metrics.Constants;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.ExceptionBase;

/**
 * Example for metric defined with custom WFR.
 * <p>
 * Suppress PMD warnings, "UnusedPrivateField", "SingularField".
 * <p>
 * Justification: this class is a metric WFR example that implements MetricValuesprovider interface
 * and metric field is required.
 *
 * @author Ioan Draghici
 * @since 21.2
 *
 */
@SuppressWarnings({ "PMD.UnusedPrivateField", "PMD.SingularField" })
public class AreaPerOccupantValuesProvider implements MetricValuesProvider {

    /**
     * Constant.
     */
    private static final String RM_TABLE = "rm";

    /**
     * Constant.
     */
    private static final String EM_TABLE = "em";

    /**
     * Constant.
     */
    private static final String DV_TABLE = "dv";

    /**
     * Constant.
     */
    private static final String BU_ID = "bu_id";

    /**
     * Constant.
     */
    private static final String DV_BU_ID = "dv.bu_id";

    /**
     * Constant.
     */
    private static final String ALLOCATED_AREA = "allocated_area";

    /**
     * Constant.
     */
    private static final String EMPLOYEE_COUNT = "employee_count";

    /**
     * Zero value double.
     */
    private final Double zeroDouble = new Double("0");

    /**
     * Huge double value.
     */
    private final Double hugeDouble = new Double("9999999999");

    /**
     * Metric definition.
     * <p>
     * Suppress warning justification: this class is a metric WFR example that implements
     * MetricValuesprovider interface and metric field is required.
     */
    @edu.umd.cs.findbugs.annotations.SuppressWarnings("URF_UNREAD_FIELD")
    private Metric metric;

    /**
     * Setter for metric object.
     *
     * @param metric the metric to set
     */
    public void setMetric(final Metric metric) {
        this.metric = metric;
    }

    /**
     * {@inheritDoc}
     */
    public Map<String, Double> getValues(final Granularity granularity, final Date fromDate,
        final Date toDate) throws ExceptionBase {
        // try {
        final Map<String, Double> areas = getAreaRecords();
        final Map<String, Double> employee = getEmCountRecords();

        return getValues(areas, employee);
        // } catch (final ExceptionBase exceptionBase) {
        // throw exceptionBase;
        // }

    }

    /**
     * Get metric values.
     *
     * @param numerator numerator values
     * @param denominator demoninator values
     * @return map object
     */
    private Map<String, Double> getValues(final Map<String, Double> numerator,
        final Map<String, Double> denominator) {
        final Map<String, Double> result = new HashMap<String, Double>();
        Iterator<String> itGroupByValue = null;
        // iterate on nominator values
        itGroupByValue = numerator.keySet().iterator();
        while (itGroupByValue.hasNext()) {
            final String groupByValue = itGroupByValue.next();
            if (!Constants.PORTFOLIO.equals(groupByValue) && !result.containsKey(groupByValue)) {
                final Double nomValue = numerator.get(groupByValue);
                final Double denomValue = denominator.get(groupByValue);
                final Double value = calculateMetricValue(nomValue, denomValue);
                result.put(groupByValue, value);
            }
        }
        // iterate on denominator and try to find unsaved group by values
        itGroupByValue = denominator.keySet().iterator();
        while (itGroupByValue.hasNext()) {
            final String groupByValue = itGroupByValue.next();
            if (!Constants.PORTFOLIO.equals(groupByValue) && !result.containsKey(groupByValue)) {
                final Double nomValue = numerator.get(groupByValue);
                final Double denomValue = denominator.get(groupByValue);
                final Double value = calculateMetricValue(nomValue, denomValue);
                result.put(groupByValue, value);
            }
        }
        return result;
    }

    /**
     * Calculate ratio value for given group by value.
     *
     * @param numerator numerator value
     * @param denominator denominator value
     * @return double
     */
    private Double calculateMetricValue(final Double numerator, final Double denominator) {
        Double nomVal = numerator;
        if (numerator == null) {
            nomVal = this.zeroDouble;
        }
        Double denomVal = denominator;
        if (denominator == null || denominator.equals(this.zeroDouble)) {
            denomVal = this.hugeDouble;
        }
        return nomVal / denomVal;
    }

    /**
     * Get area records.
     *
     * @return records
     */
    private Map<String, Double> getAreaRecords() {
        final DataSourceGroupingImpl dataSourceGroupingImpl = new DataSourceGroupingImpl();
        dataSourceGroupingImpl.addTable(RM_TABLE, DataSource.ROLE_MAIN);
        dataSourceGroupingImpl.addTable(DV_TABLE, DataSource.ROLE_STANDARD);
        dataSourceGroupingImpl.addField(DV_TABLE, BU_ID);
        final VirtualFieldDef fieldDef =
                new VirtualFieldDef(RM_TABLE, ALLOCATED_AREA, DataSource.DATA_TYPE_NUMBER,
                    DataSourceGroupingImpl.FORMULA_SUM, "rm.area_alloc");
        dataSourceGroupingImpl.addCalculatedField(fieldDef);
        dataSourceGroupingImpl.addGroupByField(DV_TABLE, BU_ID, null);
        dataSourceGroupingImpl.addRestriction(Restrictions.isNotNull(DV_TABLE, BU_ID));
        return recordsToMap(dataSourceGroupingImpl.getRecords(), DV_BU_ID, "rm.allocated_area");
    }

    /**
     * Get employee count per bu_id.
     *
     * @return map object
     */
    private Map<String, Double> getEmCountRecords() {
        final DataSourceGroupingImpl dataSourceGroupingImpl = new DataSourceGroupingImpl();
        dataSourceGroupingImpl.addTable(EM_TABLE, DataSource.ROLE_MAIN);
        dataSourceGroupingImpl.addTable(DV_TABLE, DataSource.ROLE_STANDARD);
        dataSourceGroupingImpl.addField(DV_TABLE, BU_ID);
        final VirtualFieldDef fieldDef =
                new VirtualFieldDef(EM_TABLE, EMPLOYEE_COUNT, DataSource.DATA_TYPE_NUMBER,
                    DataSourceGroupingImpl.FORMULA_COUNT, "em.em_id");
        dataSourceGroupingImpl.addCalculatedField(fieldDef);
        dataSourceGroupingImpl.addGroupByField(DV_TABLE, BU_ID, null);
        dataSourceGroupingImpl.addRestriction(Restrictions.isNotNull(DV_TABLE, BU_ID));
        return recordsToMap(dataSourceGroupingImpl.getRecords(), DV_BU_ID, "em.employee_count");
    }

    /**
     * Convert records to map.
     *
     * @param records records list
     * @param keyField key field
     * @param valueField value field
     * @return map
     */
    private Map<String, Double> recordsToMap(final List<DataRecord> records, final String keyField,
        final String valueField) {
        final Map<String, Double> result = new HashMap<String, Double>();
        for (final DataRecord record : records) {
            final String key = record.getString(keyField);
            final Double value = record.getDouble(valueField);
            result.put(key, value);
        }
        return result;
    }

}
