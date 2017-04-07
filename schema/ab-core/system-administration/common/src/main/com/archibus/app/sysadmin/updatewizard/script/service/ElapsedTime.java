package com.archibus.app.sysadmin.updatewizard.script.service;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 *
 * Provides functionalities for Elapsed time in russing a script. Used in "DUW - Run Script"
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public final class ElapsedTime {
    
    /**
     * Start time.
     */
    private long starts;
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ElapsedTime() {
        reset();
    }
    
    /**
     *
     * Constructor.
     *
     * @return new instance for ElapsedTime object.
     */
    public static ElapsedTime start() {
        return new ElapsedTime();
    }
    
    /**
     *
     * Resets the start.
     *
     * @return the current ElapsedTime object.
     */
    public ElapsedTime reset() {
        this.starts = System.currentTimeMillis();
        return this;
    }
    
    /**
     *
     * get the time.
     *
     * @return time
     */
    public long time() {
        final long ends = System.currentTimeMillis();
        return ends - this.starts;
    }
    
    /**
     *
     * Returns time.
     *
     * @param unit time unit
     * @return time
     */
    public long time(final TimeUnit unit) {
        return unit.convert(time(), TimeUnit.MILLISECONDS);
    }

    /**
     *
     * GetTimestamp.
     *
     * @return time stamp in string format.
     */
    public static String getCurrentTimestamp() {
        return "["
                + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss,SSS", Locale.getDefault())
                    .format(Calendar.getInstance().getTime()) + "] ";
    }
}
