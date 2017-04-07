package com.archibus.app.reservation.domain;

import java.util.*;

import javax.xml.bind.annotation.*;

import com.archibus.app.reservation.dao.datasource.Constants;
import com.archibus.app.reservation.domain.recurrence.Recurrence;
import com.archibus.app.reservation.util.ReservationUtils;
import com.archibus.utility.StringUtil;

/**
 * Abstract reservation class.
 *
 * Implements the Reservation interface.
 *
 * @author Bart Vanderschoot
 *
 *         <p>
 *         Suppressed warning "PMD.TooManyFields" in this class.
 *         <p>
 *         Justification: reservations have a large number of fields in the database
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "AbstractReservation")
@SuppressWarnings({ "PMD.TooManyFields" })
public abstract class AbstractReservation extends AbstractReservationBase implements IReservation {

    /** The account id. */
    private String accountId;

    /** The attendees. */
    private String attendees;

    /** The contact. */
    private String contact;

    /** The department id. */
    private String departmentId;

    /** The division id. */
    private String divisionId;

    /** The email. */
    private String email;

    /** The requested by. */
    private String requestedBy;

    /** The requested for. */
    private String requestedFor;

    /**
     * Parent ID when there is a recurrent reservation.
     */
    private Integer parentId;

    /** Conference call reservation identifier. */
    private Integer conferenceId;

    /** The phone. */
    private String phone;

    /**
     * The recurring rule is an XML format that describes the recurring type and settings.
     */
    private String recurringRule;

    /**
     * The occurrence index of this reservation in a recurring series.
     */
    private int occurrenceIndex;

    /** The reservation name. */
    private String reservationName;

    /**
     * The reservation type might be 'regular' or 'recurring'.
     */
    private String reservationType;

    /** The resource allocations. */
    private List<ResourceAllocation> resourceAllocations;

    /**
     * Unique ID for reservation used in MS Exchange.
     */
    private String uniqueId;

    /** The recurrence pattern for creating a recurring reservation. */
    private Recurrence recurrence;

    /** The recurring date modified. */
    private int recurringDateModified;

    /** Building id to use when no room nor resource allocations are in the reservation. */
    private String backupBuildingId;

    /** Comments in HTML format for Exchange. */
    private String htmlComments;

    /**
     * Instantiates a new abstract reservation.
     */
    public AbstractReservation() {
        super();
    }

    /**
     * Instantiates a new abstract reservation.
     *
     * @param reserveId the reserve id
     */
    public AbstractReservation(final Integer reserveId) {
        super(reserveId);
    }

    /**
     * Adds the resource allocation.
     *
     * @param resourceAllocation the resource allocation
     */
    public final void addResourceAllocation(final ResourceAllocation resourceAllocation) {
        if (this.resourceAllocations == null) {
            this.resourceAllocations = new ArrayList<ResourceAllocation>();
        }
        // setReservation makes sure the date of time values are set to 1899
        this.resourceAllocations.add(resourceAllocation);
        resourceAllocation.setReservation(this);
    }

    /**
     * Copy to. Only change attributes that are allowed when editing
     *
     * @param reservation the reservation
     * @param allowDateChange the allow date change
     * @return the abstract reservation
     */
    public final AbstractReservation copyTo(final AbstractReservation reservation,
            final boolean allowDateChange) {

        if (StringUtil.isNullOrEmpty(reservation.getCreatedBy())) {
            reservation.setCreatedBy(this.getCreatedBy());
        }
        if (reservation.getCreationDate() == null) {
            reservation.setCreationDate(new Date());
        }
        if (allowDateChange) {
            reservation.setStartDate(this.getStartDate());
            reservation.setEndDate(this.getEndDate());
        }
        reservation.setEndTime(this.getEndTime());
        reservation.setStartTime(this.getStartTime());
        reservation.setRequestedBy(this.getRequestedBy());
        reservation.setRequestedFor(this.getRequestedFor());
        reservation.setReservationName(this.reservationName);

        /*
         * Don't change the target reservation status. If required, the datasource will update the
         * status when saving changes.
         */
        if (StringUtil.isNullOrEmpty(reservation.getStatus())) {
            reservation.setStatus(this.getStatus());
        }
        reservation.setContact(this.contact);
        reservation.setComments(this.getComments());
        reservation.setCost(this.getCost());
        reservation.setAccountId(this.accountId);
        reservation.setDepartmentId(this.departmentId);
        reservation.setDivisionId(this.divisionId);
        reservation.setEmail(this.email);
        reservation.setPhone(this.phone);

        reservation.setUniqueId(this.uniqueId);
        reservation.setParentId(this.getParentId());
        reservation.setRecurringRule(this.getRecurringRule());
        reservation.setReservationType(this.getReservationType());

        reservation.setTimeZone(this.getTimeZone());
        reservation.setAttendees(this.getAttendees());

        return reservation;
    }

    /**
     * Gets the account id.
     *
     * @return the account id
     */
    public final String getAccountId() {
        return this.accountId;
    }

    /**
     *
     * Gets the attendees.
     *
     * @return the attendees
     *
     * @see com.archibus.reservation.domain.IReservation#getAttendees()
     */
    @Override
    public final String getAttendees() {
        return this.attendees;
    }

    /**
     * Gets the contact.
     *
     * @return the contact
     */
    public final String getContact() {
        return this.contact;
    }

    /**
     * Gets the department id.
     *
     * @return the department id
     */
    public final String getDepartmentId() {
        return this.departmentId;
    }

    /**
     * Gets the division id.
     *
     * @return the division id
     */
    public final String getDivisionId() {
        return this.divisionId;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final String getEmail() {
        return this.email;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final Integer getParentId() {
        return this.parentId;
    }

    /**
     * Gets the phone.
     *
     * @return the phone
     */
    public final String getPhone() {
        return this.phone;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final String getRecurringRule() {
        return this.recurringRule;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final String getReservationName() {
        return this.reservationName;
    }

    /**
     * Gets the reservation type.
     *
     * @return the reservation type
     */
    public final String getReservationType() {
        return this.reservationType;
    }

    /**
     * Gets the resource allocations.
     *
     * @return list of resource allocations
     *
     * @see com.archibus.reservation.domain.IReservation#getResourceAllocations()
     */
    @Override
    public final List<ResourceAllocation> getResourceAllocations() {
        if (this.resourceAllocations == null) {
            this.resourceAllocations = new ArrayList<ResourceAllocation>();
        }
        return this.resourceAllocations;
    }

    /**
     * Gets the unique id.
     *
     * @return unique id
     *
     * @see com.archibus.reservation.domain.IReservation#getUniqueId()
     */
    @Override
    public final String getUniqueId() {
        return this.uniqueId;
    }

    /**
     * Get the occurrence index.
     *
     * @return the occurrenceIndex
     */
    @Override
    public int getOccurrenceIndex() {
        return this.occurrenceIndex;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setOccurrenceIndex(final int occurrenceIndex) {
        this.occurrenceIndex = occurrenceIndex;
    }

    /**
     * Sets the account id.
     *
     * @param accountId the new account id
     */
    public final void setAccountId(final String accountId) {
        this.accountId = accountId;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final void setAttendees(final String attendees) {
        this.attendees = attendees;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setRecurrence(final Recurrence recurrence) {
        this.recurrence = recurrence;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Recurrence getRecurrence() {
        return this.recurrence;
    }

    /**
     * Get the conference reservation id.
     *
     * @return the conference reservation id
     */
    @Override
    public Integer getConferenceId() {
        return this.conferenceId;
    }

    /**
     * Set the conference reservation id.
     *
     * @param conferenceId the conference reservation id to set
     */
    public void setConferenceId(final Integer conferenceId) {
        this.conferenceId = conferenceId;
    }

    /**
     * Sets the contact.
     *
     * @param contact the new contact
     */
    public final void setContact(final String contact) {
        this.contact = contact;
    }

    /**
     * Sets the department id.
     *
     * @param departmentId the new department id
     */
    public final void setDepartmentId(final String departmentId) {
        this.departmentId = departmentId;
    }

    /**
     * Sets the division id.
     *
     * @param divisionId the new division id
     */
    public final void setDivisionId(final String divisionId) {
        this.divisionId = divisionId;
    }

    /**
     * Sets the email of the organizer.
     *
     * @param email the new email
     */
    public final void setEmail(final String email) {
        this.email = email;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final void setParentId(final Integer parentId) {
        this.parentId = parentId;
    }

    /**
     * Sets the phone.
     *
     * @param phone the new phone
     */
    public final void setPhone(final String phone) {
        this.phone = phone;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final void setRecurringRule(final String recurringRule) {
        this.recurringRule = recurringRule;
        if (StringUtil.notNullOrEmpty(recurringRule)) {
            this.setReservationType(Constants.TYPE_RECURRING);
        } else {
            this.setReservationType(Constants.TYPE_REGULAR);
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public final void setReservationName(final String reservationName) {
        this.reservationName = reservationName;
    }

    /**
     * Sets the reservation type.
     *
     * @param reservationType the new reservation type
     */
    public final void setReservationType(final String reservationType) {
        this.reservationType = reservationType;
    }

    /**
     * Sets the resource allocations.
     *
     * @param resourceAllocations the new resource allocations
     */
    public final void setResourceAllocations(final List<ResourceAllocation> resourceAllocations) {
        this.resourceAllocations = resourceAllocations;
    }

    /**
     * Sets the unique id.
     *
     * @param uniqueId the new unique id
     */
    @Override
    public final void setUniqueId(final String uniqueId) {
        this.uniqueId = uniqueId;
    }

    /**
     * Gets the requested by.
     *
     * @return requested by
     *
     * @see com.archibus.reservation.domain.IReservation#getRequestedBy()
     */
    @Override
    public final String getRequestedBy() {
        return this.requestedBy;
    }

    /**
     * Gets the requested for.
     *
     * @return requested for
     *
     * @see com.archibus.reservation.domain.IReservation#getRequestedFor()
     */
    @Override
    public final String getRequestedFor() {
        return this.requestedFor;
    }

    /**
     * Sets the requested by.
     *
     * @param requestedBy the new requested by
     */
    public final void setRequestedBy(final String requestedBy) {
        this.requestedBy = requestedBy;
    }

    /**
     * Sets the requested for.
     *
     * @param requestedFor the new requested for
     */
    public final void setRequestedFor(final String requestedFor) {
        this.requestedFor = requestedFor;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @XmlTransient
    public int getRecurringDateModified() {
        return this.recurringDateModified;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setRecurringDateModified(final int recurringDateModified) {
        this.recurringDateModified = recurringDateModified;
    }

    /**
     * Set the building id to be used when no resource allocations are linked.
     *
     * @param buildingId the building id to set
     */
    public void setBackupBuildingId(final String buildingId) {
        this.backupBuildingId = buildingId;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String determineBuildingId() {
        List<ResourceAllocation> allocations = ReservationUtils.getActiveResourceAllocations(this);
        if (allocations.isEmpty()) {
            // there are no active allocations, so check for inactive ones
            allocations = this.getResourceAllocations();
        }
        String building = null;
        if (allocations.isEmpty()) {
            building = this.backupBuildingId;
        } else {
            building = allocations.get(0).getBlId();
        }
        return building;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void setHtmlComments(final String htmlComments) {
        this.htmlComments = htmlComments;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @XmlTransient
    public String getHtmlComments() {
        return this.htmlComments;
    }

}
