package com.archibus.eventhandler.eam.domain;

import java.sql.Time;
import java.util.Date;

import com.archibus.core.event.data.ChangeType;

/**
 * Domain object for asset transaction. Mapped to asset_trans table.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class AssetTransaction {
    /**
     * Asset transaction id.
     */
    private int transactionId;

    /**
     * Transaction type.
     */
    private TransactionType transactionType;

    /**
     * Action type : Insert , update, delete.
     */
    private ChangeType actionType;
    
    /**
     * New value.
     */
    private String newValue;
    
    /**
     * Old value.
     */
    private String oldValue;
    
    /**
     * Modified table name.
     */
    private String tableName;
    
    /**
     * Modified field name.
     */
    private String fieldName;
    
    /**
     * Asset id.
     */
    private String assetId;

    /**
     * User name.
     */
    private String userName;
    
    /**
     * Transaction date.
     */
    private Date transactionDate;
    
    /**
     * Transaction time.
     */
    private Time transactionTime;
    
    /**
     * Getter for the transactionId property.
     *
     * @see transactionId
     * @return the transactionId property.
     */
    public int getTransactionId() {
        return this.transactionId;
    }
    
    /**
     * Setter for the transactionId property.
     *
     * @see transactionId
     * @param transactionId the transactionId to set
     */

    public void setTransactionId(final int transactionId) {
        this.transactionId = transactionId;
    }
    
    /**
     * Getter for the transactionType property.
     *
     * @see transactionType
     * @return the transactionType property.
     */
    public TransactionType getTransactionType() {
        return this.transactionType;
    }
    
    /**
     * Setter for the transactionType property.
     *
     * @see transactionType
     * @param transactionType the transactionType to set
     */

    public void setTransactionType(final TransactionType transactionType) {
        this.transactionType = transactionType;
    }
    
    /**
     * Getter for the actionType property.
     *
     * @see actionType
     * @return the actionType property.
     */
    public ChangeType getActionType() {
        return this.actionType;
    }
    
    /**
     * Setter for the actionType property.
     *
     * @see actionType
     * @param actionType the actionType to set
     */

    public void setActionType(final ChangeType actionType) {
        this.actionType = actionType;
    }
    
    /**
     * Getter for the newValue property.
     *
     * @see newValue
     * @return the newValue property.
     */
    public String getNewValue() {
        return this.newValue;
    }
    
    /**
     * Setter for the newValue property.
     *
     * @see newValue
     * @param newValue the newValue to set
     */

    public void setNewValue(final String newValue) {
        this.newValue = newValue;
    }
    
    /**
     * Getter for the oldValue property.
     *
     * @see oldValue
     * @return the oldValue property.
     */
    public String getOldValue() {
        return this.oldValue;
    }
    
    /**
     * Setter for the oldValue property.
     *
     * @see oldValue
     * @param oldValue the oldValue to set
     */

    public void setOldValue(final String oldValue) {
        this.oldValue = oldValue;
    }
    
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
     * Getter for the fieldName property.
     *
     * @see fieldName
     * @return the fieldName property.
     */
    public String getFieldName() {
        return this.fieldName;
    }
    
    /**
     * Setter for the fieldName property.
     *
     * @see fieldName
     * @param fieldName the fieldName to set
     */

    public void setFieldName(final String fieldName) {
        this.fieldName = fieldName;
    }
    
    /**
     * Getter for the assetId property.
     *
     * @see assetId
     * @return the assetId property.
     */
    public String getAssetId() {
        return this.assetId;
    }
    
    /**
     * Setter for the assetId property.
     *
     * @see assetId
     * @param assetId the assetId to set
     */

    public void setAssetId(final String assetId) {
        this.assetId = assetId;
    }
    
    /**
     * Getter for the userName property.
     *
     * @see userName
     * @return the userName property.
     */
    public String getUserName() {
        return this.userName;
    }
    
    /**
     * Setter for the userName property.
     *
     * @see userName
     * @param userName the userName to set
     */

    public void setUserName(final String userName) {
        this.userName = userName;
    }
    
    /**
     * Getter for the transactionDate property.
     *
     * @see transactionDate
     * @return the transactionDate property.
     */
    public Date getTransactionDate() {
        return this.transactionDate;
    }
    
    /**
     * Setter for the transactionDate property.
     *
     * @see transactionDate
     * @param transactionDate the transactionDate to set
     */

    public void setTransactionDate(final Date transactionDate) {
        this.transactionDate = transactionDate;
    }
    
    /**
     * Getter for the transactionTime property.
     *
     * @see transactionTime
     * @return the transactionTime property.
     */
    public Date getTransactionTime() {
        return this.transactionTime;
    }
    
    /**
     * Setter for the transactionTime property.
     *
     * @see transactionTime
     * @param transactionTime the transactionTime to set
     */

    public void setTransactionTime(final Time transactionTime) {
        this.transactionTime = transactionTime;
    }
}
