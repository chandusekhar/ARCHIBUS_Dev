package com.archibus.app.common.connectors.impl.archibus.translation.aftereffect;

import java.util.Map;

import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;

/**
 * A rule to do something after a transaction is applied, which may update the transaction if
 * applying it changes it (e.g. auto number, database triggers, status).
 *
 * @author cole
 *
 */
public interface IAfterEffectRule extends IConnectorRule {

    /**
     * @param archibusRecord the field values from the ARCHIBUS record the transaction was applied
     *            to.
     * @param transaction the transaction record as it was when it was applied (modifiable).
     */
    void applyAfterEffect(final Map<String, Object> archibusRecord, final Map<String, Object> transaction);
}
