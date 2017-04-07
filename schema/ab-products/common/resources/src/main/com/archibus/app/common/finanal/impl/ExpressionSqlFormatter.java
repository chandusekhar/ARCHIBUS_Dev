package com.archibus.app.common.finanal.impl;

import java.text.MessageFormat;
import java.util.Date;

import com.archibus.app.common.util.SchemaUtils;
import com.archibus.datasource.SqlUtils;
import com.archibus.schema.ArchibusFieldDefBase;

/**
 * Provides methods to replace sql binding expression.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class ExpressionSqlFormatter {
    /**
     * Constant.
     */
    private static final String DOT = ".";

    /**
     * Constant.
     */
    private static final String CLOSE_CURLY_BRACKET = "}";

    /**
     * Constant.
     */
    private static final String OPEN_ROUND_BRACKET = "(";

    /**
     * Constant.
     */
    private static final String CLOSE_ROUND_BRACKET = ")";

    /**
     * Constant.
     */
    private static final String DOLLAR = "$";

    /**
     * Constant.
     */
    private static final String EXPR_CURRENT_FISCAL_YEAR = "currentFiscalYear";

    /**
     * Constant.
     */
    private static final String EXPR_IS_IN_CURRENT_FISCAL_YEAR = "isInCurrentFiscalYear";

    /**
     * Constant.
     */
    private static final String EXPR_IS_IN_PREVIOUS_FISCAL_YEAR = "isInPreviousFiscalYear";

    /**
     * Replace binding expression and returns formatted expression.
     *
     * @param expression expression that contains binding expression.
     * @return String
     */
    public String replaceBindingExpressions(final String expression) {
        String formattedExpression = expression;
        while (formattedExpression.indexOf(DOLLAR) != -1) {
            final int start = formattedExpression.indexOf(DOLLAR);
            final int end = formattedExpression.indexOf(CLOSE_CURLY_BRACKET, start) + 1;
            final String bindingExpression = formattedExpression.substring(start, end);
            final String replacement = processExpression(bindingExpression);
            formattedExpression = formattedExpression.substring(0, start) + replacement
                    + formattedExpression.substring(end);
        }
        return formattedExpression;
    }

    /**
     * Returns fiscal year for current system date.
     *
     * @return String
     */
    public String currentFiscalYear() {
        final Object value = DateUtils.getCurrentFiscalYear();
        return SqlUtils.formatValueForSql(value);
    }

    /**
     * Format isInCurrentFiscalYear expression.
     *
     * @param fieldName field name
     * @return String
     */
    public String isInCurrentFiscalYear(final String fieldName) {
        String result = null;
        final int fiscalYear = DateUtils.getCurrentFiscalYear();
        if (isDateTimeType(fieldName)) {
            final Date dateFrom = DateUtils.getFiscalYearStartDate(fiscalYear);
            final Date dateTo = DateUtils.getFiscalYearEndDate(fiscalYear);
            result = isDateBetweenLimits(fieldName, dateFrom, dateTo);
        } else {
            result = isIntegerInLimits(fieldName, fiscalYear);
        }
        return result;
    }

    /**
     * Format isInPreviousFiscalYear expression.
     *
     * @param fieldName field name
     * @return String
     */
    public String isInPreviousFiscalYear(final String fieldName) {
        String result = null;
        final int fiscalYear = DateUtils.getCurrentFiscalYear() - 1;
        if (isDateTimeType(fieldName)) {
            final Date dateFrom = DateUtils.getFiscalYearStartDate(fiscalYear);
            final Date dateTo = DateUtils.getFiscalYearEndDate(fiscalYear);
            result = isDateBetweenLimits(fieldName, dateFrom, dateTo);
        } else {
            result = isIntegerInLimits(fieldName, fiscalYear);
        }
        return result;
    }

    /**
     * Format expression for date field between dates.
     *
     * @param fieldName field name
     * @param dateFrom date start
     * @param dateTo date end
     * @return String
     */
    private String isDateBetweenLimits(final String fieldName, final Date dateFrom,
            final Date dateTo) {
        return MessageFormat.format("( {0} >= {1} AND {0} <= {2} )", fieldName,
            SqlUtils.formatValueForSql(dateFrom), SqlUtils.formatValueForSql(dateTo));
    }

    /**
     * Check if field is integer type.
     *
     * @param fullFieldName field name
     * @return boolean
     */
    private boolean isDateTimeType(final String fullFieldName) {
        final int indexOfDot = fullFieldName.indexOf(DOT);
        final String tableName = fullFieldName.substring(0, indexOfDot);
        final String fieldName = fullFieldName.substring(indexOfDot + 1);
        final ArchibusFieldDefBase.Immutable fieldDef =
                SchemaUtils.getFieldDef(tableName, fieldName);
        return fieldDef.isDateTimeType();
    }

    /**
     * Format between limits for integer field. Typically is integer field is in given fiscal year.
     *
     * @param fieldName field name
     * @param value value
     * @return string
     */
    private String isIntegerInLimits(final String fieldName, final Object value) {
        return MessageFormat.format("{0} = {1} ", fieldName, SqlUtils.formatValueForSql(value));
    }

    /**
     * Process binding expression.
     *
     * @param expression binding expression
     * @return String
     */
    private String processExpression(final String expression) {
        final String functionName = getFunctionName(expression);
        String replacement = "";
        if (EXPR_CURRENT_FISCAL_YEAR.equals(functionName)) {
            replacement = currentFiscalYear();
        } else if (EXPR_IS_IN_CURRENT_FISCAL_YEAR.equals(functionName)) {
            final String argument = getFunctionArgument(expression);
            replacement = isInCurrentFiscalYear(argument);
        } else if (EXPR_IS_IN_PREVIOUS_FISCAL_YEAR.equals(functionName)) {
            final String argument = getFunctionArgument(expression);
            replacement = isInPreviousFiscalYear(argument);
        }
        return replacement;
    }

    /**
     * Extract function name from current binding expression.
     *
     * @param expression binding expression
     * @return String
     */
    private String getFunctionName(final String expression) {
        final int endIndex = expression.indexOf(OPEN_ROUND_BRACKET) == -1
                ? expression.indexOf(CLOSE_CURLY_BRACKET) : expression.indexOf(OPEN_ROUND_BRACKET);
        return expression.substring(expression.indexOf(DOT) + 1, endIndex);
    }

    /**
     * Return function argument - typically full field name.
     *
     *
     * @param expression binding expression
     * @return String
     */
    private String getFunctionArgument(final String expression) {
        String argument = expression.substring(expression.indexOf(OPEN_ROUND_BRACKET) + 1,
            expression.indexOf(CLOSE_ROUND_BRACKET));
        argument = argument.trim();
        argument = argument.replace("'", "");
        return argument;
    }

}
