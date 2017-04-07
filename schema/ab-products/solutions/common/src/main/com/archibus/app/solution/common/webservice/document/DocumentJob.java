package com.archibus.app.solution.common.webservice.document;

import java.io.*;
import java.util.*;

import org.apache.log4j.Logger;
import org.directwebremoting.io.*;

import com.archibus.app.solution.common.webservice.document.client.CopyServiceClient;
import com.archibus.dao.DocumentDao;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.ExceptionBase;

/**
 * This is an example of Job uploading document from WebCentral to MS SharePoint server, using
 * WebService.
 * 
 * Limitations: the current implementation of CopyServiceClient uses CXF framework to implement
 * WebService client. It only works with Sun JDK, in Windows OS, and uses Windows OS user account
 * under which WebCentral is running, to authenticate with SharePoint server.
 * 
 * The DocumentJob bean and supporting beans are defined in
 * /applications/examples/applications-child-context.xml.
 * 
 * For instructions on how to demonstrate this example, see Online Help.
 * 
 * @author Valery Tydykov
 * 
 */
public class DocumentJob extends JobBase {
    // TODO encoding
    private static final String SHARED_DOCUMENTS = "Shared%20Documents";
    
    /**
     * Logger for this class and subclasses
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    // SharePoint WebService client
    private CopyServiceClient copyServiceClient;
    
    private DocumentDao documentDao;
    
    public CopyServiceClient getCopyServiceClient() {
        return this.copyServiceClient;
    }
    
    public DocumentDao getDocumentDao() {
        return this.documentDao;
    }
    
    public void setCopyServiceClient(final CopyServiceClient copyServiceClient) {
        this.copyServiceClient = copyServiceClient;
    }
    
    public void setDocumentDao(final DocumentDao documentDao) {
        this.documentDao = documentDao;
    }
    
    /**
     * Upload document from WebCentral to MS SharePoint server.
     * 
     * @throws ExceptionBase If upload failed.
     */
    public void uploadDocument() throws ExceptionBase {
        // @non-translatable
        final String operation = "Upload document: %s";
        
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, "Started");
            this.logger.info(message);
        }
        
        // TODO method parameters?
        final String fileName = "activity_log-305-doc.doc";
        
        // get document from WebCentral
        byte[] buffer = null;
        {
            final Map<String, String> keys = new HashMap<String, String>();
            keys.put("activity_log_id", "305");
            
            final String fieldName = "doc";
            final String tableName = "activity_log";
            final String newLockStatus = "0";
            final String version = "1";
            
            buffer = checkOutDocument(fileName, keys, fieldName, tableName, newLockStatus, version);
        }
        
        final String documentLibraryFolder = SHARED_DOCUMENTS;
        
        this.copyServiceClient.copyIntoItems(buffer, documentLibraryFolder, fileName, null);
        
        if (this.logger.isInfoEnabled()) {
            final String message = String.format(operation, "OK");
            this.logger.info(message);
        }
    }
    
    /**
     * Checkout document from WebCentral document management repository.
     * 
     * @param fileName File name of the document.
     * @param keys Primary keys of the document in the inventory table.
     * @param fieldName Field name in the inventory table.
     * @param tableName Inventory table name.
     * @param newLockStatus New lock status, to be set after the checkout.
     * @param version Version of the document to checkout.
     * @return buffer with the document content.
     * @throws ExceptionBase If checkout failed.
     */
    private byte[] checkOutDocument(final String fileName, final Map<String, String> keys,
            final String fieldName, final String tableName, final String newLockStatus,
            final String version) throws ExceptionBase {
        {
            final FileTransfer fileTransfer =
                    this.documentDao.checkOut(keys, tableName, fieldName, newLockStatus, false,
                        fileName, version);
            
            final OutputStreamLoader outputStreamLoader = fileTransfer.getOutputStreamLoader();
            
            // read bytes from the input stream
            try {
                try {
                    final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                    // TODO read chunk by chunk?
                    outputStreamLoader.load(outputStream);
                    
                    return outputStream.toByteArray();
                } finally {
                    if (outputStreamLoader != null) {
                        outputStreamLoader.close();
                    }
                }
            } catch (final IOException e) {
                // @non-translatable
                throw new ExceptionBase(null, "Could not read InputStream", e);
            }
        }
    }
}
