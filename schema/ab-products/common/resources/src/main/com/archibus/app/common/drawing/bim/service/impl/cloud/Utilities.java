package com.archibus.app.common.drawing.bim.service.impl.cloud;

import java.io.UnsupportedEncodingException;

import com.archibus.utility.ExceptionBase;

/**
 *
 * Provides Utilities for services with Autodesk BIM Cloud Server.
 *
 * @author Yong Shao
 * @since 21.4
 *
 */
public final class Utilities {
    /**
     * Constant: UTF-8.
     */
    private static final String UTF_8 = "UTF-8";
    
    /**
     * Constant: URN_ENCODE_ERROR_MESSAGE.
     */
    private static final String URN_ENCODE_ERROR_MESSAGE =
            "Fail to get URN from the file [%s] and bucket [%s].";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private Utilities() {
    }

    /**
     *
     * Gets 64 based encoded URN from file and bucket names.
     *
     * @param fileName file name.
     * @param bucketName bucket name.
     * @return encoded Urn
     */
    public static String getUrn(final String fileName, final String bucketName) {
        String result = null;
        try {
            final String rawURN = "urn:adsk.objects:os.object:" + bucketName + "/" + fileName;
            
            result =
                    new String(org.apache.commons.codec.binary.Base64.encodeBase64(rawURN
                        .getBytes(UTF_8)), UTF_8);
        } catch (final UnsupportedEncodingException e) {
            throw new ExceptionBase(String.format(URN_ENCODE_ERROR_MESSAGE, fileName, bucketName),
                e);
        }
        return result;
    }
    
    /**
     *
     * Gets decoded file name from 64 based encoded URN.
     *
     * @param urn 64 based encoded name.
     * @return decoded file name.
     */
    public static String getFileName(final String urn) {
        String result = null;
        try {
            result =
                    new String(org.apache.commons.codec.binary.Base64.decodeBase64(urn
                        .getBytes(UTF_8)), UTF_8);
            result = result.substring(result.indexOf('/') + 1);
        } catch (final UnsupportedEncodingException e) {
            throw new ExceptionBase();
        }
        return result;
    }
    
}
