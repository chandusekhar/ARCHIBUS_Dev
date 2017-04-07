package com.archibus.service.space.future;

import java.io.Serializable;
import java.util.*;

import com.archibus.service.space.AssignmentObject;

/**
 * <p>
 * Helper Class for compare arrayList by start date desc.<br>
 * 
 */
public final class SpaceFutureTransactionSortProcess implements Comparator<AssignmentObject>,
        Serializable {
    
    /**
     * Property: serialVersionUID.
     */
    private static final long serialVersionUID = 1L;
    
    /**
     * @inherit.
     * 
     * @param obj1 DataRecord objec1
     * @param obj2 DataRecord objec2
     * @return int result
     */
    public int compare(final AssignmentObject obj1, final AssignmentObject obj2) {
        
        int result = 0;
        // Retrieve parameters come from JS client
        final Date dateStart1 = obj1.getRoomTransaction().getDateStart();
        final Date dateStart2 = obj2.getRoomTransaction().getDateStart();
        if (dateStart2.after(dateStart1)) {
            result = 1;
        }
        
        return result;
    }
}