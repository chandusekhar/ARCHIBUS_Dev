package com.archibus.app.solution.common.security.providers.dao;

import java.util.*;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.dao.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.util.Assert;

import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.security.*;
import com.archibus.utility.*;

/**
 * DAO for UserAccount, loaded from afm_users table. The behavior of this class does not depend on
 * the type of the database engine - the portion of the code that loads UserAccount object from the
 * database table is intentionally case-insensitive. The case-sensitivity might be enforced by
 * specifying property value ignoreUsernameCase = false.
 *
 * @author Valery Tydykov
 *
 */
public class UserAccountDao implements UserDetailsService, InitializingBean {
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * If false, username parameter must match username property of the loaded UserAccount.
     */
    // TODO: remove this property: see 3026337/Case-sensitivity in ARCHIBUS products.
    private boolean ignoreUsernameCase = false;
    
    /**
     * Properties of the password policy.
     */
    private PasswordPolicy passwordPolicy;
    
    /**
     * If false, no attempt will be made to gracefully fail down to a GUEST role.
     */
    private boolean useGuestAccountIfUsernameNotFound = false;
    
    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
     */
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.passwordPolicy, "passwordPolicy must be set");
    }
    
    /**
     * @return the passwordPolicy
     */
    public PasswordPolicy getPasswordPolicy() {
        return this.passwordPolicy;
    }
    
    /**
     * @return the ignoreUsernameCase
     */
    public boolean isIgnoreUsernameCase() {
        return this.ignoreUsernameCase;
    }
    
    public boolean isUseGuestAccountIfUsernameNotFound() {
        return this.useGuestAccountIfUsernameNotFound;
    }
    
    /**
     * @see org.springframework.security.userdetails.UserDetailsService#loadUserByUsername(java.lang.String)
     *
     *      Locates the user based on the username. The search in the afm_users table ignores case
     *      of username. The username case might be enforced after the UserAccount is loaded from
     *      the table. The <code>UserDetails</code> object that comes back may have a username that
     *      is of a different case than what was actually requested.
     *      <p>
     *      Returns UserDetails object, which references UserAccount object, which is cached by
     *      JCache.
     *
     * @param username the username presented to the {@link DaoAuthenticationProvider}
     *
     * @return a fully populated user record (never <code>null</code>)
     *
     * @throws UsernameNotFoundException if the user could not be found or the user has no
     *             GrantedAuthority, or the case of the username must be enforced and does not match
     *             the case of the UserAccount property.
     * @throws DataAccessException if user could not be found for a repository-specific reason
     */
    public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException,
            DataAccessException {
        final String sessionId = ContextStore.get().getSession().getId();
        
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Loading user by username=[" + username + "], sessionId=["
                    + sessionId + "]");
        }
        
        // get project and sessionId from the context
        final Project.Immutable project = ContextStore.get().getProject();
        
        Assert.notNull(project, "Project must be supplied in the Context");
        Assert.hasLength(sessionId, "sessionId must be supplied in the Context");
        
        // load user account
        UserAccount.Immutable userAccount;
        try {
            // loadUserAccount() method will ignore username case
            userAccount = project.loadUserAccount(username, sessionId, false);
            // enforce username Case, if required
            // TODO: remove this property
            if (!this.isIgnoreUsernameCase()) {
                // enforce username Case
                if (!username.equals(userAccount.getName())) {
                    // @non-translatable
                    final String message =
                            "The case of the username parameter=[" + username
                                    + "] does not match the case of the UserAccount property=["
                                    + userAccount.getName() + "]";
                    // log exception here, since it will be caught by Spring code, which does not
                    // log it
                    this.logger.error("Throwing UsernameNotFoundException: " + message);
                    
                    throw new UsernameNotFoundException(message);
                }
            }
        } catch (final ExceptionBase e) {
            // log exception here, since it will be caught by Spring code, which does not
            // log it
            this.logger.error("Throwing Spring exception, cause: " + e.toStringForLogging());
            // don't log this exception twice
            e.setLogged(true);
            
            // map ExceptionBase to Spring exception
            if (e.getErrorNumber() == ExceptionBase.ERROR_NUMBER_RECORD_NOT_FOUND) {
                userAccount = handleUsernameNotFound(sessionId, project, e);
            } else if (e.getErrorNumber() == ExceptionBase.ERROR_NUMBER_NO_ACTIVITY_LICENSE_FOR_ACTIVITY) {
                throw new PermissionDeniedDataAccessException(null, e);
            } else if (e.getErrorNumber() == ExceptionBase.ERROR_NUMBER_NO_ACTIVITIES_ASSIGNED) {
                throw new PermissionDeniedDataAccessException(null, e);
            } else if (e.getErrorNumber() == ExceptionBase.ERROR_NUMBER_ACTIVITY_NOT_LICENSED) {
                throw new PermissionDeniedDataAccessException(null, e);
            } else {
                throw new DataRetrievalFailureException(null, e);
            }
        }
        
        // attach UserAccount to Context:
        // will be used by AuthenticationInterceptor to count failed login attempts
        // authentication did not happen yet and might fail!
        ContextStore.get().setUserAccountForAuthenticationInterceptor(userAccount);
        
        // assemble UserDetails
        UserDetailsImpl userDetails;
        {
            final String password = userAccount.getPassword();
            
            final boolean enabled = true;
            final boolean accountNonExpired = true;
            
            boolean accountNonLocked = true;
            // TODO defaults
            // ignore NumberFailedLoginAttemptsAllowed if value is -1
            if (this.getPasswordPolicy().getNumberFailedLoginAttemptsAllowed() != -1) {
                // if Number of Failed Login Attempts is more than Allowed or allowed == -1
                if (userAccount.getNumberFailedLoginAttempts() > this.getPasswordPolicy()
                    .getNumberFailedLoginAttemptsAllowed()) {
                    // lock user account
                    accountNonLocked = false;
                }
            }
            
            boolean credentialsNonExpired = true;
            // check PasswordNeverExpires property of the account
            if (!userAccount.isPasswordNeverExpires()) {
                // ignore PasswordExpirationPeriod if value is -1
                if (this.getPasswordPolicy().getPasswordExpirationPeriod() != -1) {
                    // calculate date when password expires
                    final Date datePasswordChanged = userAccount.getDatePasswordChanged();
                    if (datePasswordChanged != null) {
                        final java.util.Date datePasswordExpires =
                                DateTime.addDays(datePasswordChanged, this.getPasswordPolicy()
                                    .getPasswordExpirationPeriod());
                        // if password already expired (expiration date is before now)
                        if (datePasswordExpires.before(new java.util.Date())) {
                            // mark credentials as expired
                            credentialsNonExpired = false;
                        }
                    }
                }
            }
            
            // map security groups to GrantedAuthorities
            final Set<GrantedAuthority> authorities = new HashSet<GrantedAuthority>();
            {
                // for each group
                for (final String group : userAccount.getGroups()) {
                    authorities.add(new SimpleGrantedAuthority(group));
                }
            }
            
            if (authorities.isEmpty()) {
                // @non-translatable
                final String message =
                        "No security group specified for the user=[" + username + "]";
                // log a warning
                this.logger.warn(message);
                
                // TODO These aren�t valid use cases. Any user with a role ought to have a group
                // (even if that group is just �%�).
                // However, given that users (a) edit roles and groups in separate views and (b)
                // older security implementations just added the list of groups to the afm_users
                // record; we will have databases out there with this condition. Perhaps we could
                // flag it when the user logs in (�You are assigned to a security Role that has no
                // Security Groups assigned to it. Please contact your system administrator.�).
                
                // throw new UsernameNotFoundException(message);
            }
            
            userDetails =
                    new UserDetailsImpl(username, password, enabled, accountNonExpired,
                        credentialsNonExpired, accountNonLocked, authorities);
        }
        
        userDetails.setUser(userAccount.getUser());
        userDetails.setUserAccount(userAccount);
        
        // TODO map additional userAccount properties to UserDetails
        
        return userDetails;
    }
    
    /**
     * @param ignoreUsernameCase the ignoreUsernameCase to set
     */
    public void setIgnoreUsernameCase(final boolean ignoreUsernameCase) {
        this.ignoreUsernameCase = ignoreUsernameCase;
    }
    
    /**
     * @param passwordPolicy the passwordPolicy to set
     */
    public void setPasswordPolicy(final PasswordPolicy passwordPolicy) {
        Assert.notNull(passwordPolicy, "passwordPolicy must not be null");
        this.passwordPolicy = passwordPolicy;
    }
    
    public void setUseGuestAccountIfUsernameNotFound(final boolean useGuestAccountIfUsernameNotFound) {
        this.useGuestAccountIfUsernameNotFound = useGuestAccountIfUsernameNotFound;
    }
    
    private UserAccount.Immutable handleUsernameNotFound(final String sessionId,
            final Project.Immutable project, final ExceptionBase e) {
        UserAccount.Immutable userAccount = null;
        
        if (this.isUseGuestAccountIfUsernameNotFound()) {
            try {
                final String guestUserId = project.getAttribute("/*/preferences/@guestUserID");
                
                userAccount = project.loadUserAccount(guestUserId, sessionId, false);
            } catch (final ExceptionBase f) {
                throw new UsernameNotFoundException(null, f);
            }
        } else {
            throw new UsernameNotFoundException(null, e);
        }
        
        return userAccount;
    }
}
