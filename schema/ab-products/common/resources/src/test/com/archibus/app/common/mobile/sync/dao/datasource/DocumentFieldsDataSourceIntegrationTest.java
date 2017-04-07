package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import com.archibus.app.common.mobile.sync.*;
import com.archibus.app.common.mobile.sync.dao.IDocumentFieldsDao;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.TableDef;

/**
 * Integration tests for DocumentFieldsDataSource.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class DocumentFieldsDataSourceIntegrationTest extends AbstractIntegrationTest {
    
    private DocumentFieldsDataSource documentFieldsDataSource;
    
    /**
     * Getter for the documentFieldsDataSource property.
     *
     * @see documentFieldsDataSource
     * @return the documentFieldsDataSource property.
     */
    public DocumentFieldsDataSource getDocumentFieldsDataSource() {
        return this.documentFieldsDataSource;
    }
    
    /**
     * Setter for the documentFieldsDataSource property.
     *
     * @see documentFieldsDataSource
     * @param documentFieldsDataSource the documentFieldsDataSource to set
     */
    
    public void setDocumentFieldsDataSource(final DocumentFieldsDataSource documentFieldsDataSource) {
        this.documentFieldsDataSource = documentFieldsDataSource;
    }
    
    /**
     * Test method for
     * {@link DocumentFieldsDataSource#checkInDocumentFields(com.archibus.datasource.data.DataRecord, RecordAndDto)}
     * and
     * {@link DocumentFieldsDataSource#checkOutDocumentFields(com.archibus.schema.TableDef.ThreadSafe, RecordAndDto)}
     * .
     */
    public final void testCheckInDocumentFieldsCheckOutDocumentFields() {
        final TableDef.ThreadSafe tableDef = prepareTableDef();
        
        final List<String> documentFieldNames = prepareDocumentFieldNames();
        final List<String> nonDocumentFieldNames = prepareNonDocumentFieldNames();
        
        DataRecord recordToSave;
        {
            
            final List<String> nonDocumentAndDocumentFieldNames = new ArrayList<String>();
            nonDocumentAndDocumentFieldNames.addAll(documentFieldNames);
            nonDocumentAndDocumentFieldNames.addAll(nonDocumentFieldNames);
            
            final DataSource dataSource =
                    SyncDataSourceUtilities.createDataSource(nonDocumentAndDocumentFieldNames,
                        tableDef, true);
            recordToSave =
                    dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS
                            + Constants.WR_ID_EXISTING_LOCKED_BY_AFM);
        }
        
        final String documentContentEncoded =
                DocumentFieldsDataSourceUtilities.base64Encode(Constants.TEST_DOCUMENT_CONTENT
                    .getBytes());
        
        {
            final Record recordDto = new Record();
            {
                recordDto.addOrSetFieldValue(Constants.DOC1, Constants.TEST_TXT);
                
                recordDto.addOrSetFieldValue(Constants.DOC1_CONTENTS, documentContentEncoded);
            }
            
            this.documentFieldsDataSource.checkInDocumentFields(tableDef,
                new IDocumentFieldsDao.RecordAndDto(recordToSave, recordDto));
        }
        
        {
            final Record recordDto = new Record();
            // recordDto has to have list of fields
            recordDto.addOrSetFieldValue(Constants.DOC1, null);
            
            recordToSave.setValue(tableDef.getName() + "." + Constants.DOC1, Constants.TEST_TXT);
            
            // verify
            this.documentFieldsDataSource.checkOutDocumentFields(tableDef,
                new IDocumentFieldsDao.RecordAndDto(recordToSave, recordDto), true);
            
            assertEquals(Constants.TEST_TXT, recordDto.findValueForFieldName(Constants.DOC1));
            assertEquals(documentContentEncoded,
                recordDto.findValueForFieldName(Constants.DOC1_CONTENTS));
        }
    }
    
    /**
     * Test method for {@link DocumentFieldsDataSource#checkInDocumentField()} and
     * {@link DocumentFieldsDataSource#checkOutDocumentField()} .
     */
    public final void testCheckInDocumentFieldCheckOutDocumentField() {
        // case #1: fileName is not empty
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put("auto_number", "9999999");
        
        final String documentContentEncoded =
                DocumentFieldsDataSourceUtilities.base64Encode(Constants.TEST_DOCUMENT_CONTENT
                    .getBytes());
        
        {
            final Record record = new Record();
            {
                record.addOrSetFieldValue(Constants.DOC1, Constants.TEST_TXT);
                record.addOrSetFieldValue(Constants.DOC1_CONTENTS, documentContentEncoded);
            }
            
            this.documentFieldsDataSource.checkInDocumentField(Constants.WR_SYNC, Constants.DOC1,
                keys, record);
        }
        
        {
            final Record record = new Record();
            // verify
            this.documentFieldsDataSource.checkOutDocumentField(Constants.WR_SYNC, Constants.DOC1,
                keys, record, Constants.TEST_TXT, true);
            
            assertEquals(Constants.TEST_TXT, record.findValueForFieldName(Constants.DOC1));
            assertEquals(documentContentEncoded,
                record.findValueForFieldName(Constants.DOC1_CONTENTS));
        }
    }
    
    /**
     * Test method for {@link DocumentFieldsDataSource#checkInDocumentField()} and
     * {@link DocumentFieldsDataSource#checkOutDocumentField()} .
     */
    // TODO fails: java.sql.SQLException: [Sybase][ODBC Driver][SQL Anywhere]User 'AFM' has the row
    // in 'wr_sync' locked
    // TODO
    public final void NOtestCheckInDocumentFieldCheckOutDocumentFieldMarkDeleted() {
        // checkin new document
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put("auto_number", "9999999");
        
        final String documentContentEncoded =
                DocumentFieldsDataSourceUtilities.base64Encode(Constants.TEST_DOCUMENT_CONTENT
                    .getBytes());
        {
            {
                final Record record = new Record();
                {
                    record.addOrSetFieldValue(Constants.DOC1, Constants.TEST_TXT);
                    record.addOrSetFieldValue(Constants.DOC1_CONTENTS, documentContentEncoded);
                }
                
                this.documentFieldsDataSource.checkInDocumentField(Constants.WR_SYNC,
                    Constants.DOC1, keys, record);
            }
        }
        
        {
            final Record record = new Record();
            // verify
            this.documentFieldsDataSource.checkOutDocumentField(Constants.WR_SYNC, Constants.DOC1,
                keys, record, Constants.TEST_TXT, true);
            
            assertEquals(Constants.TEST_TXT, record.findValueForFieldName(Constants.DOC1));
            assertEquals(documentContentEncoded,
                record.findValueForFieldName(Constants.DOC1_CONTENTS));
        }
        
        // mark document as deleted
        {
            final String documentContentEncodedMarkDeleted =
                    DocumentFieldsDataSourceUtilities
                        .base64Encode(Constants.TEST_DOCUMENT_CONTENT_MARK_DELETED.getBytes());
            
            {
                final Record record = new Record();
                {
                    record.addOrSetFieldValue(Constants.DOC1, Constants.TEST_TXT);
                    record.addOrSetFieldValue(Constants.DOC1_CONTENTS,
                        documentContentEncodedMarkDeleted);
                }
                
                this.documentFieldsDataSource.checkInDocumentField(Constants.WR_SYNC,
                    Constants.DOC1, keys, record);
            }
        }
        
        {
            final Record record = new Record();
            // verify
            this.documentFieldsDataSource.checkOutDocumentField(Constants.WR_SYNC, Constants.DOC1,
                keys, record, Constants.TEST_TXT, true);
            
            assertEquals(Constants.TEST_TXT, record.findValueForFieldName(Constants.DOC1));
            assertEquals(null, record.findValueForFieldName(Constants.DOC1_CONTENTS));
        }
    }
    
    /**
     * Test method for {@link DocumentFieldsDataSource#checkInDocumentField()} and
     * {@link DocumentFieldsDataSource#checkOutDocumentField()} .
     */
    public final void testCheckInDocumentFieldCheckOutDocumentFieldFileNameIsEmpty() {
        // case #2: fileName is empty
        
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put("auto_number", "9999999");
        
        {
            final Record record = new Record();
            {
                record.addOrSetFieldValue(Constants.DOC1, null);
                record.addOrSetFieldValue(Constants.DOC1_CONTENTS, null);
            }
            
            this.documentFieldsDataSource.checkInDocumentField(Constants.WR_SYNC, Constants.DOC1,
                keys, record);
        }
        
        {
            final Record record = new Record();
            // verify
            this.documentFieldsDataSource.checkOutDocumentField(Constants.WR_SYNC, Constants.DOC1,
                keys, record, null, true);
            
            assertEquals(null, record.findValueForFieldName(Constants.DOC1));
            assertEquals(null, record.findValueForFieldName(Constants.DOC1_CONTENTS));
        }
    }
    
    /**
     * Test method for {@link DocumentFieldsDataSource#checkInDocumentField()} and
     * {@link DocumentFieldsDataSource#checkOutDocumentField()} .
     */
    public final void testCheckInDocumentFieldCheckOutDocumentFieldIncludeDocumentDataFalse() {
        // case #2: fileName is empty
        
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put("auto_number", "9999999");
        
        {
            final Record record = new Record();
            {
                record.addOrSetFieldValue(Constants.DOC1, null);
                record.addOrSetFieldValue(Constants.DOC1_CONTENTS, null);
            }
            
            this.documentFieldsDataSource.checkInDocumentField(Constants.WR_SYNC, Constants.DOC1,
                keys, record);
        }
        
        {
            final Record record = new Record();
            // verify
            this.documentFieldsDataSource.checkOutDocumentField(Constants.WR_SYNC, Constants.DOC1,
                keys, record, null, false);
            
            assertEquals(null, record.findValueForFieldName(Constants.DOC1));
            assertEquals(null, record.findValueForFieldName(Constants.DOC1_CONTENTS));
        }
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "documentFieldsDataSource.xml" };
    }
}
