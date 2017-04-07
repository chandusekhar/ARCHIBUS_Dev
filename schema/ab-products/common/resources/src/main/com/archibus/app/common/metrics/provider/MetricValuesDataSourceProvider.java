package com.archibus.app.common.metrics.provider;

import java.util.*;
import java.util.regex.*;

import com.archibus.app.common.metrics.*;
import com.archibus.app.common.metrics.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.*;
import com.archibus.utility.expr.ExpressionContext;

/**
 * Metric values data source provider.
 *
 * @author Ioan Draghici
 * @since 21.2
 */
public class MetricValuesDataSourceProvider implements MetricValuesProvider {
    /**
     * Constant field name for metric value.
     */
    private static final String METRIC_VALUE_FIELD = "metric_value";

    /**
     * Metric definition.
     */
    private Metric metric;

    /**
     * Metric granularity.
     */
    private Granularity metricGranularity;

    /**
     * Collect period start date - inclusive.
     */
    private Date collectFromDate;

    /**
     * Collect period end date - exclusive.
     */
    private Date collectToDate;

    /**
     * Main table name.
     */
    private String mainTableName;

    /**
     * Array with standard table names.
     */
    private List<String> standardTables;

    /**
     * List with required fields.
     */
    private List<String> requiredFields;

    /**
     * List with required additional fields.
     */
    private List<String> additionalFields;

    /**
     * List with grouping fields.
     */
    private List<String> groupingFields;

    /**
     * Metric dataSource.
     */
    private DataSourceGroupingImpl dataSource;

    /**
     * Setter for metric object.
     *
     * @param metric the metric to set
     */
    @Override
    public void setMetric(final Metric metric) {
        this.metric = metric;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Map<String, Double> getValues(final Granularity granularity, final Date fromDate,
            final Date toDate) throws ExceptionBase {
        this.metricGranularity = granularity;
        this.collectFromDate = fromDate;
        if (StringUtil.notNullOrEmpty(toDate) && !fromDate.equals(toDate)) {
            this.collectToDate = toDate;
        }
        try {
            // initialize schema elements - tables and fields
            initializeSchemaElements();
            // generate data source
            generateGroupingDataSource();
            // set data source restriction
            setDataSourceRestriction();
            // get metric values
            return getMetricValues();
        } catch (final ExceptionBase originalException) {
            final ExceptionBase newException = ExceptionBaseFactory.newTranslatableException(
                Messages.ERROR_GENERIC_MESSAGE, new Object[] { this.metric.getTitle() });
            newException.setStackTrace(originalException.getStackTrace());
            throw newException;
        }
    }

    /**
     * Create grouping datasource object.
     */
    private void generateGroupingDataSource() {
        this.dataSource = new DataSourceGroupingImpl();
        // add main table
        this.dataSource.addTable(this.mainTableName, DataSource.ROLE_MAIN);

        if (!this.metricGranularity.isFieldPresent()) {
            final MetricValuesQueryBuilder metricValuesQueryBuilder = new MetricValuesQueryBuilder(
                this.mainTableName, this.standardTables, this.requiredFields, this.additionalFields,
                this.groupingFields, this.metric.getWhereClause());
            metricValuesQueryBuilder.buildQuery();
            final String sqlQuery = metricValuesQueryBuilder.getQuery();
            this.dataSource.addQuery(sqlQuery);
        }

        // add required fields
        for (final String requiredField : this.requiredFields) {
            if (SchemaUtilities.isValidTableField(this.mainTableName, requiredField)) {
                this.dataSource.addField(this.mainTableName, requiredField);
            } else {
                this.dataSource.addVirtualField(this.mainTableName, requiredField,
                    DataSource.DATA_TYPE_TEXT);
            }
        }

        // add group by fields
        for (final String groupByField : this.groupingFields) {
            // if is defined as full name, remove table name
            final String shortFieldName = SchemaUtilities.getShortFieldName(groupByField);
            if (SchemaUtilities.isValidTableField(this.mainTableName, shortFieldName)) {
                this.dataSource.addField(this.mainTableName, shortFieldName);
                this.dataSource.addGroupByField(this.mainTableName, shortFieldName, null);
            } else {
                this.dataSource.addVirtualField(this.mainTableName, shortFieldName,
                    DataSource.DATA_TYPE_TEXT);
                this.dataSource.addGroupByField(this.mainTableName, shortFieldName,
                    DataSource.DATA_TYPE_TEXT);
            }
        }

        // add formula field
        final VirtualFieldDef fieldDef = getCalculatedField();
        this.dataSource.addCalculatedField(fieldDef);

    }

    /**
     * Set data source restriction. Where statement and time restriction.
     */
    private void setDataSourceRestriction() {
        // add where restriction
        if (this.metricGranularity.isFieldPresent()
                && StringUtil.notNullOrEmpty(this.metric.getWhereClause())) {
            this.dataSource.addRestriction(Restrictions.sql(this.metric.getWhereClause()));
        }

        // add date restriction
        if (StringUtil.notNullOrEmpty(this.metric.getStartDateField())) {
            addDateRestriction();
        }
    }

    /**
     * Add date restriction.
     *
     */
    private void addDateRestriction() {
        final boolean isDateEndField = StringUtil.notNullOrEmpty(this.metric.getEndDateField());
        final boolean isTimeInterval = StringUtil.notNullOrEmpty(this.collectFromDate)
                && StringUtil.notNullOrEmpty(this.collectToDate);

        if (isTimeInterval) {
            if (isDateEndField) {
                this.dataSource.addRestriction(Restrictions.or(
                    Restrictions.lte(this.mainTableName, this.metric.getStartDateField(),
                        this.collectToDate),
                    Restrictions.gt(this.mainTableName, this.metric.getEndDateField(),
                        this.collectFromDate)));
            } else {
                this.dataSource.addRestriction(Restrictions.and(
                    Restrictions.lte(this.mainTableName, this.metric.getStartDateField(),
                        this.collectToDate),
                    Restrictions.gt(this.mainTableName, this.metric.getStartDateField(),
                        this.collectFromDate)));
            }
        } else {
            if (isDateEndField) {
                this.dataSource.addRestriction(Restrictions.or(
                    Restrictions.eq(this.mainTableName, this.metric.getStartDateField(),
                        this.collectFromDate),
                    Restrictions.eq(this.mainTableName, this.metric.getEndDateField(),
                        this.collectFromDate)));
            } else {
                this.dataSource.addRestriction(Restrictions.eq(this.mainTableName,
                    this.metric.getStartDateField(), this.collectFromDate));
            }
        }
    }

    /**
     * Initialize and validate schema elements: tables and fields.
     */
    private void initializeSchemaElements() {
        // main table name
        this.mainTableName = this.metric.getCollectTable();
        // initialize standard tables tables
        if (StringUtil.notNullOrEmpty(this.metricGranularity.getRequiredTables())) {
            this.standardTables = Arrays
                .asList(this.metricGranularity.getRequiredTables().split(Constants.SEMICOLON));
        } else {
            this.standardTables = new ArrayList<String>();
        }
        // initialize grouping fields
        this.groupingFields = Constants.PORTFOLIO.equals(this.metricGranularity.getGroupByFields())
                ? new ArrayList<String>()
                : Arrays
                    .asList(this.metricGranularity.getGroupByFields().split(Constants.SEMICOLON));
        // initialize required fields
        this.requiredFields = new ArrayList<String>();
        if (!Constants.PORTFOLIO.equals(this.metricGranularity.getGroupByFields())) {
            this.requiredFields.addAll(Arrays
                .asList(this.metricGranularity.getRequiredFields().split(Constants.SEMICOLON)));
        }

        // add other required fields from collect table that are used in collect formula when
        // fields_present= NO
        // and metric is defined with custom query
        this.additionalFields = new ArrayList<String>();
        if (!this.metricGranularity.isFieldPresent()) {
            this.additionalFields = getAdditionalFields();
        }
    }

    /**
     * Get all additional fields that must be included in custom query.
     *
     * @return list with field names
     */
    private List<String> getAdditionalFields() {
        final List<String> fields = new ArrayList<String>();
        final List<String> tableFields = SchemaUtilities.getTableFields(this.mainTableName);
        // replace binding expression if exist in collectFormula and Where Clause
        // and find all fields that are used
        // undocumented core API
        final ExpressionContext expressionContext =
                new ExpressionContext(new HashMap(), ContextStore.get().getDatabase());
        final String evaluatedFormula =
                expressionContext.evaluateExpressions(this.metric.getFormula(), false);
        final String evaluatedWhereClause =
                expressionContext.evaluateExpressions(this.metric.getWhereClause(), false);
        for (final String field : tableFields) {
            final boolean isExistingField =
                    this.groupingFields.contains(field) || this.requiredFields.contains(field);
            final boolean isCollectField =
                    this.metric.isFieldName() && field.equals(this.metric.getCollectField());
            final boolean isDateField = field.equals(this.metric.getStartDateField())
                    || field.equals(this.metric.getEndDateField());
            final boolean isRequiredField =
                    fieldIsUsed(field, evaluatedFormula, evaluatedWhereClause);
            if (!isExistingField && (isCollectField || isDateField || isRequiredField)) {
                fields.add(field);
            }
        }
        return fields;
    }

    /**
     * Create calculated field.
     *
     * @return virtual field definition
     */
    private VirtualFieldDef getCalculatedField() {
        VirtualFieldDef fieldDef = null;
        final String aggregateFormula = getAggregateFormula(this.metric.getAggregateAs());
        if (this.metric.isFieldName() && aggregateFormula.length() > 0) {
            fieldDef = new VirtualFieldDef(this.mainTableName, METRIC_VALUE_FIELD,
                DataSource.DATA_TYPE_NUMBER, aggregateFormula,
                this.mainTableName + Constants.DOT + this.metric.getCollectField());
        } else {
            final String sqlFormula = aggregateFormula + "( " + this.metric.getFormula() + ")";
            final Map<String, String> sqlExpressions = new HashMap<String, String>();
            sqlExpressions.put("generic", sqlFormula);
            fieldDef = new VirtualFieldDef(this.mainTableName, METRIC_VALUE_FIELD,
                DataSource.DATA_TYPE_NUMBER);
            fieldDef.addSqlExpressions(sqlExpressions);
        }
        return fieldDef;
    }

    /**
     * Get aggregate formula.
     *
     * @param aggregateAs aggregate as
     * @return String
     */
    private String getAggregateFormula(final String aggregateAs) {
        String result = null;
        if (Constants.AGGREGATE_AS_SUM.equals(aggregateAs)) {
            result = DataSourceGroupingImpl.FORMULA_SUM;
        } else if (Constants.AGGREGATE_AS_AVG.equals(aggregateAs)) {
            result = DataSourceGroupingImpl.FORMULA_AVG;
        } else if (Constants.AGGREGATE_AS_MAX.equals(aggregateAs)) {
            result = DataSourceGroupingImpl.FORMULA_MAX;
        } else if (Constants.AGGREGATE_AS_MIN.equals(aggregateAs)) {
            result = DataSourceGroupingImpl.FORMULA_MIN;
        } else if (Constants.AGGREGATE_AS_COUNT.equals(aggregateAs)) {
            result = DataSourceGroupingImpl.FORMULA_COUNT;
        } else if (Constants.NONE.equals(aggregateAs)) {
            result = "";
        }
        return result;
    }

    /**
     * Returns metric values.
     *
     * @return Map<String, Double> - groupByValue, value
     * @throws ExceptionBase exception
     */
    private Map<String, Double> getMetricValues() throws ExceptionBase {
        final Map<String, Double> result = new HashMap<String, Double>();
        final List<DataRecord> records = this.dataSource.getRecords();
        if (StringUtil.isNullOrEmpty(records)) {
            // prepare error message
            final ExceptionBase newException = ExceptionBaseFactory.newTranslatableException(
                Messages.ERROR_NO_DATA_AVAILABLE, new Object[] { this.metric.getTitle() });
            throw newException;
        }
        for (final DataRecord record : records) {
            final String groupByValue = getValue(record, this.mainTableName, this.groupingFields);
            final Double metricValue =
                    record.getDouble(this.mainTableName + Constants.DOT + METRIC_VALUE_FIELD);
            result.put(groupByValue, metricValue);
        }
        return result;
    }

    /**
     * Returns string value with concatenated field values.
     *
     * @param record data record
     * @param tableName table name
     * @param fields field names
     * @return string
     */
    private String getValue(final DataRecord record, final String tableName,
            final List<String> fields) {
        String result = "";
        for (final String field : fields) {
            final String shortName = SchemaUtilities.getShortFieldName(field);
            final String value = record.getString(tableName + Constants.DOT + shortName);
            if (StringUtil.notNullOrEmpty(value)) {
                result += value + Constants.SEMICOLON;
            } else {
                result += Constants.NULL + Constants.SEMICOLON;
            }
        }
        if (result.length() > 0) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }

    /**
     * Check if specified field is used in collect formula or where clause.
     *
     * @param fieldName field name
     * @param formula metric formula SQL
     * @param whereClause metric where clause
     * @return boolean
     */
    private boolean fieldIsUsed(final String fieldName, final String formula,
            final String whereClause) {
        boolean result = false;
        final String pattern = String.format(Constants.REGEX_FIELD_PATTERN_TEMPLATE, fieldName,
            fieldName, fieldName);
        final Pattern regEx = Pattern.compile(pattern);
        if (StringUtil.notNullOrEmpty(formula)) {
            // test against collect formula
            final Matcher matchFormula = regEx.matcher(formula);
            result = matchFormula.find();
        }
        if (StringUtil.notNullOrEmpty(whereClause)) {
            // test against where clause
            final Matcher matchWhere = regEx.matcher(whereClause);
            result = result || matchWhere.find();
        }
        return result;
    }

}
