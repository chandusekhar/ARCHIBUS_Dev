package com.archibus.app.reservation.service;

import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.domain.*;

/**
 * Test class for WebCentralCalendarService.
 */
public class WebCentralAvailabilityServiceTest extends ReservationServiceTestBase {

    /** First email address used for testing. */
    private static final String EMAIL1 = "afm@tgd.com";

    /** The Availability service instance being tested. */
    private WebCentralAvailabilityService webCentralAvailabilityService;

    /**
     * Set the WebCentral availability service.
     *
     * @param webCentralAvailabilityService the new WebCentral availability service
     */
    public void setWebCentralAvailabilityService(
            final WebCentralAvailabilityService webCentralAvailabilityService) {
        this.webCentralAvailabilityService = webCentralAvailabilityService;
    }

    /**
     * Test getting attendee availability.
     */
    public void testAttendeeAvailibility() {
        final TimeZone timeZone = TimeZone.getDefault();

        final AttendeeAvailability freeBusy =
                this.webCentralAvailabilityService.findAttendeeAvailability(null, this.startDate,
                    timeZone, EMAIL1, Arrays.asList(new String[] { EMAIL1 })).get(EMAIL1);
        Assert.assertTrue(freeBusy.isSuccessful());
        final List<ICalendarEvent> events = freeBusy.getCalendarEvents();
        Assert.assertNotNull(events);
    }

}
