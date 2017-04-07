/**
 * 
 */
package com.archibus.app.solution.common.security.providers.dao;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.util.Assert;

/**
 * Password policy - related properties.
 * 
 * @author Valery Tydykov
 * 
 * @see PasswordManagerImpl
 * @see UserAccountDao
 */
public class PasswordPolicy implements InitializingBean {
    private int numberFailedLoginAttemptsAllowed = -1;
    
    private int passwordExpirationPeriod = -1;
    
    /*
     * (non-Javadoc)
     * 
     * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
     */
    public void afterPropertiesSet() throws Exception {
        Assert
            .isTrue(
                (this.numberFailedLoginAttemptsAllowed > 0 || this.numberFailedLoginAttemptsAllowed == -1),
                "numberFailedLoginAttemptsAllowed must be positive or -1");
        
        Assert.isTrue((this.passwordExpirationPeriod > 0 || this.passwordExpirationPeriod == -1),
            "passwordExpirationPeriod must be positive or -1");
    }
    
    /**
     * @return the numberFailedLoginAttemptsAllowed
     */
    public int getNumberFailedLoginAttemptsAllowed() {
        return this.numberFailedLoginAttemptsAllowed;
    }
    
    /**
     * @return the passwordExpirationPeriod
     */
    public int getPasswordExpirationPeriod() {
        return this.passwordExpirationPeriod;
    }
    
    /**
     * @param numberFailedLoginAttemptsAllowed the numberFailedLoginAttemptsAllowed to set
     */
    public void setNumberFailedLoginAttemptsAllowed(final int numberFailedLoginAttemptsAllowed) {
        this.numberFailedLoginAttemptsAllowed = numberFailedLoginAttemptsAllowed;
    }
    
    /**
     * @param passwordExpirationPeriod the passwordExpirationPeriod to set
     */
    public void setPasswordExpirationPeriod(final int passwordExpirationPeriod) {
        this.passwordExpirationPeriod = passwordExpirationPeriod;
    }
}
