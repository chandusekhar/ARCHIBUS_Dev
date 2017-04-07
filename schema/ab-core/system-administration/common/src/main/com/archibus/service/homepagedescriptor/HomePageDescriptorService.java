package com.archibus.service.homepagedescriptor;

import java.util.Map;

import org.json.JSONObject;

import com.archibus.datasource.data.DataSetList;

/**
 * Service for Home Page Descriptor as used initially in the Home Page Editor application.
 *
 * @author Steven Meyer
 */
public interface HomePageDescriptorService {
    /**
     * Return the home page descriptor and its filename, query is keyed by either the file name or
     * the PK of an afm_processes record (activity_id + process_id) whose dashboard_view gives the
     * file name.
     *
     * @param activityId Part of the PKey to a process record, afm_processes.activity_id.
     * @param processId Part of the PKey to a process record, afm_processes.process_id.
     * @param fileName The file name of a descriptor in the ab-products directory tree.
     * @return JSON Object holding the descriptor XML and the filename.
     */
    JSONObject getPageDescriptorFile(String activityId, String processId, String fileName);

    /**
     * Write the home page descriptor to the file system. There is no interaction with the dB.
     *
     * @param fileName The file name of a descriptor in the ab-products directory tree.
     * @param descriptorXml Unformatted XML string describing the home page layout and content.
     */
    void savePageDescriptorFile(String fileName, String descriptorXml);

    /**
     * Duplicate the named home page descriptor file and create a new home page process record in
     * afm_processes.
     *
     * @param parameters Map holding field values for the new afm_processes record.
     */
    void copyPageDescriptorFile(final Map<String, String> parameters);

    /**
     * Create new afm_ptasks records (copied from another process) assigning them to a new or
     * modified process.
     *
     * @param taskRecords DataRecords of afm_ptasks keys to transfer to new/other process.
     */
    void saveTransferredTaskRecords(DataSetList taskRecords, final Map<String, String> parameters);

    /**
     * Create the afm_roleprocs record associating a home page process to the current user's role.
     *
     * @param parameters Map holding field values for the new record.
     */
    void createRoleProcsRecord(final Map<String, String> parameters);
}