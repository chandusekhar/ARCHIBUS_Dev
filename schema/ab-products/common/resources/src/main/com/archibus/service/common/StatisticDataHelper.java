package com.archibus.service.common;

import java.util.*;
import java.util.regex.*;

import org.json.JSONArray;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.ViewHandlers;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.AbstractViewFieldDef;
import com.archibus.model.view.datasource.*;
import com.archibus.model.view.datasource.converter.DataSourceRuntimeConverter;
import com.archibus.model.view.datasource.field.*;
import com.archibus.model.view.datasource.grouping.*;
import com.archibus.model.view.datasource.grouping.CalculatedFormulaFieldDef.SqlFormula;
import com.archibus.model.view.datasource.processor.DataSourceUnitsConverter;
import com.archibus.model.view.form.processor.AnalysisViewDefGenerator;
import com.archibus.schema.*;
import com.archibus.utility.StringUtil;

/**
 * Helper class for statistic data service.
 *
 * Calculate statistic data: minimum, maximum, average and totals.
 *
 * @author Ioan Draghici
 * @since 20.1
 *
 */
public class StatisticDataHelper {
    /**
     * Field name: counts.
     */
    static final String COUNT_FIELD = "count_of_records";

    /**
     * Constant: DOT.
     */
    static final String DOT = ".";

    /**
     * Control data source id.
     */
    static final String INPUT_DATA_SOURCE_ID = ViewHandlers.INPUT_DATA_SOURCE_ID;

    /**
     * Filter values.
     */
    static final String INPUT_FILTER_VALUES = ViewHandlers.INPUT_FILTER_VALUES;

    /**
     * Record limit.
     */
    static final String INPUT_RECORD_LIMIT = "recordLimit";

    /**
     * Restriction.
     */
    static final String INPUT_RESTRICTION = ViewHandlers.INPUT_RESTRICTION;

    /**
     * Show average.
     */
    static final String INPUT_SHOW_AVG = "showAvg";

    /**
     * Show counts.
     */
    static final String INPUT_SHOW_COUNTS = "showCounts";

    /**
     * Show max.
     */
    static final String INPUT_SHOW_MAX = "showMax";

    /**
     * Show min.
     */
    static final String INPUT_SHOW_MIN = "showMin";

    /**
     * Show totals.
     */
    static final String INPUT_SHOW_TOTALS = "showTotals";

    /**
     * Currency code.
     */
    static final String INPUT_CURRENCY_CODE = "currencyCode";
    
    /**
     * Exchange rate type.
     */
    static final String INPUT_EXCHANGE_RATE_TYPE = "exchangeRateType";
    
    /**
     * currency fields.
     */
    static final String INPUT_CURRENCY_FIELDS = "currencyFields";
    
    /**
     * Formula fields.
     */
    static final String INPUT_FORMULA_FIELDS = "formulaFields";
    
    /**
     * Formula values.
     */
    static final String INPUT_FORMULA_VALUES = "formulaValues";

    /**
     * Sort values.
     */
    static final String INPUT_SORT_VALUES = ViewHandlers.INPUT_SORT_VALUES;

    /**
     * Statistic fields.
     */
    static final String INPUT_STATISTIC_FIELDS = "statisticFields";

    /**
     * View name.
     */
    static final String INPUT_VIEW_NAME = ViewHandlers.INPUT_VIEW_NAME;

    /**
     * Parameter name.
     */
    static final String OUTPUT_AVERAGE = "average";

    /**
     * Parameter name.
     */
    static final String OUTPUT_MAXIMUM = "maximum";

    /**
     * Parameter name.
     */
    static final String OUTPUT_MINIMUM = "minimum";

    /**
     * Parameter name.
     */
    static final String OUTPUT_TOTALS = "totals";

    /**
     * Constant: UNDERSCORE.
     */
    static final String UNDERSCORE = "_";

    /**
     * If average values must be displayed.
     */
    private boolean isShowAvg;

    /**
     * If records number should be displayed.
     */
    private boolean isShowCounts;

    /**
     * If maximum values must be displayed.
     */
    private boolean isShowMax;

    /**
     * If minimum values must be displayed.
     */
    private boolean isShowMin;

    /**
     * If totals must be displayed.
     */
    private boolean isShowTotals;

    /**
     * Statistic fields list.
     */
    private List<String> statisticFields;

    /**
     * Currency code used for statistic rows.
     */
    private String currencyCode;
    
    /**
     * Exchange rate type used for statistic rows.
     */
    private String exchangeRateType;
    
    /**
     * Statistic fields list.
     */
    private List<String> currencyFields;
    
    /**
     * Statistic fields list.
     */
    private List<String> formulaFields;
    
    /**
     * Statistic fields list.
     */
    private List<String> formulaValues;
    
    /**
     * Get statistic data records.
     *
     * @param context event handler context
     * @return map object
     */
    public Map<String, DataRecord> getStatisticDataRecord(final EventHandlerContext context) {

        // read context parameters
        readContextParameters(context);
        // load data source from view
        final DataSource controlDataSource = getControlDataSource(context);
        // get data source definition
        final AbstractDataSourceDef controlDataSourceDef = controlDataSource.getDataSourceDef();
        // get main table name
        final String tableName = controlDataSourceDef.getMainTableName();
        // get sql query from control data source
        final String controlDsQuery = getSqlQuery(context, controlDataSource);

        final Map<String, DataRecord> result = new HashMap<String, DataRecord>();
        // get totals
        if (this.isShowTotals) {
            final DataRecord totals =
                    generateDataSourceAndGetData(controlDsQuery, controlDataSourceDef, tableName,
                        this.statisticFields, SqlFormula.SUM, "sum", this.isShowCounts);
            result.put(OUTPUT_TOTALS, totals);
        }

        // get max values
        if (this.isShowMax) {
            final DataRecord maximum =
                    generateDataSourceAndGetData(controlDsQuery, controlDataSourceDef, tableName,
                        this.statisticFields, SqlFormula.MAX, "max", this.isShowCounts);
            result.put(OUTPUT_MAXIMUM, maximum);
        }

        // get min values
        if (this.isShowMin) {
            final DataRecord minimum =
                    generateDataSourceAndGetData(controlDsQuery, controlDataSourceDef, tableName,
                        this.statisticFields, SqlFormula.MIN, "min", this.isShowCounts);
            result.put(OUTPUT_MINIMUM, minimum);
        }

        // get average values
        if (this.isShowAvg) {
            final DataRecord average =
                    generateDataSourceAndGetData(controlDsQuery, controlDataSourceDef, tableName,
                        this.statisticFields, SqlFormula.AVG, "avg", this.isShowCounts);
            result.put(OUTPUT_AVERAGE, average);
        }

        return result;
    }

    /**
     * Creates calculated field definition for specified base field.
     *
     * @param tableName table name
     * @param baseField base field
     * @param formula field formula
     * @param dataType field data type
     * @return field definition
     */
    private AbstractVirtualFieldDef createCalculatedFieldDef(final String tableName,
            final AbstractDataSourceFieldDef baseField, final SqlFormula formula,
            final AbstractViewFieldDef.DataType dataType) {

        AbstractVirtualFieldDef calculatedField = null;
        {
            final CalculatedFormulaFieldDef formulaField = new CalculatedFormulaFieldDef();
            formulaField.setBaseField(new ReferenceFieldDef(baseField.getFullName()));
            formulaField.setDataType(dataType);
            formulaField.setTableName(tableName);
            formulaField.setSqlFormula(formula);
            calculatedField = formulaField;
        }
        setCalculatedFieldDef(calculatedField, baseField, dataType);
        return calculatedField;
    }

    /**
     * Creates calculated field definition for specified base field using sql definition.
     *
     * @param tableName table name
     * @param baseField base field
     * @param formula field formula
     * @param dataType field data type
     * @param sqlFormula sql formula
     * @return field definition
     */
    private AbstractVirtualFieldDef createCalculatedSqlFieldDef(final String tableName,
            final AbstractDataSourceFieldDef baseField, final SqlFormula formula,
            final AbstractViewFieldDef.DataType dataType, final String sqlFormula) {
        
        AbstractVirtualFieldDef calculatedField = null;
        {
            final CalculatedSqlFieldDef formulaField = new CalculatedSqlFieldDef();
            formulaField.setDataType(dataType);
            formulaField.setTableName(tableName);
            final String formattedSqlFormula = formatSqlFormula(formula, sqlFormula);
            formulaField.getQueryDefs().add(new QueryDef(formattedSqlFormula));
            calculatedField = formulaField;
        }
        setCalculatedFieldDef(calculatedField, baseField, dataType);
        return calculatedField;
    }
    
    /**
     * Set calculated field def properties.
     *
     * @param calculatedField calculated field definition
     * @param baseField base field definition
     * @param dataType data type
     */
    private void setCalculatedFieldDef(final AbstractVirtualFieldDef calculatedField,
            final AbstractDataSourceFieldDef baseField, final AbstractViewFieldDef.DataType dataType) {
        if (baseField instanceof AbstractVirtualFieldDef) {
            // the base field is virtual - use its properties for calculated field
            final AbstractVirtualFieldDef virtualBaseField = (AbstractVirtualFieldDef) baseField;
            calculatedField.setSize(virtualBaseField.getSize());
            calculatedField.setDecimals(virtualBaseField.getDecimals());
            if (dataType == null) {
                calculatedField.setDataType(virtualBaseField.getDataType());
            }
            calculatedField.setTitle(virtualBaseField.getTitle());
            calculatedField.setNumericFormat(virtualBaseField.getNumericFormat());

        } else {
            // the base field is physical - use the schema field definition properties
            final ArchibusFieldDefBase.Immutable schemaFieldDef =
                    AnalysisViewDefGenerator.getSchemaFieldDef(baseField);
            AbstractViewFieldDef.DataType fieldType = dataType;
            if (dataType == null) {
                schemaFieldDef.getJavaType();
                // KB 3036283 IOAN Use double AVG can be double not integer on ORACLE and SYBASE
                fieldType = AbstractViewFieldDef.DataType.DOUBLE;
                // (fieldJavaTypeBaseImpl instanceof FieldJavaIntegerImpl) ?
                // AbstractViewFieldDef.DataType.DOUBLE
                // : AbstractViewFieldDef.DataType.DOUBLE;

            }
            calculatedField.setDataType(fieldType);
            calculatedField.setSize(schemaFieldDef.getSize());
            calculatedField.setDecimals(schemaFieldDef.getDecimals());
            calculatedField.setNumericFormat(schemaFieldDef.getNumericFormat());

            final String schemaFieldTitle =
                    AnalysisViewDefGenerator.getSchemaFieldTitle(schemaFieldDef);
            calculatedField.setTitle(schemaFieldTitle);
        }
    }
    
    /**
     * Format custom sql formula for totals.
     *
     * @param formula sql formula
     * @param custSqlFormula custom sql statement
     * @return string
     */
    private String formatSqlFormula(final SqlFormula formula, final String custSqlFormula) {
        String tmpSqlFormula = custSqlFormula;
        final Pattern fieldPattern = Pattern.compile("(([a-zA-Z_0-9.])+)");
        final Matcher matcher = fieldPattern.matcher(tmpSqlFormula);
        while (matcher.find()) {
            final String fieldName = matcher.group();
            tmpSqlFormula =
                    tmpSqlFormula.replace(fieldName, formula.toString() + "(" + fieldName + ")");
        }
        return tmpSqlFormula;
    }

    /**
     * Generate statistic data source and get statistic data.
     *
     * @param mainQuery control data source SQL query.
     * @param controlDataSourceDef control data source definition.
     * @param table table name.
     * @param fields statistic fields.
     * @param formula statistic formula.
     * @param fieldPrefix field prefix.
     * @param isShowCount if record counts should calculated.
     * @return data record object.
     */
    private DataRecord generateDataSourceAndGetData(final String mainQuery,
            final AbstractDataSourceDef controlDataSourceDef, final String table,
            final List<String> fields, final SqlFormula formula, final String fieldPrefix,
            final boolean isShowCount) {
        // get grouping data source definition
        final GroupingDataSourceDef statisticDataSourceDef =
                generateGroupingDataSourceDef(controlDataSourceDef, table, fields, formula,
                    fieldPrefix, isShowCount);
        String sqlQuery = "";
        if (StringUtil.isNullOrEmpty(this.currencyFields)) {
            sqlQuery = mainQuery;
        } else {
            sqlQuery = formatCurrencyFields(mainQuery, controlDataSourceDef, table);
        }
        // create grouping data source instance
        final DataSourceGroupingImpl statisticDataSource =
                (DataSourceGroupingImpl) DataSourceRuntimeConverter
                .toRuntime(statisticDataSourceDef);
        // add original sql query
        statisticDataSource.addQuery(sqlQuery);
        // get record
        final DataRecord statisticRecord = statisticDataSource.getRecord();
        // convert units
        DataSourceUnitsConverter.convertRecord(statisticRecord, statisticDataSource);

        return statisticRecord;
    }

    /**
     * Generate grouping data source definition.
     *
     * @param controlDataSourceDef control data source definition.
     * @param table table name.
     * @param fields statistic fields.
     * @param formula statistic formula.
     * @param fieldPrefix field prefix.
     * @param isShowCount if record counts should calculated.
     * @return grouping data source definition
     */
    private GroupingDataSourceDef generateGroupingDataSourceDef(
            final AbstractDataSourceDef controlDataSourceDef, final String table,
            final List<String> fields, final SqlFormula formula, final String fieldPrefix,
            final boolean isShowCount) {

        final GroupingDataSourceDef groupingDataSourceDef = new GroupingDataSourceDef();
        groupingDataSourceDef.setId(controlDataSourceDef.getId() + UNDERSCORE + fieldPrefix);
        groupingDataSourceDef.setMainTableName(table);
        groupingDataSourceDef.setTitle(controlDataSourceDef.getTitle());
        groupingDataSourceDef.setImplicit(true);
        groupingDataSourceDef.setApplyVpaRestrictions(controlDataSourceDef
            .getApplyVpaRestrictions());

        // add count field
        if (isShowCount) {
            final AbstractDataSourceFieldDef baseFieldDef =
                    controlDataSourceDef.getFieldDefs().get(0);
            final AbstractVirtualFieldDef countFieldDef =
                    createCalculatedFieldDef(table, baseFieldDef, SqlFormula.COUNT,
                        AbstractViewFieldDef.DataType.INTEGER);
            countFieldDef.setName(COUNT_FIELD);
            groupingDataSourceDef.addFieldDef(countFieldDef);
        }

        for (final String field : fields) {
            final String baseFieldName = table + DOT + field;
            final AbstractDataSourceFieldDef baseFieldDef =
                    controlDataSourceDef.findFieldDef(baseFieldName);
            AbstractVirtualFieldDef calculatedFieldDef = null;
            if (this.formulaFields.indexOf(field) == -1) {
                calculatedFieldDef = createCalculatedFieldDef(table, baseFieldDef, formula, null);
            } else {
                calculatedFieldDef =
                        createCalculatedSqlFieldDef(table, baseFieldDef, formula, null,
                            this.formulaValues.get(this.formulaFields.indexOf(field)));
            }
            
            calculatedFieldDef.setName(fieldPrefix + UNDERSCORE + baseFieldDef.getName());
            groupingDataSourceDef.addFieldDef(calculatedFieldDef);
        }

        return groupingDataSourceDef;
    }

    /**
     * Load control data source.
     *
     * @param context event handler context
     * @return data source object
     */
    private DataSource getControlDataSource(final EventHandlerContext context) {
        final String viewName = context.getString(INPUT_VIEW_NAME);
        final String dataSourceId = context.getString(INPUT_DATA_SOURCE_ID);
        return DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceId);
    }

    /**
     * Get sql query from control data source.
     *
     * @param context current context
     * @param dataSource control data source
     * @return sql query
     */
    private String getSqlQuery(final EventHandlerContext context, final DataSource dataSource) {

        // set max records.
        if (context.parameterExists(INPUT_RECORD_LIMIT)) {
            final int maxRecords = context.getInt(INPUT_RECORD_LIMIT);
            dataSource.setMaxRecords(maxRecords);
        }

        // get restriction
        String restriction = "";
        if (context.parameterExists(INPUT_RESTRICTION)) {
            restriction = context.getString(INPUT_RESTRICTION);
        }

        // sort values
        List<Object> sortValues = new ArrayList<Object>();
        if (context.parameterExists(INPUT_SORT_VALUES)) {
            final JSONArray jsonSortValues = context.getJSONArray(INPUT_SORT_VALUES);
            sortValues = ViewHandlers.fromJSONArray(jsonSortValues);
        }

        // filter values
        List<Object> filterValues = new ArrayList<Object>();
        if (context.parameterExists(INPUT_FILTER_VALUES)) {
            final JSONArray jsonFilterValues = context.getJSONArray(INPUT_FILTER_VALUES);
            filterValues = ViewHandlers.fromJSONArray(jsonFilterValues);
        }

        return dataSource.formatSqlQuery(restriction, sortValues, filterValues, false, true);
    }

    /**
     * Get statistic fields list.
     *
     * @param context event handler context
     * @param parameterName parameter name
     * @return fields list
     */
    private List<String> getStatisticFields(final EventHandlerContext context,
        final String parameterName) {
        final List<String> fields = new ArrayList<String>();
        if (context.parameterExists(parameterName)) {
            final JSONArray fieldsJSON = context.getJSONArray(parameterName);
            for (int index = 0; index < fieldsJSON.length(); index++) {
                final String fieldName = fieldsJSON.getString(index);
                fields.add(fieldName.substring(fieldName.indexOf('.') + 1));
            }
        }
        return fields;
    }

    /**
     * Format main query for currency fields.
     *
     * @param mainQuery sql query
     * @param controlDataSourceDef data source definition
     * @param table main table name
     * @return string
     */
    private String formatCurrencyFields(final String mainQuery,
            final AbstractDataSourceDef controlDataSourceDef, final String table) {
        String sqlQuery = mainQuery;
        for (final String currencyField : this.currencyFields) {
            final AbstractDataSourceFieldDef baseFieldDef =
                    controlDataSourceDef.findFieldDef(table + DOT + currencyField);
            final NumericFormat numericFormat = getNumericFormat(baseFieldDef);
            String sourceCurrency = "";
            if (NumericFormat.BUDGET_CURRENCY.equals(numericFormat)) {
                sourceCurrency = baseFieldDef.getTableName() + ".currency_budget";
            } else if (NumericFormat.PAYMENT_CURRENCY.equals(numericFormat)) {
                sourceCurrency = baseFieldDef.getTableName() + ".currency_payment";
            }
            final boolean isAliasRequired = !fieldHasAlias(sqlQuery, table + DOT + currencyField);
            final String bindingExpression =
                    table + DOT + currencyField + " * ${sql.exchangeRateFromField('"
                            + sourceCurrency + "','"
                            + this.currencyCode + "', '"
                            + this.exchangeRateType + "')}"
                            + (isAliasRequired ? " ${sql.as} " + currencyField : "");
            sqlQuery = sqlQuery.replace(table + DOT + currencyField, bindingExpression);
        }
        return sqlQuery;
    }
    
    /**
     * Get numeric format for base field.
     *
     * @param baseFieldDef base field
     * @return numeric format
     */
    private NumericFormat getNumericFormat(final AbstractDataSourceFieldDef baseFieldDef) {
        NumericFormat numericFormat;
        if (baseFieldDef instanceof AbstractVirtualFieldDef) {
            // the base field is virtual - use its properties for calculated field
            final AbstractVirtualFieldDef virtualBaseField = (AbstractVirtualFieldDef) baseFieldDef;
            numericFormat = virtualBaseField.getNumericFormat();
        } else {
            // the base field is physical - use the schema field definition properties
            final ArchibusFieldDefBase.Immutable schemaFieldDef =
                    AnalysisViewDefGenerator.getSchemaFieldDef(baseFieldDef);
            numericFormat = schemaFieldDef.getNumericFormat();
        }
        return numericFormat;
    }
    
    /**
     * Check if specified field has alias defined.
     *
     * @param query sql query
     * @param fieldName field name
     * @return boolean
     */
    private boolean fieldHasAlias(final String query, final String fieldName) {
        final String text = query.substring(query.indexOf(fieldName) + fieldName.length());
        return text.trim().indexOf(",") != 0;
    }

    /**
     * Read input parameters from context.
     *
     * @param context event handler context.
     */
    private void readContextParameters(final EventHandlerContext context) {
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        // show counts
        if (context.parameterExists(INPUT_SHOW_COUNTS)) {
            this.isShowCounts = context.getBoolean(INPUT_SHOW_COUNTS);
        }

        // show totals
        if (context.parameterExists(INPUT_SHOW_TOTALS)) {
            this.isShowTotals = context.getBoolean(INPUT_SHOW_TOTALS);
        }

        // show max
        if (context.parameterExists(INPUT_SHOW_MAX)) {
            this.isShowMax = context.getBoolean(INPUT_SHOW_MAX);
        }

        // show min
        if (context.parameterExists(INPUT_SHOW_MIN)) {
            this.isShowMin = context.getBoolean(INPUT_SHOW_MIN);
        }

        // show avg
        if (context.parameterExists(INPUT_SHOW_AVG)) {
            this.isShowAvg = context.getBoolean(INPUT_SHOW_AVG);
        }
        
        if (isMcAndVatEnabled) {
            if (context.parameterExists(INPUT_CURRENCY_CODE)) {
                this.currencyCode = context.getString(INPUT_CURRENCY_CODE);
            }
            // show currency code
            if (context.parameterExists(INPUT_EXCHANGE_RATE_TYPE)) {
                this.exchangeRateType = context.getString(INPUT_EXCHANGE_RATE_TYPE);
            }

            this.currencyFields = getStatisticFields(context, INPUT_CURRENCY_FIELDS);
        }
        // show currency code

        this.statisticFields = getStatisticFields(context, INPUT_STATISTIC_FIELDS);
        this.formulaFields = getStatisticFields(context, INPUT_FORMULA_FIELDS);
        this.formulaValues = getStatisticFields(context, INPUT_FORMULA_VALUES);

    }
}
