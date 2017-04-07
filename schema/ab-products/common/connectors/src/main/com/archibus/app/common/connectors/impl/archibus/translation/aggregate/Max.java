package com.archibus.app.common.connectors.impl.archibus.translation.aggregate;

import com.archibus.app.common.connectors.domain.ConnectorFieldConfig;
import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.utility.StringUtil;

/**
 * A connector rule for assigning the maximum value across transactions. Nulls are not considered.
 *
 * @author cole
 * @since 21.4
 *
 */
public class Max extends AbstractAggregateRule {
    /**
     * {@inheritDoc}
     */
    public void init(final ConnectorFieldConfig connectorField) throws ConfigurationException {
        /*
         * No configuration necessary.
         */
    }

    /**
     * Find the maximum of the new value and the existing value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being maxed to the previousValue.
     * @return the combined value.
     */
    public Object aggregate(final Object previousValue, final Object transactionValue) {
        Object newValue = previousValue;
        if (!StringUtil.isNullOrEmpty(transactionValue)) {
            /*
             * TODO support dates.
             */
            if (previousValue instanceof Double) {
                newValue = maxDouble((Double) previousValue, transactionValue);
            } else if (previousValue instanceof Float) {
                newValue = maxFloat((Float) previousValue, transactionValue);
            } else if (previousValue instanceof Integer) {
                newValue = maxInteger((Integer) previousValue, transactionValue);
            } else if (previousValue instanceof String) {
                newValue =
                        ((String) previousValue).compareTo(transactionValue.toString()) > 0 ? previousValue
                                : transactionValue.toString();
            } else {
                throw new ConfigurationException("The max connector rule is incompatible with "
                        + previousValue.getClass().getCanonicalName(), null);
            }
        }
        return newValue;
    }
    
    /**
     * Find the maximum of the Double value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being maxed to the previousValue.
     * @return the combined value.
     */
    private Double maxDouble(final Double previousValue, final Object transactionValue) {
        Double newValue;
        if (transactionValue instanceof Double) {
            newValue = Math.max(previousValue, (Double) transactionValue);
        } else {
            newValue = Math.max(previousValue, Double.parseDouble(transactionValue.toString()));
        }
        return newValue;
    }

    /**
     * Find the maximum of the Float value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being maxed to the previousValue.
     * @return the combined value.
     */
    private Float maxFloat(final Float previousValue, final Object transactionValue) {
        Float newValue;
        if (transactionValue instanceof Float) {
            newValue = Math.max(previousValue, (Float) transactionValue);
        } else {
            newValue = Math.max(previousValue, Float.parseFloat(transactionValue.toString()));
        }
        return newValue;
    }
    
    /**
     * Find the maximum of the Integer value of the transactionValue to the previous value.
     *
     * @param previousValue the value on the existing record, determines the type of the new value.
     * @param transactionValue the value being maxed to the previousValue.
     * @return the combined value.
     */
    private Integer maxInteger(final Integer previousValue, final Object transactionValue) {
        Integer newValue;
        if (transactionValue instanceof Integer) {
            newValue = Math.max(previousValue, (Integer) transactionValue);
        } else {
            newValue = Math.max(previousValue, Integer.parseInt(transactionValue.toString()));
        }
        return newValue;
    }
    
}
