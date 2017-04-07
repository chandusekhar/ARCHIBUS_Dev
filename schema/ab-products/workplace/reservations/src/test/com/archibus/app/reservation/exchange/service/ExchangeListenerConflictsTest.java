package com.archibus.app.reservation.exchange.service;

import java.util.*;

import com.archibus.app.reservation.domain.RoomReservation;
import com.archibus.app.reservation.service.RecurrenceService;
import com.archibus.datasource.data.DataRecord;

/**
 * Test the Exchange Listener with conflicts on some occurrences.
 * @author Yorik Gerlo
 * <p>
 * Suppress warning "PMD.TestClassWithoutTestCases".
 * <p>
 * Justification: this is a subclass, the generic test cases are in the base class
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class ExchangeListenerConflictsTest extends ExchangeListenerTestBase {
    
    /**
     * Set up a recurring meeting in the database and on the calendar.
     * 
     * @return the list of created reservations (in building time)
     */
    protected List<RoomReservation> setupRecurringMeeting() {
        DataRecord reservation = this.reservationDataSource.createNewRecord();
        reservation = createReservation(reservation, true);
        // First block out some occurrences by creating separate reservations for occurrences 0, 2 and 4.
        final List<Date> dateList =
                RecurrenceService.getDateList(reservation.getDate(RESERVE_DATE_START),
                    reservation.getDate(RESERVE_DATE_END),
                    reservation.getString("reserve.recurring_rule"));
        
        for (int i = 0; i < dateList.size(); i += 2) {
            reservation = createReservation(this.reservationDataSource.createNewRecord(), false);
            reservation.setValue(RESERVE_DATE_START, dateList.get(i));
            reservation.setValue(RESERVE_DATE_END, dateList.get(i));
            this.roomReservationService.saveRoomReservation(reservation, createRoomAllocation(), null, null);
        }
        return super.setupRecurringMeeting();
    }
    
}
