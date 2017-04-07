package com.archibus.app.common.metrics.provider;

import java.util.*;

import com.archibus.app.common.metrics.domain.*;
import com.archibus.utility.ExceptionBase;

/**
 * Metric provider. Interface to be implemented by custom WFR-ules.
 * <p>
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public interface MetricValuesProvider {
    
    /**
     * Returns metric values for given granularity and time range.
     * 
     * @param granularity metric granularity
     * @param fromDate interval start date
     * @param toDate interval end date
     * @return Map<String, Double> - map object containing group by value and metric value<br>
     *         Ex. area by department {dp_id, area}<br>
     *         {<br>
     *         {"SERVICES", 29.63},<br>
     *         {"CORPORATE", 83.12},<br>
     *         {"MANUFACTURING", 12.70}<br>
     *         }<br>
     * @throws ExceptionBase exception base
     */
    Map<String, Double> getValues(final Granularity granularity, final Date fromDate,
            final Date toDate) throws ExceptionBase;
    
    /**
     * Setter for metric object.
     * 
     * @param metric metric object
     */
    void setMetric(final Metric metric);
    
}
