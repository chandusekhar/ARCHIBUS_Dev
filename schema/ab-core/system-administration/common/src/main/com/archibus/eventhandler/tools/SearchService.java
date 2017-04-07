package com.archibus.eventhandler.tools;

import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.*;
import com.archibus.utility.*;

/**
 * Service for Search actions, such as searchForStringInFiles.
 *
 * @author Emily Dich
 */
public class SearchService extends JobBase implements com.archibus.utility.ThreadLocal {
    /**
     * Logger.
     */
    private final Logger log = Logger.getLogger(this.getClass());
    
    /**
     * Search for a given string ('parseFloat') in .js files.
     *
     * @param searchString Search string.
     */
    public void searchForString(final String searchString) {
        ContextStore.get();
        final SearchStringInFiles search = new SearchStringInFiles();
        
        // get all task records
        final String[] fieldNames = { "task_file" };
        final DataSource tasksDataSource =
                DataSourceFactory.createDataSourceForFields("afm_ptasks", fieldNames);
        final List<DataRecord> taskRecords = tasksDataSource.getAllRecords();
        
        // set the total number of steps
        this.status.setTotalNumber(taskRecords.size());
        
        // for each task
        for (int i = 0; i < taskRecords.size(); i++) {
            // for (int i = 150; i < 200; i++) {
            
            // a long run job should be stoppable
            if (this.status.isStopRequested()) {
                this.status.setCode(JobStatus.JOB_STOPPED);
                break;
            }
            
            final DataRecord taskRecord = taskRecords.get(i);
            
            this.log.info("Examining view " + i + " out of " + taskRecords.size());
            
            final String taskFile = taskRecord.getString("afm_ptasks.task_file");
            final String application = taskRecord.getString("afm_ptasks.activity_id");
            
            if (StringUtil.notNullOrEmpty(taskFile) && (taskFile.endsWith(".axvw"))) {
                try {
                    final String taskFilePath = search.findFile(taskFile);
                    
                    // add master properties
                    search.masterViews.add(taskFile);
                    search.addMaster(taskFile, taskFilePath, application);
                    
                    // search for dependent files
                    search.searchForDependentFiles(taskFilePath, taskFile);
                } catch (final ExceptionBase e) {
                    this.log.info(taskFile + " does not exist.");
                }
            }
            
            // update status
            this.status.setCurrentNumber(i);
        }
        
        // search for string in JS files
        search.processFiles(searchString);
        
        // write results
        search.writeResults();
    }
}
