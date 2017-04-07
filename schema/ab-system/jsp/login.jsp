<%@ page import="com.archibus.config.*" %>
<%@ page import="com.archibus.servlet.*" %>

<html>
<head>
<title>Test Login Java Server Page </title>

			<script language="JavaScript" src="..\javascript\common.js"> </script>
			<script language="JavaScript" src="login.js"> </script>

</head>
<body>

<form name="afmInputsForm">
UserName: <input type="text" name="vName" maxlenght="37" /><br/>
Password: <input type="password" name="vPassword" maxlenght="37" /><br/>
Your Session ID is:
<% 


String sessionID  = session.getId();
Object oContext = application.getContext("/archibus");
String APPLICATION_CONTEXT = "ApplicationContext";

application.setAttribute("ApplicationContextStore",oContext);

//String APPLICATION_CONTEXT_STORE_KEY = "ApplicationContextStore";
out.print(sessionID);

//		ApplicationContextStoreHttpImpl applicationContextStore = new ApplicationContextStoreHttpImpl(application);
//		servletContext.setAttribute(ApplicationContextStoreHttpImpl.APPLICATION_CONTEXT_STORE_KEY, applicationContextStore);







%>

<input type="hidden" name="hid" value="&lt;afmAction viewName=%22test-mdx-rm-1d-custom.axvw%22 type=%22login%22 response=%22true%22 state=%22StateFinish%22 request=%22login.axvw%22 frame=%22%22&gt;&lt;title translatable=%22true%22&gt;Guest Sign In&lt;/title&gt;&lt;target&gt;&lt;parameters/&gt;&lt;key name=%22login.axvw%22 context=%22com.archibus.config.ConfigManagerImpl-I-com.archibus.controller.ControllerLoginImpl-<%= sessionID %>%22 class=%22com.archibus.view.ViewImpl%22 xpath=%22/afmXmlView/afmTableGroup%22/&gt;&lt;/target&gt;&lt;/afmAction&gt;" />

<br/>

<script>
function test(f)
{

alert(f.hid.value);
}
</script>
<input type="button" name="signInButton" title="SignIn" value="Sign In" onclick='onLogin(this.form)'/>

</form>
			<form method="post" name="afmHiddenForm" style="margin:0">
				<input type="hidden" name="xml" value=""/>
			</form>

</body>
</html>