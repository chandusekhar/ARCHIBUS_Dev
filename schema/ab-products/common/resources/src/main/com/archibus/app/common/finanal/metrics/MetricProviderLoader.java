package com.archibus.app.common.finanal.metrics;

import com.archibus.app.common.finanal.domain.FinancialMetric;
import com.archibus.context.ContextStore;

/**
 * Provides TODO. - if it has behavior (service), or Represents TODO. - if it has state (entity,
 * domain object, model object). Utility class. Provides methods TODO. Interface to be implemented
 * by classes that TODO.
 * <p>
 *
 * Used by TODO to TODO. Managed by Spring, has prototype TODO singleton scope. Configured in TODO
 * file.
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public final class MetricProviderLoader {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private MetricProviderLoader() {

    }

    /**
     * Load an return metric provider for financial metrics.
     *
     * @param metric financial metric object
     * @return MetricProvider
     */
    public static MetricProvider loadMetricProvider(final FinancialMetric metric) {
        MetricProvider provider = null;
        if (metric.isCustomWfr()) {
            provider = (MetricProvider) ContextStore.get().getBean(metric.getBeanName());
            provider.setMetric(metric);
        } else if (metric.isRatioMetric()) {
            provider = new RatioMetricProvider();
            provider.setMetric(metric);
        }
        return provider;
    }

}
