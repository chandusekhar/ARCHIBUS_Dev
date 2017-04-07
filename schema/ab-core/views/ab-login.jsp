<%@ taglib prefix="ab" uri="/WEB-INF/tld/ab-system.tld"%>
<%@ page contentType="text/html"%>

<ab:view>
	<ab:css file="/schema/ab-core/css/login.css" />

	<ab:js file="/schema/ab-core/views/ab-secure.js" />
	<ab:js file="/schema/ab-core/views/ab-login-locale.js" />
    <ab:js file="/schema/ab-core/views/ab-login-project.js" />
    <ab:js file="/schema/ab-core/views/ab-login-user.js" />

	<ab:message name="language_label_text">Sign-in Page Language:</ab:message>
	<ab:message name="project_label_text">Project:</ab:message>
    <ab:message name="project_message_text">Select a project:</ab:message>
	<ab:message name="signin_label_text">Sign In</ab:message>
	<ab:message name="signin_message_text">Sign in to your personalized list of activities and join the collaboration now.</ab:message>
	<ab:message name="signin_button_text">Sign In</ab:message>
	<ab:message name="username_label_text">Enter your user name (case-sensitive):</ab:message>
    <ab:message name="username_label_text_insensitive">Enter your user name (case-insensitive):</ab:message>
	<ab:message name="password_label_text">Enter your password (case-sensitive):</ab:message>
    <ab:message name="password_label_text_insensitive">Enter your password (case-insensitive):</ab:message>

	<ab:message name="send_password_control_text">I forgot my password.</ab:message>
	<ab:message name="password_email_request">Request New Password?</ab:message>
	<ab:message name="password_email_sent">A password notification has been requested.</ab:message>
	<ab:message name="error_send_password">Could not request password notification. You will need to contact your administrator.</ab:message>

	<ab:message name="remember_message_text">Remember my user name on this computer</ab:message>
	<ab:message name="guest_label_text">Be Our Guest</ab:message>
	<ab:message name="guest_message_text">If you don&apos;t have an account, use this selection to access your site&apos;s guest activities.</ab:message>
    <ab:message name="guest_button_text">Guest Sign In</ab:message>
	<ab:message name="error_username_empty">You must enter a user name</ab:message>
	<ab:message name="error_password_empty">You must enter a password</ab:message>
	<ab:message name="evaluation_license_label_text">This is a limited time version of ARCHIBUS. Days left on your license:</ab:message>

	<ab:panel id="login_panel" type="html">
		<ab:html>
			<div class="loginContainer"></div> <!-- contains the css background-image to prevent a scroll -->
			<!-- TITLE BAR -->
			<table class="loginToolbar">
				<tr><td style="padding-left: 12px; padding-top: 4px">
					    <img src="/archibus/schema/ab-core/graphics/ab-icon-afm-title-main.png" alt="ARCHIBUS logo"
						     onclick='if (View.isDevelopmentMode) View.onLogger(); else window.open("http://www.archibus.com")' />
	                </td>
	                <td style="width: 100%; text-align: right; padding-right: 4px">
	                    <label for="language_selector"><span id="language_label">Sign-in Page Language:</span></label>
	                    <select id="language_selector" title="Choose Language" class="inputField_box" tabindex="50"><!--  --></select>
	                </td>
				</tr>
			</table>

			<!-- logos: not displayed unless display attribute set to 'block' in css class -->
            <img class="graphic_afm_logo" src="/archibus/schema/ab-system/graphics/ab-login-afm-logo.gif" alt="ARCHIBUS"/>
	        <img class="graphic_user_logo" src="/archibus/schema/ab-system/graphics/ab-login-user-logo.gif" alt="COMPANY"/>

	        <div id="project_form" class="project_selector">
	            <span label for="project_selector" id="project_label" class="textBasic textTitle"><!--  --></span>
	            <span id="project_name"><!--  --></span>
	        </div>
		
			<!-- text and form for login block -->
			<p class="login_block">
				<div id="signin_label" class="textBasic textTitle signin_label">Sign In</div>
				<div id="signin_message" class="textBasic signin_text">Sign in to your personalized list of activities and join the collaboration now.</div>
				<!-- To avoid a focus delay turn off the following block now. Then turn it on via the last line in ab-login-user.js -->
				<div id="login_form" class="login_form" style="display: none">  
			        <label for="username_input"><div id="username_label" class="textBasic textTitle">Enter your user name:</div></label>
		            <input class="login_textBox" type="text" title="Enter Username" id="username_input" size="37" onchange="handleUsername(); " tabindex="100"/>
			        <label for="password_input"><div id="password_label" class="textBasic textTitle" style="margin-top:8px;">Enter your password:</div></label>
			        <input class="login_textBox" type="password" title="Enter Password" id="password_input" size="37" onchange="handlePassword();" tabindex="200"/>
		        </div>
				<a id="send_password_control" class="textBasic forgot_title" title="Click here to request a new password">I forgot my password.</a>
				<input id="signin_button" type="button" title="Submit to Sign In" accesskey="S" class="formButton user_signin" value="Sign In" tabindex="300"/>
				<input id="remember_username" type="checkbox" title="Remember Username" class="rememberCheck" tabindex="400" />
				<label for="remember_username"><div id="remember_message" class="textBasic remember_text">Remember my user name on this computer</div></label>
			</p>

			<div class="login_guest">
				<div id="guest_label" class="textBasic textTitle">Be Our Guest</div>
			    <div id="guest_message" class="textBasic" style="margin-top: 8px">If you don't have an account, use this selection to access your site's guest activities.</div>
			    <input id="guest_button" type="button" title="Submit for Guest Sign In" name="guestIn" accesskey="G" class="formButton guest_signin" value="Guest Sign In" tabindex="500"/>
			    <div class="textBasic" id="evaluation_license_wrapper" style="margin-top: 8px">
                    <span id="evaluation_license_label">This is a limited time version of ARCHIBUS. Days left on your license:</span>
                    <span id="evaluation_license_message">{0}</span>
			    </div>
			</div>
		</ab:html>
	</ab:panel>
</ab:view>