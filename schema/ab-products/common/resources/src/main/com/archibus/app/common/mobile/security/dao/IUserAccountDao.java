package com.archibus.app.common.mobile.security.dao;

import org.springframework.security.core.userdetails.UserDetails;

import com.archibus.app.common.mobile.security.domain.UserAccount;

/**
 * DAO for UserAccount, com.archibus.security.UserAccount.ThreadSafe, UserDetails.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public interface IUserAccountDao {
    /**
     * Loads UserAccount by deviceId.
     *
     * @param deviceId to find UserAccount by.
     * @return loaded UserAccount, or null if UserAccount was not found.
     */
    UserAccount loadByDeviceId(final String deviceId);

    /**
     * Registers device for the userAccount.
     *
     * @param deviceId to be registered.
     * @param userAccount to be registered for.
     */
    void registerDevice(final String deviceId,
            final com.archibus.security.UserAccount.ThreadSafe userAccount);

    /**
     * Loads UserDetails by username.
     *
     * @param username to load UserAccount for.
     * @return loaded UserAccount (never <code>null</code>). throws UsernameNotFoundException if the
     *         user could not be found or the user has no GrantedAuthority, or the case of the
     *         username must be enforced and does not match the case of the UserAccount property.
     */
    UserDetails loadUserDetailsByUsername(final String username);

    /**
     * Unregisters the deviceId if it is registered with another user.
     *
     * @param deviceId of the device being unregistered
     */
    void unregisterDeviceIfRegistered(final String deviceId);

}
