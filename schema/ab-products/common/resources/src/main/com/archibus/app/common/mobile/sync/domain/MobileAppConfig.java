package com.archibus.app.common.mobile.sync.domain;

/**
 * Domain class for mobile application configuration.
 * <p>
 * Mapped to afm_mobile_apps table.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class MobileAppConfig {

    /**
     * Application title. Localized.
     */
    private String title;

    /**
     * Application URL.
     */
    private String url;

    /**
     * Application security group.
     */
    private String securityGroup;

    /**
     * Getter for the securityGroup property.
     *
     * @see securityGroup
     * @return the securityGroup property.
     */
    public String getSecurityGroup() {
        return this.securityGroup;
    }

    /**
     * Setter for the securityGroup property.
     *
     * @see securityGroup
     * @param securityGroup the securityGroup to set
     */

    public void setSecurityGroup(final String securityGroup) {
        this.securityGroup = securityGroup;
    }

    /**
     * Getter for the url property.
     *
     * @see url
     * @return the url property.
     */
    public String getUrl() {
        return this.url;
    }

    /**
     * Setter for the url property.
     *
     * @see url
     * @param url the url to set
     */

    public void setUrl(final String url) {
        this.url = url;
    }

    /**
     * Getter for the title property.
     *
     * @see title
     * @return the title property.
     */
    public String getTitle() {
        return this.title;
    }

    /**
     * Setter for the title property.
     *
     * @see title
     * @param title the title to set
     */

    public void setTitle(final String title) {
        this.title = title;
    }
}
