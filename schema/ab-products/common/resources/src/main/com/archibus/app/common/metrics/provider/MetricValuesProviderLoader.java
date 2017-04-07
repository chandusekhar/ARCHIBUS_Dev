package com.archibus.app.common.metrics.provider;

import com.archibus.app.common.metrics.domain.Metric;
import com.archibus.context.ContextStore;

/**
 * Metric provider loader.
 * <p>
 * 
 * @author Ioan Draghici
 * @since 21.2
 */
public final class MetricValuesProviderLoader {
    
    /**
     * Private default constructor.
     */
    private MetricValuesProviderLoader() {
        
    }
    
    /**
     * Returns metric provider.
     * 
     * @param metric metric object
     * @return metric provider
     */
    public static MetricValuesProvider loadProviderForMetric(final Metric metric) {
        return loadProviderForMetric(metric, false);
    }
    
    /**
     * Returns metric provider.
     * 
     * @param metric metric object
     * @param isSampleData if is called to generate sample data
     * @return metric provider
     */
    public static MetricValuesProvider loadProviderForMetric(final Metric metric,
            final boolean isSampleData) {
        MetricValuesProvider provider = null;
        if (isSampleData) {
            provider = new MetricValuesSampleDataProvider();
        } else if (metric.isCustomWfr()) {
            provider = (MetricValuesProvider) ContextStore.get().getBean(metric.getBeanName());
        } else if (metric.isRatioMetric()) {
            provider = new MetricValuesRatioProvider();
        } else {
            provider = new MetricValuesDataSourceProvider();
        }
        provider.setMetric(metric);
        return provider;
    }
}
