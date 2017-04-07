package com.archibus.app.common.finanal.dao;

import com.archibus.app.common.metrics.dao.IMetricDao;

/**
 * DAO for Financial metric. Mapped to afm_metric_definitions database table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 * @param <FinancialMetric> type of the persistent object
 */
public interface IFinancialMetricDao<FinancialMetric> extends IMetricDao<FinancialMetric> {

}
