package com.archibus.eventhandler.steps.roles;

import java.util.List; 

import com.archibus.jobmanager.EventHandlerContext;

/**
 * Interface to implement for a class to lookup helpdesk roles used in the steps.<br />
 * This class has only 1 method getList which returns a list of employees in the given role.
 *
 */
public interface HelpdeskRoleLookup {
	
	/**
	 * Get a list of employees with a role
	 * @return List of employees
	 */
	public List getList(EventHandlerContext context);
	

}
