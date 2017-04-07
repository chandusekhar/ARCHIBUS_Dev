package com.archibus.app.common.connectors.transfer.docmgmt;

import java.io.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.connectors.exception.ConnectorInstantiationException;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.connectors.transfer.file.OutboundFileAdaptor;
import com.archibus.config.Project;
import com.archibus.context.ContextStore;
import com.archibus.dao.jdbc.DocumentDaoImpl;
import com.archibus.schema.ArchibusFieldDefBase.Immutable;
import com.archibus.schema.*;
import com.archibus.utility.ListWrapper;

/**
 * Provides a mechanism for exporting data to document management using connectors.
 * <p>
 *
 * @author cole
 * @since 21.4
 *
 */
public class OutboundDocumentManagementAdaptor extends OutboundFileAdaptor {
    
    /**
     * A temporary file the data is written to before being uploaded to document management.
     */
    private final File tempFile;

    /**
     * The table associated with the managed file.
     */
    private final String tableName;
    
    /**
     * The field associated with the managed file.
     */
    private final String documentField;

    /**
     * The name to provide for the managed file.
     */
    private final String documentName;
    
    /**
     * The primary key fields for the table.
     */
    private final Map<String, String> primaryKeys;

    /**
     * The status the file should have in document management after being uploaded.
     */
    private final String lockedStatus;
    
    /**
     * A comment describing the managed file.
     */
    private final String comment;
    
    /**
     * A DAO for uploading data to document management.
     */
    private final DocumentDaoImpl documentDao;
    
    /**
     * Constructor accepting configuration for a document management entry.
     *
     * @param tableName the table associated with the managed file.
     * @param documentField the field associated with the managed file.
     * @param documentName the name to provide for the managed file.
     * @param recordValues the primary key fields for the table.
     * @param lockedStatus the status the file should have in document management after being
     *            uploaded.
     * @param comment a comment describing the managed file.
     */
    public OutboundDocumentManagementAdaptor(final String tableName, final String documentField,
            final String documentName, final List<String> recordValues, final String lockedStatus,
            final String comment) {
        this(createTempFile(), tableName, documentField, documentName, recordValues, lockedStatus,
            comment);
    }
    
    /**
     * Constructor accepting configuration for a document management entry and a temporary file to
     * buffer data to. Since this constructor is implementation specific, it is private.
     *
     * @param tempFile the temporary file to export data to.
     * @param tableName the table associated with the managed file.
     * @param documentField the field associated with the managed file.
     * @param documentName the name to provide for the managed file.
     * @param fieldValues the field values for at least the primary key fields for the table.
     * @param lockedStatus the status the file should have in document management after being
     *            uploaded.
     * @param comment a comment describing the managed file.
     */
    private OutboundDocumentManagementAdaptor(final File tempFile, final String tableName,
            final String documentField, final String documentName, final List<String> fieldValues,
            final String lockedStatus, final String comment) {
        super(tempFile);
        this.tempFile = tempFile;
        this.tableName = tableName;
        this.documentField = documentField;
        this.documentName = documentName;
        this.lockedStatus = lockedStatus;
        this.comment = comment;
        this.documentDao = new DocumentDaoImpl();

        final Project.Immutable project = ContextStore.get().getProject();
        final TableDef.Immutable tableDef = project.loadTableDef(this.tableName);
        final ListWrapper.Immutable<Immutable> primaryKeyFields =
                tableDef.getPrimaryKey().getFields();
        this.primaryKeys = new HashMap<String, String>();
        int primaryKeyIndex = 0;
        for (final Immutable primaryKeyField : primaryKeyFields) {
            this.primaryKeys.put(primaryKeyField.getName(), fieldValues.get(primaryKeyIndex));
            primaryKeyIndex++;
        }
    }
    
    /**
     * Creates a temporary file. Used by the constructor.
     *
     * @return the handle for the temporary file.
     */
    private static File createTempFile() {
        try {
            return File.createTempFile("docmgmt", ".tmp");
        } catch (final IOException e) {
            throw new ConnectorInstantiationException(
                "Unable to create temporary file for document management adaptor.", e);
        }
    }
    
    @Override
    public void close() throws AdaptorException {
        try {
            super.close();
            InputStream inputStream;
            try {
                inputStream = new FileInputStream(this.tempFile);
            } catch (final FileNotFoundException e) {
                throw new AdaptorException("Temporary file not accessible", e);
            }
            this.documentDao.checkinNewFile(inputStream, this.primaryKeys, this.tableName,
                this.documentField, this.documentName, this.comment, this.lockedStatus);
        } finally {
            if (!this.tempFile.delete()) {
                Logger.getLogger(OutboundDocumentManagementAdaptor.class).warn(
                    "Failed to delete temp file: " + this.tempFile.getAbsolutePath());
            }
        }
    }
}
