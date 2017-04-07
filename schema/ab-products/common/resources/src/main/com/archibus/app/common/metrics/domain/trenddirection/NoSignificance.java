package com.archibus.app.common.metrics.domain.trenddirection;

import com.archibus.app.common.metrics.domain.Metric;

/**
 * Implements the No Significance trend direction - Values have neutral business significance (e.g.
 * count of buildings).
 * <p>
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 */
public class NoSignificance implements ITrendDirection {
    
    /**
     * {@inheritDoc}
     */
    public StoplightColor calculateStoplightColor(final Metric metric, final double value) {
        return StoplightColor.BLACK;
    }
    
}
