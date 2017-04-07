package com.archibus.eventhandler.steps;

import com.archibus.eventhandler.steps.StatusConverter;

import junit.framework.TestCase;

public class TestStatusConverter extends TestCase {

	public void testStatus(){
		
		assertEquals("Com", StatusConverter.getWorkRequestStatus("COMPLETED"));		
		assertEquals("COMPLETED", StatusConverter.getActionStatus("Com"));
		assertEquals("N/A",StatusConverter.getActionStatus(""));		 
		assertEquals("N/A",StatusConverter.getActionStatus(null));
		
	}
	
}
