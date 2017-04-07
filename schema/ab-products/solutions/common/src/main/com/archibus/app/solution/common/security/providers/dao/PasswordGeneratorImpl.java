/**
 * 
 */
package com.archibus.app.solution.common.security.providers.dao;

import java.util.Calendar;

/**
 * Generates temporary password, which should be unique for each user. Uses the key phrase as salt.
 * 
 * @author Valery Tydykov
 * 
 */
public class PasswordGeneratorImpl implements PasswordGenerator {
    
    public String generatePassword(final String userId, final String keyPhrase) {
        // generate temporary password
        // use the key phrase
        String result1 = keyPhrase;
        // add the month and day as digits,
        result1 += Calendar.getInstance().get(Calendar.MONTH);
        result1 += Calendar.getInstance().get(Calendar.DAY_OF_MONTH);
        // and hashes it with the user name (e.g. ,
        // sum each character of the name as an integer
        final int hashOfUserId = calculateHash(userId);
        // then convert the key phrase by adding this integer mod 128 to each character in the key
        // phrase).
        
        String result2 = "";
        for (int i = 0; i < result1.length(); i++) {
            result2 += (char) (hashOfUserId + result1.charAt(i)) % 128;
        }
        
        return result2;
    }
    
    int calculateHash(final String value) {
        int result = 0;
        for (int i = 0; i < value.length(); i++) {
            result += value.charAt(i);
        }
        
        return result;
    }
}
