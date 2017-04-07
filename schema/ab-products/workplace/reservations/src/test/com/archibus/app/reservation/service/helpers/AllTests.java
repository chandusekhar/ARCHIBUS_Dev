package com.archibus.app.reservation.service.helpers;

import junit.framework.*;

/**
 * All tests in the service helpers package.
 * <p>
 * Suppress warning "PMD.TestClassWithoutTestCases".
 * <p>
 * Justification: this is a suite that groups other helper tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class AllTests extends TestCase {

    /**
     * Constructor specifying a name for the helpers test.
     *
     * @param name the name
     */
    public AllTests(final String name) {
        super(name);
    }

    /**
     * Get test suite for the service helpers package.
     *
     * @return suite suite
     */
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(LocationQueryHandlerTest.class);
        suite.addTestSuite(ReservationServiceHelperTest.class);
        suite.addTestSuite(ReservationWfrServiceHelperTest.class);
        return suite;
    }
}
