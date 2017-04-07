package com.archibus.app.common.connectors.translation.text;

import java.io.Serializable;

/**
 * A pair of escaped and unescaped versions of a control sequence, along with the function the
 * sequence indicates.
 *
 * @author cole
 */
public class CharSequenceSet implements Serializable {
    
    /**
     * Required serial version id, CharSequenceComparator requires this to be serializable.
     */
    private static final long serialVersionUID = -8293268482833851236L;

    /**
     * The function this sequence indicates.
     */
    private final CharSequenceFunction function;

    /**
     * The escaped version of this character sequence.
     */
    private final CharSequence escaped;

    /**
     * The unescaped version of this character sequence.
     */
    private final CharSequence unescaped;

    /**
     * @param function the function this sequence indicates.
     * @param escaped the escaped version of this character sequence.
     * @param unescaped the unescaped version of this character sequence.
     */
    public CharSequenceSet(final CharSequenceFunction function, final CharSequence escaped,
            final CharSequence unescaped) {
        this.function = function;
        this.escaped = escaped;
        this.unescaped = unescaped;
    }

    /**
     * @return the function this sequence indicates.
     */
    public CharSequenceFunction getFunction() {
        return this.function;
    }

    /**
     * @return the escaped version of this character sequence.
     */
    public CharSequence getEscaped() {
        return this.escaped;
    }

    /**
     * @return the unescaped version of this character sequence.
     */
    public CharSequence getUnescaped() {
        return this.unescaped;
    }
}