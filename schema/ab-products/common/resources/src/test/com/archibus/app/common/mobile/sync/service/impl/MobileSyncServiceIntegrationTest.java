package com.archibus.app.common.mobile.sync.service.impl;

import java.util.*;

import com.archibus.app.common.mobile.sync.*;
import com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSourceUtilities;
import com.archibus.app.common.mobile.sync.service.*;
import com.archibus.model.view.datasource.*;

/**
 * Integration tests for MobileSyncService.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class MobileSyncServiceIntegrationTest extends AbstractIntegrationTest {
    // TODO Move this setPopulateProtectedVariables call to base class.
    public MobileSyncServiceIntegrationTest() {
        super();
        // Enable Field Injection. Declare protected variables of the required type which match
        // named beans in the context. This is autowire by name, rather than type.
        this.setPopulateProtectedVariables(true);
    }
    
    protected IMobileSyncService mobileSyncService;
    
    /**
     * Getter for the mobileSyncService property.
     *
     * @see mobileSyncService
     * @return the mobileSyncService property.
     */
    public IMobileSyncService getMobileSyncService() {
        return this.mobileSyncService;
    }
    
    /**
     * Setter for the mobileSyncService property.
     *
     * @see mobileSyncService
     * @param mobileSyncService the mobileSyncService to set
     */
    
    public void setMobileSyncService(final IMobileSyncService mobileSyncService) {
        this.mobileSyncService = mobileSyncService;
    }
    
    /**
     * Test method for
     * {@link MobileSyncService#checkInRecords(java.lang.String, java.util.List, java.util.List)}
     * and {@link MobileSyncService#checkOutRecords(String, java.util.List, ParsedRestrictionDef)} .
     */
    public final void testCheckInRecordsCheckOutRecords() {
        final String tableName = Constants.WR_SYNC;
        final List<Record> records = new ArrayList<Record>();
        
        final String documentContentEncoded =
                DocumentFieldsDataSourceUtilities.base64Encode(Constants.TEST_DOCUMENT_CONTENT
                    .getBytes());
        
        {
            // record exists and locked by the same user
            final Record record = new Record();
            record.addOrSetFieldValue(Constants.WR_ID, new Integer(
                Constants.WR_ID_EXISTING_LOCKED_BY_AI));
            record.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);
            record.addOrSetFieldValue(Constants.DOC1, Constants.TEST_TXT);
            record.addOrSetFieldValue(Constants.DOC1_CONTENTS, documentContentEncoded);
            records.add(record);
        }
        
        final List<String> inventoryKeyNames = prepareInventoryKeyNames();
        
        this.mobileSyncService.checkInRecords(tableName, inventoryKeyNames, records);
        
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        {
            restrictionDef.addClause(tableName, Constants.WR_ID,
                Constants.WR_ID_EXISTING_LOCKED_BY_AI, ClauseDef.Operation.EQUALS);
        }
        
        final List<Record> actual =
                this.mobileSyncService.checkOutRecords(tableName, prepareFieldNames(),
                    restrictionDef);
        
        assertEquals(1, actual.size());
        
        {
            final Record record = actual.get(0);
            assertEquals(Constants.TEST_TXT, record.findValueForFieldName(Constants.DOC1));
            assertEquals(documentContentEncoded,
                record.findValueForFieldName(Constants.DOC1_CONTENTS));
            assertEquals(Constants.STATUS_TST, record.findValueForFieldName(Constants.STATUS));
            assertEquals(Integer.valueOf(Constants.WR_ID_EXISTING_LOCKED_BY_AI),
                record.findValueForFieldName(Constants.WR_ID));
        }
    }
    
    /**
     * Test method for
     * {@link MobileSyncService#checkInRecords(java.lang.String, java.util.List, java.util.List)}
     * and {@link MobileSyncService#checkOutRecords(String, java.util.List, ParsedRestrictionDef)} .
     */
    public final void testCheckInRecordsCheckOutRecordsMarkDeleted() {
        final String tableName = Constants.WR_SYNC;
        
        // checkin document
        {
            final String documentContentEncoded =
                    DocumentFieldsDataSourceUtilities.base64Encode(Constants.TEST_DOCUMENT_CONTENT
                        .getBytes());
            
            final List<Record> records = new ArrayList<Record>();
            // record exists and locked by the same user
            final Record record = new Record();
            record.addOrSetFieldValue(Constants.WR_ID, new Integer(
                Constants.WR_ID_EXISTING_LOCKED_BY_AI));
            record.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);
            record.addOrSetFieldValue(Constants.DOC1, Constants.TEST_TXT);
            record.addOrSetFieldValue(Constants.DOC1_CONTENTS, documentContentEncoded);
            records.add(record);
            
            final List<String> inventoryKeyNames = prepareInventoryKeyNames();
            
            this.mobileSyncService.checkInRecords(tableName, inventoryKeyNames, records);
        }
        
        // mark document as deleted
        {
            final List<Record> records = new ArrayList<Record>();
            
            final String documentContentEncoded =
                    DocumentFieldsDataSourceUtilities
                        .base64Encode(Constants.TEST_DOCUMENT_CONTENT_MARK_DELETED.getBytes());
            
            // record exists and locked by the same user
            final Record record = new Record();
            record.addOrSetFieldValue(Constants.WR_ID, new Integer(
                Constants.WR_ID_EXISTING_LOCKED_BY_AI));
            record.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);
            record.addOrSetFieldValue(Constants.DOC1, Constants.TEST_TXT);
            record.addOrSetFieldValue(Constants.DOC1_CONTENTS, documentContentEncoded);
            records.add(record);
            
            final List<String> inventoryKeyNames = prepareInventoryKeyNames();
            
            this.mobileSyncService.checkInRecords(tableName, inventoryKeyNames, records);
        }
        
        // checkout deleted document
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        {
            restrictionDef.addClause(tableName, Constants.WR_ID,
                Constants.WR_ID_EXISTING_LOCKED_BY_AI, ClauseDef.Operation.EQUALS);
        }
        
        final List<Record> actual =
                this.mobileSyncService.checkOutRecords(tableName, prepareFieldNames(),
                    restrictionDef);
        
        assertEquals(1, actual.size());
        
        // verify that document was deleted
        {
            final Record record = actual.get(0);
            assertEquals(null, record.findValueForFieldName(Constants.DOC1));
            assertEquals(null, record.findValueForFieldName(Constants.DOC1_CONTENTS));
            assertEquals(Constants.STATUS_TST, record.findValueForFieldName(Constants.STATUS));
            assertEquals(Integer.valueOf(Constants.WR_ID_EXISTING_LOCKED_BY_AI),
                record.findValueForFieldName(Constants.WR_ID));
        }
    }
    
    /**
     * Test method for {@link MobileSyncService#getEnabledApplications()} .
     */
    public final void testGetEnabledApplications() {
        final List<AppConfig> actual = this.mobileSyncService.getEnabledApplications();
        
        assertEquals(8, actual.size());
    }
    
    /**
     * Test method for {@link MobileSyncService#getTableDef(java.lang.String)} .
     */
    public final void testGetTableDef() {
        final com.archibus.model.schema.TableDef actual =
                this.mobileSyncService.getTableDef(Constants.WR_SYNC);
        
        assertEquals(Constants.WR_SYNC, actual.getName());
    }
    
    /**
     * Test method for
     * {@link MobileSyncService#retrieveRecords(String, java.util.List, ParsedRestrictionDef)} .
     */
    public final void testRetrieveRecords() {
        final String tableName = Constants.WR_SYNC;
        final List<String> fieldNames = prepareFieldNames();
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        {
            restrictionDef.addClause(tableName, Constants.WR_ID,
                Constants.WR_ID_EXISTING_LOCKED_BY_AI, ClauseDef.Operation.EQUALS);
        }
        
        final List<Record> actual =
                this.mobileSyncService.retrieveRecords(tableName, fieldNames, restrictionDef);
        
        assertEquals(1, actual.size());
    }
    
    /**
     * Test method for
     * {@link MobileSyncService#retrieveRecords(String, java.util.List, ParsedRestrictionDef)} .
     */
    public final void testRetrieveRecordsPageSize1() {
        final String tableName = Constants.WR_SYNC;
        final List<String> fieldNames = prepareFieldNames();
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        {
            restrictionDef.addClause(tableName, Constants.WR_ID,
                Constants.WR_ID_EXISTING_LOCKED_BY_AI, ClauseDef.Operation.EQUALS);
        }
        
        final List<Record> actual =
                this.mobileSyncService.retrievePagedRecords(tableName, fieldNames, restrictionDef,
                    1, true);
        
        assertEquals(1, actual.size());
    }

    /**
     * Test method for
     * {@link MobileSyncService#retrieveRecords(String, java.util.List, ParsedRestrictionDef)} .
     */
    public final void testDeprecatedRetrieveRecordsPageSize1() {
        final String tableName = Constants.WR_SYNC;
        final List<String> fieldNames = prepareFieldNames();
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        {
            restrictionDef.addClause(tableName, Constants.WR_ID,
                Constants.WR_ID_EXISTING_LOCKED_BY_AI, ClauseDef.Operation.EQUALS);
        }
        
        final List<Record> actual =
                this.mobileSyncService.retrievePagedRecords(tableName, fieldNames, restrictionDef,
                    1);
        
        assertEquals(1, actual.size());
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "mobileSyncService.xml" };
    }
}
