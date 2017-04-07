package com.archibus.app.common.metrics.dao.datasource;

import java.util.List;

import com.archibus.app.common.metrics.dao.IScorecardDao;
import com.archibus.app.common.metrics.domain.Scorecard;
import com.archibus.datasource.DataSourceTestBase;

/**
 * 
 * Test for ScorecardDataSource.
 * 
 * @author Sergey Kuramshin
 * @since 21.2
 * 
 */
public class ScorecardDataSourceTest extends DataSourceTestBase {
    
    /**
     * The number of active metrics in the canonic database.
     */
    private static final int EXPECTED_SCORECARDS = 6;
    
    /**
     * Test for getActiveMetrics method.
     */
    public void testGetScorecardAssignments() {
        final IScorecardDao scorecardDao = new ScorecardDataSource();
        final List<Scorecard> scorecardAssignments = scorecardDao.getScorecardAssignments("SPACE");
        
        assertEquals(EXPECTED_SCORECARDS, scorecardAssignments.size());
        assertEquals("spac_GrossArea", scorecardAssignments.get(0).getMetricName());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "scorecardDataSource.xml" };
    }
}
