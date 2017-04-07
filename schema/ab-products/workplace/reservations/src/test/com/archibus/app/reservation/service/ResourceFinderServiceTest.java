package com.archibus.app.reservation.service;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.Restrictions;

/**
 * The Class ResourceReservationServiceTest.
 */
public class ResourceFinderServiceTest extends RoomReservationServiceTestBase {

    /** Market site id. */
    private static final String SITE_ID_MARKET = "MARKET";

    /** Site id field/filter name. */
    private static final String SITE_ID_FIELD_NAME = "site_id";

    /** Building ID of the HQ building. */
    private static final String BL_ID_HQ = "HQ";

    /** Building ID of another building on the MARKET site. */
    private static final String BL_ID_LX = "LX";

    /** Reservation id in the reserve table. */
    private static final String RESERVE_RES_ID = "reserve.res_id";

    /** The resource reservation service. */
    private ResourceFinderService resourceFinderService;
    
    /** Location filter used in unit tests. */
    private Map<String, String> locationFilter;
    
    /**
     * {@inheritDoc}
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();
        locationFilter = new HashMap<String, String>();
    }

    /**
     * Test find available reservable resources.
     */
    public void testFindAvailableReservableResourcesForRoom() {
        locationFilter.put(Constants.BL_ID_FIELD_NAME, BL_ID_HQ);
        final DataRecord reservation = this.createAndSaveRoomReservation(true);

        this.roomAllocationDataSource.clearRestrictions();
        this.roomAllocationDataSource.addRestriction(Restrictions.eq(
            Constants.RESERVE_RM_TABLE_NAME, Constants.RES_ID, reservation.getInt(RESERVE_RES_ID)));
        final DataRecord roomAllocation = this.roomAllocationDataSource.getRecord();

        final DataSetList availableResources =
                this.resourceFinderService.findAvailableReservableResourcesForRoom(locationFilter,
                    reservation, roomAllocation);

        Assert.assertNotNull(availableResources);
        Assert.assertFalse(availableResources.getRecords().isEmpty());

    }

    /**
     * Test find available catering resources.
     */
    public void testFindAvailableCateringResourcesForRoom() {
        locationFilter.put(Constants.BL_ID_FIELD_NAME, BL_ID_HQ);
        final DataRecord reservation = this.createAndSaveRoomReservation(true);

        this.roomAllocationDataSource.clearRestrictions();
        this.roomAllocationDataSource.addRestriction(Restrictions.eq(
            Constants.RESERVE_RM_TABLE_NAME, Constants.RES_ID, reservation.getInt(RESERVE_RES_ID)));
        final DataRecord roomAllocation = this.roomAllocationDataSource.getRecord();

        final DataSetList availableResources =
                this.resourceFinderService.findAvailableCateringResourcesForRoom(locationFilter,
                    reservation, roomAllocation);

        Assert.assertNotNull(availableResources);
        Assert.assertFalse(availableResources.getRecords().isEmpty());

    }

    /**
     * Test finding available reservable resources for room service.
     */
    public void testFindAvailableReservableResources() {
        locationFilter.put(SITE_ID_FIELD_NAME, SITE_ID_MARKET);
        final DataRecord reservation = this.createAndSaveRoomReservation(false);

        // This query should return all resource available on the site.
        DataSetList availableResources =
                this.resourceFinderService.findAvailableReservableResources(locationFilter,
                    reservation);
        Assert.assertNotNull(availableResources);
        Assert.assertFalse(availableResources.getRecords().isEmpty());

        // Restricting to building LX, we should get no results.
        locationFilter.put(Constants.BL_ID_FIELD_NAME, BL_ID_LX);

        availableResources =
                this.resourceFinderService.findAvailableReservableResources(locationFilter,
                    reservation);
        Assert.assertNotNull(availableResources);
        Assert.assertTrue(availableResources.getRecords().isEmpty());
    }

    /**
     * Test finding available catering resources for room service.
     */
    public void testFindAvailableCateringResources() {
        locationFilter.put(SITE_ID_FIELD_NAME, SITE_ID_MARKET);
        final DataRecord reservation = this.createAndSaveRoomReservation(false);

        // This query should return all resource available on the site.
        DataSetList availableResources =
                this.resourceFinderService.findAvailableCateringResources(locationFilter,
                    reservation);
        Assert.assertNotNull(availableResources);
        Assert.assertFalse(availableResources.getRecords().isEmpty());

        // Restricting to building LX, we should get no results.
        locationFilter.put(Constants.BL_ID_FIELD_NAME, BL_ID_LX);

        availableResources =
                this.resourceFinderService.findAvailableCateringResources(locationFilter,
                    reservation);
        Assert.assertNotNull(availableResources);
        Assert.assertTrue(availableResources.getRecords().isEmpty());
    }

    /**
     * Set the resource finder service.
     *
     * @param resourceFinderService the resource finder service
     */
    public void setResourceFinderService(final ResourceFinderService resourceFinderService) {
        this.resourceFinderService = resourceFinderService;
    }

}
