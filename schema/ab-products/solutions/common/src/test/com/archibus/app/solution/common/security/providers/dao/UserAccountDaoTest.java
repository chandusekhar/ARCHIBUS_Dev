package com.archibus.app.solution.common.security.providers.dao;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.*;

import com.archibus.utility.ExceptionBase;

/**
 * Tests SecurityService event handler.
 */
public class UserAccountDaoTest extends com.archibus.fixture.IntegrationTestBase {
    private UserAccountDao userAccountDao;

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/security/afm_users/useraccount.xml",
                "/context/core/core-infrastructure.xml", "appContext-test.xml" };
    }

    public void testLoadUserByUsername() throws ExceptionBase {
        final String username = "AFM";

        this.userAccountDao.setIgnoreUsernameCase(false);
        verifyAfmAccountDetails(username);
    }

    public void testLoadUserByUsernameLowercase() throws ExceptionBase {
        final String username = "AFM";

        this.userAccountDao.setIgnoreUsernameCase(true);
        verifyAfmAccountDetails(username);
    }

    private void verifyAfmAccountDetails(final String username) {
        final UserDetails userDetails = this.userAccountDao.loadUserByUsername(username);
        final Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();

        assertEquals(15, authorities.size());
        assertEquals("%", ((GrantedAuthority) authorities.toArray()[0]).getAuthority());

        assertEquals("afm", userDetails.getPassword());
    }

    public void testLoadUserByUsernameException() throws ExceptionBase {
        try {
            final String username = "afm";
            this.userAccountDao.setIgnoreUsernameCase(false);
            this.userAccountDao.loadUserByUsername(username);
            fail("UsernameNotFoundException expected");
        } catch (final UsernameNotFoundException e) {
        }
    }

    public void testLoadUserByUsernameApostropheException() throws ExceptionBase {
        try {
            final String username = "A'FM";
            this.userAccountDao.setIgnoreUsernameCase(false);
            this.userAccountDao.loadUserByUsername(username);
            fail("UsernameNotFoundException expected");
        } catch (final UsernameNotFoundException e) {
        }
    }

    /**
     * @return the userAccountDao
     */
    public UserAccountDao getUserAccountDao() {
        return this.userAccountDao;
    }

    /**
     * @param userAccountDao the userAccountDao to set
     */
    public void setUserAccountDao(final UserAccountDao userAccountDao) {
        this.userAccountDao = userAccountDao;
    }
}
