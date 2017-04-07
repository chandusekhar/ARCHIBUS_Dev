package com.archibus.app.reservation.domain.recurrence;

import junit.framework.*;

/**
 * The Class RoomConflictsModeTest.
 */
public class RoomConflictsModeTest extends TestCase {

    /** A number of occurrences used for testing. */
    private static final int NUMBER = 9;

    /**
     * Test the settings for allowing all conflicts.
     */
    public void testConflictsAll() {
        final RoomConflictsMode mode =
                RoomConflictsMode.getRoomConflictsMode(Constants.CONFLICTS_ALL);
        Assert.assertTrue(mode.allowConflictsOnFirstOccurrence());
        Assert.assertTrue(mode.alwaysIncludeRoomConflicts());
        Assert.assertFalse(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(NUMBER - 1, mode.getMaxConflictsAllowed(NUMBER));
    }

    /**
     * Test the settings for allowing all conflicts if all rooms have conflicts.
     */
    public void testConflictsAllIfOnlyConflicts() {
        final RoomConflictsMode mode =
                RoomConflictsMode.getRoomConflictsMode(Constants.CONFLICTS_ALL_IF_ONLY_CONFLICTS);
        Assert.assertTrue(mode.allowConflictsOnFirstOccurrence());
        Assert.assertFalse(mode.alwaysIncludeRoomConflicts());
        Assert.assertTrue(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(NUMBER - 1, mode.getMaxConflictsAllowed(NUMBER));
    }

    /**
     * Test the settings for always showing filtered conflicts.
     */
    public void testConflictsFiltered() {
        final RoomConflictsMode mode =
                RoomConflictsMode.getRoomConflictsMode(Constants.CONFLICTS_FILTERED);
        Assert.assertTrue(mode.allowConflictsOnFirstOccurrence());
        Assert.assertTrue(mode.alwaysIncludeRoomConflicts());
        Assert.assertFalse(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(NUMBER / 2, mode.getMaxConflictsAllowed(NUMBER));
    }

    /**
     * Test the settings for allowing all conflicts.
     */
    public void testConflictsFilteredIfOnlyConflicts() {
        final RoomConflictsMode mode = RoomConflictsMode
            .getRoomConflictsMode(Constants.CONFLICTS_FILTERED_IF_ONLY_CONFLICTS);
        Assert.assertTrue(mode.allowConflictsOnFirstOccurrence());
        Assert.assertFalse(mode.alwaysIncludeRoomConflicts());
        Assert.assertTrue(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(NUMBER / 2, mode.getMaxConflictsAllowed(NUMBER));
    }

    /**
     * Test the settings for allowing all conflicts but only rooms available on the first
     * occurrence.
     */
    public void testConflictsFirst() {
        final RoomConflictsMode mode =
                RoomConflictsMode.getRoomConflictsMode(Constants.CONFLICTS_FIRST);
        Assert.assertFalse(mode.allowConflictsOnFirstOccurrence());
        Assert.assertTrue(mode.alwaysIncludeRoomConflicts());
        Assert.assertFalse(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(NUMBER - 1, mode.getMaxConflictsAllowed(NUMBER));
    }

    /**
     * Test the settings for always showing filtered conflicts but only rooms available on the first
     * occurrence.
     */
    public void testConflictsFirstFiltered() {
        final RoomConflictsMode mode =
                RoomConflictsMode.getRoomConflictsMode(Constants.CONFLICTS_FIRST_FILTERED);
        Assert.assertFalse(mode.allowConflictsOnFirstOccurrence());
        Assert.assertTrue(mode.alwaysIncludeRoomConflicts());
        Assert.assertFalse(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(NUMBER / 2, mode.getMaxConflictsAllowed(NUMBER));
    }

    /**
     * Test the settings showing filtered conflicts if all rooms have conflicts, limited to rooms
     * available on the first occurrence.
     */
    public void testConflictsFirstFilteredIfOnlyConflicts() {
        final RoomConflictsMode mode = RoomConflictsMode
            .getRoomConflictsMode(Constants.CONFLICTS_FIRST_FILTERED_IF_ONLY_CONFLICTS);
        Assert.assertFalse(mode.allowConflictsOnFirstOccurrence());
        Assert.assertFalse(mode.alwaysIncludeRoomConflicts());
        Assert.assertTrue(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(NUMBER / 2, mode.getMaxConflictsAllowed(NUMBER));
    }

    /**
     * Test the settings showing all conflicts if all rooms have conflicts, limited to rooms
     * available for the first occurrence.
     */
    public void testConflictsFirstIfOnlyConflicts() {
        final RoomConflictsMode mode =
                RoomConflictsMode.getRoomConflictsMode(Constants.CONFLICTS_FIRST_IF_ONLY_CONFLICTS);
        Assert.assertFalse(mode.allowConflictsOnFirstOccurrence());
        Assert.assertFalse(mode.alwaysIncludeRoomConflicts());
        Assert.assertTrue(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(NUMBER - 1, mode.getMaxConflictsAllowed(NUMBER));
    }

    /**
     * Test the settings for allowing no conflicts.
     */
    public void testConflictsNone() {
        final RoomConflictsMode mode =
                RoomConflictsMode.getRoomConflictsMode(Constants.CONFLICTS_NONE);
        Assert.assertFalse(mode.allowConflictsOnFirstOccurrence());
        Assert.assertFalse(mode.alwaysIncludeRoomConflicts());
        Assert.assertFalse(mode.onlyIfAllRoomsHaveConflicts());
        Assert.assertEquals(0, mode.getMaxConflictsAllowed(NUMBER));
    }

}
