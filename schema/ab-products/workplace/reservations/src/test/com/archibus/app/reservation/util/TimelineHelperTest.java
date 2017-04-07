package com.archibus.app.reservation.util;

import java.sql.Time;
import java.text.SimpleDateFormat;
import java.util.Locale;

import junit.framework.*;

import org.json.JSONObject;

import com.archibus.app.reservation.domain.RoomArrangement;

/**
 * Test for TimelineHelper.
 */
public class TimelineHelperTest extends TestCase {

    /** Maximum time line column index used for testing. */
    private static final int MAX_COLUMN = 31;

    /** Time line column index visible on the time line, used for testing. */
    private static final int INTERNAL_COLUMN_1 = 12;

    /** Time line column index visible on the time line, used for testing. */
    private static final int INTERNAL_COLUMN_2 = 24;

    /** Room arrangement object used for testing where day_start precedes day_end. */
    private RoomArrangement straightArrangement;

    /** Room arrangement object used for testing where day_end precedes day_start. */
    private RoomArrangement swappedArrangement;

    /**
     * Set up for the time line helper test case.
     *
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method also throws it.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    protected void setUp() throws Exception {
        super.setUp();

        final SimpleDateFormat timeFormatter =
                new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.ENGLISH);

        final Time dayStart = new Time(timeFormatter.parse("1899-12-30 10:00:00").getTime());
        final Time dayEnd = new Time(timeFormatter.parse("1899-12-30 14:00:00").getTime());

        this.straightArrangement = new RoomArrangement();
        this.straightArrangement.setDayStart(dayStart);
        this.straightArrangement.setDayEnd(dayEnd);

        this.swappedArrangement = new RoomArrangement();
        this.swappedArrangement.setDayStart(dayEnd);
        this.swappedArrangement.setDayEnd(dayStart);
    }

    /**
     * Test moving the day_start.
     */
    public void testGetFixedDayStartColumn() {
        Assert.assertEquals(0,
            TimelineHelper.getFixedDayStartColumn(0, 1, MAX_COLUMN, this.straightArrangement));
        Assert.assertEquals(MAX_COLUMN,
            TimelineHelper.getFixedDayStartColumn(0, 0, MAX_COLUMN, this.straightArrangement));

        Assert.assertEquals(0,
            TimelineHelper.getFixedDayStartColumn(0, 1, MAX_COLUMN, this.swappedArrangement));
        Assert.assertEquals(0,
            TimelineHelper.getFixedDayStartColumn(0, 0, MAX_COLUMN, this.swappedArrangement));
    }

    /**
     * Test moving the day_end.
     */
    public void testGetFixedDayEndColumn() {
        Assert.assertEquals(MAX_COLUMN, TimelineHelper.getFixedDayEndColumn(1, MAX_COLUMN,
            MAX_COLUMN, this.straightArrangement));
        Assert.assertEquals(0, TimelineHelper.getFixedDayEndColumn(MAX_COLUMN, MAX_COLUMN,
            MAX_COLUMN, this.straightArrangement));

        Assert
            .assertEquals(MAX_COLUMN, TimelineHelper.getFixedDayEndColumn(1, MAX_COLUMN,
                MAX_COLUMN, this.swappedArrangement));
        Assert.assertEquals(MAX_COLUMN, TimelineHelper.getFixedDayEndColumn(MAX_COLUMN, MAX_COLUMN,
            MAX_COLUMN, this.swappedArrangement));
    }

    /**
     * Test setting adjusted day limits without having a block-out period.
     */
    public void testSetAdjustedDayLimits() {
        final JSONObject resource = new JSONObject();

        // 1. end and start before the time line in that order
        TimelineHelper.setAdjustedDayLimits(resource, 0, 0, MAX_COLUMN);
        Assert.assertEquals(0, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_FROM));
        Assert.assertEquals(MAX_COLUMN, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_TO));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_COLUMN_BLOCKOUT_FROM));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_COLUMN_BLOCKOUT_TO));

        // 2. end and start after the time line in that order
        TimelineHelper.setAdjustedDayLimits(resource, MAX_COLUMN, MAX_COLUMN, MAX_COLUMN);
        Assert.assertEquals(0, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_FROM));
        Assert.assertEquals(MAX_COLUMN, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_TO));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_COLUMN_BLOCKOUT_FROM));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_COLUMN_BLOCKOUT_TO));

        // 3. start within, end before the time line
        TimelineHelper.setAdjustedDayLimits(resource, INTERNAL_COLUMN_1, 0, MAX_COLUMN);
        Assert.assertEquals(INTERNAL_COLUMN_1,
            resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_FROM));
        Assert.assertEquals(MAX_COLUMN, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_TO));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_COLUMN_BLOCKOUT_FROM));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_COLUMN_BLOCKOUT_TO));

        // 4. end within, start after the time line
        TimelineHelper.setAdjustedDayLimits(resource, MAX_COLUMN, INTERNAL_COLUMN_1, MAX_COLUMN);
        Assert.assertEquals(0, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_FROM));
        Assert.assertEquals(INTERNAL_COLUMN_1,
            resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_TO));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_COLUMN_BLOCKOUT_FROM));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_COLUMN_BLOCKOUT_TO));
    }

    /**
     * Test setting adjusted day limits including a block-out period.
     */
    public void testSetAdjustedDayLimitsWithBlockout() {
        final JSONObject resource = new JSONObject();

        // 1. end and start within in that order
        TimelineHelper.setAdjustedDayLimits(resource, INTERNAL_COLUMN_2, INTERNAL_COLUMN_1,
            MAX_COLUMN);
        Assert.assertEquals(0, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_FROM));
        Assert.assertEquals(MAX_COLUMN, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_TO));
        Assert.assertEquals(INTERNAL_COLUMN_1,
            resource.getInt(TimelineHelper.JSON_COLUMN_BLOCKOUT_FROM));
        Assert.assertEquals(INTERNAL_COLUMN_2,
            resource.getInt(TimelineHelper.JSON_COLUMN_BLOCKOUT_TO));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_PRE_BLOCK_TIMESLOTS));
        Assert.assertFalse(resource.has(TimelineHelper.JSON_POST_BLOCK_TIMESLOTS));

        // 2. end before, start after
        TimelineHelper.setAdjustedDayLimits(resource, MAX_COLUMN, 0, MAX_COLUMN);
        Assert.assertEquals(0, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_FROM));
        Assert.assertEquals(MAX_COLUMN, resource.getInt(TimelineHelper.JSON_COLUMN_AVAILABLE_TO));
        Assert.assertEquals(0, resource.getInt(TimelineHelper.JSON_COLUMN_BLOCKOUT_FROM));
        Assert.assertEquals(MAX_COLUMN, resource.getInt(TimelineHelper.JSON_COLUMN_BLOCKOUT_TO));
        Assert.assertEquals(0, resource.getInt(TimelineHelper.JSON_PRE_BLOCK_TIMESLOTS));
        Assert.assertEquals(0, resource.getInt(TimelineHelper.JSON_POST_BLOCK_TIMESLOTS));
    }

}
