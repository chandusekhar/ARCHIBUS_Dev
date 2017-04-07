package com.archibus.app.common.event.domain;

/**
 * Base class for DataEvent domain objects: RecordChanged and SqlExecuted.
 * 
 * @author Valery Tydykov
 * 
 */
public abstract class AbstractDataEvent {
    /**
     * Date when the event occurred.
     */
    private java.sql.Date date;
    
    /**
     * Event type.
     */
    private EventType eventType;
    
    /**
     * Event ID.
     */
    private int id;
    
    /**
     * Name of the table where the record was changed.
     */
    private String tableName;
    
    /**
     * Time when the event occurred.
     */
    private java.sql.Time time;
    
    /**
     * User who changed the record.
     */
    private String userName;
    
    /**
     * @return the date
     */
    public java.sql.Date getDate() {
        return this.date;
    }
    
    /**
     * @return the eventType
     */
    public EventType getEventType() {
        return this.eventType;
    }
    
    /**
     * @return the id
     */
    public int getId() {
        return this.id;
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * @return the time
     */
    public java.sql.Time getTime() {
        return this.time;
    }
    
    /**
     * @return the userName
     */
    public String getUserName() {
        return this.userName;
    }
    
    /**
     * @param date the date to set
     */
    public void setDate(final java.sql.Date date) {
        this.date = date;
    }
    
    /**
     * @param eventType the eventType to set
     */
    public void setEventType(final EventType eventType) {
        this.eventType = eventType;
    }
    
    /**
     * @param id the id to set
     */
    public void setId(final int id) {
        this.id = id;
    }
    
    /**
     * @param tableName the tableName to set
     */
    public void setTableName(final String tableName) {
        this.tableName = tableName;
    }
    
    /**
     * @param time the time to set
     */
    public void setTime(final java.sql.Time time) {
        this.time = time;
    }
    
    /**
     * @param userName the userName to set
     */
    public void setUserName(final String userName) {
        this.userName = userName;
    }
}
