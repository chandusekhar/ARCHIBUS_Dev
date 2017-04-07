package com.archibus.app.common.space.dao.datasource;

import java.sql.Date;
import java.util.List;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.IRoomTransactionDao;
import com.archibus.app.common.space.domain.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecordField;
import com.archibus.utility.Utility;

/**
 * Integration tests for RoomTransactionDataSource.
 * 
 * @author Valery Tydykov
 * 
 */
public class RoomTransactionDataSourceTest extends DataSourceTestBase {
    
    /**
     * Test for {@link RoomTransactionDataSource#save(java.lang.Object)} and
     * {@link RoomTransactionDataSource#get(java.lang.Object)}.
     */
    public void testSaveUpdateFind() {
        final IRoomTransactionDao dataSource = new RoomTransactionDataSource();
        
        // current dateTime
        final Date dateTime = Utility.currentDate();
        // save new object to database
        final RoomTransaction expected = prepareRoomTransaction(dateTime);
        expected.setUserName("AI");
        
        // saved has primary key valye only
        final RoomTransaction saved = dataSource.save(expected);
        
        {
            // verify that new object can be retrieved from database
            final Room room = new Room();
            room.setBuildingId(expected.getBuildingId());
            room.setFloorId(expected.getFloorId());
            room.setId(expected.getRoomId());
            
            // TODO test for dateTime values: on the border, between start/end, outside
            final List<RoomTransaction> roomTransactions = dataSource.findForRoom(room, dateTime);
            final RoomTransaction actual = roomTransactions.get(0);
            
            verify(expected, actual);
        }
        
        // set ID of the saved object
        expected.setId(saved.getId());
        // update existing object
        expected.setProrate("FLOOR");
        dataSource.update(expected);
        
        {
            // verify that updated object can be retrieved from database
            final Room room = new Room();
            room.setBuildingId(expected.getBuildingId());
            room.setFloorId(expected.getFloorId());
            room.setId(expected.getRoomId());
            
            final List<RoomTransaction> roomTransactions =
                    dataSource.findForPrimaryRoom(room, dateTime);
            final RoomTransaction actual = roomTransactions.get(0);
            
            verify(expected, actual);
        }
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "roomTransactionDataSource.xml" };
    }
    
    private RoomTransaction prepareRoomTransaction(final Date dateTime) {
        final RoomTransaction roomTransaction = new RoomTransaction();
        
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
    
    private void verify(final RoomTransaction expected, final RoomTransaction actual) {
        assertEquals(expected.getBuildingId(), actual.getBuildingId());
        assertEquals(expected.getCategory(), actual.getCategory());
        assertEquals(expected.getDepartmentId(), actual.getDepartmentId());
        assertEquals(expected.getDivisionId(), actual.getDivisionId());
        assertEquals(expected.getFloorId(), actual.getFloorId());
        assertEquals(expected.getRoomId(), actual.getRoomId());
        assertEquals(expected.getProrate(), actual.getProrate());
        assertEquals(expected.getType(), actual.getType());
    }
    
    public void testFindByRestriction() {
        
        final IRoomTransactionDao dataSource = new RoomTransactionDataSource();
        final Date dateTime = Utility.currentDate();
        
        final Room room = this.prepareRoom();
        
        dataSource.findForRoom(room, dateTime);
        dataSource.findForPrimaryRoom(room, dateTime);
        dataSource.findForAttributeChangeRoom(room, dateTime);
        
        final Employee employee = this.prepareEmployee();
        dataSource.findForEmployee(employee, dateTime);
        dataSource.findForPrimaryEmployee(employee, dateTime);
        dataSource.findForDepartmentChangeEmployee(employee, dateTime);
        dataSource.findForLocationChangeEmployee(employee, dateTime);
        
    }
    
    private Room prepareRoom() {
        
        final Room room = new Room();
        
        room.setBuildingId("HQ");
        room.setFloorId("01");
        room.setId("105");
        
        return room;
    }
    
    private Employee prepareEmployee() {
        
        final EmployeeDataSource employeeDs = new EmployeeDataSource();
        
        // Construct primary key by employee id
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName("em.em_id");
            pkField.setValue("ABERNATHY, ALISON");
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        
        return employeeDs.get(primaryKeysValues);
    }
    
}
