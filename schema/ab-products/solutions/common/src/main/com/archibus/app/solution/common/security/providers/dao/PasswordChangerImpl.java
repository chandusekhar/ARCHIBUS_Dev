package com.archibus.app.solution.common.security.providers.dao;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.authentication.dao.SaltSource;
import org.springframework.security.authentication.encoding.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.Assert;

import com.archibus.config.*;
import com.archibus.context.*;
import com.archibus.context.Context;
import com.archibus.context.utility.SecurityControllerTemplate;
import com.archibus.security.*;
import com.archibus.security.providers.dao.PasswordChanger;
import com.archibus.utility.*;

/**
 *
 * @author Valery Tydykov
 *
 */
public class PasswordChangerImpl implements PasswordChanger, InitializingBean {

    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());

    private PasswordEncoder passwordEncoder;

    private PasswordPatternValidator passwordPatternValidator;

    // optional
    private org.springframework.security.authentication.dao.SaltSource saltSource;

    private UserDetailsService userDetailsService;

    /*
     * (non-Javadoc)
     *
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
     */
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.userDetailsService, "userDetailsService must be set");
        Assert.notNull(this.passwordEncoder, "PasswordEncoder must be set");
        Assert.notNull(this.passwordPatternValidator, "PasswordPatternValidator must be set");
    }

    /*
     * (non-Javadoc)
     *
     * @see
     * com.archibus.app.solution.common.security.providers.dao.PasswordChanger#changePassword(java
     * .lang.String, java.lang.String, java.lang.String, java.lang.String)
     */
    public void changePassword(final String userId, final String oldPassword,
            final String newPassword, final String projectId) throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info("ChangePassword for userId = [" + userId + "], projectId=["
                    + projectId + "]");
        }

        if (this.logger.isDebugEnabled()) {
            this.logger.debug("userId = [" + userId + "], oldPassword=[" + oldPassword
                + "], newPassword=[" + newPassword + "]");
        }

        // TODO User is not logged in - this mode is not used? Remove?
        // if project was specified
        if (StringUtil.notNullOrEmpty(projectId)) {
            // project was specified, user was not logged in

            // User is not logged in
            // Set core user session from the specified project as current context
            final Context context = ContextStore.get();
            final ConfigManager.Immutable configManager = context.getConfigManager();
            final Project.Immutable project =
                    SecurityControllerTemplate.findProject(configManager, projectId);

            // project must exist
            if (project == null) {
                // @non-translatable
                throw new ExceptionBase("ProjectId does not match any projects");
            }

            // use core user session as context
            final UserSession.Immutable userSession = project.loadCoreUserSession();
            // TODO verify: 1. core user session is used inside of transaction; 2. not used outside
            // of
            // transaction.
            // TODO Re-setting userSession in context is not the right thing to do. Instead, we
            // should use something like RunAs functionality, or the original user session should
            // have enough privileges.
            // Do NOT call setUserSession in other places!
            // TODO clean-up user session in the Context in finally block
            context.setUserSession(userSession);
        }

        // load user account by specified userId
        final UserDetailsImpl userDetails =
                (UserDetailsImpl) this.getUserDetailsService().loadUserByUsername(userId);

        final UserAccount.ThreadSafe userAccount =
                (UserAccount.ThreadSafe) userDetails.getUserAccount();

        Assert.notNull(userAccount, "UserAccount must be supplied.");

        // Check if user is trying to change his own password.
        checkIfUserChangingOwnPassword(userAccount);

        // validate old password
        if (!this.getPasswordEncoder().isPasswordValid(userAccount.getPassword(), oldPassword,
            userId)) {
            // @translatable
            throw new ExceptionBase("Your old password does not match our records.", true);
        }

        // validate new password pattern
        this.getPasswordPatternValidator().validate(newPassword);

        // encode password
        // get salt
        Object salt = null;
        if (this.saltSource != null) {
            salt = this.saltSource.getSalt(userDetails);
        }

        final String newPasswordEncoded =
                this.getPasswordEncoder().encodePassword(newPassword, salt);

        // update password in user account
        userAccount.changePassword(newPasswordEncoded);
        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }

    /**
     * @return the passwordEncoder
     */
    public PasswordEncoder getPasswordEncoder() {
        return this.passwordEncoder;
    }

    /**
     * @return the passwordPatternValidator
     */
    public PasswordPatternValidator getPasswordPatternValidator() {
        return this.passwordPatternValidator;
    }

    /**
     * @return the saltSource
     */
    public SaltSource getSaltSource() {
        return this.saltSource;
    }

    /**
     * @return the userDetailsService
     */
    public UserDetailsService getUserDetailsService() {
        return this.userDetailsService;
    }

    /**
     * @param passwordEncoder the passwordEncoder to set
     */
    public void setPasswordEncoder(final PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * @param passwordPatternValidator the passwordPatternValidator to set
     */
    public void setPasswordPatternValidator(final PasswordPatternValidator passwordPatternValidator) {
        this.passwordPatternValidator = passwordPatternValidator;
    }

    /**
     * @param saltSource the saltSource to set
     */
    public void setSaltSource(final SaltSource saltSource) {
        this.saltSource = saltSource;
    }

    /**
     * @param userDetailsService the userDetailsService to set
     */
    public void setUserDetailsService(final UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * Checks if user is trying to change his own password. Throws ExceptionBase if user is trying
     * to change password of another user, and the user is not a member of the
     * executeSystemAdminActions group.
     *
     * @param userAccount of the current user.
     * */
    private void checkIfUserChangingOwnPassword(final UserAccount.ThreadSafe userAccount) {
        final Context context = ContextStore.get();
        if (!context.getUserAccount().getName().equals(userAccount.getName())) {
            // user is trying to change password of another user
            // check if user is member of the executeSystemAdminActions group
            if (!context.getUserAccount().isMemberOfExecuteSystemAdminActionsGroup()) {
                // @non-translatable
                final String errorMessage =
                        "You don't have permission to change password of another user.";

                throw new ExceptionBase(errorMessage);
            }
        }
    }
}
