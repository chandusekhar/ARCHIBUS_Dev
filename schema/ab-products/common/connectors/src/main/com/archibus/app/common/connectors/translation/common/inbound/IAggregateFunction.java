package com.archibus.app.common.connectors.translation.common.inbound;

/**
 *
 * Interface to be implemented by classes that apply transactions that take previous values as their
 * input.
 *
 * @author cole
 * @since 21.4
 *
 */
public interface IAggregateFunction {
    /**
     * Apply the new value to the existing value.
     *
     * @param previousValue the previous value from the database.
     * @param transactionValue the value to be applied by a transaction.
     * @return the aggregated value.
     */
    Object aggregate(final Object previousValue, final Object transactionValue);
}
