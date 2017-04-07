package com.archibus.app.common.space.domain;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * Domain class for Site.
 *
 * The site can be used in the console filter to lookup buildings and rooms.
 *
 * @author Bart Vanderschoot
 *
 */
@XmlRootElement(name = "Site")
public class Site {

    /** The country code. */
    private String ctryId;

    /** The region code. */
    private String regnId;

    /** The state code. */
    private String stateId;

    /** The city code. */
    private String cityId;

    /** The site id. */
    private String siteId;

    /** The name. */
    private String name;

    /**
     * Instantiates a new site.
     */
    public Site() {
        super();
    }

    /**
     * Instantiates a new site.
     *
     * @param siteId the site id
     * @param name the name
     */
    public Site(final String siteId, final String name) {
        super();
        this.siteId = siteId;
        this.name = name;
    }

    /**
     * Gets the city id.
     *
     * @return the city id
     */
    public final String getCityId() {
        return this.cityId;
    }

    /**
     * Gets the ctry id.
     *
     * @return the ctry id
     */
    public final String getCtryId() {
        return this.ctryId;
    }

    /**
     * Gets the name.
     *
     * @return the name
     */
    public final String getName() {
        return this.name;
    }

    /**
     * Gets the regn id.
     *
     * @return the regn id
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
     * Sets the city id.
     *
     * @param cityId the new city id
     */
    public final void setCityId(final String cityId) {
        this.cityId = cityId;
    }

    /**
     * Sets the ctry id.
     *
     * @param ctryId the new ctry id
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
     * Sets the regn id.
     *
     * @param regnId the new regn id
     */
    public final void setRegnId(final String regnId) {
        this.regnId = regnId;
    }

    /**
     * Sets the id of the site.
     *
     * @param siteId the new site id
     */
    public final void setSiteId(final String siteId) {
        this.siteId = siteId;
    }

    /**
     * Sets the state id.
     *
     * @param stateId the new state id
     */
    public final void setStateId(final String stateId) {
        this.stateId = stateId;
    }

}
