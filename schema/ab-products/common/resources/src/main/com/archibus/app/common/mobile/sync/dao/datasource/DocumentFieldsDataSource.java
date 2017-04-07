package com.archibus.app.common.mobile.sync.dao.datasource;

import java.io.InputStream;
import java.util.*;

import org.apache.log4j.Logger;
import org.directwebremoting.io.FileTransfer;

import com.archibus.app.common.mobile.sync.dao.IDocumentFieldsDao;
import com.archibus.app.common.mobile.sync.service.*;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.schema.*;
import com.archibus.service.DocumentService;
import com.archibus.utility.*;

/**
 * DataSource for operations on document fields.
 * <p>
 * Can be used with prototype or singleton scope. Designed to have singleton scope in order to be
 * dependency of a singleton bean.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class DocumentFieldsDataSource implements IDocumentFieldsDao {
    /**
     * Contains two lists of field names, filtered by type: document and non-document.
     *
     */
    static class FieldNames {
        /**
         * Property: Names of the fields which are of document type.
         */
        private List<String> documentFieldNames;
        
        /**
         * Property: Names of the fields which are not of document type.
         */
        private List<String> nonDocumentFieldNames;
        
        /**
         * Getter for the documentFieldNames property.
         *
         * @see documentFieldNames
         * @return the documentFieldNames property.
         */
        public List<String> getDocumentFieldNames() {
            return this.documentFieldNames;
        }
        
        /**
         * Getter for the nonDocumentFieldNames property.
         *
         * @see nonDocumentFieldNames
         * @return the nonDocumentFieldNames property.
         */
        public List<String> getNonDocumentFieldNames() {
            return this.nonDocumentFieldNames;
        }
        
        /**
         * Setter for the documentFieldNames property.
         *
         * @see documentFieldNames
         * @param documentFieldNames the documentFieldNames to set
         */
        
        public void setDocumentFieldNames(final List<String> documentFieldNames) {
            this.documentFieldNames = documentFieldNames;
        }
        
        /**
         * Setter for the nonDocumentFieldNames property.
         *
         * @see nonDocumentFieldNames
         * @param nonDocumentFieldNames the nonDocumentFieldNames to set
         */
        
        public void setNonDocumentFieldNames(final List<String> nonDocumentFieldNames) {
            this.nonDocumentFieldNames = nonDocumentFieldNames;
        }
    }
    
    /**
     * Constant: postfix of field name with document field content, for example "doc1_contents".
     */
    static final String FIELD_POSTFIX_CONTENTS = "_contents";
    
    /**
     * Constant: Lock status of document field: unlocked.
     */
    private static final String UNLOCKED = "0";
    
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Property: documentService.
     */
    private DocumentService documentService;
    
    /** {@inheritDoc} */
    @Override
    public void checkInDocumentFields(final TableDef.ThreadSafe tableDef,
            final RecordAndDto recordAndDto) {
        final Map<String, String> keys =
                DocumentFieldsDataSourceUtilities.extractPrimaryKeys(recordAndDto.getRecord(),
                    tableDef);
        
        final Record recordDto = recordAndDto.getRecordDto();
        // for all non-empty document fields in DTO:
        for (final FieldNameValue fieldNameValue : recordDto.getFieldValues()) {
            final String fieldName = fieldNameValue.getFieldName();
            // filter out "..._contents" fields
            final ArchibusFieldDefBase.Immutable fieldDef = tableDef.findFieldDef(fieldName);
            if (fieldDef != null && fieldDef.isDocument()) {
                // non-empty document field
                checkInDocumentField(tableDef.getName(), fieldName, keys, recordDto);
            }
        }
    }
    
    /** {@inheritDoc} */
    @Override
    public void checkOutDocumentFields(final TableDef.ThreadSafe tableDef,
            final RecordAndDto recordAndDto, final boolean includeDocumentData) {
        final Map<String, String> keys =
                DocumentFieldsDataSourceUtilities.extractPrimaryKeys(recordAndDto.getRecord(),
                    tableDef);
        
        final Record recordDto = recordAndDto.getRecordDto();
        
        final List<String> documentFieldNames =
                DocumentFieldsDataSourceUtilities.prepareDocumentFieldNames(tableDef, recordDto);
        
        // for all document fields in record
        for (final String fieldName : documentFieldNames) {
            // fileName from field with name like "doc1"
            final String fileName =
                    recordAndDto.getRecord().getString(tableDef.getFieldDef(fieldName).fullName());
            
            checkOutDocumentField(tableDef.getName(), fieldName, keys, recordDto, fileName,
                includeDocumentData);
        }
    }
    
    /**
     * Getter for the documentService property.
     *
     * @see documentService
     * @return the documentService property.
     */
    public DocumentService getDocumentService() {
        return this.documentService;
    }
    
    /**
     * Setter for the documentService property.
     *
     * @see documentService
     * @param documentService the documentService to set
     */
    
    public void setDocumentService(final DocumentService documentService) {
        this.documentService = documentService;
    }
    
    /**
     * Checks-in content of document field fieldName supplied in the record into table tableName. If
     * the content is "MARK_DELETED", marks document as deleted.
     *
     * @param tableName of the sync table.
     * @param fieldName of the document field.
     * @param keys primary key values of the record in the sync table.
     * @param record with document field values to be checked-in. Expected to contain pairs of
     *            fields like "doc1", "doc1_contents". "doc1" should contain file name,
     *            "doc1_contents" should contain document content.
     */
    void checkInDocumentField(final String tableName, final String fieldName,
            final Map<String, String> keys, final Record record) {
        // document field
        
        // fileName from field with name like "doc1"
        final String fileName = (String) record.findValueForFieldName(fieldName);
        if (!StringUtil.isNullOrEmpty(fileName)) {
            // non-empty document field
            
            // contentEncoded contains base64 encoded string from field with name like
            // "doc1_contents"
            final FieldNameValue fieldNameValueDocumentContent =
                    record.findFieldNameValueForFieldName(fieldName + FIELD_POSTFIX_CONTENTS);
            if (fieldNameValueDocumentContent == null) {
                // non-translatable
                throw new ExceptionBase(
                    String
                        .format(
                            "Missing [%s_contents] field in the Record DTO to checkin for the [%s] document field.",
                            fieldName, fieldName));
            }
            
            final String contentEncoded = (String) fieldNameValueDocumentContent.getFieldValue();
            
            if ("MARK_DELETED".equals(DocumentFieldsDataSourceUtilities
                .convertDocumentContentToString(contentEncoded))) {
                // mark document as deleted
                this.documentService.markDeleted(keys, tableName, fieldName);
            } else {
                // document to be checked in
                // document content in binary format
                final InputStream inputStream =
                        DocumentFieldsDataSourceUtilities
                            .convertDocumentContentToStream(contentEncoded);
                
                this.documentService.checkinNewFile(inputStream, keys, tableName, fieldName,
                    fileName, "Document from mobile device.", UNLOCKED);
            }
        }
    }
    
    /**
     * Checks-out content of document field fieldName from sync table tableName into the record.
     * <p>
     * Does not lock the document field. Checks-out the last version of the documents.
     *
     * @param tableName of the sync table.
     * @param fieldName of the document field.
     * @param keys primary key values of the record in the sync table.
     * @param record which will contain checked-out document field values.
     * @param fileName of the document to be checked-out.
     * @param includeDocumentData when true, document data is populated in the doc_contents field.
     *            When false, the 'doc_contents' field contains null.
     */
    void checkOutDocumentField(final String tableName, final String fieldName,
            final Map<String, String> keys, final Record record, final String fileName,
            final boolean includeDocumentData) {
        record.addOrSetFieldValue(fieldName, fileName);
        
        String contentEncoded = null;
        if (includeDocumentData && !StringUtil.isNullOrEmpty(fileName)) {
            final FileTransfer fileTransfer =
                    this.documentService.show(keys, tableName, fieldName, fileName, null, true,
                        "showDocument");
            
            try {
                // contentEncoded contains base64 encoded string
                contentEncoded =
                        DocumentFieldsDataSourceUtilities
                            .convertStreamToEncodedString(fileTransfer);
            } catch (final ExceptionBase exceptionBase) {
                if (exceptionBase.getErrorNumber() == ExceptionBase.ERROR_NUMBER_DOCUMENT_STORAGE_CORRUPTED) {
                    // log error and continue processing
                    final String errorReport = exceptionBase.toStringForLogging();
                    this.logger.error(errorReport);
                } else {
                    throw exceptionBase;
                }
            }
        }
        
        // set value of the field with name like "doc1_contents" to contentEncoded which
        // contains base64 encoded string
        record.addOrSetFieldValue(fieldName + FIELD_POSTFIX_CONTENTS, contentEncoded);
    }
}
