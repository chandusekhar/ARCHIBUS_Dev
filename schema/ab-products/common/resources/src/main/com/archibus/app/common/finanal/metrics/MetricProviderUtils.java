package com.archibus.app.common.finanal.metrics;

import java.math.*;
import java.util.*;

import org.apache.commons.lang.StringUtils;

import com.archibus.app.common.finanal.dao.IFinancialMetricDao;
import com.archibus.app.common.finanal.dao.datasource.*;
import com.archibus.app.common.finanal.domain.*;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.app.common.util.SchemaUtils;
import com.archibus.datasource.SqlUtils;
import com.archibus.service.Period;

/**
 * Utility class. Provides common methods for metric provider.
 * <p>
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public final class MetricProviderUtils {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private MetricProviderUtils() {

    }

    /**
     * Returns list with result fields for all metrics that are defined in activity parameter value.
     *
     * @param metricNames list with metric names.
     * @return List<String>
     */
    public static List<String> getCalculationFields(final List<String> metricNames) {
        final IFinancialMetricDao<FinancialMetric> financialMetricDataSource =
                new FinancialMetricDataSource();
        final List<String> fieldNames = new ArrayList<String>();
        final Iterator<String> itNames = metricNames.iterator();
        while (itNames.hasNext()) {
            final String metricName = itNames.next();
            final FinancialMetric metric = financialMetricDataSource.getByName(metricName);
            fieldNames.add(metric.getResultField());
        }
        return fieldNames;
    }

    /**
     * Load specified metric object.
     *
     * @param metricName metric name
     * @return FinancialMetric
     */
    public static FinancialMetric getMetricByName(final String metricName) {
        final IFinancialMetricDao<FinancialMetric> metricDao = new FinancialMetricDataSource();
        return metricDao.getByName(metricName);
    }

    /**
     * Returns asset types restriction for specified table.
     *
     * @param tableName table name
     * @param types list asset types
     * @return String
     */
    public static String getAssetTypeRestrictionForTable(final String tableName,
            final List<String> types) {
        final List<String> clauses = new ArrayList<String>();
        final boolean isBuilding = types.contains(AssetType.BUILDING.toString())
                && SchemaUtils.fieldExistsInSchema(tableName, Constants.BL_ID);
        final boolean isProperty = types.contains(AssetType.PROPERTY.toString())
                && SchemaUtils.fieldExistsInSchema(tableName, Constants.PR_ID);
        final boolean isProject = types.contains(AssetType.PROJECT.toString())
                && SchemaUtils.fieldExistsInSchema(tableName, Constants.PROJECT_ID);
        final boolean isEquipment = types.contains(AssetType.EQUIPMENT.toString())
                && SchemaUtils.fieldExistsInSchema(tableName, Constants.EQ_ID);

        if (isBuilding) {
            clauses.add(String.format(Constants.CLAUSE_IS_NOT_NULL, tableName, Constants.BL_ID));
        }

        if (isProperty) {
            clauses.add(String.format(Constants.CLAUSE_IS_NOT_NULL, tableName, Constants.PR_ID));
        }

        if (isProject) {
            clauses
                .add(String.format(Constants.CLAUSE_IS_NOT_NULL, tableName, Constants.PROJECT_ID));
        }

        if (isEquipment) {
            clauses.add(String.format(Constants.CLAUSE_IS_NOT_NULL, tableName, Constants.EQ_ID));
        }
        String result = null;
        if (clauses.isEmpty()) {
            result = "( 1=1 )";
        } else {
            result = "(" + StringUtils.join(clauses, Constants.OPERATOR_OR) + ")";
        }
        return result;
    }

    /**
     * Returns sql for sum formula of specified fields.
     *
     * @param tableName table name
     * @param fields fields to sum
     * @return String
     */
    public static String getSumFormulaForFields(final String tableName, final List<String> fields) {
        String formula = "";
        final Iterator<String> itFields = fields.iterator();
        while (itFields.hasNext()) {
            final String field = itFields.next();
            formula += (formula.isEmpty() ? "" : Constants.OPERATOR_PLUS) + tableName
                    + Constants.DOT + field;
        }
        return formula;
    }

    /**
     * Iterate on recurring period and execute sql statement.
     *
     * @param tableName table name
     * @param sqlStatement sql statement to execute
     * @param recurringPeriod recurring period
     * @param dateFrom start date
     * @param dateTo end date
     */
    public static void executeSql(final String tableName, final String sqlStatement,
            final Period recurringPeriod, final Date dateFrom, final Date dateTo) {
        recurringPeriod.iterate2(dateFrom, dateTo, new Period.Callback() {
            @Override
            public boolean call(final Date currentDate) {
                final int fiscalYear = DateUtils.getFiscalYearForDate(currentDate);
                final String sqlUpdateStatement = sqlStatement + " AND finanal_sum.fiscal_year = "
                        + SqlUtils.formatValueForSql(fiscalYear);
                SqlUtils.executeUpdate(tableName, sqlUpdateStatement);

                return true;
            }
        });
    }

    /**
     * Round double to specified scale.
     *
     * @param value double value
     * @param scale scale (number of decimals)
     * @return double
     */
    public static double round(final double value, final int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException();
        }

        BigDecimal bigDecimal = new BigDecimal(value);
        bigDecimal = bigDecimal.setScale(scale, RoundingMode.HALF_UP);
        return bigDecimal.doubleValue();
    }

    /**
     * Round value to specified scale.
     *
     * @param value double value
     * @param scale scale (number of decimals)
     * @return double
     */
    public static Object round(final Object value, final int scale) {
        if (scale < 0) {
            throw new IllegalArgumentException();
        }
        Object roundedValue = value;
        if (value instanceof Double) {
            BigDecimal bigDecimal = new BigDecimal(((Double) value).doubleValue());
            bigDecimal = bigDecimal.setScale(scale, RoundingMode.HALF_UP);
            roundedValue = Double.valueOf(bigDecimal.doubleValue());
        } else if (value instanceof Integer) {
            BigDecimal bigDecimal = new BigDecimal(((Integer) value).intValue());
            bigDecimal = bigDecimal.setScale(scale, RoundingMode.HALF_UP);
            roundedValue = Integer.valueOf(bigDecimal.intValue());
        }
        return roundedValue;
    }

    /**
     * Save calculated value to financial summary table.
     *
     * @param financialParameter financial parameter
     * @param collectDate collect date
     * @param fieldName field where to save the value
     * @param fieldValue calculated value
     */
    public static void saveToFinancialSummary(final FinancialAnalysisParameter financialParameter,
            final Date collectDate, final String fieldName, final int fieldValue) {
        saveToFinancialSummary(financialParameter, collectDate, fieldName,
            Integer.valueOf(fieldValue));
    }

    /**
     * Save calculated value to financial summary table.
     *
     * @param financialParameter financial parameter
     * @param collectDate collect date
     * @param fieldName field where to save the value
     * @param fieldValue calculated value
     */
    public static void saveToFinancialSummary(final FinancialAnalysisParameter financialParameter,
            final Date collectDate, final String fieldName, final double fieldValue) {
        saveToFinancialSummary(financialParameter, collectDate, fieldName,
            Double.valueOf(fieldValue));
    }

    /**
     * Save calculated value to financial summary table.
     *
     * @param financialParameter financial parameter
     * @param collectDate collect date
     * @param fieldName field where to save the value
     * @param fieldValue calculated value
     */
    public static void saveToFinancialSummary(final FinancialAnalysisParameter financialParameter,
            final Date collectDate, final String fieldName, final Object fieldValue) {
        final FinancialSummaryDataSource financialSummaryDataSource =
                new FinancialSummaryDataSource();
        final int collectYear = DateUtils.getFiscalYearForDate(collectDate);
        final Map<String, Object> values = getLocationForSummary(financialParameter);
        values.put(fieldName, fieldValue);
        financialSummaryDataSource.saveValueForAssetAndYear(financialParameter.getAssetType(),
            financialParameter.getAssetId(), collectYear, values);
    }

    /**
     * Save calculated value to financial summary lifecyle table.
     *
     * @param financialParameter financial parameter
     * @param collectDate collect date
     * @param metricName metric name
     * @param fieldValue calculated value
     */
    public static void saveToFinancialSummaryLifecycle(
            final FinancialAnalysisParameter financialParameter, final Date collectDate,
            final String metricName, final double fieldValue) {
        saveToFinancialSummaryLifecycle(financialParameter, collectDate, metricName,
            Double.valueOf(fieldValue));
    }

    /**
     * Save calculated value to financial summary lifecyle table.
     *
     * @param financialParameter financial parameter
     * @param collectDate collect date
     * @param metricName metric name
     * @param fieldValue calculated value
     */
    public static void saveToFinancialSummaryLifecycle(
            final FinancialAnalysisParameter financialParameter, final Date collectDate,
            final String metricName, final Object fieldValue) {
        final LifecycleSummaryDataSource lifecycleSummaryDataSource =
                new LifecycleSummaryDataSource();
        final int collectYear = DateUtils.getFiscalYearForDate(collectDate);
        final Map<String, Object> values = getLocationForSummaryLifecycle(financialParameter);
        values.put("metric_name", metricName);
        values.put("value", fieldValue);
        lifecycleSummaryDataSource.saveValueForAssetAndYear(financialParameter.getAssetType(),
            financialParameter.getAssetId(), metricName, collectYear, values);
    }

    /**
     * Returns map with asset location fields.
     *
     * @param financialParameter financial analysis parameter
     * @return Map<String, Object>
     */
    private static Map<String, Object> getLocationForSummaryLifecycle(
            final FinancialAnalysisParameter financialParameter) {
        final Map<String, Object> values = new HashMap<String, Object>();
        financialParameter.getAssetLocation();
        values.put(DbConstants.BL_ID, financialParameter.getBuildingCode());
        values.put(DbConstants.PR_ID, financialParameter.getPropertyCode());
        values.put(DbConstants.SITE_ID, financialParameter.getSiteCode());
        values.put(DbConstants.CTRY_ID, financialParameter.getCtryCode());
        return values;
    }

    /**
     * Returns map with asset location fields.
     *
     * @param financialParameter financial analysis parameter
     * @return Map<String, Object>
     */
    private static Map<String, Object> getLocationForSummary(
            final FinancialAnalysisParameter financialParameter) {
        final Map<String, Object> values = new HashMap<String, Object>();
        financialParameter.getAssetLocation();
        values.put(DbConstants.BL_ID, financialParameter.getBuildingCode());
        values.put(DbConstants.PR_ID, financialParameter.getPropertyCode());
        values.put(DbConstants.SITE_ID, financialParameter.getSiteCode());
        values.put(DbConstants.CITY_ID, financialParameter.getCityCode());
        values.put(DbConstants.STATE_ID, financialParameter.getStateCode());
        values.put(DbConstants.CTRY_ID, financialParameter.getCtryCode());
        return values;
    }
}
