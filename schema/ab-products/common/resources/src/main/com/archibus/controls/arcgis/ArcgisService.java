package com.archibus.controls.arcgis;

import com.archibus.context.*;

/**
 * This service class contains methods to communicate with ArcGIS.com.
 * 
 * @author gknight
 * 
 */

public class ArcgisService {
    
    /**
     * Method to request access token from ArcGIS.com. The token is required to access secure
     * services hosted on ArcGIS.com.
     * 
     * @return accessToken The Arcgis.com access token.
     */
    public String requestArcgisOnlineAccessToken() {
        
        // The ArcGIS.com access token.
        String accessToken = null;
        // Create an instance of the ArcGIS OAuth Client.
        final Context context = ContextStore.get();
        final ArcgisOAuthClient arcgisClient = (ArcgisOAuthClient) context.getBean("arcgisClient");
        // Request an access token.
        accessToken = arcgisClient.requestTokenFromArcgisOnline();
        // Return the access token.
        return accessToken;
        
    }
}

