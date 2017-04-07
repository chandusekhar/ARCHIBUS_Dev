package com.archibus.app.common.bldgops.domain;

/**
 * Domain object for Action Item.
 * <p>
 * Mapped to activity_log table.
 *
 * @author Zhang Yi
 *
 */
public class ActionItem {
    /**
     * Action Title.
     */
    private String actionTitle;

    /**
     * Item Description.
     */
    private String description;

    /**
     * Action Item's comments.
     */
    private String comments;

    /**
     * Mark Up Document.
     */
    private String doc4;

    /**
     * Action Item ID.
     */
    private String id;

    /**
     * Getter for the actionTitle property.
     *
     * @see actionTitle
     * @return the actionTitle property.
     */
    public String getActionTitle() {
        return this.actionTitle;
    }

    /**
     * Setter for the actionTitle property.
     *
     * @see actionTitle
     * @param actionTitle the actionTitle to set
     */

    public void setActionTitle(final String actionTitle) {
        this.actionTitle = actionTitle;
    }

    /**
     * Getter for the description property.
     *
     * @see description
     * @return the description property.
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * Setter for the description property.
     *
     * @see description
     * @param description the description to set
     */

    public void setDescription(final String description) {
        this.description = description;
    }

    /**
     * Getter for the comments property.
     *
     * @see comments
     * @return the comments property.
     */
    public String getComments() {
        return this.comments;
    }

    /**
     * Setter for the comments property.
     *
     * @see comments
     * @param comments the comments to set
     */

    public void setComments(final String comments) {
        this.comments = comments;
    }

    /**
     * Getter for the doc4 property.
     *
     * @see doc4
     * @return the doc4 property.
     */
    public String getDoc4() {
        return this.doc4;
    }

    /**
     * Setter for the doc4 property.
     *
     * @see doc4
     * @param doc4 the doc4 to set
     */

    public void setDoc4(final String doc4) {
        this.doc4 = doc4;
    }

    /**
     * Getter for the id property.
     *
     * @see id
     * @return the id property.
     */
    public String getId() {
        return this.id;
    }

    /**
     * Setter for the id property.
     *
     * @see id
     * @param id the id to set
     */

    public void setId(final String id) {
        this.id = id;
    }

}
