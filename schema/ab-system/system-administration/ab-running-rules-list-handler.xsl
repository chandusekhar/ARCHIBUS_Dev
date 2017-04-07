<?xml version="1.0"?>
<!--
   Yong Shao
   4-4-2005
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing xsl files -->
	<!-- constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />

	<!-- top template  -->
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- template: Html-Head-Setting in common.xsl -->
			<xsl:call-template name="Html-Head-Setting"/>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<!-- calling template LinkingCSS in common.xsl -->
			<xsl:call-template name="LinkingCSS"/>
			<!-- don't remove whitespace, otherwise, Xalan XSLT processor will generate <script .../> instead of <script ...></script> -->
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-running-rules-list-handler.js"><xsl:value-of select="$whiteSpace"/></script>
        </head>
		<xsl:variable name="stopAction" select="//afmTableGroup/afmAction[@eventName='AbSystemAdministration-stopJobs']"/>
		<xsl:variable name="refreshAction" select="//afmTableGroup/afmAction[@eventName='AbSystemAdministration-listJobs']"/>
		<xsl:variable name="runningRulesList" select="//actionIn/result/rules"/>
		<body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">

			<xsl:call-template name="rulesListHanlder">
				<xsl:with-param name="rulesList" select="$runningRulesList"/>
				<xsl:with-param name="stopAction" select="$stopAction"/>
				<xsl:with-param name="refreshAction" select="$refreshAction"/>
			</xsl:call-template>

			<!-- calling template  which is in common.xsl -->
			<xsl:call-template name="common">
				<xsl:with-param name="title" select="/*/title"/>
				<xsl:with-param name="debug" select="//@debug"/>
				<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
				<xsl:with-param name="xml" select="$xml"/>
			</xsl:call-template>
		</body>
		</html>
	</xsl:template>
	<xsl:template name="rulesListHanlder">
		<xsl:param name="rulesList"/>
		<xsl:param name="stopAction"/>
		<xsl:param name="refreshAction"/>
		<form name="afmUserInputsForm">
			<table width="100%" align="center">
				<tr align="center">
					<td align="center">
						<xsl:variable name="stopMessage" select="//message[@name='stopMessage']"/>
						<input class="perRowButton" type="button" name="Requery" value="{$refreshAction/title}" onclick='refresh("{$refreshAction/@serialized}")'/>
						<input class="perRowButton" type="button" name="StopSelected" value="{$stopAction/title}" onclick='stopJobs("{$stopAction/@serialized}", "afmUserInputsForm", "{$stopMessage}")'/>
					</td>
				</tr>
				<tr align="center">
					<td align="center">
						<table border="1">
							<tr class="AbHeaderTable1">
								<td><span translatable="true">Stop?</span></td>
								<td><span translatable="true">Rule Name</span></td>
								<td><span translatable="true">Unique ID</span></td>
								<td><span translatable="true">Elapsed Time(Seconds)</span></td>
							</tr>
							<xsl:for-each select="$rulesList/ruleEvent">
								<tr class="AbDataTable">
									<td><input type="checkbox" name="stop" value="{@key}"/></td>
									<td><xsl:value-of select="@name"/></td>
									<td><xsl:value-of select="@key"/></td>
									<td align="right"><xsl:value-of select="@elapsedTime"/></td>
								</tr>
							</xsl:for-each>
							<xsl:if test="count($rulesList/ruleEvent) &lt;= 0">
								<tr  align="center">
									<td  colspan="4" class="instruction" align="center" valign="top">
										<p><span translatable="true">No Items.</span></p>
									</td>
								</tr>
							</xsl:if>
						</table>
					</td>
				</tr>
			</table>

		</form>
	</xsl:template>
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>
