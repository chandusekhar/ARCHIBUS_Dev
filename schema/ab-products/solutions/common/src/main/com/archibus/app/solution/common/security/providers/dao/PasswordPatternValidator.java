/**
 * 
 */
package com.archibus.app.solution.common.security.providers.dao;

import com.archibus.utility.ExceptionBase;

/**
 * Check if new password conforms to the specified password pattern policy.
 * 
 * @author Valery Tydykov
 * 
 * @see PasswordChangerImpl
 */
public interface PasswordPatternValidator {
    /**
     * Check if new password conforms to the specified password pattern policy.
     * 
     * @param password new password to validate
     * @throws ExceptionBase if password does not conform to the specified password pattern policy.
     */
    void validate(String password) throws ExceptionBase;
}