package com.archibus.app.common.metrics.provider;

import java.util.List;

import com.archibus.app.common.metrics.*;
import com.archibus.utility.StringUtil;

/**
 * Construct custom sql query for granularities that have field_present = No.
 *
 * @author Ioan Draghici
 * @since 21.2
 *        <p>
 *
 *        SuppressWarning Justification
 *        <li><code>PMD.AvoidUsingSql</code> This class is SQL query builder.
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class MetricValuesQueryBuilder {
    /**
     * Select form pattern.
     */
    private static final String SELECT_FROM_PATTERN = " SELECT %s FROM %s ";

    /**
     * Field pattern: table_name.field_name AS field_name.
     */
    private static final String FIELD_PATTERN = " %s ${sql.as} %s, ";

    /**
     * Left outer join pattern.
     */
    private static final String LEFT_OUTER_JOIN_PATTERN = " LEFT OUTER JOIN %s ON %s ";

    /**
     * Where clause pattern.
     */
    private static final String WHERE_PATTERN = " WHERE %s ";

    /**
     * Constant.
     */
    private static final String EQUAL = " = ";

    /**
     * Constant.
     */
    private static final String AND = " AND ";

    /**
     * Main table name.
     */
    private final String mainTableName;

    /**
     * List with standard table names.
     */
    private final List<String> standardTableNames;

    /**
     * List with required fields name.
     */
    private final List<String> requiredFields;

    /**
     * List with required additional fields name.
     */
    private final List<String> additionalFields;

    /**
     * List with group by fields name.
     */
    private final List<String> groupByFields;

    /**
     * Metric where clause.
     */
    private final String whereCondition;

    /**
     * Select from string.
     */
    private String selectFrom;

    /**
     * Left outer join string.
     */
    private String leftOuterJoin;

    /**
     * Where clause statement.
     */
    private String whereClause;

    /**
     * Constructor.
     *
     * @param mainTable main table name
     * @param requiredTables required tables
     * @param requiredFields required fields
     * @param additionalFields additional field
     * @param groupingFields grouping fields
     * @param where metric where clause
     */
    public MetricValuesQueryBuilder(final String mainTable, final List<String> requiredTables,
            final List<String> requiredFields, final List<String> additionalFields,
            final List<String> groupingFields, final String where) {
        this.mainTableName = mainTable;
        this.standardTableNames = requiredTables;
        this.requiredFields = requiredFields;
        this.additionalFields = additionalFields;
        this.groupByFields = groupingFields;
        this.whereCondition = where;

    }

    /**
     * Build custom query parts.
     */
    public void buildQuery() {
        // build select from statement
        buildSelectStatement();
        // build join condition
        buildJoinCondition();
        // build where clause
        buildWhereClause();
    }

    /**
     * Assemble sql query from select from statement , left join condition(s) and where clause.
     *
     * @return sql query
     */
    public String getQuery() {
        String result = this.selectFrom;
        if (StringUtil.notNullOrEmpty(this.leftOuterJoin)) {
            result += this.leftOuterJoin;
        }
        if (StringUtil.notNullOrEmpty(this.whereClause)) {
            result += this.whereClause;
        }
        return result;
    }

    /**
     * Build select from part.
     *
     */
    private void buildSelectStatement() {
        final String selectFields = getSelectFieldsSql();
        this.selectFrom = String.format(SELECT_FROM_PATTERN, selectFields, this.mainTableName);
    }

    /**
     * Construct LEFT OUTER JOIN part.
     */
    private void buildJoinCondition() {
        this.leftOuterJoin = "";
        for (final String tableName : this.standardTableNames) {
            if (!tableName.equals(this.mainTableName)) {
                String onCondition = "";
                for (final String fieldName : this.requiredFields) {
                    if (SchemaUtilities.isValidTableField(tableName, fieldName)) {
                        final String relatedTable =
                                getRelatedTableForFieldAndTable(tableName, fieldName);
                        onCondition +=
                                AND + tableName + Constants.DOT + fieldName + EQUAL + relatedTable
                                + Constants.DOT + fieldName;
                    }
                }
                // remove first AND
                onCondition = onCondition.substring(AND.length());
                this.leftOuterJoin +=
                        String.format(LEFT_OUTER_JOIN_PATTERN, tableName, onCondition);
            }
        }
    }

    /**
     * Build where clause if is defined.
     */
    private void buildWhereClause() {
        if (StringUtil.notNullOrEmpty(this.whereCondition)) {
            this.whereClause = String.format(WHERE_PATTERN, this.whereCondition);
        }
    }

    /**
     * Construct fields part from select query.
     *
     * @return string
     */
    private String getSelectFieldsSql() {
        String result = "";
        for (final String field : this.groupByFields) {
            result += getSelectFieldSql(field);
        }
        for (final String field : this.requiredFields) {
            if (!this.groupByFields.contains(field)) {
                result += getSelectFieldSql(field);
            }
        }
        for (final String field : this.additionalFields) {
            if (!this.groupByFields.contains(field) || !this.requiredFields.contains(field)) {
                result += getSelectFieldSql(field);
            }
        }
        // remove last comma
        return result.substring(0, result.lastIndexOf(','));
    }

    /**
     * Get sql statement for select field.
     *
     * @param field field name
     * @return sql
     */
    private String getSelectFieldSql(final String field) {
        String result = "";
        if (field.indexOf(Constants.DOT) == -1) {
            final String table =
                    getTableNameForField(field, this.mainTableName, this.standardTableNames);
            if (StringUtil.notNullOrEmpty(table)) {
                result = String.format(FIELD_PATTERN, table + Constants.DOT + field, field);
            }
        } else {
            // is defined with table name
            result =
                    String.format(FIELD_PATTERN, field,
                        field.substring(field.indexOf(Constants.DOT) + 1));
            
        }
        return result;
    }

    /**
     * Returns table name for specified field name.
     *
     * @param fieldName field name
     * @param mainTable main table name
     * @param standardTables standard tables
     * @return string
     */
    private String getTableNameForField(final String fieldName, final String mainTable,
            final List<String> standardTables) {
        String tableName = null;
        if (SchemaUtilities.isValidTableField(mainTable, fieldName)) {
            tableName = mainTable;
        }
        if (StringUtil.isNullOrEmpty(tableName) && StringUtil.notNullOrEmpty(standardTables)
                && !standardTables.isEmpty()) {
            for (final String table : standardTables) {
                if (SchemaUtilities.isValidTableField(table, fieldName)) {
                    tableName = table;
                    break;
                }
            }
        }
        return tableName;
    }

    /**
     * Return related tabled for field and table.
     *
     * @param tableName table name , current standard table
     * @param fieldName field name
     * @return string
     */
    private String getRelatedTableForFieldAndTable(final String tableName, final String fieldName) {
        String result = "";
        if (SchemaUtilities.isValidTableField(this.mainTableName, fieldName)) {
            result = this.mainTableName;
        } else {
            for (final String table : this.standardTableNames) {
                if (!tableName.equals(table) && SchemaUtilities.isValidTableField(table, fieldName)) {
                    result = table;
                }
            }
        }
        return result;
    }

}
