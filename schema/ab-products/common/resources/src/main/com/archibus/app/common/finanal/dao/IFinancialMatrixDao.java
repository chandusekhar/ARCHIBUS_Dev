package com.archibus.app.common.finanal.dao;

import java.util.List;

import com.archibus.core.dao.IDao;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;

/**
 * DAO for financial analysis matrix. Mapped to finanal_matrix database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <FinancialMatrix> type of the persistent object
 */
public interface IFinancialMatrixDao<FinancialMatrix> extends IDao<FinancialMatrix> {

    /**
     * Returns list of financial matrix fields for specified restriction.
     *
     * @param restriction restriction
     * @return List<FinancialMatrix>
     */
    List<FinancialMatrix> getMatrixFields(final Restriction restriction);

    /**
     * Returns list of financial matrix fields for specified restriction.
     *
     * @param clause restriction clause
     * @return List<FinancialMatrix>
     */
    List<FinancialMatrix> getMatrixFields(final Clause clause);

    /**
     * Query field value for specified matrix field.
     *
     * @param matrixField financial matrix field
     * @return double
     */
    double calculateFieldValue(final FinancialMatrix matrixField);

    /**
     * Query market field value for specified matrix field.
     *
     * @param matrixField financial matrix field
     * @return double
     */
    double calculateMarketFieldValue(final FinancialMatrix matrixField);
}
