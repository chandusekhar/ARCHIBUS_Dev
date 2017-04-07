package com.archibus.app.common.metrics.domain.trenddirection;

import com.archibus.app.common.metrics.domain.Metric;

/**
 * Implements Smaller is Better trend direction - Smaller values have positive business significance
 * (e.g. expenses).
 * <p>
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 */
public class SmallerIsBetter implements ITrendDirection {
    
    /**
     * {@inheritDoc}
     */
    public StoplightColor calculateStoplightColor(final Metric metric, final double value) {
        StoplightColor result = StoplightColor.GREEN;
        
        final Double reportLimitHighCritical = metric.getReportLimitHighCritical();
        final Double reportLimitHighWarning = metric.getReportLimitHighWarning();
        
        if (reportLimitHighCritical != null && value >= reportLimitHighCritical) {
            result = StoplightColor.RED;
        } else if (reportLimitHighWarning != null && value >= reportLimitHighWarning) {
            result = StoplightColor.YELLOW;
        }
        
        return result;
    }
    
}
