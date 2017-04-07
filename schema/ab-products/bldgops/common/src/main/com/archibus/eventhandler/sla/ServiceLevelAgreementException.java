package com.archibus.eventhandler.sla;

import com.archibus.utility.ExceptionBase;

/** 
 * Exception class for SLA
 *
 */

public class ServiceLevelAgreementException extends ExceptionBase  {

	private static final long serialVersionUID = 1L;

	public ServiceLevelAgreementException(String message) {
		super(message);
	}
	
	public ServiceLevelAgreementException(String message, Throwable exception) {
		super(message, exception);
	}

}
