package com.archibus.app.common.mobile.security.dao.datasource;

import org.springframework.security.core.userdetails.*;

import com.archibus.app.common.mobile.security.domain.UserAccount;
import com.archibus.app.common.mobile.security.service.impl.*;
import com.archibus.datasource.*;
import com.archibus.security.UserDetailsImpl;
import com.archibus.utility.ExceptionBase;

/**
 * Integration tests for UserAccountDataSource.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class UserAccountDataSourceIntegrationTest extends DataSourceTestBase {
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        this.insertRecord();
    }

    private static final String TEST_NAME = "TestName";

    private static final String TEST_DEVICE_ID = "TestDeviceId";

    private UserAccountDataSource dataSource;

    /**
     * @return the dataSource
     */
    public UserAccountDataSource getDataSource() {
        return this.dataSource;
    }

    /**
     * @param dataSource the dataSource to set
     */
    public void setDataSource(final UserAccountDataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Test method for {@link UserAccountDataSource#registerDevice()} .
     */
    // TODO this test hangs on JDBC call
    public final void NoTestRegisterDevice() {
        final com.archibus.security.UserAccount.ThreadSafe userAccount =
                MobileSecurityServiceTest.prepareUserAccountImpl(TEST_NAME);
        {
            // case #1: device is registered in database
            this.dataSource.registerDevice(TEST_DEVICE_ID, userAccount);
            // TODO verify
        }
        {
            // case #2: device is not registered in database
            this.dataSource.registerDevice("Junk", userAccount);
            // TODO verify
        }
    }

    /**
     * Test method for {@link UserAccountDataSource#loadUserDetailsByUsername(String)} .
     */
    public final void testLoadUserDetailsByUsername() {
        {
            // case #1: username exists in database
            final UserDetails actual = this.dataSource.loadUserDetailsByUsername(TEST_NAME);

            assertEquals(TEST_DEVICE_ID, ((UserDetailsImpl) actual).getUserAccount()
                .getMobileDeviceId());
            assertEquals(TEST_NAME, ((UserDetailsImpl) actual).getUserAccount().getName());
        }
        {
            try { // case #2: username does not exist in database
                this.dataSource.loadUserDetailsByUsername("Junk");
                fail("Exception expected");
            } catch (final UsernameNotFoundException exception) {
                assertTrue(((ExceptionBase) exception.getCause()).getErrorNumber() == 1);
            }
        }
    }

    /**
     * Test method for {@link UserAccountDataSource#loadByUsername(String)} .
     */
    public final void testLoadByUsername() {
        {
            // case #1: username exists in database
            final com.archibus.security.UserAccount.ThreadSafe actual =
                    this.dataSource.loadByUsername(TEST_NAME);

            assertEquals(TEST_DEVICE_ID, actual.getMobileDeviceId());
            assertEquals(TEST_NAME, actual.getName());
        }
        {
            try { // case #2: username does not exist in database
                this.dataSource.loadByUsername("Junk");
                fail("Exception expected");
            } catch (final UsernameNotFoundException exception) {
                assertTrue(((ExceptionBase) exception.getCause()).getErrorNumber() == 1);
            }
        }
    }

    /**
     * Test method for {@link UserAccountDataSource#loadByDeviceId(String)} .
     */
    public final void testLoadByDeviceId() {
        {
            // case #1: deviceId exists in database
            final UserAccount actual = this.dataSource.loadByDeviceId(TEST_DEVICE_ID);

            assertEquals(TEST_DEVICE_ID, actual.getMobileDeviceId());
            assertEquals(TEST_NAME, actual.getName());
        }
        {
            // case #2: deviceId does not exist in database
            final UserAccount actual = this.dataSource.loadByDeviceId("Junk");
            assertEquals(null, actual);
        }
    }

    private void insertRecord() {
        // insert record
        final String sql =
                String.format(
                    "INSERT INTO \"afm\".afm_users (user_name, mob_device_id) VALUES('%s', '%s')",
                    TEST_NAME, TEST_DEVICE_ID);
        SqlUtils.executeUpdate("afm_users", sql);
    }

    /**
     * Test method for {@link MobileSecurityService#unregisterDeviceIfRegistered(String)} .
     */
    // TODO this test hangs on JDBC call
    public final void NOtestUnregisterDeviceIfRegistered() {
        // case #1: device is registered
        {
            this.dataSource.unregisterDeviceIfRegistered(TEST_DEVICE_ID);
            // TODO verify
        }
        // case #2: device is not registered
        {
            this.dataSource.unregisterDeviceIfRegistered("Junk");
            // TODO verify
        }
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "userAccountDataSource.xml" };
    }
}
