package com.archibus.app.common.connectors.impl.archibus.translation.inherited;

import com.archibus.app.common.connectors.impl.archibus.translation.record.IRecordTranslator;

/**
 * Provides translations that are not connector type specific and take input from a record other
 * than the record they apply to.
 *
 * @author cole
 * @since 22.1
 *
 */
public interface IInheritedRecordTranslator extends IRecordTranslator {
    /**
     * @return an identifier for the transaction definition for the source record.
     */
    String getTransactionDefinitionId();
}
