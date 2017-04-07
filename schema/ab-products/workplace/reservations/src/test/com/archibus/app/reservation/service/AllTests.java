package com.archibus.app.reservation.service;

import junit.framework.*;

/**
 * All tests in the service package.
 * <p>
 * Suppress warning "PMD.TestClassWithoutTestCases" and "PMD.CouplingBetweenObjects".
 * <p>
 * Justification: this is a suite that groups other service tests.
 */
@SuppressWarnings({ "PMD.TestClassWithoutTestCases", "PMD.CouplingBetweenObjects" })
public class AllTests extends TestCase {

    /**
     * Constructor for service suite.
     *
     * @param name name
     */
    public AllTests(final String name) {
        super(name);
    }

    /**
     * Get the test suite for service package.
     *
     * @return suite suite
     */
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(ApproveReservationServiceTest.class);
        suite.addTestSuite(CancelReservationServiceTest.class);
        suite.addTestSuite(ConferenceCallConflictsTest.class);
        suite.addTestSuite(ConferenceCallMessagesServiceTest.class);
        suite.addTestSuite(ConferenceCallMissingMeetingTest.class);
        suite.addTestSuite(ConferenceCallReservationServiceTest.class);
        suite.addTestSuite(ConferenceReservationServiceTest.class);
        suite.addTestSuite(EmployeeServiceTest.class);
        suite.addTestSuite(HideRoomConflictsTest.class);
        suite.addTestSuite(ReservationRemoteTest.class);
        suite.addTestSuite(ReservationServiceConferenceTest.class);
        suite.addTestSuite(ReservationServiceTest.class);
        suite.addTestSuite(ReservationUpgradeServiceTest.class);
        suite.addTestSuite(ResourceFinderServiceTest.class);
        suite.addTestSuite(ResourceReservationServiceTest.class);
        suite.addTestSuite(ResourceTimelineServiceTest.class);
        suite.addTestSuite(RoomReservationMissingMeetingTest.class);
        suite.addTestSuite(RoomReservationServiceConflictsTest.class);
        suite.addTestSuite(RoomReservationServiceTest.class);
        suite.addTestSuite(SpaceServiceTest.class);
        suite.addTestSuite(TimelineServiceTest.class);
        suite.addTestSuite(UpdateAppointmentSeriesTest.class);
        suite.addTestSuite(WebCentralAvailabilityServiceTest.class);
        suite.addTestSuite(WebCentralCalendarServiceTest.class);
        return suite;
    }
}
