package com.archibus.app.common.metrics.dao;

import java.util.List;

import com.archibus.app.common.metrics.domain.*;
import com.archibus.core.dao.IDao;

/**
 * 
 * DAO for granularity. Interface to be implemented by GranularityDataSource.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public interface IGranularityDao extends IDao<Granularity> {
    
    /**
     * Load granularity for group by fields.
     * 
     * @param groupByFields group by fields
     * @return granularityDef object
     */
    Granularity getGranularity(final String groupByFields);
    
    /**
     * Load granularity definition for group by fields.
     * 
     * @param groupByFields group by fields
     * @return granularityDef object
     */
    GranularityDef getGranularityDef(final String groupByFields);
    
    /**
     * Load granularities for given metric.
     * 
     * @param metricName metric name
     * @return List<Granularity> object
     */
    List<Granularity> getGranularitiesForMetric(final String metricName);
    
    /**
     * Load granularity for metric.
     * 
     * @param metricName metric name
     * @param collectGroupBy collect group by
     * @return List<Granularity> object
     */
    List<Granularity> getGranularitiesForMetric(final String metricName, final String collectGroupBy);
}
