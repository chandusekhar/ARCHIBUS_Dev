package com.archibus.app.common.finanal.metrics;

import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.RecurringCostDataSource;
import com.archibus.app.common.finance.domain.RecurringCost;
import com.archibus.jobmanager.JobStatus;
import com.archibus.service.cost.*;

/**
 * Utility class. Provides methods to calculate cahs flow projection.
 *
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public final class CashFlowProjection {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private CashFlowProjection() {

    }

    /**
     * Calculate and return cash flow projection.
     *
     * @param config cash flow parameters
     * @return CostProjection
     */
    public static CostProjection getCashFlowProjection(final Map<String, String> config) {

        final ICostDao<RecurringCost> recurringCostDataSource = new RecurringCostDataSource();
        final RequestParameters parameters = new RequestParameters(config);

        final CostProjection projection =
                CostHelper.calculateCashFlowProjection(recurringCostDataSource, parameters,
                    parameters.getDateStart(), parameters.getDateEnd(), new JobStatus());

        return projection;
    }

    /**
     * Return cost values as array of double.
     *
     * @param assetId asset id
     * @param projection cost projection
     * @return double[]
     */
    public static double[] projectionToDoubleArray(final String assetId,
            final CostProjection projection) {
        double[] result = null;
        final List<CostPeriod> periods = projection.getPeriodsForAsset(assetId);
        if (!periods.isEmpty()) {
            result = new double[periods.size()];
            for (int index = 0; index < periods.size(); index++) {
                final CostPeriod period = periods.get(index);
                result[index] = period.getCost().doubleValue();
            }
        }
        return result;
    }

}
