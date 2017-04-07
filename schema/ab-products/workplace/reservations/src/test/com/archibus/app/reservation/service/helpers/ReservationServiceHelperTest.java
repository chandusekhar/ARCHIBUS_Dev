package com.archibus.app.reservation.service.helpers;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.app.reservation.service.*;
import com.archibus.utility.LocalDateTimeUtil;

/**
 * Test for Reservation Service Helper.
 *
 * @author Yorik Gerlo
 */
public class ReservationServiceHelperTest extends ReservationServiceTestBase {
    // TODO this is actually a test for RecurrenceHelper.
    
    /** The recurrence pattern used in unit tests. */
    private Recurrence recurrence;
    
    /** Used in several unit tests to indicate how many occurrences are skipped. */
    private int skipCount;
    
    /** Used in several unit tests to track all dates in a recurrence pattern. */
    private List<Date> allDates;
    
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
        
        recurrence = createRecurrenceStartingInThePast();
        allDates =
                RecurrenceService.getDateList(recurrence.getStartDate(), recurrence.getEndDate(),
                    recurrence.toString());
        skipCount = RecurrenceHelper.moveToNextOccurrence(recurrence, HQ_TIMEZONE);
        Assert.assertEquals(skipCount, recurrence.getNumberOfSkippedOccurrences());
        
        // reset the recurrence to its original state
        recurrence = createRecurrenceStartingInThePast();
    }

    /**
     * Test moving a normal recurring reservation to the next occurrence (i.e. not in the past).
     */
    public void testMoveToNextOccurrence() {
        final RoomReservation roomReservation =
                createReservationForRecurrenceTest(HQ_TIMEZONE, recurrence.getStartDate());
        final Date originalStartDate = roomReservation.getStartDate();
        skipCount = RecurrenceHelper.moveToNextOccurrence(roomReservation, recurrence);

        Assert.assertTrue(skipCount > 0);
        Assert.assertEquals(skipCount, recurrence.getNumberOfSkippedOccurrences());
        Assert.assertEquals(roomReservation.getStartDate(), recurrence.getStartDate());
        Assert.assertTrue(roomReservation.getStartDate().after(originalStartDate));

        int index = 0;
        while (index < allDates.size()) {
            if (allDates.get(index).equals(roomReservation.getStartDate())) {
                break;
            }
            ++index;
        }

        Assert.assertEquals(index, skipCount);
        Assert.assertEquals(allDates.get(index), roomReservation.getStartDate());
    }

    /**
     * Test moving a recurring reservation to the next occurrence having cancelled the occurrence
     * which should be the next one.
     */
    public void testMoveToNextOccurrenceCancelled() {
        final List<OccurrenceInfo> infos = new ArrayList<OccurrenceInfo>();
        final OccurrenceInfo info = new OccurrenceInfo();
        info.setOriginalDate(allDates.get(skipCount));
        info.setCancelled(true);
        infos.add(info);
        recurrence.setExceptions(infos);

        final int skipCountWithCancel =
                RecurrenceHelper.moveToNextOccurrence(recurrence, HQ_TIMEZONE);
        Assert.assertEquals(skipCount + 1, skipCountWithCancel);
        Assert.assertEquals(allDates.get(skipCountWithCancel), recurrence.getStartDate());
        Assert.assertEquals(skipCountWithCancel, recurrence.getNumberOfSkippedOccurrences());
    }

    /**
     * Test moving a customized recurring reservation to the next occurrence, where the expected
     * next occurrence is modified to occur in the past.
     */
    public void testMoveToNextOccurrenceModifiedToThePast() {
        final List<OccurrenceInfo> infos = new ArrayList<OccurrenceInfo>();
        final OccurrenceInfo info = new OccurrenceInfo();
        info.setOriginalDate(allDates.get(skipCount));
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(LocalDateTimeUtil.currentLocalDateForTimeZone(HQ_TIMEZONE));
        calendar.add(Calendar.DATE, -1);
        info.setModifiedTimePeriod(new TimePeriod(calendar.getTime(), calendar.getTime(),
            HQ_TIMEZONE));
        infos.add(info);
        recurrence.setExceptions(infos);

        final int skipCountWithModification =
                RecurrenceHelper.moveToNextOccurrence(recurrence, HQ_TIMEZONE);
        Assert.assertEquals(skipCount + 1, skipCountWithModification);
        Assert.assertEquals(allDates.get(skipCountWithModification), recurrence.getStartDate());
        Assert.assertEquals(skipCountWithModification, recurrence.getNumberOfSkippedOccurrences());
    }

    /**
     * Test moving a customized recurring reservation to the next occurrence, where the last date
     * that is expected to be skipped is moved to today.
     */
    public void testMoveToNextOccurrenceModifiedToTheFuture() {
        final List<OccurrenceInfo> infos = new ArrayList<OccurrenceInfo>();
        final OccurrenceInfo info = new OccurrenceInfo();
        info.setOriginalDate(allDates.get(skipCount - 1));
        final Date today = LocalDateTimeUtil.currentLocalDateForTimeZone(HQ_TIMEZONE);
        info.setModifiedTimePeriod(new TimePeriod(today, today, HQ_TIMEZONE));
        infos.add(info);
        recurrence.setExceptions(infos);

        final int skipCountWithModification =
                RecurrenceHelper.moveToNextOccurrence(recurrence, HQ_TIMEZONE);
        Assert.assertEquals(skipCount - 1, skipCountWithModification);
        Assert.assertEquals("The recurrence pattern should still have the date in the past",
            allDates.get(skipCountWithModification), recurrence.getStartDate());
        Assert.assertTrue(
            "The modified start date should be after the recurrence pattern start date", recurrence
                .getModifiedTimePeriod(allDates.get(skipCountWithModification)).getStartDate()
                .after(recurrence.getStartDate()));
        Assert.assertEquals(skipCountWithModification, recurrence.getNumberOfSkippedOccurrences());
    }
}
