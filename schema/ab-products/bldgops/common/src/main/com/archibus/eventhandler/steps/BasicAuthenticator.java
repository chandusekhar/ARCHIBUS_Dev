package com.archibus.eventhandler.steps;

import javax.mail.Authenticator;
import javax.mail.PasswordAuthentication;

public class BasicAuthenticator extends Authenticator {

    private String userName;
    private String password;
     
    public BasicAuthenticator(String password, String userName) {
		super();
		this.password = password;
		this.userName = userName;
    } 
    
    protected PasswordAuthentication getPasswordAuthentication() {
    	return new PasswordAuthentication(userName, password); 
    } 
}
