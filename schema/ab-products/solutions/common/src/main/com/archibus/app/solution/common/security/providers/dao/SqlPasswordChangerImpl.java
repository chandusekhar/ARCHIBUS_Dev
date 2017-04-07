package com.archibus.app.solution.common.security.providers.dao;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.security.authentication.encoding.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.Assert;

import com.archibus.config.Project;
import com.archibus.context.*;
import com.archibus.security.*;
import com.archibus.security.providers.dao.SqlPasswordChanger;
import com.archibus.utility.ExceptionBase;

/**
 * Loads user account or user role by specified ID, encodes new SQL password, updates SQL password
 * in user account or user role, saves it. Does not validate old SQL password. Does not check if new
 * SQL password conforms to password pattern. Does not use saltSource.
 *
 * @author Valery Tydykov
 *
 */
public class SqlPasswordChangerImpl implements SqlPasswordChanger, InitializingBean {
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    private org.springframework.security.authentication.encoding.PasswordEncoder passwordEncoder;
    
    private UserDetailsService userDetailsService;
    
    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
     */
    public void afterPropertiesSet() throws Exception {
        Assert.notNull(this.userDetailsService, "userDetailsService must be set");
        Assert.notNull(this.passwordEncoder, "PasswordEncoder must be set");
    }
    
    public void changeSqlSecurityForUserAcccount(final String username, final String sqlUserId,
            final String sqlPassword) throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info("changeSqlSecurityForUserAcccount for username = [" + username
                    + "], sqlUserId=[" + sqlUserId + "]");
        }
        
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("sqlPassword=[" + sqlPassword + "]");
        }
        
        // User is logged in.
        
        // load user account by specified username
        final UserDetailsImpl userDetails =
                (UserDetailsImpl) this.getUserDetailsService().loadUserByUsername(username);
        
        final UserAccount.ThreadSafe userAccount =
                (UserAccount.ThreadSafe) userDetails.getUserAccount();
        
        Assert.notNull(userAccount, "UserAccount must be supplied.");
        
        // use sqlUsername as key
        final String key = userAccount.getSqlUsername();
        
        // encode password
        final String sqlPasswordEncoded =
                this.getPasswordEncoder().encodePassword(sqlPassword, key);
        
        // update password in user account
        userAccount.setSqlPassword(sqlPasswordEncoded);
        // update userId in user account
        userAccount.setSqlUsername(sqlUserId);
        // save
        UserAccountLoaderImpl.saveUserAccount(userAccount);
    }
    
    public void changeSqlSecurityForUserRole(final String roleId, final String sqlUserId,
            final String sqlPassword) throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info("changeSqlSecurityForUserRole for roleId = [" + roleId
                    + "], sqlUserId=[" + sqlUserId + "]");
        }
        
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("sqlPassword=[" + sqlPassword + "]");
        }
        
        // User is logged in.
        // Find specified role in the current project.
        final Context context = ContextStore.get();
        final Project.Immutable project = context.getProject();
        Assert.notNull(project, "project must be supplied.");
        
        final UserRole.ThreadSafe userRole = (UserRole.ThreadSafe) project.findUserRole(roleId);
        Assert.notNull(userRole, "userRole must be supplied.");
        
        // use sqlUsername as key
        final String key = userRole.getSqlUsername();
        
        // encode password
        final String sqlPasswordEncoded =
                this.getPasswordEncoder().encodePassword(sqlPassword, key);
        
        // update password in user role
        userRole.setSqlPassword(sqlPasswordEncoded);
        // update userId in user role
        userRole.setSqlUsername(sqlUserId);
        // save
        UserRoleLoaderImpl.saveUserRole(userRole);
    }
    
    /**
     * @return the passwordEncoder
     */
    public PasswordEncoder getPasswordEncoder() {
        return this.passwordEncoder;
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
     * @param userDetailsService the userDetailsService to set
     */
    public void setUserDetailsService(final UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }
}
