<?xml version="1.0" encoding="UTF-8"?>
<!-- which called by Java to handle actions frame in top of each regular view -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables used in this xslt -->
	<xsl:variable name="selectedGroupAreaDivID" select="'selectedGroupArea'"/>	
	<xsl:variable name="title" select="'title'"/>
	<xsl:variable name="file" select="'file'"/>	
	<xsl:variable name="access" select="'access'"/>
	<xsl:variable name="group" select="'group'"/>	
	<xsl:variable name="strOriginalViewTitleHiddenInputName" select="'strOriginalViewTitleHiddenInputName'"/>	

	<xsl:template match="/">
		<html>	
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="javascript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-saveas-form.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-trigger-close-dialog.js"><xsl:value-of select="$whiteSpace"/></script>
		</head>
		<xsl:variable name="cancel_afmAction_serialized" select="//afmTableGroup/afmAction[@type='cancel']/@serialized"/>
		<!-- cancel action must go throgh a server request when users click X icon in browser toolbar to close view-define-window -->
		<script	language="javascript">
			var bAutoCloseWindow = true;
			function cancel(serialized)
			{
				if(bAutoCloseWindow)
				{
					if(serialized != "")
						sendingDataFromHiddenForm("",serialized,"","",false,"");	
				}
			}
		</script>
		<body onUnload='cancel("{$cancel_afmAction_serialized}");' class="body" onload='initializingForm("{$selectedGroupAreaDivID}", "{$afmInputsForm}", "{$strOriginalViewTitleHiddenInputName}")'  leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
			<xsl:call-template name="table-group-title">
				<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
			</xsl:call-template>	
			
			<script language="javascript">
				<xsl:text>//set up javascript variables</xsl:text>
				titleName ='<xsl:value-of select="$title"/>';
				fileName = '<xsl:value-of select="$file"/>';
				accessName = '<xsl:value-of select="$access"/>';
				groupName = '<xsl:value-of select="$group"/>';
			</script>
			<table width="100%" valign="top">
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
						</xsl:call-template>
					</td></tr>
					<tr><td>
						<!-- instruction -->
						<table valign="bottom" aligh="center" width="100%">
							<tr valign="bottom"><td valign="bottom"  class="instruction">
							<p><xsl:value-of select="//afmTableGroup/message[@name='instruction']"/></p>				
							</td></tr>
						</table>
					</td></tr>
					<tr><td>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='applySaveAs']"/>
						<xsl:variable name="CANCEL" select="//afmTableGroup/afmAction[@type='cancel']"/>
						<!--xsl:variable name="TYPE" select="1"/>
						<xsl:call-template name="ok-and-cancel">
							<xsl:with-param name="OK" select="$OK"/>
							<xsl:with-param name="CANCEL" select="$CANCEL"/>
							<xsl:with-param name="TYPE" select="$TYPE"/>
						</xsl:call-template-->
						<xsl:variable name="okActionMessage" select="//afmTableGroup/message[@name='okActionMessage']"/>
						<table  class="bottomActionsTable">
							<tr><td>
								<table><tr>
									<!-- target: frame or parentFrame in XML ???-->
									<td><input class="AbActionButtonFormStdWidth" type="button" value="{$OK/title}" title="{$OK/tip}" onclick='if(!onOKAction("{$OK/@serialized}", "{$OK/@parentFrame}", "{$OK/subFrame/@name}", "{$okActionMessage}")) window.top.close(); '/></td>
									<td><input class="AbActionButtonFormStdWidth" type="button" value="{$CANCEL/title}" title="{$CANCEL/tip}" onclick='window.top.close();return false;'/></td>
								</tr></table>
							</td></tr>
						</table>
					</td></tr>
					
				</Form>
			</table>			
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

	<!-- template (AfmTableGroup) used in xsl -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="data" select="$afmTableGroup/dataSource/data"/>
		<xsl:variable name="PrefixTitle" select="//afmTableGroup/message[@name='prefixTitle']"/>
		<table>
			<!-- title and file name -->
			<tr><td>
				<table>
					<tr><td class="legendTitle" translatable="true">View Title:</td></tr>
					<tr><td>
						<input type="hidden" name="{$strOriginalViewTitleHiddenInputName}" value="{$afmTableGroup/dataSource/data/@viewTitle}"/>
						<INPUT class="inputField_box" name="{$title}" value="{$PrefixTitle} {$data/@viewTitle}" size="60" onkeyup='transformingViewFileName("{$afmInputsForm}",this.value)'/><!-- onchange='transformingViewFileName("{$afmInputsForm}",this.value)'/-->
					</td></tr>
					<tr><td id="fileNameArea1" name="fileNameArea1" class="legendTitle" translatable="true" style="display:none">View File Name:</td></tr>
					<tr><td id="fileNameArea2" name="fileNameArea2" style="display:none">
						<INPUT class="inputField_box" name="{$file}" value="{$data/@viewName}" size="60"  readonly="1"/>						
					</td></tr>
					
				</table>
			</td></tr>
			<!-- access -->
			<tr><td>
				<table>
					<tr>
						<td class="legendTitle" translatable="true">Access:</td>
					</tr>
					<tr>
						<td>
							<table>
							<tr>
							<td>
								<xsl:choose>
									<xsl:when test="$data/@access='onlyMe'">
										<input CHECKED="1" VALUE="onlyMe" name="{$access}" type="radio" onclick='showSelectedGroupArea("{$selectedGroupAreaDivID}", false)'/>
									</xsl:when>
									<xsl:otherwise>
										<input VALUE="onlyMe" name="{$access}" type="radio" onclick='showSelectedGroupArea("{$selectedGroupAreaDivID}", false)'/>
									</xsl:otherwise>
								</xsl:choose>								
								<span class="legendContent" translatable="true">Only me</span></td>
							</tr>
							<tr>							
							<td hight="44">
								<xsl:choose>
									<xsl:when test="$data/@access='group'">
										<input CHECKED="1" VALUE="group" name="{$access}" type="radio" onclick='showSelectedGroupArea("{$selectedGroupAreaDivID}", true)'/>
									</xsl:when>
									<xsl:otherwise>
										<input VALUE="group" name="{$access}" type="radio" onclick='showSelectedGroupArea("{$selectedGroupAreaDivID}", true)'/>
									</xsl:otherwise>
								</xsl:choose>								
								<span class="legendContent"  translatable="true" >Group</span>
							</td>
							<td>
								<div id="{$selectedGroupAreaDivID}">
									<xsl:attribute name="style">
										<xsl:if test="$data/@selectedGroup=''">
											<xsl:text>display:none</xsl:text>
										</xsl:if>								
									</xsl:attribute>
									<SELECT class="inputField_box" NAME="{$group}">
										<xsl:variable name="selectedGroup" select="$data/@selectedGroup"/>
										<xsl:variable name="selected_group_radio">
											<xsl:choose>
												<xsl:when test="$selectedGroup!=''">1</xsl:when>
												<xsl:otherwise>0</xsl:otherwise>
											</xsl:choose>
										</xsl:variable>
										<xsl:for-each select="$data/records/elementRecord">
											<!-- filter out %XXXX% group contains()-->
											<!--xsl:if test="not (starts-with(@group, '%'))"-->
											<xsl:if test="not (contains(@group, '%'))">
												<xsl:if test="@title!=''">
													<OPTION VALUE="{@group}" SELECTED="{$selected_group_radio}"><xsl:value-of select="@title"/></OPTION>
												</xsl:if>
											</xsl:if>
										</xsl:for-each>
									</SELECT>	
								</div>
							</td>
							</tr>
							<tr>
							<td>
								<xsl:choose>
									<xsl:when test="$data/@access='everyone'">
										<input CHECKED="1" VALUE="everyone" name="{$access}" type="radio" onclick='showSelectedGroupArea("{$selectedGroupAreaDivID}",false)'/>
									</xsl:when>
									<xsl:otherwise>
										<input value="everyone" name="{$access}" type="radio"  onclick='showSelectedGroupArea("{$selectedGroupAreaDivID}",false)'/>
									</xsl:otherwise>
								</xsl:choose>
								<span class="legendContent"  translatable="true">Everyone</span></td>
							</tr>
							</table>
						</td>
					</tr>
				</table>
			</td></tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<!--xsl:include href="../xsl/ab-actions-bar.xsl"/-->
</xsl:stylesheet>


