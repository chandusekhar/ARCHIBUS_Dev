package com.archibus.app.hoteling.service.mobile.impl;

import java.text.*;
import java.util.*;

/**
 * 
 * Utility class. Provides methods related with data sources for Workplace Services Portal mobile
 * services, Reservations module.
 * 
 * @author Cristina Moldovan
 * @since 21.2
 * 
 */
public class DateAndTimeUtilities {
    /**
     * Date formatter.
     */
    protected final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd",
        Locale.ENGLISH);
    
    /**
     * Default constructor.
     */
    DateAndTimeUtilities() {
        // default constructor
    }
    
    /**
     * Create a time object representing the given time string.
     * 
     * @param formattedDate the time as yyyy-MM-dd
     * @return the date object
     * @throws ParseException when the parameter is an invalid date
     */
    protected Date createDate(final String formattedDate) throws ParseException {
        return new Date(this.dateFormatter.parse(formattedDate).getTime());
    }
}
