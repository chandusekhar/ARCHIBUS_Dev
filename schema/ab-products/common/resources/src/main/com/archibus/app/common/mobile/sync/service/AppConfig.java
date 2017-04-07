package com.archibus.app.common.mobile.sync.service;

/**
 * DTO for MobileAppConfig.
 *
 * @author Valery Tydykov
 *
 * @since 21.1
 */
public class AppConfig {
    /**
     * Property: title. Localized.
     */
    private String title;

    /**
     * Property: url.
     */
    private String url;

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
}
