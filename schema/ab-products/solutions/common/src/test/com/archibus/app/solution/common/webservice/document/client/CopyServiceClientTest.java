/**
 * 
 */
package com.archibus.app.solution.common.webservice.document.client;

import java.net.*;

import com.archibus.app.solution.common.webservice.document.client.CopyServiceClient;

import junit.framework.TestCase;

/**
 * @author tydykov
 * 
 */
public class CopyServiceClientTest extends TestCase {

    static final String siteRoot = "http://eliza:8030/afmsharepoint/";

    static final String testFileContent = "Test file content";

    /**
     * Test method for
     * {@link com.archibus.app.solution.common.webservice.document.client.CopyServiceClient#copyIntoItems(byte[])}
     * .
     * 
     * @throws MalformedURLException
     */
    public void testCopyIntoItems() throws MalformedURLException {
        CopyServiceClient copyServiceClient = new CopyServiceClient();

        copyServiceClient.setSiteRoot(new URL(siteRoot));

        byte[] item = null;
        {
            item = testFileContent.getBytes();
        }

        // TODO URL encoding
        String documentLibraryFolder = "Shared%20Documents";
        String fileName = "myTestFile.txt";
        copyServiceClient.copyIntoItems(item, documentLibraryFolder, fileName, null);
    }

    /**
     * Test method for
     * {@link com.archibus.app.solution.common.webservice.document.client.CopyServiceClient#getItem()}.
     * 
     * @throws MalformedURLException
     */
    public void testGetItem() throws MalformedURLException {
        CopyServiceClient copyServiceClient = new CopyServiceClient();

        copyServiceClient.setSiteRoot(new URL(siteRoot));

        // TODO URL encoding
        String documentLibraryFolder = "Shared%20Documents";
        String fileName = "myTestFile.txt";
        byte[] item = copyServiceClient.getItem(documentLibraryFolder, fileName);

        assertEquals(testFileContent, new String(item));
    }
}
