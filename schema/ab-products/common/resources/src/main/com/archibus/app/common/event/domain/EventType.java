package com.archibus.app.common.event.domain;

import com.archibus.utility.EnumTemplate;

/**
 * Type of Data Event. Mapped to Event Type field of afm_data_event_log table.
 * <p>
 * There is a mismatch between the enum definitions in ARCHIBUS schema and Java: ARCHIBUS schema has
 * value "N/A", Java does not. ARCHIBUS schema has value "N/A;N/A", which is a default value for the
 * field. Since a caller must always supply EventType when saving or updating a record, it is an
 * error to have "N/A" value in a record. So, EventType enum does not have "N/A" value, which means
 * that fromString method will throw an exception when "N/A" value is supplied (this would happen
 * during loading of "N/A" value from database).
 * <p>
 * Summary: ARCHIBUS schema contains definition for this enum which does not match this enum
 * (missing "N/A" value).
 * 
 * @author Valery Tydykov
 * 
 */
public enum EventType {
    /**
     * Record was changed.
     */
    RECORD_CHANGED,
    /**
     * Records were read.
     */
    RECORDS_READ,
    
    /**
     * Records were read using aggregated SQL.
     */
    RECORDS_READ_AGGREGATED,
    /**
     * Sql statement was executed.
     */
    SQL_EXECUTED;
    
    /**
     * Suppress PMD warning "AvoidStaticFields".
     * <p>
     * Justification: False positive: this is an array of constants.
     */
    @SuppressWarnings("PMD.AvoidStaticFields")
    /**
     * Mapping to String values.
     */
    private static final Object[][] STRINGS_TO_ENUMS = { { "RecordChanged", RECORD_CHANGED },
            { "SqlExecuted", SQL_EXECUTED }, { "RecordsRead", RECORDS_READ },
            { "RecordsReadAggregated", RECORDS_READ_AGGREGATED } };
    
    /**
     * Converts given string to enum object.
     * 
     * @param source string to convert to enum.
     * @return result of conversion.
     */
    public static EventType fromString(final String source) {
        return (EventType) EnumTemplate.fromString(source, STRINGS_TO_ENUMS, EventType.class);
    }
    
    @Override
    public String toString() {
        return EnumTemplate.toString(STRINGS_TO_ENUMS, this);
    }
}
