<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle filter form -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- special xslt variables for this xslt -->
	<xsl:variable name="tables" select="'tables'"/>
	
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>	
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/view-definition-form-content-table-standard.js"><xsl:value-of select="$whiteSpace"/></script>		
		</head>
		<xsl:variable name="temp_record_node" select="//afmTableGroup/dataSource/data/records/record"/>
		<body class="body" onload='setSelectedStandardName("{$afmInputsForm}", "{$tables}", null, "{count($temp_record_node)}")' leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			
			<xsl:if test="count($temp_record_node) &gt; 0">
				<!-- calling template table-group-title in common.xsl to set up tgrp's title in the top of html page -->
				<xsl:call-template name="table-group-title">
					<xsl:with-param name="title" select="/*/afmTableGroup/title"/>
				</xsl:call-template>	
			</xsl:if>
			<table width="100%" valign="top">
				<Form name="{$afmInputsForm}">
					<tr><td>
						<xsl:call-template name="AfmTableGroup">
							<xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
						</xsl:call-template>
					</td></tr>
					<tr><td>
						<!-- template: ok-and-cancel is in ab-actions-bar.xsl -->
						<!-- parameter TYPE:1=> html form button action; 0=> customized html link action-->
						<xsl:variable name="OK" select="//afmTableGroup/afmAction[@type='applyStandard']"/>
						<xsl:variable name="CANCEL" select="//afmTableGroup/afmAction[@type='cancel']"/>
						<table  align="center" class="bottomActionsTable">
							<tr><td>
								<table align="center"><tr align="center">
									<xsl:if test="count($temp_record_node) &gt; 0">
										<td><input  class="AbActionButtonFormStdWidth" type="button" value="{$OK/title}" title="{$OK/tip}" onclick='sendingDataFromHiddenForm("","{$OK/@serialized}","{$OK/@frame}","{$OK/subFrame/@name}",true,"")'/></td>
									</xsl:if>
									<td><input  class="AbActionButtonFormStdWidth" type="button" value="{$CANCEL/title}" title="{$CANCEL/tip}" onclick='sendingDataFromHiddenForm("","{$CANCEL/@serialized}","{$CANCEL/@frame}","{$CANCEL/subFrame/@name}",false,"")'/></td>	
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

	<!-- xsl template: AfmTableGroup -->
	<xsl:template name="AfmTableGroup">
		<xsl:param name="afmTableGroup"/>
			<xsl:variable name="record_node" select="$afmTableGroup/dataSource/data/records/record"/>
			<table  align="left">
			<tr><td>
				<xsl:choose>
					<xsl:when test="count($record_node) &gt; 0">
						<table align="left">
							<xsl:choose>
								<xsl:when test="count($record_node[@default='true'])&gt;0">	
									<tr><td class="instruction">
										<span  translatable="true">Current standard table:</span><xsl:value-of select="$whiteSpace"/><xsl:value-of select="$record_node[@default='true']/@title"/>
									</td></tr>
									<tr><td class="legendTitle">
										<span  translatable="true">Change the current standard table by choosing a new one below. Choose the blank entry if you wish not to have a standard:</span>
									</td></tr>
								</xsl:when>
								<xsl:otherwise>
									<tr><td class="instruction">
										<span  translatable="true">There is no standard table.</span><xsl:value-of select="$whiteSpace"/><xsl:value-of select="$record_node[@default='true']/@title"/>
									</td></tr>
									<tr><td class="legendTitle">
										<span  translatable="true">Choose a table below for the standard table:</span>
									</td></tr>
								</xsl:otherwise>
							</xsl:choose>
							
							<tr><td align="left">
								<select  class="inputField_box"  id="{$tables}" name="{$tables}" onchange='setSelectedStandardName("", "", this)'>
									<xsl:for-each select="$record_node">
										<xsl:choose>
											<xsl:when test="@default='true'">
												<option value="{@table}" selected="1"><xsl:value-of select="@title"/></option>
											</xsl:when>
											<xsl:otherwise>
												<option value="{@table}"><xsl:value-of select="@title"/></option>
											</xsl:otherwise>
										</xsl:choose>
									</xsl:for-each>
									<xsl:choose>
										<xsl:when test="count($record_node[@default='true'])&gt;0">
											<option value=""><xsl:value-of select="$whiteSpace"/></option>
										</xsl:when>
										<xsl:otherwise>
											<option value="" selected="1"><xsl:value-of select="$whiteSpace"/></option>
										</xsl:otherwise>
									</xsl:choose>
									
								</select>
							</td></tr>
						</table>
					</xsl:when>
					<xsl:otherwise>
						<span style="font-size:12;color:red;font-family:arial,geneva,helvetica,sans-serif;"><xsl:value-of select="$afmTableGroup/message[@name='no_standard_table']"/></span>
					</xsl:otherwise>
				</xsl:choose>
			</td></tr>
		</table>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
	<!--xsl:include href="../xsl/ab-actions-bar.xsl"/-->
</xsl:stylesheet>


