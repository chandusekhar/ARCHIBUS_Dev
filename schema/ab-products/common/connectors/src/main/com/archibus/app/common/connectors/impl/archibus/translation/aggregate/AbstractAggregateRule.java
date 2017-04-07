package com.archibus.app.common.connectors.impl.archibus.translation.aggregate;

import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.translation.common.inbound.IAggregateFunction;

/**
 * To be implemented by classes that apply transactions that take previous values as their input.
 *
 * @author cole
 * @since 21.4
 *
 */
public abstract class AbstractAggregateRule implements IConnectorRule, IAggregateFunction {
    /*
     * JUSTIFICATION: returning true *is* the implementation.
     */
    /**
     * @return true, as aggregate rules require values to aggregate.
     */
    @SuppressWarnings("PMD.EmptyMethodInAbstractClassShouldBeAbstract")
    public boolean requiresExistingValue() {
        return true;
    }
}
