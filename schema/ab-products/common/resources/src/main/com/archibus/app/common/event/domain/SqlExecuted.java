package com.archibus.app.common.event.domain;

/**
 * Domain object for SqlExecuted event.
 * <p>
 * Mapped to afm_data_event_log table.
 * 
 * @author Valery Tydykov
 * 
 */
public class SqlExecuted extends AbstractDataEvent {
    
    /**
     * SQL statement executed.
     */
    private String sql;
    
    /**
     * @return the sql
     */
    public String getSql() {
        return this.sql;
    }
    
    /**
     * @param sql the sql to set
     */
    public void setSql(final String sql) {
        this.sql = sql;
    }
}
