package com.archibus.app.common.connectors.impl.archibus.translation.segregate;

import java.util.Map;

import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;
import com.archibus.app.common.connectors.translation.exception.TranslationException;

/**
 * Interface to be implemented by classes that represent connector rules and produce multiple
 * records from a single record.
 *
 * @author cole
 * @since 22.1
 *
 */
public interface ISegregateRule extends IConnectorRule {
    /**
     * @param record to segregate into multiple records.
     * @return the records that were segregated from the original.
     * @throws TranslationException if the record cannot be segregated (note: returning no records
     *             isn't an error).
     */
    Iterable<Map<String, Object>> segregate(final Map<String, Object> record)
            throws TranslationException;
}
