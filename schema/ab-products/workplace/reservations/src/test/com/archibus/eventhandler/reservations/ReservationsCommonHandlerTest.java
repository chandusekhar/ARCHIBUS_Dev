package com.archibus.eventhandler.reservations;

import java.sql.Time;
import java.util.Date;

import com.archibus.app.reservation.ConfiguredDataSourceTestBase;
import com.archibus.app.reservation.dao.datasource.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.ReservationsContextHelper;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.jobmanager.EventHandlerContext;

import junit.framework.Assert;

/**
 * Test for ReservationsCommonHandler.
 */
public class ReservationsCommonHandlerTest extends ConfiguredDataSourceTestBase {

    /** The primary key field for the notifications table. */
    private static final String AUTO_NUMBER_FIELD = "auto_number";

    /** Verified field name. */
    private static final String VERIFIED = "verified";

    /** Dummy string used as a parameter (represents a date). */
    private static final String TODAY = "today";

    /** Number of days before archiving used for testing. */
    private static final int ARCHIVE_DAYS = 87;

    /** The reservation data source used to create a reservation. */
    private RoomReservationDataSource reservationDataSource;

    /**
     * Test method for ReservationsCommonHandler.buildSqlToArchiveReserve().
     */
    public void testBuildSqlToArchiveReserve() {
        final String sql = ReservationsCommonHandler.buildSqlToArchiveReserve(
            ContextStore.get().getEventHandlerContext(), TODAY, ARCHIVE_DAYS);
        Assert.assertEquals(
            ContextStore.get().getProject().loadTableDef(Constants.RESERVE_TABLE_NAME)
                .findFieldDef(Constants.OCCURRENCE_INDEX_FIELD) != null,
            sql.contains(Constants.OCCURRENCE_INDEX_FIELD));
        Assert.assertEquals(ContextStore.get().getProject()
            .loadTableDef(Constants.RESERVE_TABLE_NAME).findFieldDef(Constants.UNIQUE_ID) != null,
            sql.contains(Constants.UNIQUE_ID));
        Assert.assertTrue(sql.contains("FROM reserve"));
        Assert.assertTrue(sql.contains(String.valueOf(ARCHIVE_DAYS)));
    }

    /**
     * Test method for ReservationsCommonHandler.buildSqlToArchiveReserveRm().
     */
    public void testBuildSqlToArchiveReserveRm() {
        final String sql = ReservationsCommonHandler.buildSqlToArchiveReserveRm(
            ContextStore.get().getEventHandlerContext(), TODAY, ARCHIVE_DAYS);
        Assert.assertEquals(
            ContextStore.get().getProject().loadTableDef(Constants.RESERVE_RM_TABLE_NAME)
                .findFieldDef(Constants.ATTENDEES_IN_ROOM_FIELD) != null,
            sql.contains(Constants.ATTENDEES_IN_ROOM_FIELD));
        Assert.assertEquals(ContextStore.get().getProject()
            .loadTableDef(Constants.RESERVE_RM_TABLE_NAME).findFieldDef(VERIFIED) != null,
            sql.contains(VERIFIED));
        Assert.assertTrue(sql.contains("FROM reserve_rm"));
        Assert.assertTrue(sql.contains(String.valueOf(ARCHIVE_DAYS)));
    }

    /**
     * Test sending email invitations.
     */
    public void testSendEmailInvitations() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(Constants.RES_ID, "");
        context.addResponseParameter("invitation_type", "new");
        context.addResponseParameter("email_invitations", "");

        // shouldn't send an email if reservation id is empty
        new ReservationsCommonHandler().sendEmailInvitations(context);
        Assert.assertFalse(
            context.parameterExists(ReservationsContextHelper.RESULT_MESSAGE_PARAMETER));
    }

    /**
     * Test sending email to the requested_by employee of a reservation.
     */
    public void testNotifyRequestedBy() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(Constants.RES_ID, "");

        // shouldn't send an email if reservation id is empty
        new ReservationsCommonHandler().notifyRequestedBy(context);
        Assert.assertFalse(
            context.parameterExists(ReservationsContextHelper.RESULT_MESSAGE_PARAMETER));
    }

    /**
     * Test sending email to the requested_for employee of a reservation.
     */
    public void testNotifyRequestedFor() {
        final RoomReservation reservation = this.createReservation();
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addResponseParameter(Constants.RES_ID, reservation.getReserveId().toString());

        final int lastId = getLastNotificationId();
        // this shouldn't send any email if requested_for matches requested_by
        new ReservationsCommonHandler().notifyRequestedFor(context);
        Assert.assertFalse(
            context.parameterExists(ReservationsContextHelper.RESULT_MESSAGE_PARAMETER));
        Assert.assertEquals(lastId, getLastNotificationId());
    }

    /**
     * Get the id of the last notification that was generated in ARCHIBUS. Can be used to verify
     * whether a particular WFR call triggered a notification.
     *
     * @return the last identifier
     */
    private int getLastNotificationId() {
        final DataSource notificationDataSource = DataSourceFactory
            .createDataSourceForFields("afm_notifications_log", new String[] { AUTO_NUMBER_FIELD });
        notificationDataSource.addSort(notificationDataSource.getMainTableName(), AUTO_NUMBER_FIELD,
            DataSource.SORT_DESC);
        notificationDataSource.setMaxRecords(1);
        return notificationDataSource.getRecord()
            .getInt(notificationDataSource.getMainTableName() + Constants.DOT + AUTO_NUMBER_FIELD);
    }

    /**
     * Test archiving reservations.
     */
    public void testCloseReservations() {
        new ReservationsCommonHandler()
            .closeReservations(ContextStore.get().getEventHandlerContext());

        // ensure nothing failed on the default run
        Assert.assertFalse(ContextStore.get().getEventHandlerContext()
            .parameterExists(ReservationsContextHelper.RESULT_MESSAGE_PARAMETER));
    }

    /**
     * Set the reservation data source used for testing.
     *
     * @param reservationDataSource the reservation data source to set
     */
    public void setReservationDataSource(
            final ConferenceCallReservationDataSource reservationDataSource) {
        this.reservationDataSource = reservationDataSource;
    }

    /**
     * Create and save a room reservation for testing.
     *
     * @return the room reservation
     */
    private RoomReservation createReservation() {
        final TimePeriod timePeriod =
                new TimePeriod(new Date(), new Time(new Date().getTime()), 60, null);
        final RoomReservation reservation =
                new RoomReservation(timePeriod, "HQ", "17", "127", "CONF-BIG-A", "CONFERENCE");
        reservation.setReservationName("reservation name");
        reservation.setCreatedBy("AFM");
        reservation.setRequestedBy(reservation.getCreatedBy());
        reservation.setRequestedFor(reservation.getCreatedBy());
        reservation.setEmail("afm@tgd.com");
        reservation.setAttendees("abernathy@tgd.com;abbot@tgd.com");
        return this.reservationDataSource.save(reservation);
    }

}
