package com.archibus.app.common.space.dao.datasource;

import java.sql.Date;
import java.util.List;

import com.archibus.app.common.space.domain.ArchivedRoomTransaction;
import com.archibus.core.dao.IDao;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.Utility;

/**
 * Integration tests for ArchivedRoomTransactionDataSource.
 * 
 * @author Valery Tydykov
 * 
 */
public class ArchivedRoomTransactionDataSourceTest extends DataSourceTestBase {
    /**
     * Test for {@link ArchivedRoomTransactionDataSource#save(java.lang.Object)} and
     * {@link ArchivedRoomTransactionDataSource#get(java.lang.Object)}.
     */
    public void testSaveUpdateFind() {
        final IDao<ArchivedRoomTransaction> dataSource = new ArchivedRoomTransactionDataSource();
        
        // current dateTime
        final Date dateTime = Utility.currentDate();
        // save new object to database
        final ArchivedRoomTransaction expected = prepareArchivedRoomTransaction(dateTime);
        expected.setUserName("AI");
        
        // saved has primary key value only
        final ArchivedRoomTransaction saved = dataSource.save(expected);
        
        verifyNewObjectInDatabase(dataSource, expected, saved.getId());
        
        // set ID of the saved object
        expected.setId(saved.getId());
        // update existing object
        expected.setProrate("FLOOR");
        dataSource.update(expected);
        
        verifyNewObjectInDatabase(dataSource, expected, saved.getId());
    }
    
    /**
     * Verifies that just saved object can be retrieved from database.
     * 
     * @param dataSource to retrieve object from database.
     * @param expected object with expected values.
     * @param savedId the ID if the just saved object.
     */
    private void verifyNewObjectInDatabase(final IDao<ArchivedRoomTransaction> dataSource,
            final ArchivedRoomTransaction expected, final int savedId) {
        // verify that new object can be retrieved from database
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("hrmpct", "pct_id", savedId, Operation.EQUALS);
        // TODO test for dateTime values: on the border, between start/end, outside
        final List<ArchivedRoomTransaction> roomTransactions = dataSource.find(restriction);
        final ArchivedRoomTransaction actual = roomTransactions.get(0);
        
        verify(expected, actual);
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "archivedRoomTransactionDataSource.xml" };
    }
    
    /**
     * Prepares ArchivedRoomTransaction using specified dateTime and hardcoded values.
     * 
     * @param dateTime to be used for dateStart, dateEnd, dateCreated.
     * @return ArchivedRoomTransaction with the test values.
     */
    private ArchivedRoomTransaction prepareArchivedRoomTransaction(final Date dateTime) {
        final ArchivedRoomTransaction roomTransaction = new ArchivedRoomTransaction();
        
        roomTransaction.setBuildingId("HQ");
        roomTransaction.setFloorId("01");
        roomTransaction.setRoomId("105");
        roomTransaction.setCategory("PERS");
        roomTransaction.setDepartmentId("ENGINEERING");
        roomTransaction.setDivisionId("ELECTRONIC SYS.");
        roomTransaction.setProrate("NONE");
        roomTransaction.setType("WRKSTATION");
        roomTransaction.setDateStart(dateTime);
        roomTransaction.setDateEnd(dateTime);
        roomTransaction.setDateCreated(dateTime);
        roomTransaction.setPercentageOfSpace(1);
        roomTransaction.setPrimaryEmployee(1);
        roomTransaction.setPrimaryRoom(1);
        roomTransaction.setStatus(1);
        
        return roomTransaction;
    }
    
    /**
     * Verifies that values in actual match values in expected ArchivedRoomTransaction.
     * 
     * @param expected object with expected values.
     * @param actual object with actual values.
     */
    private void verify(final ArchivedRoomTransaction expected, final ArchivedRoomTransaction actual) {
        assertEquals(expected.getBuildingId(), actual.getBuildingId());
        assertEquals(expected.getCategory(), actual.getCategory());
        assertEquals(expected.getDepartmentId(), actual.getDepartmentId());
        assertEquals(expected.getDivisionId(), actual.getDivisionId());
        assertEquals(expected.getFloorId(), actual.getFloorId());
        assertEquals(expected.getRoomId(), actual.getRoomId());
        assertEquals(expected.getProrate(), actual.getProrate());
        assertEquals(expected.getType(), actual.getType());
    }
}
