package com.archibus.service.space.report;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataSetList;
import com.archibus.service.space.SpaceConstants;

/**
 * <p>
 * Test Space Transaction Report Class, Added by ASC-BJ, Guo Jiangtao.<br>
 * 
 * <p>
 * 
 */
public class SpaceTransactionReportTest extends DataSourceTestBase {
    
    /**
     * test getOccupancySumaryGridRecordsForSpacePlaningConsole().
     */
    public void testGetOccupancySumaryGridRecordsForSpacePlaningConsole() {
        
        final Map<String, Object> parameters = new HashMap<String, Object>();
        parameters.put(SpaceConstants.BLID, "HQ");
        parameters.put(SpaceConstants.FLID, "17");
        parameters.put("date", "2012-12-21");
        
        final DataSetList list =
                new SpaceTransactionReport()
                    .getOccupancySumaryGridRecordsForSpacePlaningConsole(parameters);
        
        assertEquals(5, list.getRecords().size());
    }
}
