package com.archibus.app.solution.logiccookbook;

import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * Example event-handler class that shows how to implement long-running jobs.
 * <p>
 * The event-handler classes that implement jobs must extend the JobBase class.
 * 
 * @author Sergey Kuramshin
 * @author Valery Tydykov
 * 
 */
/**
 * Suppress PMD warnings "SystemPrintln", "AvoidPrintStackTrace" in this class.
 * <p>
 * Justification: This is a simplified example. Don't do this in production code.
 */
@SuppressWarnings({ "PMD.SystemPrintln", "PMD.AvoidPrintStackTrace" })
public class JobExampleHandlers extends JobBase {
    
    /**
     * Number of steps: 10.
     */
    private static final int NUMBER_OF_STEPS = 10;
    
    /**
     * Time to sleep: 1 second.
     */
    private static final int TIME_TO_SLEEP = 1000;
    
    /**
     * Total amount of work to be performed: 100.
     */
    private static final int TOTAL_WORK_UNITS = 100;
    
    /**
     * Example of an event-handler method that implements a long-running job.
     * <p>
     * Counts from 0 to 100, one increment per second.
     * <p>
     * This method can be called as a Job directly from the view using the the startJob command or
     * the Workflow.startJob() JavaScript method.
     */
    public void runCounter() {
        int counter = 0;
        
        this.status.setTotalNumber(TOTAL_WORK_UNITS);
        this.status.setResult(new JobResult("Percent counter example"));
        this.status.addProperty("myProperty", "myValue");
        
        while (!this.stopRequested && counter <= TOTAL_WORK_UNITS) {
            // sleep for 1 second
            // do not do this in production code!
            try {
                Thread.sleep(TIME_TO_SLEEP);
            } catch (final InterruptedException e) {
                // do not do this in production code!
                e.printStackTrace();
            }
            
            this.status.setCurrentNumber(counter);
            
            // the work is divided into 10 logical steps
            final int step = counter / NUMBER_OF_STEPS + 1;
            
            // in the beginning of each step
            if (counter % NUMBER_OF_STEPS == 0) {
                // if this is not the first step, update the last partial result for the
                // previous step
                if (step > 1) {
                    this.status.updateLastPartialResult(new JobResult("file " + (step - 1)
                            + " generated successfully", "", ""));
                }
                
                // add partial result for the new step
                if (counter < TOTAL_WORK_UNITS) {
                    this.status.addPartialResult(new JobResult("generating file " + step, "", ""));
                }
            }
            
            // don't do this in production code!
            System.out.println("Counter: " + counter);
            
            counter++;
        }
        
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
    
    /**
     * Example of an event-handler method that implements a long-running job.
     * <p>
     * Counts from 0 to 100, one increment per second.
     * <p>
     * This method can be called as a Job directly from the view using the the startJob command or
     * the Workflow.startJob() JavaScript method.
     * 
     * @param size Total amount of work to be performed.
     */
    public void runSimpleCounter(final int size) {
        int counter = 0;
        
        // initialize the progress indicator
        this.status.setTotalNumber(size);
        
        while (!this.stopRequested && counter <= size) {
            // sleep for 1 second
            // do not do this in production code!
            try {
                Thread.sleep(TIME_TO_SLEEP);
            } catch (final InterruptedException e) {
                // do not do this in production code!
                e.printStackTrace();
            }
            
            this.status.setCurrentNumber(counter++);
        }
        
        if (this.stopRequested) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
    }
}
