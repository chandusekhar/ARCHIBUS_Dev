package com.archibus.app.common.space.domain;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * Domain class for Floor.
 *
 * @author Bart Vanderschoot
 *
 */
@XmlRootElement(name = "Floor")
public class Floor {

    /** The building code. */
    private String buildingId;

    /** The floor code. */
    private String floorId;

    /** The name. */
    private String name;

    /**
     * Default constructor.
     */
    public Floor() {
        super();
    }

    /**
     * Constructor with parameters.
     *
     * @param blId building id
     * @param flId floor id
     * @param name name of floor
     */
    public Floor(final String blId, final String flId, final String name) {
        super();
        this.buildingId = blId;
        this.floorId = flId;
        this.name = name;
    }

    /**
     * Gets the building code.
     *
     * @return the building code
     */
    public final String getBuildingId() {
        return this.buildingId;
    }

    /**
     * Gets the floor code.
     *
     * @return the floor code
     */
    public final String getFloorId() {
        return this.floorId;
    }

    /**
     * Gets the name of the floor.
     *
     * @return the name
     */
    public final String getName() {
        return this.name;
    }

    /**
     * Sets the building code.
     *
     * @param blId the new building code
     */
    public final void setBuildingId(final String blId) {
        this.buildingId = blId;
    }

    /**
     * Sets the floor code.
     *
     * @param flId the new floor code
     */
    public final void setFloorId(final String flId) {
        this.floorId = flId;
    }

    /**
     * Sets the name.
     *
     * @param name the new name
     */
    public final void setName(final String name) {
        this.name = name;
    }

}
