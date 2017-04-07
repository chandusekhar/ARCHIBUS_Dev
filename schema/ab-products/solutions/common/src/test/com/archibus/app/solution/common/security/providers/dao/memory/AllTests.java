package com.archibus.app.solution.common.security.providers.dao.memory;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class AllTests extends TestCase {

    public AllTests(String s) {
        super(s);
    }

    public static Test suite() {
        TestSuite suite = new TestSuite();
        suite
            .addTestSuite(com.archibus.app.solution.common.security.providers.dao.memory.AuthenticationManagerInMemoryTest.class);
        return suite;
    }
}
