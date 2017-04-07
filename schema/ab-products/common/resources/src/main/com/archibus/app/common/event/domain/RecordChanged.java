package com.archibus.app.common.event.domain;

import com.archibus.core.event.data.ChangeType;

/**
 * Domain object for RecordChanged event.
 * <p>
 * Mapped to afm_data_event_log table.
 * 
 * @author Valery Tydykov
 * 
 */
public class RecordChanged extends AbstractDataEvent {
    /**
     * Type of the change: INSERT, UPDATE, DELETE. Required parameter.
     */
    private ChangeType changeType;
    
    /**
     * Names of the fields which were changed, separated by "|", e.g.
     * "bl_id|fl_id|rm_id|dv_id|dp_id".
     */
    private String fields;
    
    /**
     * New field values, separated by "|", e.g. "HQ|17|101|EXEC|MNGMT". Use “||” as the separator
     * betweeen the records for RecordsRead event.
     */
    private String newValues;
    
    /**
     * Old field values, separated by "|", e.g. "HQ|17|101|EXEC|MNGMT". Use “||” as the separator
     * betweeen the records for RecordsRead event.
     */
    private String oldValues;
    
    /**
     * @return the changeType
     */
    public ChangeType getChangeType() {
        return this.changeType;
    }
    
    /**
     * @return the fields
     */
    public String getFields() {
        return this.fields;
    }
    
    /**
     * @return the newValues
     */
    public String getNewValues() {
        return this.newValues;
    }
    
    /**
     * @return the oldValues
     */
    public String getOldValues() {
        return this.oldValues;
    }
    
    /**
     * @param changeType the changeType to set
     */
    public void setChangeType(final ChangeType changeType) {
        this.changeType = changeType;
    }
    
    /**
     * @param fields the fields to set
     */
    public void setFields(final String fields) {
        this.fields = fields;
    }
    
    /**
     * @param newValues the newValues to set
     */
    public void setNewValues(final String newValues) {
        this.newValues = newValues;
    }
    
    /**
     * @param oldValues the oldValues to set
     */
    public void setOldValues(final String oldValues) {
        this.oldValues = oldValues;
    }
    
}
