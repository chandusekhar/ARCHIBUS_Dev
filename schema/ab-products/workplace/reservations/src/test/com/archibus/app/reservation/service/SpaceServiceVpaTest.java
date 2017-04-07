package com.archibus.app.reservation.service;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.common.space.domain.Building;
import com.archibus.context.ContextStore;

/**
 * The Class SpaceServiceVpaTest.
 */
public class SpaceServiceVpaTest extends ReservationServiceTestBase {
    
    /** Space Service bean name. */
    private static final String SPACE_SERVICE_BEAN = "reservationSpaceService";
    
    /**
     * Test an issue with VPA restrictions becoming removed / not being removed.
     * 
     * Note: run this test with a user that has a building VPA different from HQ.
     */
    public final void testVpaIssue() {
        // First get a building by specifying it's ID.
        // VPA is not applied in this case.
        final Building filter = new Building();
        filter.setBuildingId(BL_ID);
        List<Building> buildings = this.spaceService.getBuildings(filter);
        Assert.assertEquals(1, buildings.size());
        Assert.assertEquals(BL_ID, buildings.get(0).getBuildingId());
        
        // Then try to get buildings based on the site ID.
        // VPA should be applied.
        filter.setBuildingId(null);
        filter.setSiteId(SITE_ID);
        buildings = this.spaceService.getBuildings(filter);
        Assert.assertTrue("Reusing the bean means VPA is now applied.", buildings.isEmpty());
        
        final SpaceService newSpaceService =
                (SpaceService) ContextStore.get().getBean(SPACE_SERVICE_BEAN);
        buildings = newSpaceService.getBuildings(filter);
        Assert.assertTrue("Using a new bean results in VPA being applied", buildings.isEmpty());
    }
    
    /**
     * Test an issue with VPA restrictions becoming removed / not being removed.
     * 
     * Note: run this test with a user that has a building VPA different from HQ.
     */
    public final void testVpaIssueReverse() {
        final Building filter = new Building();
        
        // First try to get buildings based on the site ID.
        // VPA should be applied.
        filter.setSiteId(SITE_ID);
        List<Building> buildings = this.spaceService.getBuildings(filter);
        Assert.assertTrue(buildings.isEmpty());
        
        // Then get a building by specifying it's ID.
        // VPA is not applied in this case.
        filter.setBuildingId(BL_ID);
        buildings = this.spaceService.getBuildings(filter);
        Assert.assertFalse(buildings.isEmpty());
        
        final SpaceService newSpaceService =
                (SpaceService) ContextStore.get().getBean(SPACE_SERVICE_BEAN);
        buildings = newSpaceService.getBuildings(filter);
        Assert.assertEquals(1, buildings.size());
        Assert.assertEquals(BL_ID, buildings.get(0).getBuildingId());
    }
    
}
