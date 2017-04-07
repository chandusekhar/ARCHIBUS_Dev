package com.archibus.eventhandler.eam.domain;

/**
 * Domain object for space budget. Mapped to sb database table
 *
 * <p>
 *
 * @author Ioan Draghici
 * @since 22.1
 *
 */
public class SpaceBudget {
    
    /**
     * Space budget name.
     */
    private String name;
    
    /**
     * Space budget description.
     */
    private String description;
    
    /**
     * Space budget level.
     */
    private String level;
    
    /**
     * Space budget type.
     */
    private String type;
    
    /**
     * Space budget created as.
     */
    private String createdAs;
    
    /**
     * Space budget created from.
     */
    private String createdFrom;
    
    /**
     * Allocation period.
     */
    private int allocPeriod;
    
    /**
     * Allocation score.
     */
    private int allocScore;
    
    /**
     * Allocation score extended.
     */
    private int allocScoreExt;

    /**
     * Getter for the name property.
     *
     * @see name
     * @return the name property.
     */
    public String getName() {
        return this.name;
    }

    /**
     * Setter for the name property.
     *
     * @see name
     * @param name the name to set
     */
    
    public void setName(final String name) {
        this.name = name;
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
     * Getter for the level property.
     *
     * @see level
     * @return the level property.
     */
    public String getLevel() {
        return this.level;
    }

    /**
     * Setter for the level property.
     *
     * @see level
     * @param level the level to set
     */
    
    public void setLevel(final String level) {
        this.level = level;
    }

    /**
     * Getter for the type property.
     *
     * @see type
     * @return the type property.
     */
    public String getType() {
        return this.type;
    }

    /**
     * Setter for the type property.
     *
     * @see type
     * @param type the type to set
     */
    
    public void setType(final String type) {
        this.type = type;
    }

    /**
     * Getter for the createdAs property.
     *
     * @see createdAs
     * @return the createdAs property.
     */
    public String getCreatedAs() {
        return this.createdAs;
    }

    /**
     * Setter for the createdAs property.
     *
     * @see createdAs
     * @param createdAs the createdAs to set
     */
    
    public void setCreatedAs(final String createdAs) {
        this.createdAs = createdAs;
    }

    /**
     * Getter for the createdFrom property.
     *
     * @see createdFrom
     * @return the createdFrom property.
     */
    public String getCreatedFrom() {
        return this.createdFrom;
    }

    /**
     * Setter for the createdFrom property.
     *
     * @see createdFrom
     * @param createdFrom the createdFrom to set
     */
    
    public void setCreatedFrom(final String createdFrom) {
        this.createdFrom = createdFrom;
    }

    /**
     * Getter for the allocPeriod property.
     *
     * @see allocPeriod
     * @return the allocPeriod property.
     */
    public int getAllocPeriod() {
        return this.allocPeriod;
    }

    /**
     * Setter for the allocPeriod property.
     *
     * @see allocPeriod
     * @param allocPeriod the allocPeriod to set
     */
    
    public void setAllocPeriod(final int allocPeriod) {
        this.allocPeriod = allocPeriod;
    }

    /**
     * Getter for the allocScore property.
     *
     * @see allocScore
     * @return the allocScore property.
     */
    public int getAllocScore() {
        return this.allocScore;
    }

    /**
     * Setter for the allocScore property.
     *
     * @see allocScore
     * @param allocScore the allocScore to set
     */
    
    public void setAllocScore(final int allocScore) {
        this.allocScore = allocScore;
    }

    /**
     * Getter for the allocScoreExt property.
     *
     * @see allocScoreExt
     * @return the allocScoreExt property.
     */
    public int getAllocScoreExt() {
        return this.allocScoreExt;
    }

    /**
     * Setter for the allocScoreExt property.
     *
     * @see allocScoreExt
     * @param allocScoreExt the allocScoreExt to set
     */
    
    public void setAllocScoreExt(final int allocScoreExt) {
        this.allocScoreExt = allocScoreExt;
    }
    
}
