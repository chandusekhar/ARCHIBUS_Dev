package com.archibus.app.common.connectors.impl.archibus.translation.skip;

import java.util.Map;

import com.archibus.app.common.connectors.impl.archibus.translation.IConnectorRule;

/**
 * A connector rule that may indicate a record should be skipped.
 * 
 * @author cole
 * 
 */
public interface ISkipRecordCondition extends IConnectorRule {
    /**
     * @param record to be considered.
     * @return true, if the record should be skipped.
     */
    boolean shouldSkip(final Map<String, Object> record);
    
    /**
     * @param record to be considered.
     * @return the reason the record would be skipped.
     */
    String getReason(final Map<String, Object> record);
}
