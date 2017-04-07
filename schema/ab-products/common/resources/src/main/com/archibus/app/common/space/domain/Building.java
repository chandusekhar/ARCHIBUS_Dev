package com.archibus.app.common.space.domain;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * Domain class for building.
 *
 * @author Bart Vanderschoot
 *
 */
@XmlRootElement(name = "Building")
public class Building {

    /** The building code. */
    private String buildingId;

    /** The city id. */
    private String cityId;

    /** The country code. */
    private String ctryId;

    /** The name. */
    private String name;

    /** The region code. */
    private String regnId;

    /** The site id. */
    private String siteId;

    /** The state code. */
    private String stateId;

    /**
     * Default constructor.
     */
    public Building() {
        super();
    }

    /**
     * Constructor.
     *
     * @param siteId the site id
     * @param blId the bl id
     * @param name the name
     */
    public Building(final String siteId, final String blId, final String name) {
        super();
        this.siteId = siteId;
        this.buildingId = blId;
        this.name = name;
    }

    /**
     * Gets the building code.
     *
     * @return the bl id
     */
    public final String getBuildingId() {
        return this.buildingId;
    }

    /**
     * Gets the city code.
     *
     * @return the city id
     */
    public final String getCityId() {
        return this.cityId;
    }

    /**
     * Gets the country code.
     *
     * @return the country code
     */
    public final String getCtryId() {
        return this.ctryId;
    }

    /**
     * Gets the name of the building.
     *
     * @return the name
     */
    public final String getName() {
        return this.name;
    }

    /**
     * Gets the region id.
     *
     * @return the region id
     */
    public final String getRegnId() {
        return this.regnId;
    }

    /**
     * Gets the site id.
     *
     * @return the site id
     */
    public final String getSiteId() {
        return this.siteId;
    }

    /**
     * Gets the state id.
     *
     * @return the state id
     */
    public final String getStateId() {
        return this.stateId;
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
     * Sets the city id.
     *
     * @param cityId the new city id
     */
    public final void setCityId(final String cityId) {
        this.cityId = cityId;
    }

    /**
     * Sets the country code.
     *
     * @param ctryId the new country code
     */
    public final void setCtryId(final String ctryId) {
        this.ctryId = ctryId;
    }

    /**
     * Sets the name.
     *
     * @param name the new name
     */
    public final void setName(final String name) {
        this.name = name;
    }

    /**
     * Sets the region code.
     *
     * @param regnId the new region code
     */
    public final void setRegnId(final String regnId) {
        this.regnId = regnId;
    }

    /**
     * Sets the site id.
     *
     * @param siteId the new site id
     */
    public final void setSiteId(final String siteId) {
        this.siteId = siteId;
    }

    /**
     * Sets the state code.
     *
     * @param stateId the new state code
     */
    public final void setStateId(final String stateId) {
        this.stateId = stateId;
    }

}
