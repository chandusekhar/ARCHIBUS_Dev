package com.archibus.eventhandler.CapitalProjects;

import java.io.*;
import java.util.*;

import org.apache.commons.collections.map.LinkedMap;
import org.directwebremoting.io.FileTransfer;

import com.archibus.db.RecordPersistenceImpl;
import com.archibus.docmanager.*;
import com.archibus.schema.Record;
import com.archibus.utility.*;
import com.aspose.tasks.*;

public class MppDocument {

    private byte[] bt = null;
    
    /**
     * This is a static class that should not be instantiated.
     *
     * @param persistence
     *
     * @param persistence
     */
    public MppDocument(final ByteArrayOutputStream outStream) {
        if (outStream != null) {
            this.bt = outStream.toByteArray();
        }
    }

    public InputStream getInputStream() {
        final InputStream inputStream = new ByteArrayInputStream(this.bt);
        return inputStream;
    }

    /**
     * Description of the Method
     *
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     * @param xmlString Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public void upload(final MsProjectProperties properties,
            final MsProjectPersistenceImpl persistence) throws ExceptionBase {

        final Document document =
                new Document(persistence.getUserSession(), this.prepareValues(properties));

        final Map<String, Object> fieldPkValues = getPkValues(properties);
        final boolean newDocument = isNewDocument(fieldPkValues, persistence);

        document.checkin(newDocument, persistence.getUserSession());
        
    }

    /**
     * Gets the docContent attribute of the MsProjectHandlers object
     *
     * @param persistence
     *
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     * @return The docContent value
     * @exception IOException Description of the Exception
     */
    public Project download(final MsProjectProperties properties,
            MsProjectPersistenceImpl persistence) throws ExceptionBase {
        
        final HashMap<String, Object> fieldValues = getFieldValues(properties);

        if (persistence == null) {
            persistence = new MsProjectPersistenceImpl();
        }

        final com.archibus.docmanager.Document document =
                new com.archibus.docmanager.Document(persistence.getUserSession(), fieldValues);
        final FileTransfer fileTransfer =
                document.download(null, true, "application/msproject", "attachment");
        
        final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            fileTransfer.getOutputStreamLoader().load(outputStream);
        } catch (final IOException e) {
            throw new ExceptionBase("Unable to load the outstream for MPP document.");
        }
        
        if (outputStream != null) {
            this.bt = outputStream.toByteArray();
        }

        // Create a project reader instance
        final ProjectReader projectReader = new ProjectReader();
        
        return projectReader.read(this.getInputStream());
        
    }

    private HashMap<String, Object> prepareValues(final MsProjectProperties properties) {
        // prepare Pk values for afm_docs table
        final HashMap<String, Object> fieldValues = getFieldValues(properties);
        
        // prepare doc_file field for afm_docvers table
        fieldValues.put(DocumentVersion.DOC_FILE, properties.getServerFileName());
        {
            // prepare file_contents field for afm_docvers table
            final InputStream inputStream = new ByteArrayInputStream(this.bt);
            // Test for BLOB
            fieldValues.put(DocumentVersion.FILE_CONTENTS, inputStream);
            final double size = this.bt.length;
            fieldValues.put(DocumentVersion.DOC_SIZE, new Double(size / 1000.0));
            
        }
        
        // prepare doc_file field for inventory table
        fieldValues.put(StringUtil.toString(fieldValues.get(Document.FIELD_NAME)),
            properties.getServerFileName());
        
        return fieldValues;
    }

    private boolean isNewDocument(final Map<String, Object> fieldPkValues,
            final MsProjectPersistenceImpl persistence) {
        boolean newDocument = false;
        fieldPkValues.put(DocumentVersion.VERSION, Integer.valueOf(1));
        
        final RecordPersistenceImpl recordImpl =
                persistence.preparePersistence(new HashMap<String, Object>(),
                    DocumentVersion.TABLE, false);
        
        // retrieve and compare
        final Record.Immutable record = recordImpl.retrieve(false, fieldPkValues);
        
        if (record == null) {
            newDocument = true;
        }
        
        return newDocument;
    }

    /**
     * Gets the pkValues attribute of the MsProjectHandlers object
     *
     * @return The pkValues value
     */
    private HashMap<String, Object> getPkValues(final MsProjectProperties properties) {
        final HashMap<String, Object> fieldPkValues = new HashMap<String, Object>();
        if (properties.isHasWorkpackage()) {
            fieldPkValues.put(Document.TABLE_NAME, MsProjectConstants.WORK_PKGS_TBL);
            fieldPkValues.put(Document.FIELD_NAME,
                MsProjectConstants.WORK_PKGS_FLDS.DOC_ACTS_XFER.toString());
            fieldPkValues.put(Document.PKEY_VALUE,
                properties.getProjectId() + "|" + properties.getWorkPackageId());
        } else {
            fieldPkValues.put(Document.TABLE_NAME, MsProjectConstants.PROJECT_TBL);
            fieldPkValues.put(Document.FIELD_NAME,
                MsProjectConstants.PROJECT_FLDS.DOC_ACTS_XFER.toString());
            fieldPkValues.put(Document.PKEY_VALUE, properties.getProjectId());
        }
        return fieldPkValues;
    }

    /**
     * Gets the fieldValues attribute of the MsProjectHandlers object
     *
     * @param properties Description of the Parameter
     * @return The fieldValues value
     */
    private HashMap<String, Object> getFieldValues(final MsProjectProperties properties) {
        final HashMap<String, Object> fieldValues = getPkValues(properties);
        
        final Map<String, String> pkeys = new LinkedMap();
        if (properties.isHasWorkpackage()) {
            pkeys.put(MsProjectConstants.PROJECT_FLDS.PROJECT_ID.toString(),
                properties.getProjectId());
            pkeys.put(MsProjectConstants.WORK_PKGS_FLDS.WORK_PKG_ID.toString(),
                properties.getWorkPackageId());
            fieldValues.put(Document.PKEY_VALUES, pkeys);
        } else {
            pkeys.put(MsProjectConstants.PROJECT_FLDS.PROJECT_ID.toString(),
                properties.getProjectId());
            fieldValues.put(Document.PKEY_VALUES, pkeys);
        }
        return fieldValues;
    }
    
}