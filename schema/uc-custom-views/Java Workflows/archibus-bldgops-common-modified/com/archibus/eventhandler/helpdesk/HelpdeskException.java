package com.archibus.eventhandler.helpdesk;

import com.archibus.utility.ExceptionBase;

/**
 * 
 * Exception class for Helpdesk
 *
 */

public class HelpdeskException extends ExceptionBase  {

	private static final long serialVersionUID = 1L;
	
	/**
	 * 
	 * 
	 * @param message
	 * @param args
	 */
	public HelpdeskException(String message, Object[] args) {
		this.setPattern(message);
		this.setTranslatable(true);
		this.setArgs(args);		
	}

	/**
	 * 
	 * 
	 * @param message
	 */
	public HelpdeskException(String message) {

		/*
		 * 
		 * final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(errorMsgDeptContactInvalid);
            exception.setTranslatable(true);
            final Object[] args = {dept_contact};
            exception.setArgs(args);
			throw exception;
		 * 
		 */
		super(message);
		// this.setTranslatable(true);
	}
	
	public HelpdeskException(String message, Throwable exception) {
		super(message, exception);
	}

}
