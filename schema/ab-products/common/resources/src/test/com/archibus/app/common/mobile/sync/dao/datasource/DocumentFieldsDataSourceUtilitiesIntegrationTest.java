package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import com.archibus.app.common.mobile.sync.*;
import com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.schema.TableDef;

/**
 * Integration tests for DocumentFieldsDataSourceUtilities.
 * 
 * @author Valery Tydykov
 * @since 20.1
 * 
 */
public class DocumentFieldsDataSourceUtilitiesIntegrationTest extends AbstractIntegrationTest {
    /**
     * Test method for
     * {@link DocumentFieldsDataSource#extractPrimaryKeys(DataRecord, DataRecord, TableDef.ThreadSafe)}
     * .
     */
    public final void testExtractPrimaryKeys() {
        // case #1: recordSaved == null
        {
            final String expectedAutonumber = "123";
            Map<String, String> actual = null;
            {
                final TableDef.ThreadSafe tableDef = this.prepareTableDef();
                
                DataRecord recordToSave;
                {
                    final List<String> nonDocumentFieldNames = prepareNonDocumentFieldNames();
                    
                    final DataSource dataSource =
                            SyncDataSourceUtilities.createDataSource(nonDocumentFieldNames,
                                tableDef, true);
                    recordToSave =
                            dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS
                                    + Constants.WR_ID_EXISTING_LOCKED_BY_AFM);
                    recordToSave.setValue("wr_sync.auto_number",
                        Integer.valueOf(expectedAutonumber));
                }
                
                actual =
                        DocumentFieldsDataSourceUtilities
                            .extractPrimaryKeys(recordToSave, tableDef);
            }
            
            assertEquals(1, actual.size());
            assertEquals(expectedAutonumber, actual.get("auto_number"));
        }
    }
    
    /**
     * Test method for
     * {@link DocumentFieldsDataSourceUtilities#prepareDocumentFieldNames(com.archibus.schema.TableDef. ThreadSafe, com.archibus.app.common.mobile.sync.service.Record)}
     * .
     */
    public final void testPrepareDocumentFieldNames() {
        final Record recordDto = new Record();
        // document field
        recordDto.addOrSetFieldValue(Constants.DOC1, null);
        
        // non-document field
        recordDto.addOrSetFieldValue("wr_id", null);
        
        // field not in the table
        recordDto.addOrSetFieldValue(Constants.DOC1_CONTENTS, null);
        
        final List<String> actual =
                DocumentFieldsDataSourceUtilities.prepareDocumentFieldNames(this.prepareTableDef(),
                    recordDto);
        assertEquals(1, actual.size());
        assertEquals(Constants.DOC1, actual.get(0));
    }
    
    /**
     * Test method for
     * {@link DocumentFieldsDataSource#separateFieldNames(java.util.List, com.archibus.schema.TableDef.ThreadSafe)}
     * .
     */
    public final void testSeparateFieldNames() {
        FieldNames actual = null;
        {
            final TableDef.ThreadSafe tableDef = this.prepareTableDef();
            
            final List<String> nonDocumentAndDocumentFieldNames = new ArrayList<String>();
            nonDocumentAndDocumentFieldNames.addAll(prepareNonDocumentFieldNames());
            nonDocumentAndDocumentFieldNames.addAll(prepareDocumentFieldNames());
            nonDocumentAndDocumentFieldNames.add(Constants.DOC1_CONTENTS);
            
            actual =
                    DocumentFieldsDataSourceUtilities.separateFieldNames(
                        nonDocumentAndDocumentFieldNames, tableDef);
        }
        
        {
            final List<String> documentFieldNames = actual.getDocumentFieldNames();
            assertEquals(1, documentFieldNames.size());
            assertEquals(Constants.DOC1, documentFieldNames.get(0));
        }
        
        {
            final List<String> nonDocumentFieldNames = actual.getNonDocumentFieldNames();
            assertEquals(6, nonDocumentFieldNames.size());
            assertEquals("wr_id", nonDocumentFieldNames.get(0));
            assertEquals("bl_id", nonDocumentFieldNames.get(1));
            assertEquals("fl_id", nonDocumentFieldNames.get(2));
            assertEquals("rm_id", nonDocumentFieldNames.get(3));
            assertEquals("description", nonDocumentFieldNames.get(4));
            assertEquals(Constants.STATUS, nonDocumentFieldNames.get(5));
        }
    }
}
