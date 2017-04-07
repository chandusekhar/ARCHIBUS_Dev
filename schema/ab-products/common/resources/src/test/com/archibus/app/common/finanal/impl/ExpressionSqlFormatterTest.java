package com.archibus.app.common.finanal.impl;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for ExpressionSqlFormatter.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
@SuppressWarnings({ "PMD.SystemPrintln", "PMD.AvoidUsingSql" })
public class ExpressionSqlFormatterTest extends DataSourceTestBase {

    /**
     * test method for replaceBindingExpression.
     */
    public void testReplaceBindingExpression() {

        final String expression =
                "SELECT SUM ( finanal_params.cost_basis_for_deprec ) FROM  finanal_params WHERE ${sql.isInCurrentFiscalYear( 'finanal_params.date_purchased' )} AND( finanal_params.bl_id IS NOT NULL OR finanal_params.pr_id IS NOT NULL ) AND (${sql.isInPreviousFiscalYear( finanal_sum.fiscal_year )}) AND finanal_sum.fiscal_year = ${sql.currentFiscalYear}";
        final ExpressionSqlFormatter formatter = new ExpressionSqlFormatter();

        final String formattedExpression = formatter.replaceBindingExpressions(expression);

        System.out.println(formattedExpression);

    }

}
