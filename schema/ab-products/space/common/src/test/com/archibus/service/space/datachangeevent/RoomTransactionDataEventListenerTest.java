package com.archibus.service.space.datachangeevent;

import java.util.*;

import junit.framework.*;

import org.springframework.context.ApplicationEvent;

import com.archibus.app.common.MockUtilities;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.Room;
import com.archibus.app.sysadmin.event.data.CallbackFlag;
import com.archibus.config.Project.Immutable;
import com.archibus.context.User;
import com.archibus.core.event.data.*;
import com.archibus.core.event.data.DataEvent.BeforeOrAfter;
import com.archibus.service.space.SpaceConstants;

/**
 * @author tydykov
 *
 */
public class RoomTransactionDataEventListenerTest extends TestCase {

    /**
     * Test method for
     * {@link com.archibus.app.common.space.service.RoomTransactionDataEventListener#onApplicationEvent(org.springframework.context.ApplicationEvent)}
     * .
     */
    public void testOnApplicationEvent() {
        {
            // case 1: event has RecordChangedEvent type, table name = "rm",
            // UseWorkspaceTransactions =
            // "1"
            final RoomTransactionDataEventListener roomTransactionDataEventListener =
                    new RoomTransactionDataEventListener();
            final Map<String, String> parametersKeyValue = new HashMap<String, String>();
            parametersKeyValue.put(SpaceConstants.SPACE_ACTIVITY + "-"
                    + SpaceConstants.USEWORKSPACETRANSACTIONS, "1");

            roomTransactionDataEventListener.setProject(MockUtilities
                .createMockProject(MockUtilities
                    .createMockActivityManager(null, parametersKeyValue)));

            roomTransactionDataEventListener.setRoomDao(MockUtilities.createMockRoomDao());
            // table name 'rm"
            final User user = new User(null);
            final RecordChangedEvent recordChangedEvent =
                    new RecordChangedEvent(this, null, user, "rm", null, null);

            final CallbackFlag callbackFlag = new CallbackFlag();
            final IRoomTransactionService roomTransactionService = new IRoomTransactionService() {

                @Override
                public void recordTransaction(final ChangeType changeType, final User user,
                        final Date dateTime, final Employee employee,
                        final BeforeOrAfter beforeOrAfter, final Immutable project) {
                    // TODO Auto-generated method stub
                }

                @Override
                public void recordTransaction(final ChangeType changeType, final User user,
                        final Room room, final Date dateTime, final BeforeOrAfter beforeOrAfter) {
                    // verification: this method should be called
                    callbackFlag.called = true;
                    // verify parameter bean
                    Assert.assertEquals(recordChangedEvent.getChangeType(), changeType);
                    Assert.assertSame(recordChangedEvent.getUser(), user);
                    Assert.assertEquals(new Date(recordChangedEvent.getTimestamp()), dateTime);

                    Assert.assertEquals(recordChangedEvent.getBeforeOrAfter(), beforeOrAfter);
                }
                
                @Override
                public void recordEmployeePrimaryChange(final String oldEmployeeId,
                        final String employeeId, final Immutable project) {
                    // TODO Auto-generated method stub

                }
            };

            roomTransactionDataEventListener.setRoomTransactionService(roomTransactionService);

            // invoke tested method
            roomTransactionDataEventListener.onApplicationEvent(recordChangedEvent);
            // verify that IRoomTransactionService.recordTransaction method was called
            Assert.assertTrue(callbackFlag.called);
        }

        {
            // case 2: event has RecordChangedEvent type, table name = "rm",
            // UseWorkspaceTransactions =
            // "No"
            final RoomTransactionDataEventListener roomTransactionDataEventListener =
                    new RoomTransactionDataEventListener();
            final Map<String, String> parametersKeyValue = new HashMap<String, String>();
            parametersKeyValue.put(SpaceConstants.SPACE_ACTIVITY + "-"
                    + SpaceConstants.USEWORKSPACETRANSACTIONS, "0");

            roomTransactionDataEventListener.setProject(MockUtilities
                .createMockProject(MockUtilities
                    .createMockActivityManager(null, parametersKeyValue)));

            // table name 'rm"
            final User user = new User(null);
            final RecordChangedEvent recordChangedEvent =
                    new RecordChangedEvent(this, null, user, "rm", null, null);

            final CallbackFlag callbackFlag = new CallbackFlag();
            final IRoomTransactionService roomTransactionService = new IRoomTransactionService() {

                @Override
                public void recordTransaction(final ChangeType changeType, final User user,
                        final Date dateTime, final Employee employee,
                        final BeforeOrAfter beforeOrAfter, final Immutable project) {
                    // TODO Auto-generated method stub
                }

                @Override
                public void recordTransaction(final ChangeType changeType, final User user,
                        final Room room, final Date dateTime, final BeforeOrAfter beforeOrAfter) {
                    // verification: this method should be called
                    callbackFlag.called = true;
                    // verify parameter bean
                    Assert.assertEquals(recordChangedEvent.getChangeType(), changeType);
                    Assert.assertSame(recordChangedEvent.getUser(), user);
                    Assert.assertEquals(new Date(recordChangedEvent.getTimestamp()), dateTime);

                    Assert.assertEquals(recordChangedEvent.getBeforeOrAfter(), beforeOrAfter);
                }
                
                @Override
                public void recordEmployeePrimaryChange(final String oldEmployeeId,
                        final String employeeId, final Immutable project) {
                    // TODO Auto-generated method stub

                }
            };

            roomTransactionDataEventListener.setRoomTransactionService(roomTransactionService);

            // invoke tested method
            roomTransactionDataEventListener.onApplicationEvent(recordChangedEvent);
            // verify that IRoomTransactionService.recordTransaction method was not called
            Assert.assertFalse(callbackFlag.called);
        }

        {
            // case 3: event has RecordChangedEvent type, table name != "rm"
            final RoomTransactionDataEventListener roomTransactionDataEventListener =
                    new RoomTransactionDataEventListener();

            // table name 'NotRm"
            final User user = new User(null);
            final RecordChangedEvent recordChangedEvent =
                    new RecordChangedEvent(this, null, user, "NotRm", null, null);

            final CallbackFlag callbackFlag = new CallbackFlag();
            final IRoomTransactionService roomTransactionService = new IRoomTransactionService() {

                @Override
                public void recordTransaction(final ChangeType changeType, final User user,
                        final Date dateTime, final Employee employee,
                        final BeforeOrAfter beforeOrAfter, final Immutable project) {
                    // TODO Auto-generated method stub
                }

                @Override
                public void recordTransaction(final ChangeType changeType, final User user,
                        final Room room, final Date dateTime, final BeforeOrAfter beforeOrAfter) {
                    // verification: this method should be called
                    callbackFlag.called = true;
                    // verify parameter bean
                    Assert.assertEquals(recordChangedEvent.getChangeType(), changeType);
                    Assert.assertSame(recordChangedEvent.getUser(), user);
                    Assert.assertEquals(new Date(recordChangedEvent.getTimestamp()), dateTime);

                    Assert.assertEquals(recordChangedEvent.getBeforeOrAfter(), beforeOrAfter);
                }

                @Override
                public void recordEmployeePrimaryChange(final String oldEmployeeId,
                        final String employeeId, final Immutable project) {
                    // TODO Auto-generated method stub
                    
                }
            };

            roomTransactionDataEventListener.setRoomTransactionService(roomTransactionService);

            // invoke tested method
            roomTransactionDataEventListener.onApplicationEvent(recordChangedEvent);
            // verify that IRoomTransactionService.recordTransaction method was not called
            Assert.assertFalse(callbackFlag.called);
        }

        {
            // case 5: event has SqlExecutedEvent type, table name = "rm", UseWorkspaceTransactions
            // =
            // "Yes"
            final RoomTransactionDataEventListener roomTransactionDataEventListener =
                    new RoomTransactionDataEventListener();
            final Map<String, String> parametersKeyValue = new HashMap<String, String>();
            parametersKeyValue.put(SpaceConstants.SPACE_ACTIVITY + "-"
                    + SpaceConstants.USEWORKSPACETRANSACTIONS, "1");

            final CallbackFlag callbackFlag = new CallbackFlag();
            roomTransactionDataEventListener.setProject(MockUtilities
                .createMockProject(MockUtilities.createMockActivityManager(callbackFlag,
                    parametersKeyValue)));

            // table name 'rm"
            final User user = new User(null);
            final SqlExecutedEvent sqlExecutedEvent =
                    new SqlExecutedEvent(this, user, null, "rm", null);

            // invoke tested method
            roomTransactionDataEventListener.onApplicationEvent(sqlExecutedEvent);
            // verify that IActivityParameterManager.updateParameter method was called
            Assert.assertTrue(callbackFlag.called);
        }

        {
            // case 6: event has SqlExecutedEvent type, table name = "rm", UseWorkspaceTransactions
            // =
            // "No"
            final RoomTransactionDataEventListener roomTransactionDataEventListener =
                    new RoomTransactionDataEventListener();
            final Map<String, String> parametersKeyValue = new HashMap<String, String>();
            parametersKeyValue.put(SpaceConstants.SPACE_ACTIVITY + "-"
                    + SpaceConstants.USEWORKSPACETRANSACTIONS, "0");

            final CallbackFlag callbackFlag = new CallbackFlag();
            roomTransactionDataEventListener.setProject(MockUtilities
                .createMockProject(MockUtilities.createMockActivityManager(callbackFlag,
                    parametersKeyValue)));

            // table name 'rm"
            final User user = new User(null);
            final SqlExecutedEvent sqlExecutedEvent =
                    new SqlExecutedEvent(this, user, null, "rm", null);

            // invoke tested method
            roomTransactionDataEventListener.onApplicationEvent(sqlExecutedEvent);
            // verify that IActivityParameterManager.updateParameter method was not called
            Assert.assertFalse(callbackFlag.called);
        }

        {
            // case 7: event has SqlExecutedEvent type, table name != "rm"
            final RoomTransactionDataEventListener roomTransactionDataEventListener =
                    new RoomTransactionDataEventListener();

            final CallbackFlag callbackFlag = new CallbackFlag();
            roomTransactionDataEventListener.setProject(MockUtilities
                .createMockProject(MockUtilities.createMockActivityManager(callbackFlag, null)));

            // table name 'NotRm"
            final User user = new User(null);
            final SqlExecutedEvent sqlExecutedEvent =
                    new SqlExecutedEvent(this, user, null, "NotRm", null);

            // invoke tested method
            roomTransactionDataEventListener.onApplicationEvent(sqlExecutedEvent);
            // verify that IActivityParameterManager.updateParameter method was not called
            Assert.assertFalse(callbackFlag.called);
        }

        {
            // case 8: event has type that is not SqlExecutedEvent and not RecordChangedEvent
            final RoomTransactionDataEventListener roomTransactionDataEventListener =
                    new RoomTransactionDataEventListener();

            // event parameters don't matter here
            final ApplicationEvent event =
                    new org.springframework.security.web.session.HttpSessionCreatedEvent(
                        MockUtilities.createMockHttpSession());
            // invoke tested method
            roomTransactionDataEventListener.onApplicationEvent(event);

            // nothing should happen
        }
    }
}
