<%@ taglib prefix="ab" uri="/WEB-INF/tld/ab-system.tld"%>
<%@ page contentType="text/html"%>

<ab:view>
    <ab:css file="/schema/ab-core/views/sign-in/ab-sign-in.css" />

    <ab:js file="/schema/ab-core/views/ab-secure.js" />
    <ab:js file="/schema/ab-core/views/sign-in/ab-sign-in.js" />
    <ab:js file="/schema/ab-core/views/sign-in/ab-sign-in-locale.js" />

    <ab:message name="project_label_text">Project:</ab:message>
    <ab:message name="project_message_text">Select a project:</ab:message>
    <ab:message name="signin_button_text">Sign In</ab:message>
    <ab:message name="username_label_text">Enter your user name (case-sensitive)</ab:message>
    <ab:message name="username_label_text_insensitive">Enter your user name (case-insensitive)</ab:message>
    <ab:message name="password_label_text">Enter your password (case-sensitive)</ab:message>
    <ab:message name="password_label_text_insensitive">Enter your password (case-insensitive)</ab:message>

    <ab:message name="send_password_control_text">I forgot my password</ab:message>
    <ab:message name="password_email_request_text">Request administrator to reset your password?</ab:message>
    <ab:message name="lost_password_y_button_text">Yes</ab:message>
    <ab:message name="lost_password_n_button_text">No</ab:message>
        
    <ab:message name="password_email_sent">A password notification has been requested.</ab:message>
    <ab:message name="error_send_password">Could not request password notification. You will need to contact your administrator.</ab:message>

    <ab:message name="remember_message_text">Remember my username&lt;br&gt;on this computer</ab:message>
    <ab:message name="guest_button_text">Sign in as &ldquo;guest&rdquo;</ab:message>
    <ab:message name="error_username_empty">You must enter a user name</ab:message>
    <ab:message name="error_password_empty">You must enter a password</ab:message>
    <ab:message name="evaluation_license_label_text">This is a time-limited version of ARCHIBUS.&lt;br&gt;Days left on your license: {0}</ab:message>
    <ab:message name="language_label_text">Select your language:</ab:message>
    
    <ab:panel id="login_panel" type="html">
    <ab:html>
        <div id="loginContainer" class="loginContainer"></div> <!-- contains the css background-image to prevent a scroll -->
        
        <div class="logo"></div>

        <div class="loginDialog">
            <div class="main">
            <div id="login_form" class="loginForm">
                <ol>
                    <li>
                        <label id="project_label" for="project_input">Project:</label>
                        <div class="dropdown">
                            <select id="project_input" class="loginControl">
                            </select>
                        </div>
                    </li>
                    <li>
                        <input class="loginTextBox loginControl" id="username_input" type="text" onchange="handleUsername(); " tabindex="100"/>
                        <div class="inputHint" id="username_label">Usernames are not case-sensitive</div>
                    </li>
                    <li>
                        <input class="loginTextBox loginControl" id="password_input" type="password" onchange="handlePassword();" tabindex="200"/>
                        <div class="inputHint" id="password_label">Case-sensitive</div>
                    </li>
                </ol>                        
                <div class="signInContainer">
                    <input class="loginDialogButton loginControl" id="signin_button" type="button" title="Sign In" accesskey="S" value="Sign In" tabindex="300"/>
                </div>
            </div>
            </div>
            
            <div class="misc">
                <div class="misc-inner">
                    <div class="right-side">
                        <input type="checkbox" id="remember_username">
                            <div style="display:inline-block; vertical-align: top; color: #e6e9eb;" id="remember_message">Remember my username<br>on this computer</div>
                        </input>
                    </div>

                    <div class="left-side">
                    
                        <a id="send_password_control" onClick="showBlock('lostPasswordCallout'); hideBlock('changeLocaleCallout');">I forgot my password</a>
                        
                        <div class="callout" id="lostPasswordCallout">
                            <div style="display:block; padding-bottom: 10px;" id="password_email_request">
                                Request administrator to reset your password?
                            </div>
                            <div>
                                <input class="loginDialogButton loginControl" id="lost_password_y_button" type="button" title="Yes" accesskey="Y" value="Yes" tabindex="400" onClick="hideBlock('lostPasswordCallout');"/>
                                <input class="loginDialogButton loginControl" id="lost_password_n_button" type="button" title="No" accesskey="N" value="No" tabindex="500"  onClick="hideBlock('lostPasswordCallout');"/>
                            </div>
                            
                            <div class="closeX">
                                <a onClick="hideBlock('lostPasswordCallout');">
                                    <img src="/archibus/schema/ab-core/views/sign-in/close-x.png">
                                </a>
                            </div>
                            <div class="calloutTriangle"></div>
                        </div>

                        <a id="guest_button">Sign in as &ldquo;guest&rdquo;</a>
                        
                        <a id="localizeLink" class="localizeLink">
                            <img class="localizeFlag" src="/archibus/schema/ab-core/graphics/icons/flags/US.png">
                            <span>English</span>
                        </a>
                        
                        <div class="callout" id="changeLocaleCallout">
                            <div style="display:block; padding-bottom: 10px;" id="language_label">Select your language:</div>

                            <div id="localeList">
                            </div>
                            
                            <div class="closeX">
                                <a onClick="hideBlock('changeLocaleCallout');">
                                    <img src="/archibus/schema/ab-core/views/sign-in/close-x.png">
                                </a>
                            </div>
                            <div class="calloutTriangle"></div>
                        </div>

                    </div>
                    
                    <div style="clear:both;"></div>
                    <div class="bottom" id="evaluation_license_label">
                        This is a time-limited version of ARCHIBUS.<br>Days left on your license:
                    </div>
                </div>
            </div>
        </div>
    </ab:html>
    </ab:panel>
</ab:view>
