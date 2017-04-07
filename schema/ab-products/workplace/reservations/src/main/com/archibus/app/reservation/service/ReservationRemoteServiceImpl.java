package com.archibus.app.reservation.service;

import java.sql.Time;
import java.util.List;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.Recurrence;
import com.archibus.app.reservation.service.helpers.ActivityParameterHelper;
import com.archibus.app.reservation.util.*;
import com.archibus.utility.ExceptionBase;

/**
 * The Class ReservationRemoteServiceImpl.
 *
 * @author Bart Vanderschoot
 */
public class ReservationRemoteServiceImpl extends ReservationRemoteServiceBaseImpl
        implements ReservationRemoteService {

    /** The reservation service. */
    private IConferenceReservationService reservationService;

    /** The cancel service. */
    private CancelReservationService cancelReservationService;

    /** The parameter helper for retrieving activity parameters and other settings. */
    private ActivityParameterHelper activityParameterHelper;

    /** The reservation messages service. */
    private ConferenceCallMessagesService messagesService;

    /**
     * {@inheritDoc}
     */
    @Override
    public final void cancelRoomReservation(final RoomReservation reservation)
            throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();
        this.cancelReservationService.cancelReservation(reservation);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Deprecated
    public final List<RoomReservation> cancelRoomReservationByUniqueIdRecurrence(
            final String uniqueId, final String email, final boolean disconnectOnError)
                    throws ExceptionBase {
        return this.cancelRoomReservations(uniqueId, email, null, disconnectOnError);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final List<RoomReservation> cancelRoomReservations(final String uniqueId,
            final String email, final Integer conferenceId, final boolean disconnectOnError)
                    throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();

        return this.cancelReservationService.cancelRoomReservationsByUniqueId(uniqueId, email,
            conferenceId, disconnectOnError);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final void disconnectRoomReservation(final RoomReservation reservation)
            throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();

        // get the original reservation, so any changes in the object received from the client
        // are not saved
        final RoomReservation roomReservation = this.reservationService
            .getActiveReservation(reservation.getReserveId(), Constants.TIMEZONE_UTC);

        this.cancelReservationService.disconnectReservation(roomReservation);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ConferenceRoomsAvailability checkConferenceRoomsAvailability(
            final List<RoomReservation> reservations, final boolean allDayEvent,
            final Recurrence recurrence) throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();
        final ConferenceRoomsAvailability result = this.locationQueryHandler
            .getConferenceRoomsAvailability(reservations, allDayEvent, recurrence);

        // also fill in the location
        final ReservationMessage container = this.messagesService
            .processLocationTemplate(reservations, this.locationQueryHandler.getSpaceService());
        result.setLocationSeparator(container.getSubject());
        result.setLocation(container.getBody());

        return result;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final RoomReservation getRoomReservationById(final Integer reserveId)
            throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();
        return this.reservationService.getActiveReservation(reserveId, Constants.TIMEZONE_UTC);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Deprecated
    public final List<RoomReservation> getRoomReservationsByUniqueId(final String uniqueId)
            throws ExceptionBase {
        return this.getRoomReservations(uniqueId, null);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final List<RoomReservation> getRoomReservations(final String uniqueId,
            final Integer conferenceId) throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();

        return this.reservationService.getByUniqueId(uniqueId, conferenceId,
            Constants.TIMEZONE_UTC);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final RoomReservation saveRoomReservation(final RoomReservation reservation)
            throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();
        // only set the requestor for new reservaions
        if (reservation.getReserveId() == null || reservation.getReserveId() == 0) {
            this.employeeService.setRequestor(reservation);
        }

        this.reservationService.saveFullReservation(reservation);
        return this.getRoomReservationById(reservation.getReserveId());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final boolean verifyRecurrencePattern(final String uniqueId, final Recurrence recurrence,
            final Time startTime, final Time endTime, final String timeZone) throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();
        return this.reservationService.verifyRecurrencePattern(uniqueId, recurrence, startTime,
            endTime, timeZone);

    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final List<RoomArrangement> getRoomArrangementDetails(
            final List<RoomArrangement> roomArrangements) throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();
        final List<RoomArrangement> details =
                this.reservationService.getRoomArrangementDetails(roomArrangements);
        this.locationQueryHandler.getSpaceService().setLocationString(details);
        return details;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final String getActivityParameter(final String identifier) throws ExceptionBase {
        return this.activityParameterHelper.getActivityParameter(identifier);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final List<String> getActivityParameters(final List<String> identifiers) {
        return this.activityParameterHelper.getActivityParameters(identifiers);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final List<RoomReservation> saveRecurringRoomReservation(
            final RoomReservation reservation, final Recurrence recurrence) throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();
        // Set the requestor and save the reservation series.
        // only set the requestor for new reservaions
        if (reservation.getReserveId() == null || reservation.getReserveId() == 0) {
            this.employeeService.setRequestor(reservation);
        }

        final List<RoomReservation> savedReservations =
                this.reservationService.saveFullRecurringReservation(reservation, recurrence);

        // Return the reservations with UTC time zone.
        for (final RoomReservation savedReservation : savedReservations) {
            ReservationUtils.convertToTimeZone(savedReservation, Constants.TIMEZONE_UTC);
        }
        return savedReservations;
    }

    /**
     *
     * {@inheritDoc}
     */
    @Override
    public SavedConferenceCall saveConferenceCall(final List<RoomReservation> reservations,
            final Recurrence recurrence, final boolean disconnectOnError) throws ExceptionBase {
        ReservationsContextHelper.checkProjectContext();
        for (final RoomReservation reservation : reservations) {
            // Set the requestor for new reservations.
            if (reservation.getReserveId() == null || reservation.getReserveId() == 0) {
                this.employeeService.setRequestor(reservation);
            }
        }

        final SavedConferenceCall result = this.reservationService.saveConferenceCall(reservations,
            recurrence, disconnectOnError);
        if (result.isCompleted()) {
            // convert all reservations to UTC
            for (final RoomReservation reservation : result.getSavedReservations()) {
                ReservationUtils.convertToTimeZone(reservation, Constants.TIMEZONE_UTC);
            }
        }
        return result;
    }

    /**
     * Sets the reservation service.
     *
     * @param reservationService the new reservation service
     */
    public final void setReservationService(
            final IConferenceReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * Setter for the parameter helper.
     *
     * @param activityParameterHelper the new activity parameter helper
     */
    public final void setActivityParameterHelper(
            final ActivityParameterHelper activityParameterHelper) {
        this.activityParameterHelper = activityParameterHelper;
    }

    /**
     * Sets the cancel reservation service.
     *
     * @param cancelReservationService the new cancel reservation service
     */
    public final void setCancelReservationService(
            final CancelReservationService cancelReservationService) {
        this.cancelReservationService = cancelReservationService;
    }

    /**
     * Sets the messages reservation service.
     *
     * @param messagesService the new conference call messages reservation service
     */
    public final void setMessagesService(final ConferenceCallMessagesService messagesService) {
        this.messagesService = messagesService;
    }

}
