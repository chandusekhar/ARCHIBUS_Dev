package com.archibus.app.reservation.domain.recurrence;

import java.text.ParseException;
import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.service.RecurrenceService;
import com.archibus.app.reservation.service.actions.SaveRecurringReservationOccurrenceAction;

/**
 * Test for YearlyPattern.
 */
public class YearlyPatternTest extends RecurrencePatternTestBase {

    /** Error message fragment to look for in the exception that indicates an invalid end date. */
    private static final String MESSAGE_END_DATE = "end date";

    /**
     * Test YearlyPattern.loopThroughRepeats() using a fixed yearly date.
     */
    public void testLoopThroughRepeatsFixedDate() {
        // Create a new pattern occurring on a fixed day of the month.
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, Month.May, this.dayOfTheMonth);
        pattern.setEndDate(this.endDate);

        final TestOccurrenceAction testAction = new TestOccurrenceAction();
        try {
            pattern.loopThroughRepeats(testAction);

            // CHECKSTYLE:OFF Justification: this 'magic number' is used for testing.
            Assert.assertEquals(6, testAction.getNumberOfVisitedDates());
            // CHECKSTYLE:ON
            final List<Date> visitedDates = testAction.getVisitedDates();
            Assert.assertEquals(this.dateFormatter.parse("2013-05-17"), visitedDates.get(0));
            Assert.assertEquals(this.dateFormatter.parse("2014-05-17"), visitedDates.get(1));
            Assert.assertEquals(this.dateFormatter.parse("2015-05-17"), visitedDates.get(2));
            // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
            Assert.assertEquals(this.dateFormatter.parse("2016-05-17"), visitedDates.get(3));
            Assert.assertEquals(this.dateFormatter.parse("2017-05-17"), visitedDates.get(4));
            Assert.assertEquals(this.dateFormatter.parse("2018-05-17"), visitedDates.get(5));
            // CHECKSTYLE:ON
        } catch (final ParseException exception) {
            fail(exception.toString());
        } catch (final ReservationException exception) {
            fail(exception.toString());
        }
    }

    /**
     * Test YearlyPattern.loopThroughRepeats() using a specified yearly instance of a week day in a
     * specific month.
     * <p>
     * Suppress warning avoid final local variable
     * <p>
     * Justification: Turning local variable into field is not useful in this case.
     */
    @SuppressWarnings("PMD.AvoidFinalLocalVariable")
    public void testLoopThroughRepeatsWeekDay() {
        // Create a new pattern occurring on a specific instance of a weekday day each year.
        final DayOfTheWeek dayOfTheWeek = DayOfTheWeek.Thursday;
        final int weekOfMonth = 3;
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, this.endDate, Month.May, weekOfMonth,
                    dayOfTheWeek);

        final TestOccurrenceAction testAction = new TestOccurrenceAction();
        try {
            pattern.loopThroughRepeats(testAction);

            // CHECKSTYLE:OFF Justification: this 'magic number' is used for testing.
            Assert.assertEquals(6, testAction.getNumberOfVisitedDates());
            // CHECKSTYLE:ON
            final List<Date> visitedDates = testAction.getVisitedDates();
            Assert.assertEquals(this.dateFormatter.parse("2013-05-16"), visitedDates.get(0));
            Assert.assertEquals(this.dateFormatter.parse("2014-05-15"), visitedDates.get(1));
            Assert.assertEquals(this.dateFormatter.parse("2015-05-21"), visitedDates.get(2));
            // CHECKSTYLE:OFF Justification: these 'magic numbers' are used for testing.
            Assert.assertEquals(this.dateFormatter.parse("2016-05-19"), visitedDates.get(3));
            Assert.assertEquals(this.dateFormatter.parse("2017-05-18"), visitedDates.get(4));
            Assert.assertEquals(this.dateFormatter.parse("2018-05-17"), visitedDates.get(5));
        } catch (final ParseException exception) {
            fail(exception.toString());
        } catch (final ReservationException exception) {
            fail(exception.toString());
        }
    }

    /**
     * Test YearlyPattern.loopThroughRepeats with no stop condition.
     * <p>
     * Suppress warning "PMD.JUnitTestsShouldIncludeAssert".
     * <p>
     * Justification: false positive, asserts are included in the called method.
     */
    @SuppressWarnings("PMD.JUnitTestsShouldIncludeAssert")
    public void testLoopThroughRepeatsNoStopCondition() {
        loopThroughRepeatsNoStopCondition(new YearlyPattern(this.startDate, Month.May,
            this.dayOfTheMonth));
        loopThroughRepeatsNoStopCondition(new YearlyPattern(this.startDate, null, Month.February,
            3, DayOfTheWeek.Wednesday));
    }

    /**
     * Test method for YearlyPattern.toString() using a fixed date.
     * <p>
     * Suppress warning avoid final local variable
     * <p>
     * Justification: Turning local variable into field is not useful in this case.
     */
    @SuppressWarnings("PMD.AvoidFinalLocalVariable")
    public void testToStringFixedDate() {
        // Create a new pattern occurring on a fixed day of the month.
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, Month.May, this.dayOfTheMonth);
        final int interval = 2;
        pattern.setInterval(interval);
        pattern.setEndDate(this.endDate);

        Assert.assertEquals("<recurring type=\"year\" value1=\"17\" value2=\"may\" value3=\""
                + interval + "\" value4=\"\" total=\"\" />", pattern.toString());

        final int numberOfOccurrences = 3;
        pattern.setNumberOfOccurrences(numberOfOccurrences);
        Assert.assertEquals("<recurring type=\"year\" value1=\"17\" value2=\"may\" value3=\""
                + interval + "\" value4=\"\" total=\"3\" />", pattern.toString());
    }

    /**
     * Test method for YearlyPattern.toString() using a specific day of the week.
     * <p>
     * Suppress warning avoid final local variable
     * <p>
     * Justification: Turning local variable into field is not useful in this case.
     */
    @SuppressWarnings("PMD.AvoidFinalLocalVariable")
    public void testToStringWeekDay() {
        // Create a new pattern occurring on a specific instance of a weekday day each year.
        final DayOfTheWeek dayOfTheWeek = DayOfTheWeek.Thursday;
        final int weekOfMonth = 3;
        final int interval = 2;
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, this.endDate, Month.May, weekOfMonth,
                    dayOfTheWeek);
        pattern.setInterval(interval);

        // This isn't a valid representation of the pattern because this type is actually not
        // supported.
        // We don't need to support it as long as the common recurring schedule doesn't.
        Assert
            .assertEquals(
                "<recurring type=\"year\" value1=\"3rd\" value2=\"thu\" value3=\"may\" value4=\"2\" total=\"\" />",
                pattern.toString());

        final int numberOfOccurrences = 3;
        pattern.setNumberOfOccurrences(numberOfOccurrences);
        Assert
            .assertEquals(
                "<recurring type=\"year\" value1=\"3rd\" value2=\"thu\" value3=\"may\" value4=\"2\" total=\"3\" />",
                pattern.toString());
    }

    /**
     * Test loopThroughRepeats with an end date that doesn't correspond to the number of occurrences
     * for saving a recurring reservation.
     */
    public void testInvalidEndDate() {
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, Month.May, this.dayOfTheMonth);
        // set both end date and number of occurrences to trigger the check
        pattern.setEndDate(this.endDate);
        pattern.setNumberOfOccurrences(10);

        final SaveRecurringReservationOccurrenceAction testAction =
                new SaveRecurringReservationOccurrenceAction(new ArrayList<RoomReservation>(),
                    null, null, new RoomReservation(new TimePeriod(this.startDate, this.startDate,
                        null), new RoomArrangement()));
        try {
            pattern.loopThroughRepeats(testAction);
            Assert.fail("Should detect an invalid end date");
        } catch (final ReservationException exception) {
            Assert.assertTrue(exception.getPattern().contains(MESSAGE_END_DATE));
        }
    }

    /**
     * Test loopThroughRepeats with an end date that corresponds to one of the intermediate
     * occurrences for saving a recurring reservation. This is not allowed when saving and indicates
     * the end date was calculated incorrectly in Outlook.
     */
    public void testInvalidNumberOfOccurrences() {
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, Month.May, this.dayOfTheMonth);

        /*
         * This can happen in Outlook as follows: First define a yearly recurrence pattern on a
         * fixed date for 5 occurrences. Click OK to close the dialog. Note the calculated end date
         * correctly shows 4 years from the start date. Secondly, open the dialog again and change
         * the interval to 2 years. Click OK to close the dialog again without touching anything
         * else. Note the end date still shows 4 years from the start date, which is incorrect
         * because it matches the 3rd occurrence instead of the 5th.
         */

        pattern.setInterval(2);
        // set both end date and number of occurrences to trigger the check
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.startDate);
        calendar.add(Calendar.YEAR, 4);
        pattern.setEndDate(calendar.getTime());
        pattern.setNumberOfOccurrences(5);

        final SaveRecurringReservationOccurrenceAction testAction =
                new SaveRecurringReservationOccurrenceAction(new ArrayList<RoomReservation>(),
                    null, null, new RoomReservation(new TimePeriod(this.startDate, this.startDate,
                        null), new RoomArrangement()));
        try {
            pattern.loopThroughRepeats(testAction);
            Assert.fail("Should detect an invalid end date by the number of occurrences check");
        } catch (final ReservationException exception) {
            Assert.assertTrue(exception.getPattern().contains(MESSAGE_END_DATE));
        }
    }

    /**
     * Test loopThroughRepeats with an end date that doesn't correspond to the number of occurrences
     * for saving a recurring reservation.
     *
     * @param pattern the recurrence pattern to test
     */
    public void testTooManyOccurrences() {
        final YearlyPattern pattern =
                new YearlyPattern(this.startDate, Month.May, this.dayOfTheMonth);
        // set both end date and number of occurrences to trigger the check
        pattern.setNumberOfOccurrences(RecurrenceService.getMaxOccurrences() + 1);
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(pattern.getStartDate());
        calendar.add(Calendar.YEAR, pattern.getNumberOfOccurrences() - 1);
        pattern.setEndDate(calendar.getTime());

        final SaveRecurringReservationOccurrenceAction testAction =
                new SaveRecurringReservationOccurrenceAction(new ArrayList<RoomReservation>(),
                    null, null, new RoomReservation(new TimePeriod(this.startDate, this.startDate,
                        null), new RoomArrangement()));
        try {
            pattern.loopThroughRepeats(testAction);
            Assert.fail("Should detect an invalid number of occurrences");
        } catch (final ReservationException exception) {
            Assert.assertTrue(exception.getPattern().contains("number of occurrences"));
        }
    }

}
