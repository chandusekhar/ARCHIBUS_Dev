package com.archibus.app.common.finanal.dao.datasource;

import java.util.*;

import com.archibus.app.common.finanal.dao.IFinancialMatrixDao;
import com.archibus.app.common.finanal.domain.FinancialMatrix;
import com.archibus.app.common.finanal.impl.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * Financial matrix datasource object. Mapped to finanal_matrix database table.
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class FinancialMatrixDataSource extends ObjectDataSourceImpl<FinancialMatrix>
        implements IFinancialMatrixDao<FinancialMatrix> {

    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Fields common for all Cost DataSources are specified here.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { DbConstants.BOX_ID, "boxId" },
            { "date_last_calc", "dateLastCalc" }, { DbConstants.VALUE, DbConstants.VALUE },
            { "value_market", "valueMarket" }, { DbConstants.VALUE_CALC, "valueCalc" },
            { DbConstants.VALUE_CALC_MARKET, "valueCalcMarket" },
            { "value_display_decimals", "valueDisplayDecimals" },
            { "value_formatted", "valueFormatted" },
            { "value_market_formatted", "valueMarketFormatted" } };

    /**
     *
     * Constructor.
     */
    public FinancialMatrixDataSource() {
        super("financialMatrix", "finanal_matrix");
    }

    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }

    /** {@inheritDoc} */

    @Override
    public List<FinancialMatrix> getMatrixFields(final Restriction restriction) {
        final DataSource dataSource = this.createCopy();
        dataSource.addRestriction(restriction);
        final List<DataRecord> records = dataSource.getRecords();
        return new DataSourceObjectConverter<FinancialMatrix>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }

    /** {@inheritDoc} */

    @Override
    public List<FinancialMatrix> getMatrixFields(final Clause clause) {
        return getMatrixFields(Restrictions.and(new Clause[] { clause }));
    }

    /** {@inheritDoc} */

    @Override
    public double calculateFieldValue(final FinancialMatrix matrixField) {
        final DataSource dataSource = this.createCopy();
        final VirtualFieldDef vfFieldValue = new VirtualFieldDef(this.tableName,
            DbConstants.VF_VALUE_CALC, DataSource.DATA_TYPE_DOUBLE);
        final ExpressionSqlFormatter sqlFormatter = new ExpressionSqlFormatter();
        final String formattedSqlExpression =
                sqlFormatter.replaceBindingExpressions(matrixField.getValueCalc());
        final Map<String, String> sqlExpressions = new HashMap<String, String>();
        sqlExpressions.put(SqlExpressions.DIALECT_GENERIC, " (" + formattedSqlExpression + ") ");
        vfFieldValue.addSqlExpressions(sqlExpressions);
        dataSource.addCalculatedField(vfFieldValue);
        dataSource.addRestriction(
            Restrictions.eq(this.tableName, DbConstants.BOX_ID, matrixField.getBoxId()));
        final DataRecord record = dataSource.getRecord();
        return record.getDouble(this.tableName + DbConstants.DOT + DbConstants.VF_VALUE_CALC);
    }

    /** {@inheritDoc} */

    @Override
    public double calculateMarketFieldValue(final FinancialMatrix matrixField) {
        final DataSource dataSource = this.createCopy();
        final VirtualFieldDef vfMarketFieldValue = new VirtualFieldDef(this.tableName,
            DbConstants.VF_VALUE_CALC_MARKET, DataSource.DATA_TYPE_DOUBLE);
        final ExpressionSqlFormatter sqlFormatter = new ExpressionSqlFormatter();
        final String formattedSqlExpression =
                sqlFormatter.replaceBindingExpressions(matrixField.getValueCalcMarket());
        final Map<String, String> sqlExpressions = new HashMap<String, String>();
        sqlExpressions.put(SqlExpressions.DIALECT_GENERIC, "(" + formattedSqlExpression + ")");
        vfMarketFieldValue.addSqlExpressions(sqlExpressions);
        dataSource.addCalculatedField(vfMarketFieldValue);
        dataSource.addRestriction(
            Restrictions.eq(this.tableName, DbConstants.BOX_ID, matrixField.getBoxId()));
        final DataRecord record = dataSource.getRecord();
        return record
            .getDouble(this.tableName + DbConstants.DOT + DbConstants.VF_VALUE_CALC_MARKET);
    }
}
