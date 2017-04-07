package com.archibus.app.common.drawing.bim.service.impl.cloud;

import java.io.*;

import org.apache.http.*;
import org.apache.http.client.*;
import org.apache.http.entity.mime.*;
import org.apache.http.entity.mime.content.InputStreamBody;
import org.apache.http.impl.client.DefaultHttpClient;

import com.archibus.utility.ExceptionBase;

/**
 *
 * Provides Services to upload files into Autodesk BIM Cloud Server.
 *
 * @author Yong Shao
 * @since 21.4
 *
 */
public final class UploadFile {
    /**
     * Constant: CONTENT_TYPE.
     */
    private static final String CONTENT_TYPE = "application/octet-stream";
    
    /**
     * Constant: UPLOAD_ERROR_MESSAGE.
     */
    private static final String UPLOAD_ERROR_MESSAGE =
            "Fail to upload thw file [%s] to Autodesk Cloud Server.";
    
    /**
     * Constant: UPLOAD_STATUS_CODE_200.
     */
    private static final int UPLOAD_STATUS_CODE_200 = 200;

    /**
     * Constant: UPLOAD_STATUS_CODE_201.
     */
    private static final int UPLOAD_STATUS_CODE_201 = 201;
    
    /**
     * Constant: UPLOAD_STATUS_CODE_202.
     */
    private static final int UPLOAD_STATUS_CODE_202 = 202;

    /**
     * Constant: UPLOAD_STATUS_CODE_409.
     */
    private static final int UPLOAD_STATUS_CODE_409 = 409;
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private UploadFile() {
    }

    /**
     *
     * Uploads file.
     *
     * @param file InputStream.
     * @param fileName file name.
     * @param bucketName bucket Name.
     * @param clientId client Id.
     * @param clientSecret client Secret key.
     * @throws ExceptionBase if Could throws an exception.
     */
    public static void upload(final InputStream file, final String fileName,
            final String bucketName, final String clientId, final String clientSecret)
            throws ExceptionBase {

        ExceptionBase exceptionBase = null;
        
        final HttpClient httpClient = new DefaultHttpClient();
        
        final org.apache.http.client.methods.HttpPut httpPut =
                new org.apache.http.client.methods.HttpPut(
                    "https://developer.api.autodesk.com/oss/v1/buckets/" + bucketName + "/objects/"
                            + fileName);
        final String accessToken = AccessToken.getToken(clientId, clientSecret);

        httpPut.setHeader("Authorization", "Bearer " + accessToken);
        httpPut.setHeader("Content-Type", CONTENT_TYPE);
        
        final MultipartEntityBuilder builder = MultipartEntityBuilder.create();
        builder.setMode(HttpMultipartMode.BROWSER_COMPATIBLE);
        
        try {
            builder.addPart("file", new UploadFile.InputStreamKnownSizeBody(file, file.available(),
                CONTENT_TYPE, fileName));
            final HttpEntity httpEntity = builder.build();
            
            httpPut.setEntity(httpEntity);

            final HttpResponse httpResponse = httpClient.execute(httpPut);
            final StatusLine statusLine = httpResponse.getStatusLine();
            if (statusLine != null) {
                final int code = statusLine.getStatusCode();
                if (code != UPLOAD_STATUS_CODE_200 && code != UPLOAD_STATUS_CODE_409
                        && code != UPLOAD_STATUS_CODE_201 && code != UPLOAD_STATUS_CODE_202) {
                    throw new ExceptionBase(String.format(UPLOAD_ERROR_MESSAGE, fileName));
                }
            }
            
        } catch (final ClientProtocolException e) {
            exceptionBase = new ExceptionBase(String.format(UPLOAD_ERROR_MESSAGE, fileName), e);
        } catch (final IOException e) {
            exceptionBase = new ExceptionBase(String.format(UPLOAD_ERROR_MESSAGE, fileName), e);
        } finally {
            exceptionBase = release(file, httpPut);
        }

        if (exceptionBase != null) {
            throw exceptionBase;
        }
    }

    /**
     *
     * Releases resources.
     *
     * @param file InputStream.
     * @param put HttpPut.
     * @return ExceptionBase.
     */
    private static ExceptionBase release(final InputStream file,
            final org.apache.http.client.methods.HttpPut put) {
        ExceptionBase exceptionBase = null;
        if (file != null) {
            try {
                file.close();
            } catch (final IOException e) {
                exceptionBase = new ExceptionBase(UPLOAD_ERROR_MESSAGE, e);
            }
        }
        if (put != null) {
            put.releaseConnection();
        }
        return exceptionBase;
    }
    
    /**
     *
     * Corrects the length issue of InputStreamBody.
     *
     * @author Yong Shao
     * @since 21.4
     *
     */
    static final class InputStreamKnownSizeBody extends InputStreamBody {
        /**
         * length.
         */
        private final int length;
        
        /**
         *
         * @param inputStream data.
         * @param length data size.
         * @param mimeType mime type.
         * @param filename file name.
         */
        @SuppressWarnings("deprecation")
        public InputStreamKnownSizeBody(final InputStream inputStream, final int length,
                final String mimeType, final String filename) {
            super(inputStream, mimeType, filename);
            this.length = length;
        }
        
        @Override
        public long getContentLength() {
            return this.length;
        }
        
    }
    
}
