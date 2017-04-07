package com.archibus.app.common.mobile.security.dao.datasource;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.core.userdetails.*;
import org.springframework.util.Assert;

import com.archibus.app.common.mobile.security.dao.IUserAccountDao;
import com.archibus.app.common.mobile.security.domain.UserAccount;
import com.archibus.security.*;

/**
 * DataSource for UserAccount.
 * <p>
 * Designed to have singleton scope in order to be dependency of a singleton bean.
 *
 * @author Valery Tydykov
 * @since 21.1
 */
public class UserAccountDataSource implements IUserAccountDao, InitializingBean {

    /**
     * DAO for UserAccount. Used to load UserAccount by username.
     */
    private UserDetailsService userDetailsService;

    /**
     * {@inheritDoc}
     * <p>
     * Suppress Warning "PMD.SignatureDeclareThrowsException"
     * <p>
     * Justification: This method implements Spring interface.
     */
    @Override
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.userDetailsService, "userDetailsService must be supplied");
    }

    /**
     * @return the userDetailsService
     */
    public UserDetailsService getUserDetailsService() {
        return this.userDetailsService;
    }

    /**
     * @param userDetailsService the userDetailsService to set
     */
    public void setUserDetailsService(final UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /** {@inheritDoc} */
    @Override
    public UserAccount loadByDeviceId(final String deviceId) {
        UserAccount userAccount = null;

        final String username = UserAccountLoaderImpl.loadUsernameByDeviceId(deviceId);
        if (username != null) {
            userAccount = new UserAccount();
            userAccount.setMobileDeviceId(deviceId);
            userAccount.setName(username);
        }

        return userAccount;
    }

    /**
     * Loads UserAccount by username.
     *
     * @param username to load UserAccount for.
     * @return loaded UserAccount (never <code>null</code>).
     * @throws UsernameNotFoundException if the user could not be found or the user has no
     *             GrantedAuthority, or the case of the username must be enforced and does not match
     *             the case of the UserAccount property.
     */
    com.archibus.security.UserAccount.ThreadSafe loadByUsername(final String username)
            throws UsernameNotFoundException {
        final UserDetailsImpl userDetails =
                (UserDetailsImpl) this.loadUserDetailsByUsername(username);

        final com.archibus.security.UserAccount.ThreadSafe userAccount =
                (com.archibus.security.UserAccount.ThreadSafe) userDetails.getUserAccount();

        return userAccount;
    }

    /** {@inheritDoc} */
    @Override
    public UserDetails loadUserDetailsByUsername(final String username)
            throws UsernameNotFoundException {
        return this.getUserDetailsService().loadUserByUsername(username);
    }

    /** {@inheritDoc} */
    @Override
    public void registerDevice(final String deviceId,
            final com.archibus.security.UserAccount.ThreadSafe userAccount) {
        this.unregisterDeviceIfRegistered(deviceId);

        userAccount.setMobileDeviceId(deviceId);

        // TODO unit test
        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }

    /**
     * Unregisters device which is registered with the username.
     *
     * @param username to unregister device with.
     */

    private void unregisterDevice(final String username) {
        // device is registered with another user
        // load user account by specified username
        final com.archibus.security.UserAccount.ThreadSafe userAccount = loadByUsername(username);

        // clear the Device ID
        userAccount.setMobileDeviceId(null);
        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }

    /**
     * Unregisters the deviceId if it is registered with another user.
     *
     * @param deviceId to unregister.
     */
    @Override
    public void unregisterDeviceIfRegistered(final String deviceId) {
        // check if deviceId is registered
        final String username = UserAccountLoaderImpl.loadUsernameByDeviceId(deviceId);
        if (username != null) {
            // device is registered with username, unregister it
            this.unregisterDevice(username);
        }
    }

}
