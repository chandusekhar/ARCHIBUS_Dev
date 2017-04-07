package com.archibus.app.reservation.service.helpers;

import java.util.List;

import junit.framework.Assert;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.service.ReservationServiceTestBase;

/**
 * Test for LocationQueryHandler.
 *
 * @author Yorik Gerlo
 */
public class LocationQueryHandlerTest extends ReservationServiceTestBase {

    /** Country ID used for testing. */
    private static final String USA = "USA";

    /** The location query handler being tested. */
    private LocationQueryHandler locationQueryHandler;

    /**
     * Set the Location Query Handler for using in this test.
     *
     * @param locationQueryHandler the location query handler for this test
     */
    public void setLocationQueryHandler(final LocationQueryHandler locationQueryHandler) {
        this.locationQueryHandler = locationQueryHandler;
    }

    /**
     * Test handling a location query with all levels except rooms.
     */
    public void testHandleFullLocationQuery() {
        final LocationQuery query = new LocationQuery();
        query.setLevelsToInclude("country,state,city,site,building,floor,arrangement,attributes");
        final LocationQueryResult result = this.locationQueryHandler.handle(query);
        Assert.assertNotNull(result.getArrangements());
        Assert.assertNotNull(result.getAttributes());
        Assert.assertNotNull(result.getCountries());
        Assert.assertNotNull(result.getStates());
        Assert.assertNotNull(result.getCities());
        Assert.assertNotNull(result.getSites());
        Assert.assertNotNull(result.getBuildings());
        Assert.assertNotNull(result.getFloors());

        Assert.assertNotNull(result.getCountryId());
        Assert.assertNotNull(result.getStateId());
        Assert.assertNotNull(result.getCityId());
        Assert.assertNotNull(result.getSiteId());
        Assert.assertNotNull(result.getBuildingId());
        Assert.assertNull(result.getFloorId());
    }

    /**
     * Test handling a location query with some levels, not including rooms.
     */
    public void testHandlePartialLocationQuery() {
        final LocationQuery query = new LocationQuery();
        query.setLevelsToInclude("state,city,building,floor");
        final LocationQueryResult result = this.locationQueryHandler.handle(query);
        Assert.assertNull(result.getArrangements());
        Assert.assertNull(result.getCountries());
        Assert.assertNotNull(result.getStates());
        Assert.assertNotNull(result.getCities());
        Assert.assertNull(result.getSites());
        Assert.assertNotNull(result.getBuildings());
        Assert.assertNotNull(result.getFloors());

        Assert.assertNull(result.getCountryId());
        Assert.assertNotNull(result.getStateId());
        Assert.assertNotNull(result.getCityId());
        Assert.assertNull(result.getSiteId());
        Assert.assertNotNull(result.getBuildingId());
        Assert.assertNull(result.getFloorId());
    }

    /**
     * Test handling a location query where some of the lower levels have incorrect values.
     */
    public void testHandleIncorrectLocationQuery() {
        final LocationQuery query = new LocationQuery();
        query.setLevelsToInclude("country,state,city,building,floor,arrangement");
        query.setCountryId(USA);
        query.setCityId("DUMMY");
        query.setBuildingId(BL_ID);
        final LocationQueryResult result = this.locationQueryHandler.handle(query);

        Assert.assertEquals("BOSTON", result.getCityId());
        Assert.assertEquals("BOSMED", result.getBuildingId());
        Assert.assertNull(result.getFloorId());
    }

    /**
     * Test retrieving information for some levels while specifying a restriction for the higher
     * levels.
     */
    public void testHandleSubQuery() {
        final LocationQuery query = new LocationQuery();
        query.setLevelsToInclude("state,site,building");
        query.setCountryId(USA);
        final LocationQueryResult result = this.locationQueryHandler.handle(query);
        Assert.assertNull(result.getArrangements());
        Assert.assertNull(result.getCountries());
        Assert.assertNotNull(result.getStates());
        Assert.assertNull(result.getCities());
        Assert.assertNotNull(result.getSites());
        Assert.assertNotNull(result.getBuildings());
        Assert.assertNull(result.getFloors());

        Assert.assertEquals(query.getCountryId(), result.getCountryId());
        Assert.assertNotNull(result.getStateId());
        Assert.assertNull(result.getCityId());
        Assert.assertNotNull(result.getSiteId());
        Assert.assertNotNull(result.getBuildingId());
        Assert.assertNull(result.getFloorId());
    }

    /**
     * Test get fixed resource standards.
     */
    public final void testGetFixedResourceStandards() {
        final List<ResourceStandard> standards =
                this.locationQueryHandler.getFixedResourceStandards();
        Assert.assertFalse(standards.isEmpty());
    }

}
