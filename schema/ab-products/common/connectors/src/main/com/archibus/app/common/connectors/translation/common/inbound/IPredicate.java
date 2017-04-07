package com.archibus.app.common.connectors.translation.common.inbound;

/**
 * An operation that determines if an argument meets criteria.
 * 
 * @author cole
 * 
 * @param <ArgumentType> the type of argument that is evaluated.
 */
public interface IPredicate<ArgumentType> {
    /**
     * @param argument the value to be evaluated.
     * @return true if and only if the argument meets the implemented criteria.
     */
    boolean evaluate(final ArgumentType argument);
}
