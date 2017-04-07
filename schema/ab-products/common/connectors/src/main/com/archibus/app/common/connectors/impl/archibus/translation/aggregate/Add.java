package com.archibus.app.common.connectors.impl.archibus.translation.aggregate;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.utility.StringUtil;

/**
 * A connector rule for aggregating data across transactions by adding or appending values. Nulls
 * are not considered.
 *
 * @author cole
 * @since 21.4
 *
 */
public class Add extends AbstractAggregateRule {
    /**
     * {@inheritDoc}
     */
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        /*
         * No configuration necessary.
         */
    }

    /**
     * Add the new value to the existing value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being added to the previousValue.
     * @return the combined value.
     */
    public Object aggregate(final Object previousValue, final Object transactionValue) {
        Object newValue = previousValue;
        if (!StringUtil.isNullOrEmpty(transactionValue)) {
            if (previousValue instanceof Double) {
                newValue = addDouble((Double) previousValue, transactionValue);
            } else if (previousValue instanceof Float) {
                newValue = addFloat((Float) previousValue, transactionValue);
            } else if (previousValue instanceof Integer) {
                newValue = addInteger((Integer) previousValue, transactionValue);
            } else if (previousValue instanceof String) {
                newValue = previousValue + transactionValue.toString();
            } else {
                throw new ConfigurationException("Add connector rule is incompatible with "
                        + previousValue.getClass().getCanonicalName(), null);
            }
        }
        return newValue;
    }
    
    /**
     * Add the Double value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being added to the previousValue.
     * @return the combined value.
     */
    private Double addDouble(final Double previousValue, final Object transactionValue) {
        Double newValue;
        if (transactionValue instanceof Double) {
            newValue = previousValue + (Double) transactionValue;
        } else {
            newValue = previousValue + Double.parseDouble(transactionValue.toString());
        }
        return newValue;
    }

    /**
     * Add the Float value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being added to the previousValue.
     * @return the combined value.
     */
    private Float addFloat(final Float previousValue, final Object transactionValue) {
        Float newValue;
        if (transactionValue instanceof Float) {
            newValue = previousValue + (Float) transactionValue;
        } else {
            newValue = previousValue + Float.parseFloat(transactionValue.toString());
        }
        return newValue;
    }
    
    /**
     * Add the Integer value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being added to the previousValue.
     * @return the combined value.
     */
    private Integer addInteger(final Integer previousValue, final Object transactionValue) {
        Integer newValue;
        if (transactionValue instanceof Integer) {
            newValue = previousValue + (Integer) transactionValue;
        } else {
            newValue = previousValue + Integer.parseInt(transactionValue.toString());
        }
        return newValue;
    }
}
