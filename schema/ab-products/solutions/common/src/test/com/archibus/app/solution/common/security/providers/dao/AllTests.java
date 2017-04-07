package com.archibus.app.solution.common.security.providers.dao;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

public class AllTests extends TestCase {

    public AllTests(String s) {
        super(s);
    }

    public static Test suite() {
        TestSuite suite = new TestSuite();
        suite.addTest(com.archibus.app.solution.common.security.providers.dao.memory.AllTests.suite());
        suite
            .addTestSuite(com.archibus.app.solution.common.security.providers.dao.PasswordPatternValidatorImplTest.class);
        suite.addTestSuite(com.archibus.app.solution.common.security.providers.dao.AfmUsersIntegrationTest.class);
        suite.addTestSuite(com.archibus.app.solution.common.security.providers.dao.UserAccountDaoTest.class);
        suite.addTestSuite(com.archibus.app.solution.common.security.providers.dao.PasswordChangerImplNotAuthenticatedTest.class);
        // TODO: PasswordsChangerImplTest will encrypt all passwords in the database,
        // which will make the database unusable.
        suite.addTestSuite(com.archibus.app.solution.common.security.providers.dao.SqlPasswordChangerImplTest.class);
        suite.addTestSuite(com.archibus.app.solution.common.security.providers.dao.PasswordManagerImplTest.class);
        suite.addTestSuite(com.archibus.app.solution.common.security.providers.dao.MessagesDaoTest.class);
        suite.addTestSuite(com.archibus.app.solution.common.security.providers.dao.PasswordGeneratorImplTest.class);
        return suite;
    }
}
