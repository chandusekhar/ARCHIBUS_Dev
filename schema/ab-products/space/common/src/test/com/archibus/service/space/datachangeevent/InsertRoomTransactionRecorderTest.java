package com.archibus.service.space.datachangeevent;

import java.util.*;

import junit.framework.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.IRoomTransactionDao;
import com.archibus.app.common.space.domain.*;
import com.archibus.app.sysadmin.event.data.CallbackFlag;
import com.archibus.context.User;
import com.archibus.model.view.datasource.AbstractRestrictionDef;

/**
 * Tests for InsertRoomTransactionRecorder.
 * 
 * @author Valery Tydykov
 * 
 */
public class InsertRoomTransactionRecorderTest extends TestCase {
    
    /**
     * Constant: user name: "TestName".
     */
    private static final String TEST_NAME = "TestName";
    
    /**
     * Test method for
     * {@link com.archibus.app.common.space.service.InsertRoomTransactionRecorder#recordInsertTransaction(com.archibus.context.User, java.util.Date, com.archibus.app.common.space.domain.Room)}
     * .
     */
    public void testRecordInsertTransaction() {
        // prepare tested method parameters and tested object dependencies
        // parameters: user, dateTime, room
        final Room room = new Room();
        // TODO set room properties values
        
        final User user = new User(null);
        user.setName(TEST_NAME);
        
        final Date dateTime = new Date();
        
        // dependencies
        
        // dependency: roomTransactionDao
        final CallbackFlag callbackFlagRoomTransactionDao = new CallbackFlag();
        // create mock IRoomTransactionDao
        final IRoomTransactionDao roomTransactionDao = new IRoomTransactionDao() {
            public void delete(final RoomTransaction bean) {
                // Auto-generated method stub
            }
            
            public List<RoomTransaction> find(final AbstractRestrictionDef restriction) {
                // Auto-generated method stub
                return null;
            }
            
            public List<RoomTransaction> findForEmployee(final Employee employee,
                    final Date dateTime) {
                // Auto-generated method stub
                return null;
            }
            
            public List<RoomTransaction> findForRoom(final Room room, final Date dateTime) {
                // Auto-generated method stub
                return null;
            }
            
            public RoomTransaction get(final Object id) {
                // Auto-generated method stub
                return null;
            }
            
            public RoomTransaction save(final RoomTransaction bean) {
                // verify that this method was called
                callbackFlagRoomTransactionDao.called = true;
                
                // verify parameter bean
                Assert.assertEquals(RoomTransaction.ROOM_STATUS_1, bean.getStatus());
                Assert.assertEquals(RoomTransaction.PERCENTAGE_SPACE_100,
                    bean.getPercentageOfSpace());
                Assert.assertEquals(RoomTransaction.PRIMARY_ROOM_1, bean.getPrimaryRoom());
                // TODO verify the rest of the properties of RoomTransaction
                return null;
            }
            
            public void update(final RoomTransaction bean) {
                // Auto-generated method stub
            }
            
            public void update(final RoomTransaction bean, final RoomTransaction oldBean) {
                // Auto-generated method stub
            }
            
            public List<RoomTransaction> findForPrimaryRoom(final Room room, final Date dateTime) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<RoomTransaction> findForPrimaryEmployee(final Employee employee,
                    final Date dateTime) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<RoomTransaction> findForLocationChangeEmployee(final Employee employee,
                    final Date dateTime) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<RoomTransaction> findForDepartmentChangeEmployee(final Employee employee,
                    final Date dateTime) {
                // TODO Auto-generated method stub
                return null;
            }
            
            public List<RoomTransaction> findForAttributeChangeRoom(final Room room,
                    final Date dateTime) {
                // TODO Auto-generated method stub
                return null;
            }
        };
        
        final InsertRoomTransactionRecorder insertRoomTransactionRecorder =
                new InsertRoomTransactionRecorder();
        insertRoomTransactionRecorder.setRoomTransactionDao(roomTransactionDao);
        
        // invoke tested method
        insertRoomTransactionRecorder.recordInsertTransaction(user, dateTime, room);
        
        // verify that IRoomTransactionDao.save was called
        Assert.assertTrue(callbackFlagRoomTransactionDao.called);
    }
}
