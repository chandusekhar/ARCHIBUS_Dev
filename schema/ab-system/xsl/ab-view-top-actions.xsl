<?xml version="1.0"?>
<!-- which called by Java to handle actions frame in top of each regular view -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="constants.xsl" />

	<xsl:template match="/">
		<html lang="EN">
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<!-- linking path must be related to the folder in which xml is being processed -->
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't remove whitespace, otherwise, Xalan will generate <script .../> instead of <script ...></script> -->
			<!-- <script .../> is not working in html -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-view-top-actions.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<xsl:variable name="cancel_afmAction_serialized" select="/*/afmTableGroup/afmAction[@type='cancel']/@serialized"/>
		<!-- cancel action must go throgh a server request when users click X icon in browser toolbar to close view-define-window -->
		<script	language="javascript">
			bShowSaveAsFileName='<xsl:value-of select="/*/afmTableGroup/@bShowSaveAsFileName"/>';
			function cancel(serialized){
				//check if it's needed to inform server for closing window
				//'Apply' action will not need such kind of informing server for closing window
				var bAutoCloseWindow = document.forms['<xsl:value-of select="$afmInputsForm"/>'].bAutoCloseWindow.value;
				
				if(bAutoCloseWindow=="true")
				{
					if(serialized != "")
					{
						sendingDataFromHiddenForm("",serialized,"","",false,"");
					}
				}
			}
		</script>
		<body onUnload='cancel("{$cancel_afmAction_serialized}");' leftmargin="0" rightmargin="0" topmargin="0" bottommargin="0">
			<form name="{$afmInputsForm}">
				<!-- main section: going through all afmTableGroups to process their data-->
				<xsl:call-template name="AfmTableGroups">
					<xsl:with-param name="afmTableGroupNodes" select="/*/afmTableGroup"/>
				</xsl:call-template>
				
				<!-- set up a javascript variable to check if cancel(serialized) is called when alter-view window is closed  -->
				<!-- when "Apply" button is pushed, alter-view window closing will not trigger cancel(serialized) -->
				<!-- pushing "Cancel" or "ESC" key will invoke cancel(serialized) to tell server that this alter-view session is termitted by users -->
				<input type="hidden" name="bAutoCloseWindow" value="true"/>
			</form>
			<!-- calling common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>

	<!-- template (AfmTableGroups) used in xsl -->
	<xsl:template name="AfmTableGroups">
		<xsl:param name="afmTableGroupNodes"/>
		<xsl:variable name="bShowAlterButtons" select="$afmTableGroupNodes/@bShowAlterButtons"/>
		<xsl:variable name="current_title">
			<xsl:choose>
				<xsl:when test="$afmTableGroupNodes/@isNew='true'"><xsl:value-of select="//message[@name='newView']"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$afmTableGroupNodes/title"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<table class="alterViewTopFrame" cellspacing="0" cellpadding="0">
			<tr><td nowrap="1" class="alterViewTopFrameTitle"><h1><xsl:value-of select="$current_title"/></h1></td>
			<!-- go through each afmAction -->
			<xsl:for-each select="$afmTableGroupNodes/afmAction">
				<xsl:choose>
				<xsl:when test="$bShowAlterButtons='true'">
					<td>
					<xsl:if test="@type='alter'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='sendingDataFromHiddenForm("","{@serialized}","_blank","{subFrame/@name}",false,"");return false;'/>
					</xsl:if>

					<xsl:if test="@type='new'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='sendingDataFromHiddenForm("","{@serialized}","_blank","{subFrame/@name}",false,"");return false;'/>
					</xsl:if>

					<xsl:if test="@type='save'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",false,"");return false;'/>
					</xsl:if>

					<xsl:if test="@type='saveAs'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='sendingDataFromHiddenForm("","{@serialized}","_blank","{subFrame/@name}",false,"");return false;'/>
					</xsl:if>

					<xsl:if test="@type='apply'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",false,"");document.forms["{$afmInputsForm}"].bAutoCloseWindow.value="false";window.top.close();return false;'/>
					</xsl:if>

					<xsl:if test="@type='cancel'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0"  title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='window.top.close();return false;'/>
					</xsl:if>
						
					<xsl:if test="@clientSenMailTo='true'">
						<script language="javascript">
							//initialize javascript variables, defined in ab-view-top-actions.js
							afmActionViewName="<xsl:value-of select="@viewName"/>";
							afmAbsoluteAppPath="<xsl:value-of select="@link"/>";
							afmViewTitle="<xsl:value-of select="$afmTableGroupNodes/title"/>";
						</script>
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='sendingDataFromHiddenForm("","{@serialized}","_blank","{subFrame/@name}",false,"titlebar=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=400,height=400");return false;'/>
					</xsl:if>
					
					<xsl:if test="@role='help'">
						<xsl:variable name="target">
							<xsl:choose>
								<xsl:when test="@newWindow='true'">_blank</xsl:when>
								<xsl:otherwise><xsl:value-of select="@frame"/></xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='openNewContent("{@request}", "{$target}");return false;'/>
					</xsl:if>
					
					<xsl:if test="@type='print'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='printOut();return false;'/>
					</xsl:if>
					<xsl:if test="@type='myfavorite'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='addMyFavorite();return false;'/>
					</xsl:if>
					</td>
				</xsl:when>
				
				<xsl:otherwise>
					<td>
					<xsl:if test="@type='new'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='sendingDataFromHiddenForm("","{@serialized}","_blank","{subFrame/@name}",false,"");return false;'/>
					</xsl:if>
					
					<xsl:if test="@clientSenMailTo='true'">
						<script language="javascript">
							//initialize javascript variables, defined in ab-view-top-actions.js
							afmActionViewName="<xsl:value-of select="@viewName"/>";
							afmAbsoluteAppPath="<xsl:value-of select="@link"/>";
							afmViewTitle="<xsl:value-of select="$afmTableGroupNodes/title"/>";
						</script>
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='sendingDataFromHiddenForm("","{@serialized}","_blank","{subFrame/@name}",false,"titlebar=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,status=yes,width=400,height=335");return false;'/>
					</xsl:if>
					
					<xsl:if test="@role='help'">
						<xsl:variable name="target">
							<xsl:choose>
								<xsl:when test="@newWindow='true'">_blank</xsl:when>
								<xsl:otherwise><xsl:value-of select="@frame"/></xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" 
							 onclick='openNewContent("{@request}", "{$target}");return false;'/>
					</xsl:if>
					
					<xsl:if test="@type='print'">
						<input type="image" src="{icon/@request}" alt="{title}" border="0" title="{title}" onkeypress="mapKeyPressToClick(event, this)" onclick='printOut();return false;'/>
					</xsl:if>
					</td>
				</xsl:otherwise>
				</xsl:choose>
			</xsl:for-each>	
			</tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="common.xsl" />
</xsl:stylesheet>


