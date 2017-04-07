package com.archibus.app.common.mobile.sync.domain;

/**
 * Domain class for table transaction events.
 * <p>
 * Mapped to afm_table_trans table.
 *
 * @author Jeff Martin
 * @since 23.1
 *
 */
public class TableTransaction {

    /**
     * Transaction Table Name.
     */
    private String tableName;

    /**
     * Transaction Primary key values.
     */
    private String pkeyValue;

    /**
     * Transaction Event Timestamp.
     */
    private double eventTimeStamp;

    /**
     * Transaction Deleted.
     */
    private int deleted;

    /**
     * Getter for the tableName property.
     *
     * @see tableName
     * @return the tableName property.
     */
    public String getTableName() {
        return this.tableName;
    }

    /**
     * Setter for the tableName property.
     *
     * @see tableName
     * @param tableName the tableName to set
     */

    public void setTableName(final String tableName) {
        this.tableName = tableName;
    }

    /**
     * Getter for the pkeyValue property.
     *
     * @see pkeyValue
     * @return the pkeyValue property.
     */
    public String getPkeyValue() {
        return this.pkeyValue;
    }

    /**
     * Setter for the pkeyValue property.
     *
     * @see pkeyValue
     * @param pkeyValue the pkeyValue to set
     */

    public void setPkeyValue(final String pkeyValue) {
        this.pkeyValue = pkeyValue;
    }

    /**
     * Getter for the eventTimeStamp property.
     *
     * @see eventTimeStamp
     * @return the eventTimeStamp property.
     */
    public double getEventTimeStamp() {
        return this.eventTimeStamp;
    }

    /**
     * Setter for the eventTimeStamp property.
     *
     * @see eventTimeStamp
     * @param eventTimeStamp the eventTimeStamp to set
     */

    public void setEventTimeStamp(final double eventTimeStamp) {
        this.eventTimeStamp = eventTimeStamp;
    }

    /**
     * Getter for the deleted property.
     *
     * @see deleted
     * @return the deleted property.
     */
    public int getDeleted() {
        return this.deleted;
    }

    /**
     * Setter for the deleted property.
     *
     * @see deleted
     * @param deleted the deleted to set
     */

    public void setDeleted(final int deleted) {
        this.deleted = deleted;
    }

}
