/**
 *
 */
package com.archibus.app.solution.common.security.providers.dao;

import junit.framework.TestCase;

import com.archibus.utility.ExceptionBase;

/**
 * @author Valery
 *
 */
public class PasswordPatternValidatorImplTest extends TestCase {

    PasswordPatternValidatorImpl passwordPatternValidator = new PasswordPatternValidatorImpl();

    /**
     * Test method for
     * {@link com.archibus.app.solution.common.security.providers.dao.PasswordPatternValidatorImpl#validate(java.lang.String)}
     * .
     */
    public final void testValidateLength() {
        this.passwordPatternValidator.setMinimumLength(8);
        this.passwordPatternValidator.setMustIncludePunctuation(false);
        this.passwordPatternValidator.setMustIncludeNumbers(false);
        try {
            this.passwordPatternValidator.validate("1");
            fail("Exception expected");
        } catch (final ExceptionBase e) {
        }

        this.passwordPatternValidator.validate("12345678");
        this.passwordPatternValidator.validate("1234567890");
    }

    public final void testValidateNumbers() {
        this.passwordPatternValidator.setMinimumLength(0);
        this.passwordPatternValidator.setMustIncludeNumbers(true);
        this.passwordPatternValidator.setMustIncludePunctuation(false);
        try {
            this.passwordPatternValidator.validate("abcdef");
            fail("Exception expected");
        } catch (final ExceptionBase e) {
        }

        this.passwordPatternValidator.validate("abcdef1");
    }

    public final void testValidatePunctuation() {
        this.passwordPatternValidator.setMinimumLength(0);
        this.passwordPatternValidator.setMustIncludeNumbers(false);
        this.passwordPatternValidator.setMustIncludePunctuation(true);
        try {
            this.passwordPatternValidator.validate("abcdef");
            fail("Exception expected");
        } catch (final ExceptionBase e) {
        }

        this.passwordPatternValidator.validate("abcdef1,");
    }

    public final void testValidateMustNotConsistOfWhitespaces() {
        this.passwordPatternValidator.setMinimumLength(0);
        this.passwordPatternValidator.setMustNotConsistOfWhitespaces(true);
        this.passwordPatternValidator.setMustIncludeNumbers(false);
        this.passwordPatternValidator.setMustIncludePunctuation(false);

        try {
            this.passwordPatternValidator.validate("");
            fail("Exception expected");
        } catch (final ExceptionBase e) {
        }

        try {
            this.passwordPatternValidator.validate(" ");
            fail("Exception expected");
        } catch (final ExceptionBase e) {
        }
        
        try {
            this.passwordPatternValidator.validate("   ");
            fail("Exception expected");
        } catch (final ExceptionBase e) {
        }

        try {
            this.passwordPatternValidator.validate("   \n\r");
            fail("Exception expected");
        } catch (final ExceptionBase e) {
        }

        this.passwordPatternValidator.validate("abcdef1");
        this.passwordPatternValidator.validate(" abcdef1 \n\r");
    }
}
