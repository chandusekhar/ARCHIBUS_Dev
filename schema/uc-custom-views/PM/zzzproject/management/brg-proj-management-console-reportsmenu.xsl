<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" indent="yes" />
    <xsl:include href="../../../../../ab-system/xsl/constants.xsl" />
    <xsl:param name="numcols" select="5"/> 
    
 <xsl:variable name="view1" select="'brg-proj-project-profiles-mc.axvw'"/>
 <xsl:variable name="view2" select="'ab-proj-assign-team-mc.axvw'"/>
 <xsl:variable name="view3" select="'brg-proj-workpkgs-edit.axvw'"/>
 <xsl:variable name="view4" select="'ab-proj-actions-summary.axvw'"/>
 <xsl:variable name="view5" select="'brg-proj-actions-by-workpkg.axvw'"/>
 <xsl:variable name="view6" select="'brg-proj-actions-with-docs-mc.axvw'"/>
 <xsl:variable name="view7" select="'ab-proj-commlogs-by-date-and-time.axvw'"/>
 <xsl:variable name="view8" select="'ab-proj-changeorders.axvw'"/>
 <xsl:variable name="view9" select="'brg-proj-gantt-chart.axvw'"/>
 <xsl:variable name="view10" select="'brg-proj-view-contracts-mc.axvw'"/>

 <xsl:variable name="title1" translatable="true">Profile</xsl:variable>
 <xsl:variable name="title2" translatable="true">Team</xsl:variable>
 <xsl:variable name="title3" translatable="true">Work Packages</xsl:variable>
 <xsl:variable name="title4" translatable="true">Actions Summary</xsl:variable>
 <xsl:variable name="title5" translatable="true">Actions by Work Package</xsl:variable>
 <xsl:variable name="title6" translatable="true">Documents and Drawings</xsl:variable>
 <xsl:variable name="title7" translatable="true">Communication Logs</xsl:variable>
 <xsl:variable name="title8" translatable="true">Change Orders</xsl:variable>
 <xsl:variable name="title9" translatable="true">Gantt Chart</xsl:variable>
 <xsl:variable name="title10" translatable="true">Contracts</xsl:variable>
  
 <xsl:variable name="rest" select="/*/actionIn/@project.project_id"/>
    
 <xsl:template match="/">
	<html>
		<head>	
			<title>
				<xsl:value-of select="/*/title"/><xsl:value-of select="$whiteSpace"/>
			</title>

	    <!-- LinkingCSS in common.xsl includes the default style sheets -->
			<link rel="stylesheet" type="text/css" href="#Attribute%//@relativeFileDirectory%/brg-proj-management-console.css"/>
	    <xsl:call-template name="LinkingCSS" />
	    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace" /></script>
	    <script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/brg-proj-management-console-tabmenu.js"><xsl:value-of select="$whiteSpace" /></script>
		</head>
	    
	    <body class="body">
				<table align="left" border="1" width="150" cellspacing="0" cellpadding="0" class="AbPMButtonTable">
				
    			<xsl:variable name="numfixed" select="10"/> 
    			
				  <tr>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view1}')"><xsl:value-of select="$title1"/></button></td>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view2}')"><xsl:value-of select="$title2"/></button></td>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view3}')"><xsl:value-of select="$title3"/></button></td>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view4}')"><xsl:value-of select="$title4"/></button></td>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view5}')"><xsl:value-of select="$title5"/></button></td>
				  </tr>
				  
				  <tr>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view6}')"><xsl:value-of select="$title6"/></button></td>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view7}')"><xsl:value-of select="$title7"/></button></td>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view8}')"><xsl:value-of select="$title8"/></button></td>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view9}')"><xsl:value-of select="$title9"/></button></td>
				    <td><button class="AbPMConsoleBtnCommon" name="AbPMConsoleBtnCommon" onClick="changeButtonFormat(this);loadTabMenuReport('{$view10}')"><xsl:value-of select="$title10"/></button></td>
				  </tr>
				  
     			<xsl:variable name="rc" select="($numcols - ($numfixed mod $numcols))+1"/> 

					<!-- This code is used if the number of common (fixed) views does not fill up an entire row
				  <tr>
				    add common views on last row here...this example is for 9 common views on a 4-column layout, so 1 left on last row
				    <td><button class="AbPMConsoleBtn" onClick="loadTabMenuReport('{$view9}')"><xsl:value-of select="$title9"/></button></td>
					  <xsl:for-each select="/*/afmAction[position() &lt; $rc]">          
              <td><button class="AbPMConsoleBtn" name="AbPMConsoleBtn" onClick="changeButtonFormat(this);loadTabMenuReport('{@request}')"><xsl:value-of select="title"/></button></td>
					  </xsl:for-each>
				  </tr>
				  -->
				  
    			<xsl:variable name="imod" select="$rc mod $numcols"/> 
    			
					<xsl:for-each select="/*/afmAction[(position() mod $numcols = $imod) or $numcols = 1]">          
          <tr> 
            <xsl:for-each select=". | following-sibling::afmAction[position() &lt; $numcols]"> 
            
             <td><button class="AbPMConsoleBtn" name="AbPMConsoleBtn" onClick="changeButtonFormat(this);loadTabMenuReport('{@request}')"><xsl:value-of select="title"/></button></td>
              
					  </xsl:for-each>
					</tr>
			  </xsl:for-each>
					
				</table>
	    </body>
	</html>
    </xsl:template>
    <xsl:include href="../../../../../ab-system/xsl/common.xsl" />
</xsl:stylesheet>

