package com.archibus.app.solution.logiccookbook;

import java.io.*;
import java.util.*;

import com.archibus.dao.DocumentDao;
import com.archibus.dao.jdbc.DocumentDaoImpl;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.service.DocumentService.DocumentParameters;
import com.archibus.utility.ExceptionBase;

/**
 * Example unit test for event handlers.
 */

public class TestLogicExampleHandlers extends DataSourceTestBase {
    
    /**
     * Priority: 100.
     */
    private static final int PRIORITY_100 = 100;
    
    /**
     * Work order ID: 2004000001.
     */
    private static final int WORK_ORDER_ID_2004000001 = 2004000001;
    
    /**
     * Year: 2009.
     */
    private static final int YEAR_2005 = 2005;
    
    /**
     * Test for copyDocument method.
     * 
     * @throws ExceptionBase
     */
    public void testCopyDocument() {
        final String fieldName = "doc";
        final String tableName = "ls";
        
        final Map<String, String> keys = new HashMap<String, String>();
        keys.put("ls_id", "102");
        
        // check-in original document
        final String newLockStatus = "0";
        {
            final String documentName = "test.txt";
            final String description = "Test text file";
            this.checkinStringAsDocument(tableName, fieldName, keys, description, documentName,
                newLockStatus);
        }
        
        // copy original document
        final Map<String, String> keysTo = new HashMap<String, String>();
        {
            final DocumentParameters documentParametersFrom = new DocumentParameters(keys,
                tableName, fieldName, null, true);
            
            keysTo.put("ls_id", "103");
            final DocumentParameters documentParametersTo = new DocumentParameters(keysTo,
                tableName, fieldName, "copyOfTest.txt", "copy of test.txt", newLockStatus);
            
            final LogicExampleHandlers handler = new LogicExampleHandlers();
            handler.copyDocument(documentParametersFrom, documentParametersTo);
        }
        
        // verify that copy of the document exists
        this.getDocumentDao().checkOut(keysTo, tableName, fieldName, newLockStatus, false,
            "copyOfTest.txt", "1");
    }
    
    /**
     * Test for HelloWorld method.
     * 
     * @throws ExceptionBase
     */
    public void testCreateNewRecord() {
        // get the last existing primary key
        final int lastWorkOrderId = DataStatistics.getInt("wo", "wo_id", "max");
        
        // create new record
        final LogicExampleHandlers handler = new LogicExampleHandlers();
        final int workOrderId = handler.createNewRecord();
        
        // verify that the new primary key is greater than the last
        assertTrue(workOrderId > lastWorkOrderId);
        
        // verify that the new record exists
        final int newLastWorkOrderId = DataStatistics.getInt("wo", "wo_id", "max");
        assertEquals(newLastWorkOrderId, workOrderId);
    }
    
    /**
     * Test for HelloWorld method.
     * 
     * @throws ExceptionBase
     */
    public void testGetRecordByPrimaryKey() {
        final LogicExampleHandlers handler = new LogicExampleHandlers();
        final int originalWorkOrderId = WORK_ORDER_ID_2004000001;
        final DataRecord record = handler.getRecordByPrimaryKey(originalWorkOrderId);
        
        // verify that the actual record is returned
        assertNotNull(record);
        
        // verify that the record contains one of the fields
        final Date dateAssigned = record.getDate("wo.date_assigned");
        assertNotNull(dateAssigned);
        
        // verify that the record primary key value matches the original value
        final int workOrderId = record.getInt("wo.wo_id");
        assertEquals(originalWorkOrderId, workOrderId);
    }
    
    /**
     * Test for HelloWorld method.
     * 
     * @throws ExceptionBase
     */
    public void testGetRecordsUsingSqlRestriction() {
        final LogicExampleHandlers handler = new LogicExampleHandlers();
        final DataSetList dataSet = handler.getRecordsUsingSqlRestriction();
        final List<DataRecord> records = dataSet.getRecords();
        
        // verify that some records have been returned
        assertNotNull(records);
        assertTrue(!records.isEmpty());
        
        final DataRecord record = records.get(0);
        assertNotNull(record);
        
        // verify that the record contains one of the fields
        final Date dateAssigned = record.getDate("wo.date_assigned");
        assertNotNull(dateAssigned);
    }
    
    /**
     * Test for HelloWorld method.
     * 
     * @throws ExceptionBase
     */
    public void testGetRecordsUsingSqlRestrictionWithParameters() {
        final LogicExampleHandlers handler = new LogicExampleHandlers();
        
        final Date dateFrom = new GregorianCalendar(YEAR_2005, 1, 1).getTime();
        final DataSetList dataSet = handler.getRecordsUsingSqlRestrictionWithParameters(dateFrom);
        final List<DataRecord> records = dataSet.getRecords();
        
        // verify that some records have been returned
        assertNotNull(records);
        assertTrue(!records.isEmpty());
    }
    
    /**
     * Test for HelloWorld method.
     * 
     * @throws ExceptionBase
     */
    public void testLogProgressAndThrowException() {
        try {
            final LogicExampleHandlers handler = new LogicExampleHandlers();
            handler.logProgressAndThrowException("test");
            
            // the method should have thrown the exception
            fail("Exception expected");
        } catch (final ExceptionBase e) {
            // Exception expected
            assertTrue(e.getPattern().contains("My user-friendly error message"));
        }
    }
    
    /**
     * Test for HelloWorld method.
     * 
     * @throws ExceptionBase
     */
    public void testShowPartsForOpenWorkRequests() {
        final LogicExampleHandlers handler = new LogicExampleHandlers();
        final String message = handler.showPartsForOpenWorkRequests();
        
        assertTrue(message.contains("Part"));
    }
    
    /**
     * Test for HelloWorld method.
     * 
     * @throws ExceptionBase
     */
    public void testUpdateRecord() {
        // get the last existing primary key
        final int lastWorkOrderId = DataStatistics.getInt("wo", "wo_id", "max");
        
        // update the priority value in the last record
        final LogicExampleHandlers handler = new LogicExampleHandlers();
        handler.updateRecord(lastWorkOrderId, PRIORITY_100);
        
        // verify that the priority value has been updated
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields("wo",
            new String[] { "priority" });
        final DataRecord record = dataSource.getRecord("wo_id = " + lastWorkOrderId);
        final int priority = record.getInt("wo.priority");
        assertEquals(PRIORITY_100, priority);
    }
    
    /**
     * Check-in string with file content as document.
     * 
     * @param tableName Table name
     * @param fieldName Field name of the document field in the table.
     * @param keys Primary key values for the record with document.
     * @param description Document description.
     * @param documentName Document name.
     * @param newLockStatus Status of the lock to be changed to.
     */
    private void checkinStringAsDocument(final String tableName, final String fieldName,
            final Map<String, String> keys, final String description, final String documentName,
            final String newLockStatus) {
        InputStream inputStream = null;
        try {
            inputStream = prepareInputStream("New file content.");
            
            this.getDocumentDao().checkinNewFile(inputStream, keys, tableName, fieldName,
                documentName, description, newLockStatus);
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (final IOException e) {
                    // Should not happen
                    e.printStackTrace();
                }
            }
        }
    }
    
    /**
     * @return new instance of DocumentDao
     */
    private DocumentDao getDocumentDao() {
        return new DocumentDaoImpl();
    }
    
    /**
     * Prepare InputStream, using specified fileContent.
     * 
     * @param fileContent String with file content of the stream.
     * @return stream with the specified file content.
     * @throws ExceptionBase
     */
    private InputStream prepareInputStream(final String fileContent) throws ExceptionBase {
        InputStream inputStream = null;
        try {
            inputStream = new ByteArrayInputStream(fileContent.getBytes("UTF-8"));
        } catch (final UnsupportedEncodingException e) {
            ExceptionBase.throwNew(null, e);
        }
        
        return inputStream;
    }
}
