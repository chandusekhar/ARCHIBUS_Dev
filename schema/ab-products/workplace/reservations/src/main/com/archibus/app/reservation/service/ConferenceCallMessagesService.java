package com.archibus.app.reservation.service;

import java.util.*;

import com.archibus.app.common.notification.domain.Notification;
import com.archibus.app.common.notification.message.NotificationDataModel;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.StringTranscoder;
import com.archibus.utility.StringUtil;

/**
 * Service class that can build messages related to conferencec call reservations.
 * 
 * Managed by Spring.
 * 
 * @author Yorik Gerlo
 * @since 21.3
 */
public class ConferenceCallMessagesService extends ReservationMessagesService {
    
    /** Separator for inserting the conference call locations in a reservation comment. */
    private static final String CONFERENCE_CALL_LOCATIONS_SEPARATOR = "CONFERENCE_CALL_LOCATIONS_SEPARATOR";

    /** Referenced_by value for the messages used for conference call reservations. */
    private static final String REFERENCED_BY_CONFCALL = "CONFCALL_WFR";

    /**
     * Insert the conference call locations in the reservations' comment field.
     * 
     * @param reservations the reservations in the conference call
     * @param spaceService the service interface to get the location description
     * @param additionalComments additional comments to place in the locations template (optional)
     */
    public void insertConferenceCallLocations(final List<RoomReservation> reservations,
            final ISpaceService spaceService, final String additionalComments) {
        final ReservationMessage localizedMessage =
                processLocationTemplate(reservations, spaceService);
        // add a newline to the separator to ensure better matching
        final String separator = StringUtil.notNull(localizedMessage.getSubject());
        String formattedLocations = StringUtil.notNull(localizedMessage.getBody());
        if (StringUtil.notNullOrEmpty(additionalComments)) {
            formattedLocations = formattedLocations + '\n' + additionalComments + '\n';
        }
        
        // Determine whether the current body already contains the locations template.
        final String originalBody = StringUtil.notNull(reservations.get(0).getComments());
        final int indexOfTopSeparator = originalBody.indexOf(separator);
        final int indexOfBottomSeparator =
                originalBody.indexOf(separator, indexOfTopSeparator + separator.length());
        final StringBuffer buffer = new StringBuffer();
        if (indexOfTopSeparator > -1 && indexOfTopSeparator < indexOfBottomSeparator) {
            // The separator was found twice. Replace what's in between.
            buffer.append(originalBody.substring(0, indexOfTopSeparator));
            buffer.append(separator);
            buffer.append('\n');
            buffer.append(formattedLocations);
            buffer.append(separator);
            buffer.append(originalBody.substring(indexOfBottomSeparator + separator.length(),
                originalBody.length()));
        } else {
            // The separator was not found, so place the template at the beginning.
            buffer.append(separator);
            buffer.append('\n');
            buffer.append(formattedLocations);
            buffer.append(separator);
            buffer.append('\n');
            buffer.append(originalBody);
        }
        
        final String updatedBody = buffer.toString();
        final String updatedComments = StringTranscoder.stripHtml(updatedBody);
        for (final RoomReservation reservation : reservations) {
            reservation.setHtmlComments(updatedBody);
            reservation.setComments(updatedComments);
        }
    }

    /**
     * Process the conference call locations template to a reservation message. The subject contains
     * the localized separator and the body contains the localized list of locations.
     * 
     * @param reservations the reservations with the rooms to include
     * @param spaceService space service to retrieve location details
     * @return message with the separator as the subject and the locations as the body
     */
    public ReservationMessage processLocationTemplate(final List<RoomReservation> reservations,
            final ISpaceService spaceService) {
        final RoomReservation primaryReservation = reservations.get(0);
        final Notification notification = new Notification();
        // For localization, set the separator as the subject and the template as the body.
        notification.setSubject(this.getNotificationMessageDao().getByPrimaryKey(ACTIVITY_ID,
            REFERENCED_BY_CONFCALL, CONFERENCE_CALL_LOCATIONS_SEPARATOR));
        notification.setBody(this.getNotificationMessageDao().getByPrimaryKey(ACTIVITY_ID,
            REFERENCED_BY_CONFCALL, "CONFERENCE_CALL_LOCATIONS"));
        
        // Build the location data model for all rooms.
        final List<Map<String, Object>> locations =
                new ArrayList<Map<String, Object>>(reservations.size());
        for (final RoomReservation reservation : reservations) {
            locations.add(spaceService.getLocationDataModel(reservation));
        }
        final NotificationDataModel dataModel = new NotificationDataModel();
        dataModel.setDataModel(new HashMap<String, Object>());
        dataModel.getDataModel().put("locations", locations);
        
        // Localize the template and fill in the data.
        final ReservationMessage localizedMessage =
                formatMessage(primaryReservation.getEmail(), notification, dataModel);
        return localizedMessage;
    }
    
    /**
     * Strip the conference call locations from the reservation's comment field.
     * 
     * @param email organizer email address
     * @param comments the comments to remove the locations from
     * @return the reservation comments without the conference call locations
     */
    public String stripConferenceCallLocations(final String email, final String comments) {
        final Notification notification = new Notification();
        // For localization, set the separator as the subject and the template as the body.
        notification.setSubject(this.getNotificationMessageDao().getByPrimaryKey(ACTIVITY_ID,
            REFERENCED_BY_CONFCALL, CONFERENCE_CALL_LOCATIONS_SEPARATOR));
        
        // Localize the template and fill in the data.
        final ReservationMessage localizedMessage =
                formatMessage(email, notification, new NotificationDataModel());
        final String separator = StringUtil.notNull(localizedMessage.getSubject());
        
        // Determine whether the current body contains the locations template.
        final int indexOfTopSeparator = comments.indexOf(separator);
        final int indexOfBottomSeparator =
                comments.indexOf(separator, indexOfTopSeparator + separator.length());
        
        String strippedComments = null;
        if (indexOfTopSeparator > -1 && indexOfTopSeparator < indexOfBottomSeparator) {
            final StringBuffer buffer = new StringBuffer();
            // The separator was found twice. Remove what's in between.
            buffer.append(comments.substring(0, indexOfTopSeparator));
            String part2 = comments.substring(indexOfBottomSeparator + separator.length(),
                comments.length());
            // If present, remove the extra newline which was added after the bottom separator.
            if (part2.startsWith("\n")) {
                part2 = part2.substring(1);
            }
            buffer.append(part2);
            strippedComments = buffer.toString();
        } else {
            strippedComments = comments;
        }
        return strippedComments;
    }

}
