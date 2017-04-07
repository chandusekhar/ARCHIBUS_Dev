package com.archibus.app.solution.common.security.providers.dao;

import org.apache.log4j.Logger;
import org.springframework.security.authentication.dao.SaltSource;
import org.springframework.util.Assert;

import com.archibus.security.*;

/**
 * Salt source, which uses username as salt.
 *
 * @author Valery Tydykov
 *
 * @see PasswordManagerImpl
 * @see PasswordChangerImpl
 */
public class UsernameSaltSource implements SaltSource {
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    /*
     * (non-Javadoc)
     *
     * @see
     * org.springframework.security.providers.dao.SaltSource#getSalt(org.springframework.security
     * .userdetails.UserDetails)
     */
    public Object getSalt(final org.springframework.security.core.userdetails.UserDetails user) {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Using username as salt");
        }

        Assert.isAssignable(UserDetailsImpl.class, user.getClass());

        final UserAccount.Immutable userAccount = ((UserDetailsImpl) user).getUserAccount();
        Assert.notNull(userAccount);

        final String username = userAccount.getName();

        return username;
    }
}
