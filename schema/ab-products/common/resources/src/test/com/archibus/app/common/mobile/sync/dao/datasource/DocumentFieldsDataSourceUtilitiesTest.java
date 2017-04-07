package com.archibus.app.common.mobile.sync.dao.datasource;

import java.io.*;

import junit.framework.TestCase;

import org.directwebremoting.io.FileTransfer;

import com.archibus.app.common.mobile.sync.Constants;
import com.archibus.servlet.DWRFileTransfer;
import com.archibus.utility.FileCopy;

/**
 * Tests for DocumentFieldsDataSourceUtilities.
 * 
 * @author Valery Tydykov
 * @since 21.1
 * 
 */
public class DocumentFieldsDataSourceUtilitiesTest extends TestCase {
    
    private static final String UTF_8 = "UTF-8";
    
    /**
     * Test method for
     * {@link DocumentFieldsDataSource#convertDocumentContentToString(java.lang.String)} .
     * 
     * @throws UnsupportedEncodingException if encoding fails.
     */
    public final void testConvertDocumentContentToString() throws UnsupportedEncodingException {
        final String expected = Constants.TEST_DOCUMENT_CONTENT;
        String actual = null;
        {
            final String contentEncoded =
                    DocumentFieldsDataSourceUtilities.base64Encode(expected.getBytes());
            
            actual =
                    DocumentFieldsDataSourceUtilities
                        .convertDocumentContentToString(contentEncoded);
        }
        
        assertEquals(expected, actual);
    }
    
    /**
     * Test method for
     * {@link DocumentFieldsDataSource#convertDocumentContentToStream(java.lang.String)} .
     * 
     * @throws UnsupportedEncodingException if encoding fails.
     */
    public final void testConvertDocumentContentToStream() throws UnsupportedEncodingException {
        final String expected = Constants.TEST_DOCUMENT_CONTENT;
        InputStream actual = null;
        {
            final String contentEncoded =
                    DocumentFieldsDataSourceUtilities.base64Encode(expected.getBytes());
            
            actual =
                    DocumentFieldsDataSourceUtilities
                        .convertDocumentContentToStream(contentEncoded);
        }
        
        assertEquals(expected, new String(FileCopy.copyToByteArray(actual), UTF_8));
    }
    
    /**
     * Test method for {@link DocumentFieldsDataSource#base64Encode(byte[])} .
     * 
     * @throws UnsupportedEncodingException if encoding fails
     */
    public final void testBase64EncodeBase64Decode() throws UnsupportedEncodingException {
        final String expected = Constants.TEST_DOCUMENT_CONTENT;
        final String encoded = DocumentFieldsDataSourceUtilities.base64Encode(expected.getBytes());
        final byte[] decoded = DocumentFieldsDataSourceUtilities.base64Decode(encoded);
        
        assertEquals(expected, new String(decoded, UTF_8));
    }
    
    /**
     * Test method for
     * {@link DocumentFieldsDataSource#convertStreamToEncodedString(org.directwebremoting.io.FileTransfer)}
     * .
     * 
     * @throws UnsupportedEncodingException if encoding fails.
     */
    public final void testConvertStreamToEncodedString() throws UnsupportedEncodingException {
        final String expected = Constants.TEST_DOCUMENT_CONTENT;
        String actual = null;
        {
            final InputStream inputStream = new ByteArrayInputStream(expected.getBytes());
            final FileTransfer fileTransfer = new DWRFileTransfer(null, null, null, inputStream);
            
            actual = DocumentFieldsDataSourceUtilities.convertStreamToEncodedString(fileTransfer);
        }
        
        final String contentEncoded =
                DocumentFieldsDataSourceUtilities.base64Encode(expected.getBytes());
        
        assertEquals(contentEncoded, actual);
    }
}
