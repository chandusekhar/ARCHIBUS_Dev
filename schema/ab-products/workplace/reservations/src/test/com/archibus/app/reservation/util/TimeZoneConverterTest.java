package com.archibus.app.reservation.util;

import java.text.SimpleDateFormat;
import java.util.*;

import junit.framework.Assert;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.LocalDateTimeUtil;

/**
 * Test for TimeZoneConverter.
 */
public class TimeZoneConverterTest extends DataSourceTestBase {

    /**
     * Site ID of the building to use for testing.
     */
    private static final String HQ_SITE_ID = "MARKET";

    /**
     * Building ID used for testing.
     */
    private static final String HQ_BUILDING_ID = "HQ";

    /**
     * Time zone identifier of the requestor.
     */
    private static final String REQUESTOR_TIMEZONE_ID = "Europe/Brussels";

    /**
     * Time zone identifier of the HQ building on MARKET site.
     */
    private String buildingTimeZone;

    /**
     * Date of the requestor to be converted to local time.
     */
    private Date requestorDate;

    /**
     * Combined date and time value of the requestor.
     */
    private Date requestorDateTime;

    /**
     * Time zone offset from requestor time zone to hq time zone.
     */
    private int timeZoneOffset;

    /**
     * Set up for a test case for TimeZoneConverter utilities.
     *
     * @throws Exception when setup fails
     *             <p>
     *             Suppress Warning "PMD.SignatureDeclareThrowsException"
     *             <p>
     *             Justification: the overridden method in DataSourceTestBase throws it as well.
     */
    @SuppressWarnings({ "PMD.SignatureDeclareThrowsException" })
    @Override
    public void onSetUp() throws Exception {
        super.onSetUp();

        this.buildingTimeZone =
                LocalDateTimeUtil.getLocationTimeZone(null, null, null, HQ_BUILDING_ID);
        Assert
            .assertTrue(
                "HQ is in an expected time zone. Note EST is only good for Java 5",
                "America/New_York".equals(this.buildingTimeZone)
                        || "EST".equals(this.buildingTimeZone));

        final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
        final SimpleDateFormat timeFormatter =
                new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.ENGLISH);

        this.requestorDate = dateFormatter.parse("2012-05-02");
        this.requestorDateTime = timeFormatter.parse("2012-05-02 18:30:00");

        final TimeZone requestorTimeZone = TimeZone.getTimeZone(REQUESTOR_TIMEZONE_ID);
        final TimeZone hqTimeZone = TimeZone.getTimeZone(this.buildingTimeZone);
        this.timeZoneOffset =
                hqTimeZone.getOffset(this.requestorDateTime.getTime())
                        - requestorTimeZone.getOffset(this.requestorDateTime.getTime());
    }

    /**
     * Test getting the location time zone of a building and site.
     */
    public void testLocationTimeZone() {

        String timeZone = LocalDateTimeUtil.getLocationTimeZone(null, null, HQ_SITE_ID, null);

        Assert.assertEquals(this.buildingTimeZone, timeZone);

        timeZone = LocalDateTimeUtil.getLocationTimeZone(null, null, null, HQ_BUILDING_ID);

        Assert.assertEquals(this.buildingTimeZone, timeZone);
    }

    /**
     * Test method for TimeZoneConverter.calculateDateTime() for a site.
     */
    public void testCalculateDateTimeForSite() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.requestorDateTime);
        calendar.add(Calendar.MILLISECOND, this.timeZoneOffset);
        final Date expectedSiteTime = calendar.getTime();

        final String localTimeZone =
                LocalDateTimeUtil.getLocationTimeZone(null, null, HQ_SITE_ID, null);

        final Date actualSiteTime =
                TimeZoneConverter.calculateDateTime(this.requestorDateTime, REQUESTOR_TIMEZONE_ID,
                    localTimeZone);
        Assert.assertEquals(expectedSiteTime, actualSiteTime);
        final Date calculatedRequestorDateTime =
                TimeZoneConverter.calculateDateTime(actualSiteTime, localTimeZone,
                    REQUESTOR_TIMEZONE_ID);
        Assert.assertEquals(this.requestorDateTime, calculatedRequestorDateTime);
    }

    /**
     * Test method for TimeZoneConverter.calculateDateTime() for a building.
     */
    public void testCalculateDateTimeForBuilding() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.requestorDateTime);
        calendar.add(Calendar.MILLISECOND, this.timeZoneOffset);
        final Date expectedBuildingTime = calendar.getTime();

        final String localTimeZone = TimeZoneConverter.getTimeZoneIdForBuilding(HQ_BUILDING_ID);

        final Date actualBuildingTime =
                TimeZoneConverter.calculateDateTime(this.requestorDateTime, REQUESTOR_TIMEZONE_ID,
                    localTimeZone);
        Assert.assertEquals(expectedBuildingTime, actualBuildingTime);

        // backwards
        final Date calculatedRequestorDateTime =
                TimeZoneConverter.calculateDateTime(actualBuildingTime, localTimeZone,
                    REQUESTOR_TIMEZONE_ID);
        Assert.assertEquals(this.requestorDateTime, calculatedRequestorDateTime);
    }

    /**
     * Test method for TimeZoneConverter.calculateDateTime() for UTC.
     */
    public void testCalculateRequestorDateTime() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(this.requestorDateTime);
        calendar.add(Calendar.MILLISECOND,
            -TimeZone.getTimeZone(REQUESTOR_TIMEZONE_ID)
                .getOffset(this.requestorDateTime.getTime()));
        final Date expectedUtcDate = calendar.getTime();
        final Date actualUtcDate =
                TimeZoneConverter.calculateDateTime(this.requestorDateTime, REQUESTOR_TIMEZONE_ID,
                    Constants.TIMEZONE_UTC);
        Assert.assertEquals(expectedUtcDate, actualUtcDate);

        // backwards
        final Date calculatedRequestorDateTime =
                TimeZoneConverter.calculateDateTime(actualUtcDate, Constants.TIMEZONE_UTC,
                    REQUESTOR_TIMEZONE_ID);
        Assert.assertEquals(this.requestorDateTime, calculatedRequestorDateTime);
    }

    /**
     * Test Calendar and Date behavior when converting a date to UTC time zone.
     */
    public void testConvertToUtc() {
        final TimeZone requestedTimeZone = TimeZone.getTimeZone(this.buildingTimeZone);
        final Calendar localCalendar = Calendar.getInstance(requestedTimeZone);

        localCalendar.setTime(this.requestorDate);
        final Date windowStart =
                TimeZoneConverter.calculateDateTime(localCalendar.getTime(),
                    requestedTimeZone.getID(), Constants.TIMEZONE_UTC);

        Assert.assertTrue(windowStart.after(this.requestorDate));
    }

}
