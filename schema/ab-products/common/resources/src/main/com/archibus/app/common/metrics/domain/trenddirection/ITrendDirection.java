package com.archibus.app.common.metrics.domain.trenddirection;

import com.archibus.app.common.metrics.domain.Metric;

/**
 * Interface for classes that implement trend directions.
 * <p>
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 * 
 */
public interface ITrendDirection {
    
    /**
     * Calculates stoplight color for specified value, based on report limits for this metric.
     * 
     * @param metric The metric.
     * @param value The value.
     * @return The stoplight color.
     */
    StoplightColor calculateStoplightColor(Metric metric, double value);
}
