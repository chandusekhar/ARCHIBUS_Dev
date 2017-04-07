package com.archibus.app.reservation.exchange.service;

import junit.framework.*;

/**
 * All tests in the exchange service package.
 * <p>
 * Suppress warning "PMD.TestClassWithoutTestCases".
 * <p>
 * Justification: this is a suite that groups other actions tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class AllTests extends TestCase {

    /**
     * Constructor specifying a name for the exchange service test.
     *
     * @param name the name
     */
    public AllTests(final String name) {
        super(name);
    }

    /**
     * Get test suite for the exchange service package.
     *
     * @return suite suite
     */
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(AutodiscoverExchangeServiceHelperTest.class);
        suite.addTestSuite(ExchangeAvailabilityServiceTest.class);
        suite.addTestSuite(ExchangeCalendarServiceTest.class);
        suite.addTestSuite(ExchangeServiceHelperTest.class);
        suite.addTestSuite(ExchangeUpdateRecurringTest.class);

        // clean up the connected exchange before starting the listener tests
        suite.addTestSuite(ExchangeCleanUpTest.class);

        // these tests take very long to execute...
        suite.addTestSuite(ExchangeListenerTest.class);
        suite.addTestSuite(ExchangeListenerConferenceTest.class);
        suite.addTestSuite(ExchangeListenerConflictsTest.class);
        return suite;
    }
}
