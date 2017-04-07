package com.archibus.app.common.metrics.domain.trenddirection;

/**
 * Factory for trend direction implementations.
 * 
 * Suppress PMD warning "AbstractNaming". Factory classes should be abstract, but should not use the
 * AbstractXxxFactory naming convention.
 * 
 * @author Sergey Kuramshin
 */
@SuppressWarnings("PMD.AbstractNaming")
public abstract class TrendDirectionFactory {
    
    /**
     * Creates a trend direction implementation.
     * 
     * @param trendDirectionCode The value of the afm_metric_definitions.trend_dir field.
     * @return The trend direction instance.
     */
    public static ITrendDirection createTrendDirection(final int trendDirectionCode) {
        ITrendDirection result = null;
        
        switch (trendDirectionCode) {
            case 0:
                result = new SmallerIsBetter();
                break;
            case 1:
                result = new LargerIsBetter();
                break;
            case 2:
                result = new OnTargetIsBetter();
                break;
            default:
                result = new NoSignificance();
                break;
        }
        
        return result;
    }
}
