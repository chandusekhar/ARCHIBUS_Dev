package com.archibus.service.space.datachangeevent;

import java.util.*;

import junit.framework.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.IRoomTransactionDao;
import com.archibus.app.common.space.domain.*;
import com.archibus.app.sysadmin.event.data.CallbackFlag;
import com.archibus.context.User;
import com.archibus.core.dao.IDao;
import com.archibus.model.view.datasource.AbstractRestrictionDef;
import com.archibus.utility.DateTime;

/**
 * Tests for DeleteRoomTransactionRecorder.
 * 
 * @author Valery Tydykov
 * 
 */
public class DeleteRoomTransactionRecorderTest extends TestCase {
    
    /**
     * Constant: user name: "TestName".
     */
    private static final String TEST_NAME = "TestName";
    
    /**
     * Test method for
     * {@link com.archibus.app.common.space.service.DeleteRoomTransactionRecorder#archiveRoomTransaction(com.archibus.app.common.space.domain.RoomTransaction)}
     * .
     */
    public void testArchiveRoomTransaction() {
        // prepare tested method parameters and tested object dependencies
        // parameters: user, dateTime
        final User user = new User(null);
        user.setName(TEST_NAME);
        
        new Date();
        
        // dependencies
        
        // dependency: archivedRoomTransactionDao
        final CallbackFlag callbackFlagArchivedRoomTransactionDao = new CallbackFlag();
        // create mock IDao<ArchivedRoomTransaction>
        final IDao<ArchivedRoomTransaction> archivedRoomTransactionDao =
                new IDao<ArchivedRoomTransaction>() {
                    public void delete(final ArchivedRoomTransaction bean) {
                        // Auto-generated method stub
                    }
                    
                    public List<ArchivedRoomTransaction> find(
                            final AbstractRestrictionDef restriction) {
                        // Auto-generated method stub
                        return null;
                    }
                    
                    public ArchivedRoomTransaction get(final Object id) {
                        // Auto-generated method stub
                        return null;
                    }
                    
                    public ArchivedRoomTransaction save(final ArchivedRoomTransaction bean) {
                        // verify that this method was called
                        callbackFlagArchivedRoomTransactionDao.called = true;
                        
                        // verify parameter bean
                        // TODO verify the rest of the properties of ArchivedRoomTransaction
                        
                        return null;
                    }
                    
                    public void update(final ArchivedRoomTransaction bean) {
                        // Auto-generated method stub
                    }
                    
                    public void update(final ArchivedRoomTransaction bean,
                            final ArchivedRoomTransaction oldBean) {
                        // Auto-generated method stub
                    }
                };
        
        final DeleteRoomTransactionRecorder deleteRoomTransactionRecorder =
                new DeleteRoomTransactionRecorder();
        deleteRoomTransactionRecorder.setArchivedRoomTransactionDao(archivedRoomTransactionDao);
        
        final RoomTransaction roomTransaction = new RoomTransaction();
        // TODO set roomTransaction properties values
        
        // invoke tested method
        deleteRoomTransactionRecorder.archiveRoomTransaction(roomTransaction);
        
        // verify that IDao<ArchivedRoomTransaction>.save was called
        Assert.assertTrue(callbackFlagArchivedRoomTransactionDao.called);
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.common.space.service.DeleteRoomTransactionRecorder#recordDeleteTransaction(com.archibus.context.User, java.util.Date, com.archibus.app.common.space.domain.Room)}
     * .
     */
    public void testRecordDeleteTransaction() {
        // prepare tested method parameters and tested object dependencies
        // parameters: user, dateTime, room
        final Room room = new Room();
        
        final User user = new User(null);
        user.setName(TEST_NAME);
        
        final Date dateTime = new Date();
        
        // dependencies
        // dependency: archivedRoomTransactionDao
        final CallbackFlag callbackFlagArchivedRoomTransactionDao = new CallbackFlag();
        // create mock IDao<ArchivedRoomTransaction>
        final IDao<ArchivedRoomTransaction> archivedRoomTransactionDao =
                new IDao<ArchivedRoomTransaction>() {
                    public void delete(final ArchivedRoomTransaction bean) {
                        // Auto-generated method stub
                    }
                    
                    public List<ArchivedRoomTransaction> find(
                            final AbstractRestrictionDef restriction) {
                        // Auto-generated method stub
                        return null;
                    }
                    
                    public ArchivedRoomTransaction get(final Object id) {
                        // Auto-generated method stub
                        return null;
                    }
                    
                    public ArchivedRoomTransaction save(final ArchivedRoomTransaction bean) {
                        // verify that this method was called
                        callbackFlagArchivedRoomTransactionDao.called = true;
                        
                        // verify parameter bean
                        Assert.assertEquals(DateTime.addDays(dateTime, -1), bean.getDateEnd());
                        Assert.assertEquals(dateTime, bean.getDateDeleted());
                        Assert.assertEquals(user.getName(), bean.getDeletionUserName());
                        // TODO verify the rest of the properties of ArchivedRoomTransaction
                        
                        return null;
                    }
                    
                    public void update(final ArchivedRoomTransaction bean) {
                        // Auto-generated method stub
                    }
                    
                    public void update(final ArchivedRoomTransaction bean,
                            final ArchivedRoomTransaction oldBean) {
                        // Auto-generated method stub
                    }
                };
        
        final DeleteRoomTransactionRecorder deleteRoomTransactionRecorder =
                new DeleteRoomTransactionRecorder();
        deleteRoomTransactionRecorder.setArchivedRoomTransactionDao(archivedRoomTransactionDao);
        
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
                final List<RoomTransaction> roomTransactions = new ArrayList<RoomTransaction>();
                final RoomTransaction roomTransaction = new RoomTransaction();
                // TODO set roomTransaction properties values
                roomTransactions.add(roomTransaction);
                return roomTransactions;
            }
            
            public RoomTransaction get(final Object id) {
                // Auto-generated method stub
                return null;
            }
            
            public RoomTransaction save(final RoomTransaction bean) {
                // Auto-generated method stub
                return null;
            }
            
            public void update(final RoomTransaction bean) {
                // verify that this method was called
                callbackFlagRoomTransactionDao.called = true;
                
                // verify parameter bean
                Assert.assertEquals(DateTime.addDays(dateTime, -1), bean.getDateEnd());
                Assert.assertEquals(dateTime, bean.getDateDeleted());
                Assert.assertEquals(user.getName(), bean.getDeletionUserName());
                // TODO verify the rest of the properties of RoomTransaction
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
        
        deleteRoomTransactionRecorder.setRoomTransactionDao(roomTransactionDao);
        
        // invoke tested method
        deleteRoomTransactionRecorder.recordDeleteTransaction(user, dateTime, room);
        
        // verify that IRoomTransactionDao.update was called
        Assert.assertTrue(callbackFlagRoomTransactionDao.called);
        // verify that IDao<ArchivedRoomTransaction>.save was called
        Assert.assertTrue(callbackFlagArchivedRoomTransactionDao.called);
    }
    
    /**
     * Test method for
     * {@link com.archibus.app.common.space.service.DeleteRoomTransactionRecorder#updateRoomTransaction(com.archibus.context.User, java.util.Date, com.archibus.app.common.space.domain.RoomTransaction)}
     * .
     */
    public void testUpdateRoomTransaction() {
        // prepare tested method parameters and tested object dependencies
        // parameters: user, dateTime
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
                // Auto-generated method stub
                return null;
            }
            
            public void update(final RoomTransaction bean) {
                // verify that this method was called
                callbackFlagRoomTransactionDao.called = true;
                
                // verify parameter bean
                Assert.assertEquals(DateTime.addDays(dateTime, -1), bean.getDateEnd());
                Assert.assertEquals(dateTime, bean.getDateDeleted());
                Assert.assertEquals(user.getName(), bean.getDeletionUserName());
                // TODO verify the rest of the properties of RoomTransaction
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
        
        final DeleteRoomTransactionRecorder deleteRoomTransactionRecorder =
                new DeleteRoomTransactionRecorder();
        deleteRoomTransactionRecorder.setRoomTransactionDao(roomTransactionDao);
        
        final RoomTransaction roomTransaction = new RoomTransaction();
        // TODO set roomTransaction properties values
        
        // invoke tested method
        deleteRoomTransactionRecorder.updateRoomTransaction(user, dateTime, roomTransaction);
        
        // verify that IRoomTransactionDao.update was called
        Assert.assertTrue(callbackFlagRoomTransactionDao.called);
    }
}
