package com.archibus.app.common.metrics.domain.trenddirection;

import com.archibus.app.common.metrics.domain.Metric;

/**
 * Implements Larger is Better trend direction - Larger values have positive business significance
 * (e.g. revenue).
 * <p>
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 */
public class LargerIsBetter implements ITrendDirection {
    
    /**
     * {@inheritDoc}
     */
    public StoplightColor calculateStoplightColor(final Metric metric, final double value) {
        StoplightColor result = StoplightColor.GREEN;
        
        final Double reportLimitLowCritical = metric.getReportLimitLowCritical();
        final Double reportLimitLowWarning = metric.getReportLimitLowWarning();
        
        if (reportLimitLowCritical != null && value <= reportLimitLowCritical) {
            result = StoplightColor.RED;
        } else if (reportLimitLowWarning != null && value <= reportLimitLowWarning) {
            result = StoplightColor.YELLOW;
        }
        
        return result;
    }
    
}
