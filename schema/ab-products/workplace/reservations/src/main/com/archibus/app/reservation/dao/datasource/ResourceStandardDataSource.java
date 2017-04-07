package com.archibus.app.reservation.dao.datasource;

import java.util.*;

import com.archibus.app.reservation.dao.IResourceStandardDataSource;
import com.archibus.app.reservation.domain.ResourceStandard;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Simple Resource Standards data source based on data source defined in axvw.
 * 
 * @author Yorik Gerlo
 */
public class ResourceStandardDataSource implements IResourceStandardDataSource {
    
    /** View name containing the custom data sources. */
    private static final String CUSTOM_DATASOURCE_VIEW = "ab-rr-room-reservation-datasources.axvw";
    
    /** Name of the custom data source defined in the view. */
    private static final String FIXED_RESOURCE_STANDARDS_DATASOURCE = "fixedResourceStandardDs";
    
    /**
     * {@inheritDoc}
     */
    public List<ResourceStandard> getFixedResourceStandards() {
        final DataSource viewDataSource =
                DataSourceFactory.loadDataSourceFromFile(CUSTOM_DATASOURCE_VIEW,
                    FIXED_RESOURCE_STANDARDS_DATASOURCE);
        
        final List<DataRecord> records = viewDataSource.getRecords();
        final List<ResourceStandard> results = new ArrayList<ResourceStandard>(records.size());
        for (final DataRecord record : records) {
            final ResourceStandard resourceStandard = new ResourceStandard();
            resourceStandard.setId(record.getString("resource_std.resource_std"));
            resourceStandard.setName(record.getString("resource_std.resource_name"));
            results.add(resourceStandard);
        }
        
        return results;
    }
    
}
