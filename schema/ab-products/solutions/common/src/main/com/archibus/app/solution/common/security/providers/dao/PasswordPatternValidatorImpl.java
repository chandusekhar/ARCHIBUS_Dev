/**
 *
 */
package com.archibus.app.solution.common.security.providers.dao;

import com.archibus.utility.ExceptionBase;
import com.archibus.utility.regexp.*;

/**
 * Check if new password conforms to the specified password pattern policy.
 *
 * @author Valery Tydykov
 *
 * @see PasswordChangerImpl
 */
public class PasswordPatternValidatorImpl implements PasswordPatternValidator {
    private int minimumLength = 8;

    private boolean mustIncludeNumbers = true;

    private boolean mustIncludePunctuation = true;

    private boolean mustNotConsistOfWhitespaces = true;

    /**
     * Getter for the mustNotConsistOfWhitespaces property.
     *
     * @see mustNotConsistOfWhitespaces
     * @return the mustNotConsistOfWhitespaces property.
     */
    public boolean isMustNotConsistOfWhitespaces() {
        return this.mustNotConsistOfWhitespaces;
    }

    /**
     * Setter for the mustNotConsistOfWhitespaces property.
     *
     * @see mustNotConsistOfWhitespaces
     * @param mustNotConsistOfWhitespaces the mustNotConsistOfWhitespaces to set
     */

    public void setMustNotConsistOfWhitespaces(final boolean mustNotConsistOfWhitespaces) {
        this.mustNotConsistOfWhitespaces = mustNotConsistOfWhitespaces;
    }

    /**
     * Getter for the minimumLength property.
     *
     * @see minimumLength
     * @return the minimumLength property.
     */
    public int getMinimumLength() {
        return this.minimumLength;
    }

    /**
     * Setter for the minimumLength property.
     *
     * @see minimumLength
     * @param minimumLength the minimumLength to set
     */

    public void setMinimumLength(final int minimumLength) {
        this.minimumLength = minimumLength;
    }

    /**
     * Getter for the mustIncludeNumbers property.
     *
     * @see mustIncludeNumbers
     * @return the mustIncludeNumbers property.
     */
    public boolean isMustIncludeNumbers() {
        return this.mustIncludeNumbers;
    }

    /**
     * Setter for the mustIncludeNumbers property.
     *
     * @see mustIncludeNumbers
     * @param mustIncludeNumbers the mustIncludeNumbers to set
     */

    public void setMustIncludeNumbers(final boolean mustIncludeNumbers) {
        this.mustIncludeNumbers = mustIncludeNumbers;
    }

    /**
     * Getter for the mustIncludePunctuation property.
     *
     * @see mustIncludePunctuation
     * @return the mustIncludePunctuation property.
     */
    public boolean isMustIncludePunctuation() {
        return this.mustIncludePunctuation;
    }

    /**
     * Setter for the mustIncludePunctuation property.
     *
     * @see mustIncludePunctuation
     * @param mustIncludePunctuation the mustIncludePunctuation to set
     */

    public void setMustIncludePunctuation(final boolean mustIncludePunctuation) {
        this.mustIncludePunctuation = mustIncludePunctuation;
    }

    @Override
    public void validate(final String password) throws ExceptionBase {
        if (this.getMinimumLength() > password.length()) {
            // @translatable
            final String message = "Password must have minimum length: {0}";
            throw new ExceptionBase(message, new Object[] { Integer.valueOf(getMinimumLength()) },
                true);
        }
        
        if (this.isMustNotConsistOfWhitespaces()) {
            if (password.trim().isEmpty()) {
                // @translatable
                final String message = "Password must not consist of whitespaces only";
                throw new ExceptionBase(message, true);
            }
        }
        
        if (this.isMustIncludeNumbers()) {
            REProgram reProgram = null;
            try {
                reProgram = new RECompiler().compile("[0-9]+");
            } catch (final RESyntaxException e) {
                // error in RE pattern
                throw new ExceptionBase(null, e);
            }
            
            final RE re = new RE(reProgram);
            if (!re.match(password)) {
                // @translatable
                final String message = "Password must include numbers";
                throw new ExceptionBase(message, true);
            }
        }
        
        if (this.isMustIncludePunctuation()) {
            REProgram reProgram = null;
            try {
                reProgram = new RECompiler().compile("[:punct:]+");
            } catch (final RESyntaxException e) {
                // error in RE pattern
                throw new ExceptionBase(null, e);
            }
            
            final RE re = new RE(reProgram);
            if (!re.match(password)) {
                // @translatable
                final String message = "Password must include punctuation";
                throw new ExceptionBase(message, true);
            }
        }
    }
}
