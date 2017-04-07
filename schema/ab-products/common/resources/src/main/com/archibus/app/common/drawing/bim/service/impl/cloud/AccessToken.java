package com.archibus.app.common.drawing.bim.service.impl.cloud;

import java.io.*;
import java.util.*;

import org.apache.http.*;
import org.apache.http.client.*;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Provides Services to get access key from Autodesk BIM Cloud Server.
 *
 * @author Yong Shao
 * @since 21.4
 *
 */
public final class AccessToken {
    /**
     * Constant: ACCESS_TOKEN_RETREAT_ERROR_MESSAGE.
     */
    // @translatable
    private static final String ACCESS_TOKEN_RETREAT_ERROR_MESSAGE =
            "Fail to get access token from Autodesk by clientId [%s] and clientSecretKey [%s].";

    /**
     * Constant: BIM_CLOUD_SERVER_AUTHENTICATE_UTL.
     */
    private static final String BIM_CLOUD_SERVER_AUTHENTICATE_UTL =
            "https://developer.api.autodesk.com/authentication/v1/authenticate";

    /**
     * Constant: ACCESS_TOKEN_STATUS_CODE_200.
     */
    private static final int ACCESS_TOKEN_STATUS_CODE_200 = 200;

    /**
     * Constant: UTF-8E.
     */
    private static final String UTF_8 = "UTF-8";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private AccessToken() {
    }

    /**
     * Gets View 360 Data Access key.
     *
     * @param clientId - "56vRODyX63SwkFRCbuQWfIi5QULGlVg5".
     * @param clientSecret - "9HUtjlMAyL7IeqR4".
     * @return String access token.
     */
    public static String getToken(final String clientId, final String clientSecret) {
        final String errorMessage =
                String.format(ACCESS_TOKEN_RETREAT_ERROR_MESSAGE, clientId, clientSecret);
        String accessToken = null;
        final HttpClient httpClient = new DefaultHttpClient();

        final HttpPost httpPost = new HttpPost(BIM_CLOUD_SERVER_AUTHENTICATE_UTL);
        final List<NameValuePair> formParams = new ArrayList<NameValuePair>();
        formParams.add(new BasicNameValuePair("client_id", clientId));
        formParams.add(new BasicNameValuePair("client_secret", clientSecret));
        formParams.add(new BasicNameValuePair("grant_type", "client_credentials"));
        try {
            httpPost.setHeader("Content-Type", "application/x-www-form-urlencoded");

            final UrlEncodedFormEntity formEntity = new UrlEncodedFormEntity(formParams, UTF_8);
            httpPost.setEntity(formEntity);
            final HttpResponse httpResponse = httpClient.execute(httpPost);
            final StatusLine statusLine = httpResponse.getStatusLine();
            if (statusLine != null) {
                final int code = statusLine.getStatusCode();
                if (code == ACCESS_TOKEN_STATUS_CODE_200) {
                    final HttpEntity entity = httpResponse.getEntity();

                    final String result = EntityUtils.toString(entity, UTF_8);
                    try {
                        accessToken = EventHandlerBase.fromJSONObject(result).get("access_token")
                            .toString();
                    } catch (final java.text.ParseException e) {
                        throw new ExceptionBase(errorMessage, e, true);
                    }
                } else {
                    throw new ExceptionBase(errorMessage, true);
                }
            }

        } catch (final UnsupportedEncodingException e) {
            throw new ExceptionBase(errorMessage, e, true);
        } catch (final ClientProtocolException e) {
            throw new ExceptionBase(errorMessage, e, true);
        } catch (final IOException e) {
            throw new ExceptionBase(errorMessage, e, true);
        } finally {
            if (httpPost != null) {
                httpPost.releaseConnection();
            }
        }

        return accessToken;
    }

}
