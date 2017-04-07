package com.archibus.app.reservation.domain.recurrence;

import java.util.*;

import junit.framework.*;

import com.archibus.app.reservation.domain.TimePeriod;

/**
 * The Class RecurrenceTest.
 *
 * Test functionality of the Recurrence base class.
 */
public class RecurrenceTest extends TestCase {

    /**
     * Test setting the exceptions in the recurrence pattern.
     */
    public void testSetExceptions() {
        final Recurrence recurrence = new DailyPattern();

        final List<OccurrenceInfo> exceptions = new ArrayList<OccurrenceInfo>();
        final OccurrenceInfo cancelledInfo = new OccurrenceInfo();
        cancelledInfo.setCancelled(true);
        cancelledInfo.setOriginalDate(TimePeriod.clearTime(new Date()));
        exceptions.add(cancelledInfo);

        final OccurrenceInfo modifiedInfo = new OccurrenceInfo();
        modifiedInfo.setOriginalDate(TimePeriod.clearTime(new Date(0)));
        exceptions.add(modifiedInfo);

        recurrence.setExceptions(exceptions);

        Assert.assertTrue(recurrence.isDateCancelled(cancelledInfo.getOriginalDate()));
        Assert.assertNotNull(recurrence.getModifiedTimePeriod(modifiedInfo.getOriginalDate()));
    }
}
