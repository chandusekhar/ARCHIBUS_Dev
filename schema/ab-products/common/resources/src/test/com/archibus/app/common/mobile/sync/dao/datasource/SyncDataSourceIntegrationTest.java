package com.archibus.app.common.mobile.sync.dao.datasource;

import java.util.*;

import com.archibus.app.common.mobile.sync.*;
import com.archibus.app.common.mobile.sync.dao.IDocumentFieldsDao.RecordAndDto;
import com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames;
import com.archibus.app.common.mobile.sync.service.Record;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.*;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.schema.TableDef;
import com.archibus.utility.ExceptionBase;

/**
 * Integration tests for SyncDataSource.
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 */
public class SyncDataSourceIntegrationTest extends AbstractIntegrationTest {

    private SyncDataSource syncDataSource;

    /**
     * Getter for the syncDataSource property.
     *
     * @see syncDataSource
     * @return the syncDataSource property.
     */
    public SyncDataSource getSyncDataSource() {
        return this.syncDataSource;
    }

    /**
     * Setter for the syncDataSource property.
     *
     * @see syncDataSource
     * @param syncDataSource the syncDataSource to set
     */

    public void setSyncDataSource(final SyncDataSource syncDataSource) {
        this.syncDataSource = syncDataSource;
    }

    /**
     * Test method for
     * {@link com.archibus.app.common.mobile.sync.dao.datasource.SyncDataSource#checkInRecord(java.util.List, com.archibus.schema.TableDef.ThreadSafe, java.lang.String, com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames, com.archibus.datasource.DataSource, java.util.List)}
     * .
     */
    public final void testCheckInRecord() {
        final FieldNames fieldNamesFromRecord = new FieldNames();
        {
            fieldNamesFromRecord.setDocumentFieldNames(prepareDocumentFieldNames());
            fieldNamesFromRecord.setNonDocumentFieldNames(prepareNonDocumentFieldNames());
        }

        final List<String> fieldNames = prepareFieldNames();

        DataRecord record = null;
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(fieldNames, prepareTableDef(), true);
        {
            record =
                    dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS
                        + Constants.WR_ID_EXISTING_LOCKED_BY_AI);
        }

        final Record recordDto = new Record();
        recordDto.addOrSetFieldValue(Constants.WR_ID, new Integer(
            Constants.WR_ID_EXISTING_LOCKED_BY_AI));
        recordDto.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);

        final RecordAndDto recordAndDto = new RecordAndDto(record, recordDto);

        final boolean actual =
                this.syncDataSource.checkInRecord(Constants.AI, recordAndDto, prepareTableDef(),
                    fieldNamesFromRecord, prepareInventoryKeyNames(), dataSource);

        assertEquals(true, actual);

        assertEquals(Integer.valueOf(Constants.WR_ID_EXISTING_LOCKED_BY_AI),
            record.getValue(Constants.WR_SYNC_WR_ID));
    }

    /**
     * Test method for
     * {@link SyncDataSource#checkInRecords(List, List, TableDef.ThreadSafe, String)} .
     */
    public final void testCheckInRecords() {
        final TableDef.ThreadSafe tableDef = prepareTableDef();
        final List<String> inventoryKeyNames = prepareInventoryKeyNames();

        final List<Record> records = new ArrayList<Record>();
        {
            // record exists, not locked, should fail
            final Record record = new Record();
            record.addOrSetFieldValue("prob_type", null);
            record.addOrSetFieldValue(Constants.WR_ID, new Integer(
                Constants.WR_ID_EXISTING_NOT_LOCKED));
            record.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);
            records.add(record);
        }
        {
            // record does not exist
            final Record record = new Record();
            record.addOrSetFieldValue(Constants.WR_ID,
                new Integer(Constants.WR_ID_DOES_NOT_EXIST_1));
            record.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);
            records.add(record);
        }
        {
            // record does not exist
            final Record record = new Record();
            record.addOrSetFieldValue(Constants.WR_ID,
                new Integer(Constants.WR_ID_DOES_NOT_EXIST_2));
            record.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);
            records.add(record);
        }
        {
            // record does not exist, no wr_id
            final Record record = new Record();
            record.addOrSetFieldValue("prob_type", "ASBESTOS");
            records.add(record);
        }
        {
            // record does not exist, no wr_id
            final Record record = new Record();
            record.addOrSetFieldValue("prob_type", "AIR QUALITY");
            records.add(record);
        }
        {
            // record exists and locked by another user, should fail
            final Record record = new Record();
            record.addOrSetFieldValue(Constants.WR_ID, new Integer(
                Constants.WR_ID_EXISTING_LOCKED_BY_AFM));
            record.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);
            records.add(record);
        }
        {
            // record exists and locked by the same user
            final Record record = new Record();
            record.addOrSetFieldValue(Constants.WR_ID, new Integer(
                Constants.WR_ID_EXISTING_LOCKED_BY_AI));
            record.addOrSetFieldValue(Constants.STATUS, Constants.STATUS_TST);
            records.add(record);
        }

        final List<Record> failedRecords =
                this.syncDataSource.checkInRecords(inventoryKeyNames, records, tableDef,
                    Constants.AI);

        // verify
        {
            final List<String> fieldNames = prepareFieldNames();

            final DataSource dataSource =
                    SyncDataSourceUtilities.createDataSource(fieldNames, tableDef, true);
            // record existed
            verifyRecordIsLocked(Constants.WR_SYNC, dataSource,
                Constants.WR_ID_EXISTING_LOCKED_BY_AI);
            // record did not exist
            verifyRecordIsLocked(Constants.WR_SYNC, dataSource, Constants.WR_ID_DOES_NOT_EXIST_1);
            // record did not exist
            verifyRecordIsLocked(Constants.WR_SYNC, dataSource, Constants.WR_ID_DOES_NOT_EXIST_2);

            // record did not exist
            this.verifyRecordIsLocked(Constants.WR_SYNC, "prob_type", "ASBESTOS", dataSource);

            // record did not exist
            this.verifyRecordIsLocked(Constants.WR_SYNC, "prob_type", "AIR QUALITY", dataSource);

            // verify that record WR_ID_EXISTING_LOCKED_BY_AFM was not updated
            {
                final DataRecord actual =
                        dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS
                            + Constants.WR_ID_EXISTING_LOCKED_BY_AFM);

                assertEquals(
                    "AFM",
                    actual.getValue(Constants.WR_SYNC + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER));
                assertEquals(
                    0,
                    actual.getValue(Constants.WR_SYNC + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER));
                assertEquals(
                    Constants.STATUS_H,
                    actual.getValue(Constants.WR_SYNC + SyncDataSourceUtilities.DOT
                        + Constants.STATUS));
            }

            // verify that record WR_ID_EXISTING_NOT_LOCKED was not updated
            {
                final DataRecord actual =
                        dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS
                            + Constants.WR_ID_EXISTING_NOT_LOCKED);

                assertEquals(
                    null,
                    actual.getValue(Constants.WR_SYNC + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.LOCKED_BY_MOBILE_USER));
                assertEquals(
                    0,
                    actual.getValue(Constants.WR_SYNC + SyncDataSourceUtilities.DOT
                        + SyncDataSourceUtilities.CHANGED_BY_MOBILE_USER));
                assertEquals(
                    Constants.STATUS_H,
                    actual.getValue(Constants.WR_SYNC + SyncDataSourceUtilities.DOT
                        + Constants.STATUS));
            }
        }

        assertEquals(2, failedRecords.size());

        boolean recordNotLockedFailed = false;
        boolean recordLockedFailed = false;
        for (final Record failedRecord : failedRecords) {
            assertEquals(Constants.WR_ID, failedRecord.getFieldValues().get(1).getFieldName());
            // verify that record WR_ID_EXISTING_NOT_LOCKED failed
            // verify that record WR_ID_EXISTING_LOCKED_BY_AFM failed
            final Object fieldValue = failedRecord.getFieldValues().get(1).getFieldValue();
            if (new Integer(Constants.WR_ID_EXISTING_NOT_LOCKED).equals(fieldValue)) {
                recordNotLockedFailed = true;
            }

            if (new Integer(Constants.WR_ID_EXISTING_LOCKED_BY_AFM).equals(fieldValue)) {
                recordLockedFailed = true;
            }
        }

        assertTrue(recordNotLockedFailed);
        assertTrue(recordLockedFailed);
    }

    /**
     * Test method for
     * {@link com.archibus.app.common.mobile.sync.dao.datasource.SyncDataSource#checkOutRecord(java.lang.String, com.archibus.schema.TableDef.ThreadSafe, java.util.List, com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames, com.archibus.datasource.DataSource, com.archibus.datasource.data.DataRecord)}
     * .
     */
    public final void testCheckOutRecord() {
        final FieldNames fieldNamesSeparated = new FieldNames();
        {
            fieldNamesSeparated.setDocumentFieldNames(prepareDocumentFieldNames());
            fieldNamesSeparated.setNonDocumentFieldNames(prepareNonDocumentFieldNames());
        }

        final List<String> fieldNames = prepareFieldNames();

        DataRecord recordToSave = null;
        final DataSource dataSource =
                SyncDataSourceUtilities.createDataSource(fieldNames, prepareTableDef(), true);
        {
            recordToSave =
                    dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS
                        + Constants.WR_ID_EXISTING_NOT_LOCKED);
        }

        final Record actual =
                this.syncDataSource.checkOutRecord(Constants.AI, prepareTableDef(), fieldNames,
                    fieldNamesSeparated, dataSource, recordToSave, true);

        assertEquals(Integer.valueOf(Constants.WR_ID_EXISTING_NOT_LOCKED),
            actual.findValueForFieldName(Constants.WR_ID));
    }

    /**
     * Test method for
     * {@link SyncDataSource#checkOutRecords(List, ParsedRestrictionDef, TableDef.ThreadSafe, String)}
     * .
     */
    public final void testCheckOutRecords() {
        {
            final TableDef.ThreadSafe tableDef = prepareTableDef();
            final List<String> fieldNames = prepareFieldNames();

            final ParsedRestrictionDef restrictionDef = null;
            final List<Record> actual =
                    this.syncDataSource.checkOutRecords(fieldNames, restrictionDef, tableDef,
                        this.context.getUserAccount().getName(), true);

            assertEquals(2, actual.size());
        }

        // test error handling for invalid field name
        {
            final TableDef.ThreadSafe tableDef = prepareTableDef();
            final List<String> fieldNames = prepareFieldNames();
            fieldNames.add("JUNK");

            try {
                this.syncDataSource.checkOutRecords(fieldNames, null, tableDef, this.context
                    .getUserAccount().getName(), true);
                fail("Exception expected");
            } catch (final ExceptionBase exception) {
                assertEquals("DataSource field not found: wr_sync.JUNK", exception.getPattern());
            }
        }
    }

    /**
     * Test method for
     * {@link com.archibus.app.common.mobile.sync.dao.datasource.SyncDataSource#retrieveRecord(java.util.List, com.archibus.schema.TableDef.ThreadSafe, com.archibus.app.common.mobile.sync.dao.datasource.DocumentFieldsDataSource.FieldNames, com.archibus.datasource.data.DataRecord)}
     * .
     */
    public final void testRetrieveRecord() {
        final FieldNames fieldNamesSeparated = new FieldNames();
        {
            fieldNamesSeparated.setDocumentFieldNames(prepareDocumentFieldNames());
            fieldNamesSeparated.setNonDocumentFieldNames(prepareNonDocumentFieldNames());
        }

        final List<String> fieldNames = prepareFieldNames();

        DataRecord record = null;
        {
            final DataSource dataSource =
                    SyncDataSourceUtilities.createDataSource(fieldNames, prepareTableDef(), false);
            record =
                    dataSource.getRecord(Constants.WR_SYNC_WR_ID + Constants.EQUALS
                        + Constants.WR_ID_EXISTING_LOCKED_BY_AFM);
        }

        final Record actual =
                this.syncDataSource.retrieveRecord(fieldNames, prepareTableDef(),
                    fieldNamesSeparated, record, true);

        assertEquals(Integer.valueOf(Constants.WR_ID_EXISTING_LOCKED_BY_AFM),
            actual.findValueForFieldName(Constants.WR_ID));
    }

    /**
     * Test method for
     * {@link SyncDataSource#retrieveRecords(List, ParsedRestrictionDef, TableDef.ThreadSafe)} .
     */
    public final void testRetrieveRecordsPageSize1() {
        final List<String> fieldNames = prepareFieldNames();

        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        {
            restrictionDef.addClause(Constants.WR_SYNC, Constants.WR_ID,
                Constants.WR_ID_EXISTING_LOCKED_BY_AI, ClauseDef.Operation.EQUALS,
                RelativeOperation.OR);
            restrictionDef.addClause(Constants.WR_SYNC, Constants.WR_ID,
                Constants.WR_ID_EXISTING_NOT_LOCKED, ClauseDef.Operation.EQUALS,
                RelativeOperation.OR);
        }

        final List<Record> actual =
                this.syncDataSource.retrieveRecords(fieldNames, restrictionDef, prepareTableDef(),
                    1, true);

        assertEquals(1, actual.size());
        assertEquals(Integer.valueOf(Constants.WR_ID_EXISTING_NOT_LOCKED), actual.get(0)
            .findValueForFieldName(Constants.WR_ID));
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
        "syncDataSource.xml" };
    }
}
