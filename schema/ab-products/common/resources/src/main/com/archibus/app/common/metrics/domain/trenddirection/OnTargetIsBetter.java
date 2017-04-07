package com.archibus.app.common.metrics.domain.trenddirection;

import com.archibus.app.common.metrics.domain.Metric;

/**
 * Implements On Target is Better trend direction - Values outside of target range have negative
 * business significance (e.g. vacancy rate, temperature).
 * <p>
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 */
public class OnTargetIsBetter implements ITrendDirection {
    
    /**
     * {@inheritDoc}
     */
    // Suppress PMD warning "ConfusingTernary". The if (x != y) expression cannot be
    // converted into a different expression without making the code more confusing.
    @SuppressWarnings("PMD.ConfusingTernary")
    public StoplightColor calculateStoplightColor(final Metric metric, final double value) {
        StoplightColor result = StoplightColor.GREEN;
        
        final StoplightColor smallerIsBetterResult =
                new SmallerIsBetter().calculateStoplightColor(metric, value);
        final StoplightColor largerIsBetterResult =
                new LargerIsBetter().calculateStoplightColor(metric, value);
        
        if (!result.equals(smallerIsBetterResult)) {
            result = smallerIsBetterResult;
        } else if (!result.equals(largerIsBetterResult)) {
            result = largerIsBetterResult;
        }
        
        return result;
    }
    
}
