package com.archibus.service.cost;

import java.util.*;

import com.archibus.jobmanager.JobStatus;

/**
 * 
 * Utility class to handle job status.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public final class JobStatusUtil {
    
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private JobStatusUtil() {
        
    }
    
    /**
     * Check is user requested to stop the job. Return true if job execution can continue and false
     * if job should stop.
     * 
     * @param status job status
     * @return boolean
     */
    public static boolean checkJobStatus(final JobStatus status) {
        boolean result = true;
        if (status.isStopRequested()) {
            status.setCode(JobStatus.JOB_STOP_REQUESTED);
            status.setCurrentNumber(status.getTotalNumber());
            result = false;
        }
        return result;
    }
    
    /**
     * Increment job status current number.
     * 
     * @param status job status
     * @param increment increment value
     */
    public static void incrementJobCurrentNo(final JobStatus status, final long increment) {
        status.setCurrentNumber(status.getCurrentNumber() + increment);
    }
    
    /**
     * Initialize job status.
     * 
     * @param status job status
     * @param totalNo total number
     * @param currentNo current number
     */
    public static void initializeJob(final JobStatus status, final long totalNo,
            final long currentNo) {
        status.setTotalNumber(totalNo);
        status.setCurrentNumber(currentNo);
    }
    
    /**
     * End job.
     * 
     * @param status job status
     */
    public static void completeJob(final JobStatus status) {
        status.setCurrentNumber(status.getTotalNumber());
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Add property to job status.
     * 
     * @param status job status
     * @param name property name
     * @param value property value
     */
    public static void addProperty(final JobStatus status, final String name, final String value) {
        String currentValue = "";
        if (status.getProperties().containsKey(name)) {
            currentValue = status.getProperties().get(name);
        }
        currentValue += "<br/>" + value;
        status.addProperty(name, currentValue);
    }
    
    /**
     * Add property to job status.
     * 
     * @param status status
     * @param name property name
     * @param values list with property values
     */
    public static void addProperty(final JobStatus status, final String name,
            final List<String> values) {
        final Iterator<String> itValues = values.iterator();
        while (itValues.hasNext()) {
            final String crtValue = itValues.next();
            addProperty(status, name, crtValue);
        }
    }
    
}
