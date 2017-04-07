package com.archibus.app.solution.common.eventhandler.webservice;

import java.io.Serializable;
import java.util.Date;

/**
 * This is a POJO - business object implementing properties of the booking.
 * 
 * @author tydykov
 * @created November 9, 2006
 */
public class Booking implements Serializable {
    /*
     * Private Fields
     */
    private String roomId;

    private String bookingId;

    private java.util.Date start;

    private java.util.Date end;

    private boolean confidential = false;

    private boolean passwordProtected = false;

    private String purpose;

    // TODO implement optional parameters

    /**
     * Constructor for the Booking object
     */
    public Booking() {
    }

    /**
     * Gets the start attribute of the Booking object
     * 
     * @return The start value
     */
    public Date getStart() {
        return this.start;
    }

    /**
     * Gets the roomId attribute of the Booking object
     * 
     * @return The roomId value
     */
    public String getRoomId() {
        return this.roomId;
    }

    /**
     * Gets the purpose attribute of the Booking object
     * 
     * @return The purpose value
     */
    public String getPurpose() {
        return this.purpose;
    }

    /**
     * Gets the passwordProtected attribute of the Booking object
     * 
     * @return The passwordProtected value
     */
    public boolean isPasswordProtected() {
        return this.passwordProtected;
    }

    /**
     * Gets the end attribute of the Booking object
     * 
     * @return The end value
     */
    public Date getEnd() {
        return this.end;
    }

    /**
     * Gets the confidential attribute of the Booking object
     * 
     * @return The confidential value
     */
    public boolean isConfidential() {
        return this.confidential;
    }

    /**
     * Sets the bookingId attribute of the Booking object
     * 
     * @param bookingId The new bookingId value
     */
    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    /**
     * Sets the start attribute of the Booking object
     * 
     * @param start The new start value
     */
    public void setStart(Date start) {
        this.start = start;
    }

    /**
     * Sets the roomId attribute of the Booking object
     * 
     * @param roomId The new roomId value
     */
    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    /**
     * Sets the purpose attribute of the Booking object
     * 
     * @param purpose The new purpose value
     */
    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    /**
     * Sets the passwordProtected attribute of the Booking object
     * 
     * @param passwordProtected The new passwordProtected value
     */
    public void setPasswordProtected(boolean passwordProtected) {
        this.passwordProtected = passwordProtected;
    }

    /**
     * Sets the end attribute of the Booking object
     * 
     * @param end The new end value
     */
    public void setEnd(Date end) {
        this.end = end;
    }

    /**
     * Sets the confidential attribute of the Booking object
     * 
     * @param confidential The new confidential value
     */
    public void setConfidential(boolean confidential) {
        this.confidential = confidential;
    }

    /**
     * Gets the bookingId attribute of the Booking object
     * 
     * @return The bookingId value
     */
    public String getBookingId() {
        return this.bookingId;
    }

    /*
     * JavaBeans Properties
     */

    @Override
    public String toString() {
        return this.bookingId + ";" + this.roomId + ";" + this.purpose + ";" + this.confidential
                + ";" + this.passwordProtected + ";" + this.start + ";" + this.end;
    }
}
