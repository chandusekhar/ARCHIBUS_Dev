package com.archibus.service.space;

import com.archibus.app.common.space.domain.RoomTransaction;

/**
 * object for customlize attribute and RoomTransaction Object.
 * 
 */
public class AssignmentObject {
    
    /**
     * roomTransaction Object.
     */
    private RoomTransaction roomTransaction;
    
    /**
     * action: insert or update.
     */
    private String action;
    
    /**
     * Getter for the action property.
     * 
     * @see action
     * @return the action property.
     */
    public String getAction() {
        return this.action;
    }
    
    /**
     * Setter for the action property.
     * 
     * @see action
     * @param action the action to set
     */
    
    public void setAction(final String action) {
        this.action = action;
    }
    
    /**
     * Getter for the roomTransaction property.
     * 
     * @see roomTransaction
     * @return the roomTransaction property.
     */
    public RoomTransaction getRoomTransaction() {
        return this.roomTransaction;
    }
    
    /**
     * Setter for the roomTransaction property.
     * 
     * @see roomTransaction
     * @param roomTransaction the roomTransaction to set
     */
    
    public void setRoomTransaction(final RoomTransaction roomTransaction) {
        this.roomTransaction = roomTransaction;
    }
    
}
