package com.brg.eventhandler.pm;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.jobmanager.JobBase;
import com.archibus.jobmanager.JobManager;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.Utility;

/**
 * Generates Preventive Maintenance work orders and work requests.
 */
public class UCPMJob extends JobBase {
    private Logger log = Logger.getLogger(this.getClass());
    
    private String genWOJobId;
    
    public UCPMJob(String genWOJobId) {
    	this.genWOJobId = genWOJobId;
    }
    
    /**
     * Runs the work order generation process and post-processing.
     */
    public void run() {

        log.debug("UC Preventive Maintainence Processing Job Starting.");

        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
  
        // Wait until the Generate WO Job is complete
    	JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
    	this.status.setTotalNumber(100);
        while(true) {
            if (this.stopRequested) {
                this.status.setCode(JobStatus.JOB_STOP_REQUESTED);
                return;
            }
            
        	JobStatus genWoStatus = jobManager.getJobStatus(genWOJobId);
        	int jobCode = genWoStatus.getCode();
        	double genWoJobPct = 1;
        	if (genWoStatus.getTotalNumber() != 0) {
        		genWoJobPct = genWoStatus.getCurrentNumber()/(double)genWoStatus.getTotalNumber();
        	}
        	this.status.setCurrentNumber((long)(genWoJobPct*30));
        	if(jobCode == JobStatus.JOB_COMPLETE) {
                // Generate WO is complete, execute the post processing rules
                UCPMHandler ucPMHandler = new UCPMHandler();
                ucPMHandler.updateWrAcId(context);
                this.status.setCurrentNumber(50);               
                
                // Run the pmdd generator              
                try {
                	String pmsidRestriction = "";
            		if (context.parameterExistsNotEmpty("pmsidRestriction")) {
            			pmsidRestriction = (String) context.getParameter("pmsidRestriction");
            		}
                	
              		SimpleDateFormat dateFormat = new SimpleDateFormat();
                    dateFormat.applyPattern("yyyy-MM-dd");
            		
            		java.sql.Date dt = Utility.currentDate();
        	       // String current_date = formatSqlFieldValue(context, date, "java.sql.Date","current_date");
        			Date dateStart;
        			Date dateEnd;
                    
        			SimpleDateFormat yrFormat = new SimpleDateFormat("yyyy");
        			int mnth = dt.getMonth();
        			int yr = Integer.parseInt(yrFormat.format(dt));
        			String ds = Integer.toString(yr) + "-" + Integer.toString(mnth + 3) + "-01";
        			if (mnth == 10) {
        				ds = Integer.toString(yr + 1)  + "-01-01";
        			}
        			else if (mnth == 11) {
        				ds = Integer.toString(yr + 1)  + "-02-01";
        			}
        			else {
        				ds = Integer.toString(yr) + "-"  + Integer.toString(mnth + 3) + "-01";
        			}
        			dateStart =  dateFormat.parse((String) ds);
        			
        			String de = Integer.toString(yr + 1) + "-"  + Integer.toString(mnth + 1) + "-01";
        			dateEnd = dateFormat.parse((String) de);

        			boolean createFutureDates = true;
        			boolean RecreateDatesFromScratch = false;
        	        BRGPmScheduleGenerator generator = new BRGPmScheduleGenerator(dateStart, dateEnd,pmsidRestriction, createFutureDates,RecreateDatesFromScratch);

        	        //generator.run();
        	        jobManager.startJob(generator);
        	        
        	        /*
        	        // wait for the generator to stop or complete
        	        JobStatus pmddGenJobCode = generator.getStatus();
        	        while(pmddGenJobCode.getCode() == JobStatus.JOB_STARTED || pmddGenJobCode.getCode() == JobStatus.JOB_CREATED) {
        	        	double pmddGenJobPct = 1;
        	        	if (pmddGenJobCode.getTotalNumber() != 0) {
        	        		pmddGenJobPct = pmddGenJobCode.getCurrentNumber()/(double)pmddGenJobCode.getTotalNumber();
        	        	}
        	        	this.status.setCurrentNumber((long) (50+pmddGenJobPct*50));
            			log.info("Waiting on Generate PMDD Job for 10s.");     	        	
    					Thread.sleep(10000);
        	        	pmddGenJobCode = generator.getStatus();
        	        }
        	        */
                }
                catch (Exception e) {
                	// log error
               		log.error("The Generate PMDD Job failed.");
                }
                this.status.setCode(JobStatus.JOB_COMPLETE);
        		return;
        	}
        	else if (jobCode == JobStatus.JOB_CREATED || jobCode == JobStatus.JOB_STARTED) {
        		// we will wait 10 seconds
        		try {
        			log.info("Waiting on Generate PM Job for 10s.");
					Thread.sleep(10000);
				} catch (InterruptedException e) {
					// interrupted, we'll just continue.
				}
        	}
        	else {
        		log.error("The Generate PM Job did not complete successfully.  Aborting post-processing.");
        		return;
        	}
        }
    }
}
