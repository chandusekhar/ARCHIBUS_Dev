package com.archibus.eventhandler.msds;

import java.io.IOException;
import java.net.*;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.DocumentService;
import com.archibus.utility.StringUtil;

/**
 * MsdsCommonUtil test class.
 */
public final class MsdsCommonUtilTest extends DataSourceTestBase {
    
    final String remoteURL = "http://starequip.com/documents/MSDS_51086090.PDF";
    
    /**
     * 
     * Test checkInFile method of class MsdsCommonUtil.
     * 
     * @throws IOException
     */
    public void testCheckInFile() throws IOException {
        final MsdsCommonHandler m = new MsdsCommonHandler();
        final Logger logger = Logger.getLogger(m.getClass());
        
        // get document service object
        final DocumentService documentService =
                (DocumentService) ContextStore.get().getBean("documentService");
        
        ContextStore.get().getEventHandlerContext();
        final String msdsId = "5";
        
        final URL remoteFile = new URL(StringUtil.replace(this.remoteURL, " ", "%20"));
        
        // get file name from the URL
        final String remoteFileName = remoteFile.getFile().trim();
        
        final URLConnection urlConnection = remoteFile.openConnection();
        final boolean isNew = false;
        MsdsCommonUtil.checkInFile(logger, documentService, msdsId, remoteFileName, urlConnection,
            isNew);
        
    }
    
    /**
     * 
     * Test convertToLocalInputStream method of class MsdsCommonUtil.
     * 
     * @throws IOException
     */
    public void testConvertToLocalInputStream() {
        final MsdsCommonHandler m = new MsdsCommonHandler();
        final Logger logger = Logger.getLogger(m.getClass());
        
        ContextStore.get().getBean("documentService");
        URL remoteFile;
        try {
            remoteFile = new URL(StringUtil.replace(this.remoteURL, " ", "%20"));
            
            URLConnection urlConnection;
            try {
                urlConnection = remoteFile.openConnection();
                
                MsdsCommonUtil.convertToLocalInputStream(logger, urlConnection.getInputStream());
            } catch (final IOException e) {
                e.printStackTrace();
            }
            
        } catch (final MalformedURLException e) {
            e.printStackTrace();
        }
    }
    
    /**
     * 
     * Test logExceptionMessageAndThrowExceptionBase method of class MsdsCommonUtil.
     * 
     * @throws IOException
     */
    
    public static void testLogExceptionMessageAndThrowExceptionBase() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final MsdsCommonHandler m = new MsdsCommonHandler();
        final Logger logger = Logger.getLogger(m.getClass());
        
        MsdsCommonUtil.logExceptionMessageAndThrowExceptionBase(logger, "error", context);
        
    }
    
}
