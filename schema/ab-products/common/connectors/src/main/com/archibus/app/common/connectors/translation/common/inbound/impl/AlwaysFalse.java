package com.archibus.app.common.connectors.translation.common.inbound.impl;

import com.archibus.app.common.connectors.translation.common.inbound.IPredicate;

/**
 * A predicate that always resolves to false, a contradiction.
 *
 * TODO make AlwaysFalse a singleton
 *
 * @author cole
 *
 * @param <ArgumentType> the type of argument that is given to test the predicate against.
 */
public class AlwaysFalse<ArgumentType> implements IPredicate<ArgumentType> {

    /**
     * @param argument will be ignored. irrelevant.
     * @return false
     */
    public boolean evaluate(final ArgumentType argument) {
        return false;
    }

}
