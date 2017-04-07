package com.archibus.app.common.notification.domain;

/**
 * Domain object for Notification Message.
 * <p>
 * Mapped to messages table.
 * 
 * @author Zhang Yi
 * 
 */
public class NotificationMessage {
    
    /**
     * Activity ID.
     */
    private String activityId;
    
    /**
     * Message ID.
     */
    private String id;
    
    /**
     * Message Text.
     */
    private int isRichText;
    
    /**
     * Message Text.
     */
    private String messageText;
    
    /**
     * Referenced By.
     */
    private String referencedBy;
    
    /**
     * @return the activity id
     */
    public String getActivityId() {
        return this.activityId;
    }
    
    /**
     * @return the id
     */
    public String getId() {
        return this.id;
    }
    
    /**
     * Getter for the isRichText property.
     * 
     * @see isRichText
     * @return the isRichText property.
     */
    public int getIsRichText() {
        return this.isRichText;
    }
    
    /**
     * @return the messageText
     */
    public String getMessageText() {
        return this.messageText;
    }
    
    /**
     * @return the referenced by
     */
    public String getReferencedBy() {
        return this.referencedBy;
    }
    
    /**
     * @param activityId the activity id to set
     */
    public void setActivityId(final String activityId) {
        this.activityId = activityId;
    }
    
    /**
     * @param id the id to set
     */
    public void setId(final String id) {
        this.id = id;
    }
    
    // Suppress StrictDuplicateCode CheckStyle warning. Justification: this class has "id" property,
    // like many other classes.
    
    /**
     * Setter for the isRichText property.
     * 
     * @see isRichText
     * @param isRichText the isRichText to set
     */
    
    public void setIsRichText(final int isRichText) {
        this.isRichText = isRichText;
    }
    
    /**
     * @param messageText the message text to set
     */
    public void setMessageText(final String messageText) {
        this.messageText = messageText;
    }
    
    /**
     * @param refBy the referenced by to set
     */
    public void setReferencedBy(final String refBy) {
        this.referencedBy = refBy;
    }
    
}
