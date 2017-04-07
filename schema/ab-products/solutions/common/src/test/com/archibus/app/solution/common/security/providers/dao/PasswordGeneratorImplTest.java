/**
 * 
 */
package com.archibus.app.solution.common.security.providers.dao;

import com.archibus.app.solution.common.security.providers.dao.PasswordGeneratorImpl;

import junit.framework.TestCase;

/**
 * @author tydykov
 * 
 */
public class PasswordGeneratorImplTest extends TestCase {
    private PasswordGeneratorImpl passwordGenerator;
    
    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#setUp()
     */
    @Override
    protected void setUp() throws Exception {
        this.passwordGenerator = new PasswordGeneratorImpl();
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see junit.framework.TestCase#tearDown()
     */
    @Override
    protected void tearDown() throws Exception {
        this.passwordGenerator = null;
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.solution.common.security.providers.dao.PasswordGeneratorImpl#generatePassword(java.lang.String, java.lang.String)}
     * .
     */
    public final void testGeneratePassword() {
        String result = this.passwordGenerator.generatePassword("AI", "myKeyPhrase");
        System.out.println(result);
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.solution.common.security.providers.dao.PasswordGeneratorImpl#calculateHash(java.lang.String)}
     * .
     */
    public final void testCalculateHash() {
        int result = this.passwordGenerator.calculateHash("AFM");
        assertEquals(212, result);
    }
}
