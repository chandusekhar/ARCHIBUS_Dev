package com.archibus.eventhandler.compliance;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.StringUtil;

/**
 * Helper Classes for Compliance Event related business logic.
 * 
 * 
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceEventFiller {
    
    /**
     * boolean sign indicate if generated event contains date_scheduled is earlier than today.
     * 
     */
    private boolean hadPastDate;
    
    /**
     * Date represents 'today' without hour, minute, seconds, millisecond.
     */
    private final Date today;
    
    /**
     * Constructor.
     * 
     */
    public ComplianceEventFiller() {
        
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        this.today = (Date) calendar.getTime().clone();
        
    }
    
    /**
     * Fill necessary values to empty fields of event from requirement record.
     * 
     * @param requirement Compliance Requirement Record
     * @param program Compliance Program Record
     * @param event Compliance Event Record(activity_log)
     */
    public void fillRequirementInfoToEvent(final DataRecord requirement, final DataRecord program,
            final DataRecord event) {
        // action_title = regrequirement.event_title (if null then summary, else reg_requirement);
        String eventTitle = requirement.getString("regrequirement.event_title");
        if (StringUtil.isNullOrEmpty(eventTitle)) {
            eventTitle = requirement.getString("regrequirement.summary");
        }
        if (StringUtil.isNullOrEmpty(eventTitle)) {
            eventTitle = requirement.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT);
        }
        event.setValue("activity_log.action_title", eventTitle);
        
        // manager = regrequirement.em_id;
        event.setValue("activity_log.manager", requirement.getString("regrequirement.em_id"));
        
        // description = regrequirement.description;
        event.setValue("activity_log.description",
            requirement.getString("regrequirement.description"));
        
        // status = SCHEDULED?
        event.setValue("activity_log.status", "SCHEDULED");
        
        // vn_id = regrequirement.vn_id;
        event.setValue("activity_log.vn_id", requirement.getString("regrequirement.vn_id"));
        
        // contact_id = regrequirement.contact_id;
        event.setValue("activity_log.contact_id",
            requirement.getString("regrequirement.contact_id"));
        
        // hcm_labeled = 0;
        event.setValue("activity_log.hcm_labeled", 0);
        
        // project_id = regprogram.project_id;
        event.setValue("activity_log.project_id", program.getString("regprogram.project_id"));
        
        // comments = regrequirement.hold_reason;
        event
            .setValue("activity_log.comments", requirement.getString("regrequirement.hold_reason"));
        
        // construct and fill Satisfaction Notes to event
        fillSatisfactionNotes(event, requirement);
    }
    
    /**
     * Fill basic values to empty fields of event from requirement record.
     * 
     * @param requirement Compliance Requirement Record
     * @param event Compliance Event Record(activity_log)
     */
    public void fillBasicInfoToEvent(final DataRecord requirement, final DataRecord event) {
        // fill basic information
        event.setValue(Constant.ACTIVITY_LOG_REGULATION,
            requirement.getString(Constant.REGREQUIREMENT_REGULATION));
        event.setValue(Constant.ACTIVITY_LOG_REG_PROGRAM,
            requirement.getString(Constant.REGREQUIREMENT_REG_PROGRAM));
        event.setValue(Constant.ACTIVITY_LOG_REG_REQUIREMENT,
            requirement.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT));
        event.setValue("activity_log.activity_type", "COMPLIANCE - EVENT");
    }
    
    /**
     * Fill calculated data field values to empty fields of event.
     * 
     * @param requirement Compliance Requirement Record
     * @param date single date
     * @param event Compliance Event Record(activity_log)
     */
    public void fillDateValuesToEvent(final DataRecord requirement, final Date date,
            final DataRecord event) {
        // fill date fields: date_required = nextDate;
        final Date dateRequired = (Date) date.clone();
        event.setValue("activity_log.date_required", dateRequired);
        
        // date_scheduled_end = nextDate ?regrequirement.event_sched_buffer
        date.setTime(date.getTime()
                - requirement.getInt(Constant.REGREQUIREMENT_EVENT_SCHED_BUFFER)
                * Constant.MILLSECONDS);
        final Date dateScheduledEnd = (Date) date.clone();
        event.setValue("activity_log.date_scheduled_end", dateScheduledEnd);
        
        // date_scheduled = nextDate ?regrequirement.event_sched_buffer ?event_duration -+ 1
        int eventDuration = requirement.getInt("regrequirement.event_duration");
        if (eventDuration > 0) {
            eventDuration = eventDuration - 1;
        } else {
            eventDuration = 0;
        }
        date.setTime(date.getTime() - eventDuration * Constant.MILLSECONDS);
        event.setValue("activity_log.date_scheduled", date);
        
        if (date.before(this.today)) {
            this.hadPastDate = true;
        }
        
    }
    
    /**
     * fill location related values from regloc to event.
     * 
     * @param location compliance_locations record
     * @param event activity log record
     */
    public void fillRegLocInformationToEvent(final DataRecord location, final DataRecord event) {
        
        if (location != null && event != null) {
            event.setValue("activity_log.location_id",
                location.getValue("compliance_locations.location_id"));

            event.setValue("activity_log.site_id",
                location.getValue("compliance_locations.site_id"));
            event.setValue("activity_log.pr_id", location.getValue("compliance_locations.pr_id"));
            event.setValue("activity_log.bl_id", location.getValue("compliance_locations.bl_id"));
            event.setValue("activity_log.fl_id", location.getValue("compliance_locations.fl_id"));
            event.setValue("activity_log.rm_id", location.getValue("compliance_locations.rm_id"));
            event.setValue("activity_log.eq_id", location.getValue("compliance_locations.eq_id"));            
        }
        
    }
    
    /**
     * Copy the following regrequirement fields into activity_log.satisfaction_notes field in the
     * given format (i.e. include the field titles as shown below, one per line. This is used to
     * archive critical information in case regulation, program, or requirement are deleted in the
     * future
     * 
     * @param event activity_log record
     * @param requirement regrequirement record
     */
    public void fillSatisfactionNotes(final DataRecord event, final DataRecord requirement) {
        
        if (requirement != null && event != null) {
            
            final StringBuilder notes = new StringBuilder();
            
            // Regulation: regrequirement.regulation
            notes.append("Regulation:").append(
                requirement.getString(Constant.REGREQUIREMENT_REGULATION));
            // Program Code: regrequirement.reg_program
            notes.append(Constant.ENTER).append("Program Code:")
                .append(requirement.getString(Constant.REGREQUIREMENT_REG_PROGRAM));
            // Requirement Code: regrequirement.reg_requirement
            notes.append(Constant.ENTER).append("Requirement Code:")
                .append(requirement.getString(Constant.REGREQUIREMENT_REG_REQUIREMENT));
            // Requirement Type: regrequirement.reg_type
            notes.append(Constant.ENTER).append("Requirement Type:")
                .append(requirement.findField("regrequirement.regreq_type").getLocalizedValue());
            // Requirement Priority: regrequirement.priority
            notes.append(Constant.ENTER).append("Requirement Priority:")
                .append(requirement.findField("regrequirement.priority").getLocalizedValue());
            // Requirement Compliance Level: regrequirement.comp_level
            notes.append(Constant.ENTER).append("Requirement Compliance Level:")
                .append(requirement.getString("regrequirement.comp_level"));
            // Requirement Status: regrequirement.status
            notes.append(Constant.ENTER).append("Requirement Status:")
                .append(requirement.findField("regrequirement.status").getLocalizedValue());
            
            event.setValue("activity_log.satisfaction_notes", notes.toString());
        }
        
    }
    
    /**
     * Fill some field values to event record from Compliance Requirement record.
     * 
     * @param regulation Compliance Regulation ID
     * @param program Compliance Program ID
     * @param requirement Compliance Requirement ID
     * @param event record
     * 
     */
    public void fillRequirementInfoToEvent(final String regulation, final String program,
            final String requirement, final DataRecord event) {
        
        final DataRecord regRequirement =
                ComplianceUtility.getDataSourceRequirement().getRecord(
                    "  regrequirement.reg_requirement= '" + requirement
                            + "'  and regrequirement.regulation='" + regulation
                            + "'  and regrequirement.reg_program='" + program + "'    ");
        
        final DataRecord regProgram =
                ComplianceUtility.getDataSourceProgram().getRecord(
                    "  regprogram.regulation= '" + regulation + "'  and regprogram.reg_program='"
                            + program + "'     ");
        
        if (regRequirement != null && regProgram != null) {
            
            this.fillRequirementInfoToEvent(regRequirement, regProgram, event);
            
            // set return result
            final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
            context.setResponse(event);
        }
    }
    
    /**
     * Getter for the hadPastDate property.
     * 
     * @see hadPastDate
     * @return the hadPastDate property.
     */
    public boolean isHadPastDate() {
        return this.hadPastDate;
    }
    
}
