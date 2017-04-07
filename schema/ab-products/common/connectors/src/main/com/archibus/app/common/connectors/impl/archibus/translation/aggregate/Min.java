package com.archibus.app.common.connectors.impl.archibus.translation.aggregate;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.utility.StringUtil;

/**
 * A connector rule for assigning the minimum value across transactions. Nulls are not considered.
 *
 * @author cole
 * @since 21.4
 *
 */
public class Min extends AbstractAggregateRule {
    /**
     * {@inheritDoc}
     */
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        /*
         * No configuration necessary.
         */
    }

    /**
     * Find the minimum of the new value and the existing value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being mined to the previousValue.
     * @return the combined value.
     */
    public Object aggregate(final Object previousValue, final Object transactionValue) {
        Object newValue = previousValue;
        if (!StringUtil.isNullOrEmpty(transactionValue)) {
            /*
             * TODO support dates.
             */
            if (previousValue instanceof Double) {
                newValue = minDouble((Double) previousValue, transactionValue);
            } else if (previousValue instanceof Float) {
                newValue = minFloat((Float) previousValue, transactionValue);
            } else if (previousValue instanceof Integer) {
                newValue = minInteger((Integer) previousValue, transactionValue);
            } else if (previousValue instanceof String) {
                newValue =
                        ((String) previousValue).compareTo(transactionValue.toString()) < 0 ? previousValue
                                : transactionValue.toString();
            } else {
                throw new ConfigurationException("The min connector rule is incompatible with "
                        + previousValue.getClass().getCanonicalName(), null);
            }
        }
        return newValue;
    }

    /**
     * Find the minimum of the Double value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being mined to the previousValue.
     * @return the combined value.
     */
    private Double minDouble(final Double previousValue, final Object transactionValue) {
        Double newValue;
        if (transactionValue instanceof Double) {
            newValue = Math.min(previousValue, (Double) transactionValue);
        } else {
            newValue = Math.min(previousValue, Double.parseDouble(transactionValue.toString()));
        }
        return newValue;
    }
    
    /**
     * Find the minimum of the Float value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being mined to the previousValue.
     * @return the combined value.
     */
    private Float minFloat(final Float previousValue, final Object transactionValue) {
        Float newValue;
        if (transactionValue instanceof Float) {
            newValue = Math.min(previousValue, (Float) transactionValue);
        } else {
            newValue = Math.min(previousValue, Float.parseFloat(transactionValue.toString()));
        }
        return newValue;
    }

    /**
     * Find the minimum of the Integer value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being mined to the previousValue.
     * @return the combined value.
     */
    private Integer minInteger(final Integer previousValue, final Object transactionValue) {
        Integer newValue;
        if (transactionValue instanceof Integer) {
            newValue = Math.min(previousValue, (Integer) transactionValue);
        } else {
            newValue = Math.min(previousValue, Integer.parseInt(transactionValue.toString()));
        }
        return newValue;
    }

}
