package com.archibus.app.common.metrics.dao.datasource;

import com.archibus.app.common.metrics.domain.GranularityDef;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Test for GranularityDefDataSource.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class GranularityDefDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test for getByGroupByFields method. Require GranularityDef for bl.
     */
    public void testGetByGroupByFields() {
        final GranularityDefDataSource granularityDefDataSource = new GranularityDefDataSource();
        final String groupByFields = "bl_id";
        
        final GranularityDef granularityDef =
                granularityDefDataSource.getGranularityDef(groupByFields);
        
        assertEquals("bl_id", granularityDef.getGroupByFields());
        assertEquals("bl_id", granularityDef.getRequiredFields());
        assertEquals(1, granularityDef.getFieldPresence());
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "granularityDefDataSource.xml" };
    }
}
