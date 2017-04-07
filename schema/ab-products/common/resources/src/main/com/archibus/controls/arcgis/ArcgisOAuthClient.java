package com.archibus.controls.arcgis;

import org.apache.log4j.Logger;
import org.jasypt.encryption.pbe.*;
import org.json.JSONObject;

import com.archibus.servletx.WebCentralConfigListener;

/**
 * This class contains methods to authenticate with ArcGIS.com.
 *
 * @author gknight
 *
 */

public class ArcgisOAuthClient {

    /**
     * The Application ID used to authenticate with Arcgis.com.
     */
    private String appId;

    /**
     * The Application Secret used to authenticate with Arcgis.com.
     */
    private String appSecret;

    /**
     * The Logger object used to log messages to archibus.log.
     */
    private final Logger log = Logger.getLogger(this.getClass());

    /**
     * This method requests an access token from Arcgis.com using the Application ID and Application
     * Secret.
     *
     * @return accessToken The access token returned by Arcgis.com.
     *
     */
    public String requestTokenFromArcgisOnline() {
        // The access token.
        String accessToken = null;

        // The decoded application id and application secret.

        final String applicationId = decodeParameter(getAppId());
        final String applicationSecret = decodeParameter(getAppSecret());

        // Prepare the URL request string.
        final String requestString = constructRequestString(applicationId, applicationSecret);

        // Execute the http post.
        JSONObject result =
                ArcgisHttpClient.executePost(ArcgisCommonConstants.ARCGIS_OAUTH_URL, requestString);

        // Check for result object.
        if (null == result) {
            result = new JSONObject();
            result.put("code", "failed");
            result.put("message", "Error getting token from ArcGIS. Response was null.");
        }

        // Get the token from the result.
        if (result.has(ArcgisCommonConstants.ACCESS_TOKEN)) {
            accessToken = result.getString(ArcgisCommonConstants.ACCESS_TOKEN);
            this.log.info("ArcGIS access token : " + accessToken);
        }

        // If the result has an error, log it.
        if (result.has(ArcgisCommonConstants.ERROR)) {
            final JSONObject error = result.getJSONObject(ArcgisCommonConstants.ERROR);
            final String errorMessage = error.getString(ArcgisCommonConstants.ERROR);
            final String errorDescription =
                    error.getString(ArcgisCommonConstants.ERROR_DESCRIPTION);
            this.log.info("ArcGIS.com token error : " + errorMessage + ", " + errorDescription);
        }

        // Return the access token.
        return accessToken;
    }

    /**
     * Construct the request string to use in the token request.
     *
     * @param appId The ArcGIS.com application id.
     * @param appSecret The ArcGIS.com application secret.
     * @return requestString The request string to use in the token request.
     */
    private static String constructRequestString(final String appId, final String appSecret) {

        final String requestString =
                "client_id=" + appId + "&client_secret=" + appSecret + "&grant_type="
                        + "client_credentials";
        return requestString;
    }

    /**
     * This method decrypts an encoded string. It is used to decrypt the encrypted application id
     * and application secret.
     *
     * @param parameter The encrypted string.
     * @return parameterDecrypted The decrypted string.
     */
    private static String decodeParameter(final String parameter) {
        final PBEStringEncryptor stringEncryptor = new StandardPBEStringEncryptor();
        stringEncryptor.setPassword(WebCentralConfigListener.PASSWORD);
        String parameterDecrypted = parameter;

        if (parameter.startsWith("ENC(")) {
            parameterDecrypted =
                    stringEncryptor.decrypt(parameter.substring(ArcgisCommonConstants.INT_FOUR,
                        parameter.length() - 1));
        }
        return parameterDecrypted;
    }

    /**
     * Gets the application secret.
     *
     * @return appSecret The application secret.
     */
    public String getAppSecret() {
        return this.appSecret;
    }

    /**
     * Sets the application secret.
     *
     * @param appSecret The application secret.
     */
    public void setAppSecret(final String appSecret) {
        this.appSecret = appSecret;
    }

    /**
     * Gets the application id.
     *
     * @return @appId The application id.
     */
    public String getAppId() {
        return this.appId;
    }

    /**
     * Sets the application id.
     *
     * @param appId The application id.
     */
    public void setAppId(final String appId) {
        this.appId = appId;
    }

}