<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- importing constants.xsl which contains constant XSLT variables -->
	<xsl:import href="../xsl/constants.xsl" />
	<!-- specified XSLT variables for this XSLT file -->
    <xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>
    
	<xsl:output method="html" indent="no" />
	<xsl:template match="/">
		<html>
		<title>
			<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
		</title>
		<head>
			<!-- css and javascript files  -->
			<!-- linking path must be related to the folder in which xml is being processed -->
			<xsl:call-template name="LinkingCSS"/>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace"/></script>
			<!--script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-navigator-all-levels.js"><xsl:value-of select="$whiteSpace"/></script>
			<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-ex-ie-drag-drop-assgin-em-to-dp.js"><xsl:value-of select="$whiteSpace"/></script-->
		</head>
		<body class="body"  onselectstart="return false" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin ="0">
			<xsl:variable name="executeTransaction" select="/*/afmTableGroup[@name='transaction_form']/afmAction[@type='executeTransaction']/@serialized"/>

			<script language="javascript">
				var ab_ex_em_open_node_id="";
				var ab_ex_em_open_em_id="";
				var bRefreshingDPFrame = false;
				var bRefreshingEMFrame = false;
			</script>
			<table align="left" valign="top" width="100%">
				<tr><td align="left" valign="top" >
					<table align="left" valign="top" >
						<tr>
							<td align="left" valign="top" >
								<img alt="{$activity_graphic}" src="{$abSchemaSystemGraphicsFolder}/ab-form-work-request.gif"/>
							</td>
							<td >
								<table style="margin-left:10">
									<tr><td  style="font-size:14;font-family:arial,geneva,helvetica,sans-serif;">
										<p><span translatable="false">The Microsoft Internet Explorer browser is required to support the drag and drop features.</span><br />
										<span translatable="false">Drag an unassigned employee and drop it on a department to assign it to that department.</span><br />
										<span translatable="false">Drag an assigned employee and drop it on another department to change the assignment.</span><br />
										<span translatable="false">Drag an assigned employee from a department and drop it on the unassigned employees list to clear the assignment.</span></p>
									</td></tr>
									<tr><td style="font-size:14;color:red;font-family:arial,geneva,helvetica,sans-serif;">
										<span name="messageBox" id="messageBox"><xsl:value-of select="$whiteSpace"/></span>
									</td></tr>
								</table>
							</td>
						</tr>
					</table>
				</td></tr>
				<tr><td align="left" valign="top" >
					<table  align="center" valign="top" border="1" width="100%" hight="100%">
						<tr valign="top">
							<td valign="top" align="center" class="treeParentNodeTitles"><span  translatable="false">Employees by Department:</span></td>
							<td valign="top" align="center" class="treeParentNodeTitles"><span  translatable="false">Unassigned Employees:</span></td>
						</tr>
						<tr valign="top">
							<td valign="top">
								<!-- assgined em: dv and dp as parent: tree allowTransparency="true" -->
								 <iframe name="department"  style="width:100%;height:400;"  frameborder="0" src="{/*/afmAction[@name='departments']/@request}">">Department</iframe>
							</td>
							<td    valign="top">
								<!-- unassigned em: table -->
								 <iframe name="employees"  style="width:100%;height:400;"  frameborder="0" src="{/*/afmAction[@name='employees']/@request}">">Employees</iframe>
							</td>
						</tr>
					</table>
				</td></tr>
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
	<!-- including template model XSLT files called in XSLT -->
	<xsl:include href="../xsl/common.xsl" />
</xsl:stylesheet>


