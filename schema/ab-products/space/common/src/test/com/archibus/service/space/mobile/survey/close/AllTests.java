package com.archibus.service.space.mobile.survey.close;

import junit.framework.*;

public class AllTests extends TestCase {
    public AllTests(final String name) {
        super(name);
    }
    
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(TestOneRmpctEmptyRoom.class);
        suite.addTestSuite(TestOneRmpctOneDv.class);
        suite.addTestSuite(TestOneRmpctOneEm.class);
        suite.addTestSuite(TestOneRmpctWithDvAndEm.class);
        suite.addTestSuite(TestTwoRmpctEmptyRoom.class);
        suite.addTestSuite(TestTwoRmpctOneDvOneEmpty.class);
        suite.addTestSuite(TestTwoRmpctOneEmAndDvOneEmpty.class);
        suite.addTestSuite(TestTwoRmpctOneEmOneEmpty.class);
        suite.addTestSuite(TestTwoRmpctOnePrimaryDvAndOneEmAndDifferentDv.class);
        suite.addTestSuite(TestTwoRmpctOnePrimaryDvOneEmSameDv.class);
        suite.addTestSuite(TestTwoRmpctOnePrimaryDvOneEmSamePrimaryDv.class);
        suite.addTestSuite(TestTwoRmpctTwoDistinctDv.class);
        suite.addTestSuite(TestTwoRmpctTwoEmDistinctDv.class);
        suite.addTestSuite(TestTwoRmpctTwoEmSameDv.class);
        suite.addTestSuite(TestTwoRmpctTwoSameDv.class);
        return suite;
    }
}
