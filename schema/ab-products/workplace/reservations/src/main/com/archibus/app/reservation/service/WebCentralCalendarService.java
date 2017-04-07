package com.archibus.app.reservation.service;

import java.util.*;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.reservation.dao.IVisitorDataSource;
import com.archibus.app.reservation.dao.datasource.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.AttendeeResponseStatus.ResponseStatus;
import com.archibus.app.reservation.service.helpers.WebCentralCalendarServiceHelper;
import com.archibus.app.reservation.util.*;
import com.archibus.context.ContextStore;
import com.archibus.eventhandler.reservations.ReservationsCommonHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * The Class WebCentralCalendarService.
 */
public class WebCentralCalendarService implements ICalendarService {

    /** The Constant SPACE. */
    private static final String SPACE = " ";

    /** Invitation type for new invitations. */
    private static final String TYPE_NEW = "new";

    /** Invitation type for cancel invitations. */
    private static final String TYPE_CANCEL = "cancel";

    /** Invitation type for invitation updates. */
    private static final String TYPE_UPDATE = "update";

    /** The employee service. */
    private IEmployeeService employeeService;

    /** The visitors data source. */
    private IVisitorDataSource visitorDataSource;

    /** The room reservation data source. */
    private ConferenceCallReservationDataSource reservationDataSource;

    /** The logger. */
    private final Logger logger = Logger.getLogger(this.getClass());

    /** {@inheritDoc} */
    @Override
    public String createAppointment(final IReservation reservation) throws ExceptionBase {
        // send emails to attendees, only recurring if recurrence property is set
        sendEmails(reservation, null, TYPE_NEW, reservation.getRecurrence() != null, null,
            reservation.getConferenceId());
        // return empty string for appointment identifier
        return "";
    }

    /** {@inheritDoc} */
    @Override
    public void updateAppointment(final IReservation reservation) throws ExceptionBase {
        // send emails to attendees.
        sendEmails(reservation, null, TYPE_UPDATE, true, null, reservation.getConferenceId());
    }

    /** {@inheritDoc} */
    @Override
    public void cancelAppointment(final IReservation reservation, final String message,
            final boolean notifyOrganizer) throws ExceptionBase {
        // send emails to attendees
        sendEmails(reservation, null, TYPE_CANCEL, true, message,
            this.getMasterConferenceId(reservation));
    }

    /** {@inheritDoc} */
    @Override
    public void cancelAppointmentOccurrence(final IReservation reservation, final String message,
            final boolean notifyOrganizer) throws ExceptionBase {
        // send emails to attendees
        sendEmails(reservation, null, TYPE_CANCEL, false, message,
            this.getMasterConferenceId(reservation));
    }

    /** {@inheritDoc} */
    @Override
    public void updateAppointmentOccurrence(final IReservation reservation,
            final IReservation originalReservation) throws ExceptionBase {
        // send emails to attendees
        sendEmails(reservation, originalReservation, TYPE_UPDATE, false, null,
            this.getMasterConferenceId(reservation));
    }

    /**
     * Get the conference id of the first occurrence in the series of the given reservation
     * occurrence.
     *
     * @param reservation the reservation
     * @return the conference id, or null if this isn't a conference call reservation
     */
    private Integer getMasterConferenceId(final IReservation reservation) {
        Integer conferenceId = reservation.getConferenceId();
        if (conferenceId != null && reservation.getParentId() != null) {
            conferenceId = this.reservationDataSource.getParentId(conferenceId);
        }
        return conferenceId;
    }

    /** {@inheritDoc} */
    @Override
    public void updateAppointmentSeries(final RoomReservation reservation,
            final List<RoomReservation> originalReservations) throws ExceptionBase {

        if (StringUtil.isNullOrEmpty(reservation.getAttendees())) {
            // For simple email the full series can be sent again in a single message
            this.updateAppointment(reservation);
        } else {
            final List<RoomReservation> createdReservations = reservation.getCreatedReservations();

            // For ICS this is implemented by updating each individual occurrence.
            for (int index = 0; index < originalReservations.size(); ++index) {
                this.updateAppointmentOccurrence(createdReservations.get(index),
                    originalReservations.get(index));
            }
        }
    }

    /**
     * Set the employee service.
     *
     * @param employeeService the new employee service
     */
    public void setEmployeeService(final IEmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Set the visitor data source.
     *
     * @param visitorDataSource the new visitor data source
     */
    public void setVisitorDataSource(final IVisitorDataSource visitorDataSource) {
        this.visitorDataSource = visitorDataSource;
    }

    /**
     * Sets the reservation data source.
     *
     * @param reservationDataSource the new reservation data source
     */
    public void setReservationDataSource(
            final ConferenceCallReservationDataSource reservationDataSource) {
        this.reservationDataSource = reservationDataSource;
    }

    /**
     * Send the e-mail notifications.
     *
     * @param reservation the reservation to send a message for
     * @param originalReservation the original reservation
     * @param invitationType the type of invite to send
     * @param allRecurrences true to send for all occurrences, false for only the given occurrence
     * @param message the message to include in the notification
     * @param conferenceId the conference id in case of a conference call reservation (may be null)
     */
    private void sendEmails(final IReservation reservation, final IReservation originalReservation,
            final String invitationType, final boolean allRecurrences, final String message,
            final Integer conferenceId) {

        // KB 3046144 don't create ICS invitations when there are no attendees.
        if (StringUtil.isNullOrEmpty(reservation.getAttendees())) {
            final boolean recurring =
                    allRecurrences && StringUtil.notNullOrEmpty(reservation.getRecurringRule());
            Integer parentId = null;
            if (recurring) {
                parentId = reservation.getParentId();
            }

            if (Constants.STATUS_REJECTED.equalsIgnoreCase(reservation.getStatus())) {
                // this email is already sent from the approval service
                this.logger
                    .debug("Calendar Service doesn't need to send email for rejected reservation "
                            + reservation.getReserveId() + " without attendees");
            } else {
                /*
                 * TODO do something with conference id? Better probably to check in CommonHandler
                 * what to send as 'reservation id'
                 */
                // the helper checks whether email notifications are enabled
                EmailNotificationHelper.sendNotifications(reservation.getReserveId(), parentId,
                    message);
            }

        } else if (EmailNotificationHelper.notificationsEnabled()) {
            sendEmailInvitations(reservation, originalReservation, invitationType, allRecurrences,
                message, conferenceId);
        }
    }

    /**
     * Send email invitations with ICAL attachments.
     *
     * @param reservation the room reservation to send an invite for
     * @param originalReservation the original reservation
     * @param invitationType the type of invite to send
     * @param allRecurrences true to send for all occurrences, false for only the given occurrence
     * @param message the message to include in the notification
     * @param conferenceId the conference id in case of a conference call reservation (may be null)
     */
    private void sendEmailInvitations(final IReservation reservation,
            final IReservation originalReservation, final String invitationType,
            final boolean allRecurrences, final String message, final Integer conferenceId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // the reservation id
        context.addResponseParameter(Constants.RES_ID, reservation.getReserveId().toString());
        // set the invitation type
        context.addResponseParameter("invitation_type", invitationType);

        if (conferenceId != null) {
            context.addResponseParameter(Constants.RES_CONFERENCE, conferenceId.toString());
        }

        if (invitationType.equals(TYPE_CANCEL) && !allRecurrences) {
            // when canceling one occurrence, specify which date to cancel
            context.addResponseParameter("date_cancel",
                WebCentralCalendarServiceHelper.getDateFormatted(reservation.getStartDate()));
        }
        // email_invitations: set empty string if null
        final String attendees = reservation.getAttendees();

        context.addResponseParameter("email_invitations", attendees);
        // require reply always
        context.addResponseParameter("require_reply", true);
        // canceling message

        if (StringUtil.notNullOrEmpty(message)) {
            context.addResponseParameter("cancel_message", message);
        }

        // when update
        WebCentralCalendarServiceHelper.addResponseParametersUpdate(reservation,
            originalReservation, context);

        addReservationResponseParameters(reservation, allRecurrences, context);
        // do we allow exceptions for cancelled reservations?
        context.addResponseParameter("RoomConflicts", "[]");

        // Check whether the result message is already set and remember it.
        final String resultMessage = WebCentralCalendarServiceHelper.checkResultMessage(context);

        // when editing different occurrences of a recurrent reservation, send as separate
        // update invitations

        // call using the ReservationsCommonHandler
        // all parameters are in context
        final ReservationsCommonHandler commonHandler = new ReservationsCommonHandler();

        /*
         * Code was modified to generate invitations for conference calls (i.e. using
         * res_conference) this is required to ensure the correct meetings are updated once the
         * primary room is cancelled.
         */
        commonHandler.sendEmailInvitations(context);

        WebCentralCalendarServiceHelper.setResultMessage(context, resultMessage);
    }

    /**
     * Set the Reservation JSON object, reservation id and parent reservation id in the context for
     * sending the invitations.
     *
     * @param reservation the reservation domain object
     * @param allRecurrences whether to create invitations for all occurrences
     * @param context the event handler context
     */
    private void addReservationResponseParameters(final IReservation reservation,
            final boolean allRecurrences, final EventHandlerContext context) {
        final JSONObject json = new JSONObject();
        Date startDate = null;
        Date endDate = null;
        // KB 3040087: for a recurring invitation, the endDate in the Reservation json object
        // must indicate the end date of the series.
        if (allRecurrences && reservation.getRecurrence() != null) {
            startDate = reservation.getRecurrence().getStartDate();
            endDate = reservation.getRecurrence().getEndDate();
        } else {
            startDate = reservation.getStartDate();
            endDate = reservation.getEndDate();
        }
        json.put(Constants.DATE_START_FIELD_NAME,
            WebCentralCalendarServiceHelper.getDateFormatted(startDate));
        json.put(Constants.DATE_END_FIELD_NAME,
            WebCentralCalendarServiceHelper.getDateFormatted(endDate));

        json.put("time_start",
            WebCentralCalendarServiceHelper.getTimeFormatted(reservation.getStartTime()));
        json.put("time_end",
            WebCentralCalendarServiceHelper.getTimeFormatted(reservation.getEndTime()));
        json.put("status", reservation.getStatus());
        json.put("bl_id", reservation.determineBuildingId());
        json.put("res_id", String.valueOf(reservation.getReserveId()));

        // bv when editing or canceling the full list of reservations
        if (allRecurrences && StringUtil.notNullOrEmpty(reservation.getRecurringRule())) {
            WebCentralCalendarSettings.prepareRecurringInvitations(reservation, context, json);
        } else {
            // bv when editing or canceling an occurrence, point to the correct date
            WebCentralCalendarSettings.prepareSingleInvitation(reservation, context, json);
        }

        // add reservation in context
        context.addResponseParameter("Reservation", json.toString());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<AttendeeResponseStatus> getAttendeesResponseStatus(final IReservation reservation)
            throws ExceptionBase {
        final List<AttendeeResponseStatus> responses = new ArrayList<AttendeeResponseStatus>();
        if (reservation != null) {
            final String attendeesValue = reservation.getAttendees();
            if (StringUtil.notNullOrEmpty(attendeesValue)) {
                final String[] emails = attendeesValue.split(";");
                for (final String email : emails) {
                    final AttendeeResponseStatus responseStatus = toResponseStatus(email);
                    responses.add(responseStatus);
                }
            }

        }
        return responses;
    }

    /**
     * Get the response status object for the attendee with the given email.
     *
     * @param email the email address
     * @return the attendee response status
     */
    private AttendeeResponseStatus toResponseStatus(final String email) {
        final AttendeeResponseStatus responseStatus = new AttendeeResponseStatus();
        responseStatus.setEmail(email);
        // the response status is always unknown
        responseStatus.setResponseStatus(ResponseStatus.Unknown);

        // lookup name in employee and visitors tables
        try {
            final Employee employee = this.employeeService.findEmployee(email);
            if (StringUtil.isNullOrEmpty(employee.getFirstName())
                    && StringUtil.isNullOrEmpty(employee.getLastName())) {
                responseStatus.setName(employee.getId());
            } else {
                responseStatus.setName(StringUtil.notNull(employee.getFirstName()) + SPACE
                        + StringUtil.notNull(employee.getLastName()));
            }
        } catch (final ReservationException exception) {
            // no employee found.
            final Visitor visitor = this.visitorDataSource.findByEmail(email);
            if (visitor != null) {
                responseStatus.setName(StringUtil.notNull(visitor.getFirstName()) + SPACE
                        + StringUtil.notNull(visitor.getLastName()));
            }
        }
        return responseStatus;
    }

}
