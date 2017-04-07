/**
 * 
 */
package com.archibus.app.solution.common.webservice.document;

import java.net.MalformedURLException;

import com.archibus.app.solution.common.webservice.document.DocumentJob;
import com.archibus.datasource.DataSourceTestBase;

/**
 * @author Valery
 * 
 */
public class DocumentJobTest extends DataSourceTestBase {
    private DocumentJob documentJob;

    public DocumentJob getDocumentJob() {
        return this.documentJob;
    }

    public void setDocumentJob(DocumentJob documentJob) {
        this.documentJob = documentJob;
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "/context/core/core-infrastructure.xml", "appContext-test.xml",
                "/com/archibus/webservice/document/documentJob.xml" };
    }

    /**
     * Test method for {@link com.archibus.app.solution.common.webservice.document.DocumentJob#uploadDocument()} .
     * 
     * @throws MalformedURLException
     */
    public void testUploadDocument() throws MalformedURLException {
        this.documentJob.uploadDocument();
        // TODO verify
    }
}
