package com.archibus.app.solution.common.webservice.document.interceptor;

import java.io.*;
import java.util.*;

import org.aopalliance.intercept.MethodInvocation;

import com.archibus.app.solution.common.webservice.document.client.*;
import com.archibus.service.interceptor.AbstractInterceptor;
import com.archibus.utility.ExceptionBase;

/**
 * This is an example of an interceptor, which intercepts the standard document checkin, extracts
 * invocation parameters, and conditionally performs another operation based on those parameters. An
 * example of such operation would be document upload to SharePoint server, if table name and field
 * name parameters match the specified values. Typical use case: when a lease document (the ls.doc
 * field) is uploaded to the WebCentral document management repository, it also should be uploaded
 * to SharePoint server, tagged with the Lease Id (ls.ls_id), inventory table name, field name,
 * primary keys.
 *
 * Limitations: the current implementation of CopyServiceClient uses CXF framework to implement
 * WebService client. It only works with Sun JDK, in Windows OS, and uses Windows OS user account
 * under which WebCentral is running, to authenticate with SharePoint server.
 *
 * The DocumentInterceptor bean and supporting beans are defined in
 * /schema/ab-products/solutions/common
 * /src/test/com/archibus/webservice/document/interceptor/documentService.xml.
 *
 * For instructions on how to demonstrate this example, see Online Help.
 *
 * @author Valery Tydykov
 *
 */
public class DocumentInterceptor extends AbstractInterceptor {
    private static final String CHECKIN_NEW_FILE = "checkinNewFile";

    private static final String CHECKIN_NEW_VERSION = "checkinNewVersion";

    private static final String DOC = "doc";

    private static final String FIELD_NAME = "Field Name";

    private static final String KEYS = "Keys";

    private static final String LEASE_ID = "Lease ID";

    private static final String LS = "ls";

    private static final String LS_ID = "ls_id";

    private static final String SHARED_DOCUMENTS = "Shared%20Documents";

    private static final String TABLE_NAME = "Table Name";

    // SharePoint WebService client
    private CopyServiceClient copyServiceClient;

    public CopyServiceClient getCopyServiceClient() {
        return this.copyServiceClient;
    }

    /*
     * (non-Javadoc)
     *
     * @see
     * org.aopalliance.intercept.MethodInterceptor#invoke(org.aopalliance.intercept.MethodInvocation
     * )
     */
    @Override
    public Object invoke(final MethodInvocation invocation) throws Throwable {
        final ReturnValues returnValues = workAroundSpring4BugIfToStringCalled(invocation);
        if (returnValues.isProcessed()) {
            return returnValues.getReturnValue();
        }
        
        // proceed with normal invocation (document checkin)
        final Object retVal = invocation.proceed();

        // after document checkin to WebCentral
        // intercept checkinNewFile, checkinNewVersion methods
        final String methodName = invocation.getMethod().getName();
        if (CHECKIN_NEW_FILE.equals(methodName) || CHECKIN_NEW_VERSION.equals(methodName)) {
            // extract method arguments
            final InputStream inputStream = (InputStream) invocation.getArguments()[0];
            final Map<String, String> keys = (Map<String, String>) invocation.getArguments()[1];
            final String tableName = (String) invocation.getArguments()[2];
            final String fieldName = (String) invocation.getArguments()[3];
            final String documentName = (String) invocation.getArguments()[4];

            if (LS.equals(tableName) && DOC.equals(fieldName)) {
                uploadLeaseToSharepointServer(inputStream, keys, tableName, fieldName, documentName);
            }
        }

        return retVal;
    }

    public void setCopyServiceClient(final CopyServiceClient copyServiceClient) {
        this.copyServiceClient = copyServiceClient;
    }

    /**
     * Prepare metadata (fieldInfos) to be uploaded along with the document. The fieldInfos are
     * prepared in format expected by the WebService.
     *
     * @param values Map of keys/values, the key will become the display name of the column in
     *            SharePoint, the value will become the value of the column in SharePoint.
     * @return List of FieldInformation, to be used by the WebService.
     */
    private ArrayList<FieldInformation> prepareFieldInfos(final Map<String, String> values) {
        final ArrayList<FieldInformation> fieldInfos = new ArrayList<FieldInformation>();

        for (final Map.Entry<String, String> entry : values.entrySet()) {
            final String key = entry.getKey();

            final FieldInformation fieldInfo = new FieldInformation();
            fieldInfo.setDisplayName(key);
            fieldInfo.setId(UUID.randomUUID().toString());
            fieldInfo.setInternalName(key);
            fieldInfo.setType(FieldType.TEXT);
            fieldInfo.setValue(entry.getValue());

            fieldInfos.add(fieldInfo);
        }

        return fieldInfos;
    }

    /**
     * Upload lease document supplied in inputStream to SharePoint Server. Create metadata
     * (fieldInfos) to be uploaded along with the document.
     *
     * @param inputStream The lease document to be uploaded.
     * @param keys Document primary keys in the inventory table.
     * @param tableName Inventory table.
     * @param fieldName Field name in the inventory table.
     * @param documentName File name of the document.
     * @throws ExceptionBase If upload failed.
     */
    private void uploadLeaseToSharepointServer(final InputStream inputStream,
            final Map<String, String> keys, final String tableName, final String fieldName,
            final String documentName) throws ExceptionBase {
        // @non-translatable
        final String operation =
                "Intercepting checkinNewFile or checkinNewVersion method: tableName=[%s], fieldName=[%s], documentName=[%s], keys=[%s]";

        if (this.logger.isInfoEnabled()) {
            final String message =
                    String.format(operation, tableName, fieldName, documentName, keys);
            this.logger.info(message);
        }

        // reset the marker in the stream, which was moved to the end by the previous checkin
        // operation
        byte[] buffer = null;
        try {
            inputStream.reset();

            buffer = new byte[inputStream.available()];
            // read stream into buffer
            inputStream.read(buffer);
        } catch (final IOException e) {
            // @non-translatable
            throw new ExceptionBase(null, "Could not read InputStream", e);
        }

        // prepare metadata (fieldInfos) to be uploaded along with the document
        ArrayList<FieldInformation> fieldInfos = null;
        {

            final Map<String, String> fieldInfoValues = new HashMap<String, String>();
            fieldInfoValues.put(TABLE_NAME, tableName);
            fieldInfoValues.put(FIELD_NAME, fieldName);

            {
                final String leaseId = keys.get(LS_ID);
                fieldInfoValues.put(LEASE_ID, leaseId);
            }

            fieldInfoValues.put(KEYS, keys.toString());

            fieldInfos = prepareFieldInfos(fieldInfoValues);
        }

        // TODO method parameters?
        final String fileName = documentName;
        // TODO encoding
        final String documentLibraryFolder = SHARED_DOCUMENTS;

        // invoke SharePoint WebService
        this.copyServiceClient.copyIntoItems(buffer, documentLibraryFolder, fileName, fieldInfos);
    }
}
