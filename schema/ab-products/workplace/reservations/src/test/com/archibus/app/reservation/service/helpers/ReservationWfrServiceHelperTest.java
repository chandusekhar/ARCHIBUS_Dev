package com.archibus.app.reservation.service.helpers;

import com.archibus.app.reservation.ConfiguredDataSourceTestBase;
import com.archibus.app.reservation.domain.*;

import junit.framework.Assert;

/**
 * Test for ReservationWfrServiceHelper.
 *
 * @author Yorik Gerlo
 * @since 23.1
 */
public class ReservationWfrServiceHelperTest extends ConfiguredDataSourceTestBase {

    /**
     * Test email validation with invalid email addresses.
     */
    public void testInvalidEmail() {
        final RoomReservation reservation = new RoomReservation();
        reservation.setEmail("ébbot@tgd.com");
        try {
            ReservationWfrServiceHelper.validateEmails(reservation);
            Assert.fail("Organizer email is invalid");
        } catch (final ReservationException exception) {
            Assert.assertTrue(exception.getPattern().contains(reservation.getEmail()));
        }

        reservation.setEmail("abbot@tgd.com");
        reservation.setAttendees("Marc Fech (mfech@tgd.com);Rötz Theo (troetz@tgd.com)");

        try {
            ReservationWfrServiceHelper.validateEmails(reservation);
            Assert.fail("Attendee email is invalid");
        } catch (final ReservationException exception) {
            Assert.assertTrue(exception.getPattern().contains("troetz@tgd.com"));
        }
    }

    /**
     * Test email validation with valid email addresses.
     */
    public void testValidateEmail() {
        final RoomReservation reservation = new RoomReservation();
        reservation.setEmail("Hanna Abbot (abbot@tgd.com)");
        reservation.setAttendees("Marc Fech (mfech@tgd.com);Rotz Theo (troetz@tgd.com)");

        try {
            ReservationWfrServiceHelper.validateEmails(reservation);
        } catch (final ReservationException exception) {
            Assert.fail("All emails are valid");
        }
    }

}
