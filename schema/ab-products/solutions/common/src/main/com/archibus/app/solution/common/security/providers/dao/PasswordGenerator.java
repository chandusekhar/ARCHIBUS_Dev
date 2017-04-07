/**
 * 
 */
package com.archibus.app.solution.common.security.providers.dao;

/**
 * Generates temporary password, which should be unique for each user. Uses the key phrase as salt.
 * 
 * @author Valery Tydykov
 * 
 */
public interface PasswordGenerator {
    /**
     * Generate temporary password.
     * 
     * @param userId user ID
     * @param keyPhrase used as salt
     * @return temporary password
     */
    String generatePassword(String userId, String keyPhrase);
}