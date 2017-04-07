package com.archibus.app.common.drawing.bim.service.impl.cloud;

import java.io.*;
import java.util.Map;

import org.apache.http.*;
import org.apache.http.client.*;
import org.apache.http.client.methods.*;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Provides Services to register the upload files with Autodesk BIM Cloud Server.
 *
 * @author Yong Shao
 * @since 22.0
 *
 */
public final class Registration {
    /**
     * Constant: REGISTRATION_ERROR_MESSAGE.
     */
    // @translatable
    private static final String REGISTRATION_ERROR_MESSAGE =
            "Fail to register URN [%s] with Autodesk Cloud Server.";

    /**
     * Constant: CHECK_STATUS_ERROR_MESSAGE.
     */
    // @translatable
    private static final String CHECK_STATUS_ERROR_MESSAGE =
            "Fail to check the status of uploaded file [%s] from Autodesk Cloud Server.";

    /**
     * Constant: BUCKET_ERROR_MESSAGE.
     */
    // @translatable
    private static final String BUCKET_ERROR_MESSAGE =
            "Fail to create the bucket [%s] with Autodesk Cloud Server.";

    /**
     * Constant: BUCKET_STATUS_CODE_200.
     */
    private static final int BUCKET_STATUS_CODE_200 = 200;

    /**
     * Constant: BUCKET_STATUS_CODE_409.
     */
    private static final int BUCKET_STATUS_CODE_409 = 409;

    /**
     * Constant: REGISTER_STATUS_CODE_200.
     */
    private static final int REGISTER_STATUS_CODE_200 = 200;

    /**
     * Constant: REGISTER_STATUS_CODE_201.
     */
    private static final int REGISTER_STATUS_CODE_201 = 201;

    /**
     * Constant: CHECK_STATUS_CODE_200.
     */
    private static final int CHECK_STATUS_CODE_200 = 200;

    /**
     * Constant: UTF-8.
     */
    private static final String UTF_8 = "UTF-8";

    /**
     * Constant: URN.
     */
    private static final String URN = "urn";

    /**
     * Constant: AUTHORIZATION_HEADER.
     */
    private static final String AUTHORIZATION_HEADER = "Authorization";

    /**
     * Constant: AUTHORIZATION_BEARER.
     */
    private static final String AUTHORIZATION_BEARER = "Bearer ";

    /**
     * Constant: CONTENT_TYPE.
     */
    private static final String CONTENT_TYPE = "application/json";

    /**
     * Constant: CONTENT_TYPE_NAME.
     */
    private static final String CONTENT_TYPE_NAME = "Content-Type";

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private Registration() {
    }

    /**
     *
     * Registers uploaded file on BIM cloud server.
     *
     * @param fileName file name.
     * @param bucketName bucket Name.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     */
    public static void register(final String fileName, final String bucketName,
            final String clientId, final String clientSecret) throws ExceptionBase {
        register(Utilities.getUrn(fileName, bucketName), clientId, clientSecret);
    }

    /**
     *
     * Registers uploaded file on BIM cloud server.
     *
     * @param urn String.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     */
    public static void register(final String urn, final String clientId, final String clientSecret)
            throws ExceptionBase {
        final String errorMessage =
                String.format(REGISTRATION_ERROR_MESSAGE, Utilities.getFileName(urn));

        final HttpClient httpClient = new DefaultHttpClient();
        final HttpPost httpPost =
                new HttpPost("https://developer.api.autodesk.com/viewingservice/v1/register");

        final String accessToken = AccessToken.getToken(clientId, clientSecret);

        httpPost.setHeader(AUTHORIZATION_HEADER, AUTHORIZATION_BEARER + accessToken);
        httpPost.setHeader(CONTENT_TYPE_NAME, "application/json; charset=utf-8");

        final JSONObject jsonObj = new JSONObject();
        jsonObj.put(URN, urn);

        try {
            final StringEntity formEntity = new StringEntity(jsonObj.toString(), UTF_8);
            httpPost.setEntity(formEntity);

            final HttpResponse httpResponse = httpClient.execute(httpPost);

            final StatusLine statusLine = httpResponse.getStatusLine();
            if (statusLine != null) {
                final int code = statusLine.getStatusCode();
                if (code != REGISTER_STATUS_CODE_200 && code != REGISTER_STATUS_CODE_201) {
                    throw new ExceptionBase(errorMessage, true);
                }
            }

        } catch (final ClientProtocolException e) {
            throw new ExceptionBase(errorMessage, e, true);
        } catch (final IOException e) {
            throw new ExceptionBase(errorMessage, e, true);
        } finally {
            if (httpPost != null) {
                httpPost.releaseConnection();
            }
        }

    }

    /**
     *
     * Checks if registered files is completely translated on BIM cloud server.
     *
     * @param fileName file name.
     * @param bucketName bucket Name.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     * @return Status.
     */
    public static Status checKStatus(final String fileName, final String bucketName,
            final String clientId, final String clientSecret) throws ExceptionBase {
        return checKStatus(Utilities.getUrn(fileName, bucketName), clientId, clientSecret);
    }

    /**
     *
     * Checks if registered files is completely translated on BIM cloud server.
     *
     * @param urn String.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     * @return Status.
     */
    public static Status checKStatus(final String urn, final String clientId,
            final String clientSecret) throws ExceptionBase {
        final String errorMessage =
                String.format(CHECK_STATUS_ERROR_MESSAGE, Utilities.getFileName(urn));

        final Status status = new Status();
        final HttpClient httpClient = new DefaultHttpClient();
        final HttpGet httpGet = new HttpGet(
            "https://developer.api.autodesk.com/viewingservice/v1/" + urn + "/status");
        final String accessToken = AccessToken.getToken(clientId, clientSecret);

        httpGet.setHeader(AUTHORIZATION_HEADER, AUTHORIZATION_BEARER + accessToken);
        try {
            final HttpResponse httpResponse = httpClient.execute(httpGet);

            final StatusLine statusLine = httpResponse.getStatusLine();
            if (statusLine != null) {
                final int code = statusLine.getStatusCode();
                if (code == CHECK_STATUS_CODE_200) {
                    final HttpEntity entity = httpResponse.getEntity();
                    final String result = EntityUtils.toString(entity, UTF_8);
                    try {
                        final Map<String, String> map = EventHandlerBase.fromJSONObject(result);
                        status.setName(Utilities.getFileName(urn));
                        status.setProgress(map.get("progress"));
                        status.setUrn(map.get(URN));
                        status.setState(map.get("status"));
                    } catch (final java.text.ParseException e) {
                        throw new ExceptionBase(errorMessage, e, true);
                    }

                } else {
                    throw new ExceptionBase(errorMessage, true);
                }

            }

        } catch (final ClientProtocolException e) {
            throw new ExceptionBase(errorMessage, e, true);
        } catch (final IOException e) {
            throw new ExceptionBase(errorMessage, e, true);
        } finally {
            if (httpGet != null) {
                httpGet.releaseConnection();
            }
        }

        return status;

    }

    /**
     *
     * Creates Bucket.
     *
     * @param bucketName bucket Name.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     */
    public static void createBucket(final String bucketName, final String clientId,
            final String clientSecret) throws ExceptionBase {
        final HttpClient httpClient = new DefaultHttpClient();
        final HttpPost httpPost = new HttpPost("https://developer.api.autodesk.com/oss/v1/buckets");

        final JSONObject jsonObj = new JSONObject();
        jsonObj.put("bucketKey", bucketName);
        jsonObj.put("policy", "persistent");

        final String accessToken = AccessToken.getToken(clientId, clientSecret);

        httpPost.setHeader(AUTHORIZATION_HEADER, AUTHORIZATION_BEARER + accessToken);
        httpPost.setHeader(CONTENT_TYPE_NAME, CONTENT_TYPE);

        try {

            final StringEntity formEntity = new StringEntity(jsonObj.toString(), UTF_8);
            httpPost.setEntity(formEntity);

            final HttpResponse httpResponse = httpClient.execute(httpPost);
            final StatusLine statusLine = httpResponse.getStatusLine();
            if (statusLine != null) {
                final int code = statusLine.getStatusCode();
                if (code != BUCKET_STATUS_CODE_200 && code != BUCKET_STATUS_CODE_409) {
                    throw new ExceptionBase(String.format(BUCKET_ERROR_MESSAGE, bucketName), true);
                }
            }

        } catch (final UnsupportedEncodingException e) {
            throw new ExceptionBase(String.format(BUCKET_ERROR_MESSAGE, bucketName), e, true);
        } catch (final ClientProtocolException e) {
            throw new ExceptionBase(String.format(BUCKET_ERROR_MESSAGE, bucketName), e, true);
        } catch (final IOException e) {
            throw new ExceptionBase(String.format(BUCKET_ERROR_MESSAGE, bucketName), e, true);
        }

    }

}
