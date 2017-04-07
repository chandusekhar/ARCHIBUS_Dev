package com.archibus.app.common.connectors.translation.common.inbound;

import com.archibus.app.common.connectors.exception.StepException;

/**
 * Performs some operation on individual records.
 *
 * @author cole
 *
 * @param <OriginalType> the type of record the process should be performed on.
 * @param <HandledType> the type of the record after it's been processed.
 */
public interface IRecordHandler<OriginalType, HandledType> {
    /**
     * Perform some operation on the provided record.
     *
     * @param record the record the operation should be performed on.
     * @return the record after the operation has been performed.
     * @throws StepException if anything goes wrong, to be further specified by implementations.
     */
    HandledType handleRecord(final OriginalType record) throws StepException;
}
