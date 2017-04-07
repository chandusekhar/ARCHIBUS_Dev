package com.archibus.app.solution.common.webservice.document.interceptor;

import java.io.InputStream;
import java.net.MalformedURLException;
import java.util.*;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.service.*;

public class DocumentInterceptorTest extends DataSourceTestBase {
    private DocumentService documentService;

    public DocumentService getDocumentService() {
        return this.documentService;
    }

    public void setDocumentService(DocumentService documentService) {
        this.documentService = documentService;
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/com/archibus/webservice/document/interceptor/documentService.xml" };
    }

    public void testCheckinNewFile() throws MalformedURLException {
        InputStream inputStream = TestDocumentService.prepareInputStream("New file content.");

        Map<String, String> keys = new HashMap<String, String>();
        keys.put("ls_id", "101");

        String fieldName = "doc";
        String tableName = "ls";
        String newLockStatus = "0";
        String documentName = "lease1.doc";
        String comments = "New file comments";

        this.documentService.checkinNewFile(inputStream, keys, tableName, fieldName, documentName,
            comments, newLockStatus);
        // TODO verify
    }
}
