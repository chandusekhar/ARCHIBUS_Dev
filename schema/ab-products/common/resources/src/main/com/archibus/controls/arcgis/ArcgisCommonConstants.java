package com.archibus.controls.arcgis;

/**
 *
 * Constants used by the Arcgis control classes.
 *
 * @author knight
 *
 */

public final class ArcgisCommonConstants {
    
    /**
     * The URL to the ArcGIS OAuth2 token service.
     */
    // TODO move to application parameter
    static final String ARCGIS_OAUTH_URL = "https://www.arcgis.com/sharing/oauth2/token";

    /**
     * access_token string.
     */
    static final String ACCESS_TOKEN = "access_token";
    
    /**
     * error string.
     */
    static final String ERROR = "error";
    
    /**
     * error_description string.
     */
    static final String ERROR_DESCRIPTION = "error_description";
    
    /**
     * integer '4'.
     */
    static final int INT_FOUR = 4;
    
    /**
     *
     * Constructor is not called.
     *
     */
    private ArcgisCommonConstants() {
        
    }
    
}
