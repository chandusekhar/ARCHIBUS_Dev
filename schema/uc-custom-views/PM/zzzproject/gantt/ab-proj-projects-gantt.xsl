<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:import href="../../../ab-system/xsl/constants.xsl"/>
	<!--xsl:variable name="showActions"  select="/afmXmlView/calendarElements/showActions" /-->
	<xsl:variable name="showActions" select="/afmXmlView/layer[@name='showActions']/@on"/>
	<xsl:variable name="showWorkPkgs" select="/afmXmlView/layer[@name='showWorkPkgs']/@on"/>
	<!--xsl:variable name="showWeeks" select="/afmXmlView/layer[@name='showWeeks']/@on"/-->
	<xsl:variable name="showWeeks" select="0"/>
	<xsl:variable name="viewtype" select="/afmXmlView/message[@name='viewtype']"/>
	<xsl:variable name="viewscope" select="/afmXmlView/message[@name='viewscope']"/>
	<xsl:variable name="source" select="/afmXmlView/message[@name='source']"/>
	<xsl:variable name="afmAction" select="//afmAction[@name='test']/@serialized"/>
	<xsl:template match="/">
		<html>
			<head>
				<xsl:call-template name="LinkingCSS"/>
				<title>calendar Chart</title>
				<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-common-move.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common-edit-report.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-edit-move-project-form.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<script language="JavaScript" src="#Attribute%//@relativeFileDirectory%/ab-proj-projects-gantt.js">
					<xsl:value-of select="$whiteSpace"/>
				</script>
				<xsl:call-template name="SetUpLocales" />
				<link rel="stylesheet" type="text/css" href="#Attribute%//@relativeFileDirectory%/ab-proj-projects-gantt.css"/>
			</head>
			<body>
				<script language="JavaScript">

				var afmAction = '<xsl:value-of select="$afmAction"/>'
				var source= '<xsl:value-of select="$source"/>'
			</script>

				<span id="january_id" name="january_id" style="display:none" translatable="true">January</span>
				<span id="february_id" name="february_id" style="display:none" translatable="true">February</span>
				<span id="march_id" name="march_id" style="display:none" translatable="true">March</span>
				<span id="april_id" name="april_id" style="display:none" translatable="true">April</span>
				<span id="may_id" name="may_id" style="display:none" translatable="true">May</span>
				<span id="june_id" name="june_id" style="display:none" translatable="true">June</span>
				<span id="july_id" name="july_id" style="display:none" translatable="true">July</span>
				<span id="august_id" name="august_id" style="display:none" translatable="true">August</span>
				<span id="september_id" name="september_id" style="display:none" translatable="true">September</span>
				<span id="october_id" name="october_id" style="display:none" translatable="true">October</span>
				<span id="november_id" name="november_id" style="display:none" translatable="true">November</span>
				<span id="december_id" name="december_id" style="display:none" translatable="true">December</span>

				<span id="jan_id" name="jan_id" style="display:none" translatable="true">Jan.</span>
				<span id="feb_id" name="feb_id" style="display:none" translatable="true">Feb.</span>
				<span id="mar_id" name="mar_id" style="display:none" translatable="true">Mar.</span>
				<span id="apr_id" name="apr_id" style="display:none" translatable="true">Apr.</span>

				<span id="jun_id" name="jun_id" style="display:none" translatable="true">Jun.</span>
				<span id="jul_id" name="jul_id" style="display:none" translatable="true">Jul.</span>
				<span id="aug_id" name="aug_id" style="display:none" translatable="true">Aug.</span>
				<span id="sep_id" name="sep_id" style="display:none" translatable="true">Sep.</span>
				<span id="oct_id" name="oct_id" style="display:none" translatable="true">Oct.</span>
				<span id="nov_id" name="nov_id" style="display:none" translatable="true">Nov.</span>
				<span id="dec_id" name="dec_id" style="display:none" translatable="true">Dec.</span>

				<span id="sun" name="sun" style="display:none" translatable="true">Sun</span>
				<span id="mon" name="mon" style="display:none" translatable="true">Mon</span>
				<span id="tue" name="tue" style="display:none" translatable="true">Tue</span>
				<span id="wed" name="wed" style="display:none" translatable="true">Wed</span>
				<span id="thu" name="thu" style="display:none" translatable="true">Thu</span>
				<span id="fri" name="fri" style="display:none" translatable="true">Fri</span>
				<span id="sat" name="sat" style="display:none" translatable="true">Sat</span>

				<span id="sun1" name="sun1" style="display:none" translatable="true">U</span>
				<span id="mon1" name="mon1" style="display:none" translatable="true">M</span>
				<span id="tue1" name="tue1" style="display:none" translatable="true">T</span>
				<span id="wed1" name="wed1" style="display:none" translatable="true">W</span>
				<span id="thu1" name="thu1" style="display:none" translatable="true">R</span>
				<span id="fri1" name="fri1" style="display:none" translatable="true">F</span>
				<span id="sat1" name="sat1" style="display:none" translatable="true">S</span>

				<xsl:apply-templates select="//afmTableGroup[dataSource/mdx]"/>
				<!-- calling template common which is in common.xsl -->
				<xsl:call-template name="common">
					<xsl:with-param name="title" select="/*/title"/>
					<xsl:with-param name="debug" select="//@debug"/>
					<xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
					<xsl:with-param name="xml" select="$xml"/>
				</xsl:call-template>
			</body>
		</html>
	</xsl:template>
	<!-- This template formats one-dimensional MDX table -->
	<xsl:template name="SetupGantt" match="//afmTableGroup[dataSource/mdx/preferences/@dimensions = '1']">
		<xsl:variable name="data" select="dataSource/data"/>
		<div id="chartPane" style="background:#FFFFFF;overflow:auto;">
			<xsl:if test="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value">
				<table class="panelReportHeader">
					<tr><td width="100%"><xsl:text/><xsl:value-of select="/*/title"/></td>
						<td valign="top">
						   <span translatable="true">From:</span>
						   <script language="JavaScript">
							   var tempdispdatefrom = returnDate( '<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>');
							   tempdispdatefrom =  FormattingDate(tempdispdatefrom.getDate(),(tempdispdatefrom.getMonth() + 1),tempdispdatefrom.getFullYear(),strDateShortPattern);
							   document.write(' ' + tempdispdatefrom );
							</script>

						   <xsl:value-of select="$whiteSpace"/>

						   <span translatable="true">To:</span>
						   <script language="JavaScript">
						   	   tempdispdatefrom = returnDate( '<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[05]/@value"/>');
							   tempdispdatefrom =  FormattingDate(tempdispdatefrom.getDate(), (tempdispdatefrom.getMonth() + 1),tempdispdatefrom.getFullYear(),strDateShortPattern);
							   document.write(' ' + tempdispdatefrom );
						   </script>
						  </td>
						<td style="text-align: right; padding-right: 8px">
							<span class="panelButton_input" style="cursor: default" translatable="true" onclick="window.location.reload()">Refresh</span>	
						</td>
					</tr>
					<xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record) = 0">
					<table width="100%" class="showingTgrpTitleTableWithLogo">
                       <tr>
                          <td><xsl:value-of select="$whiteSpace"/></td>
                          <td class="instruction" colspan="2">
                              <span translatable="true">There are no Actions that meet your restriction.</span>
                          </td>
                       </tr>
                    </table>
                    </xsl:if>
				</table>
				<!-- table width="100%" class="showingTgrpTitleTableWithLogo">
					<tr width="100%">
						<td width="22" valign="top">
							<img border="0" src="{$projectGraphicsFolder}/archibus-20x20-trans.gif"/>
						</td>
						<td>
							<xsl:value-of select="/*/title"/>
						</td>

						<td valign="top">
						   <span translatable="true">From:</span>
						   <script language="JavaScript">
							   var tempdispdatefrom = returnDate( '<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>');
							   tempdispdatefrom =  FormattingDate(tempdispdatefrom.getDate(),(tempdispdatefrom.getMonth() + 1),tempdispdatefrom.getFullYear(),strDateShortPattern);
							   document.write(' ' + tempdispdatefrom );
							</script>

						   <xsl:value-of select="$whiteSpace"/>

						   <span translatable="true">To:</span>
						   <script language="JavaScript">
						   	   tempdispdatefrom = returnDate( '<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[05]/@value"/>');
							   tempdispdatefrom =  FormattingDate(tempdispdatefrom.getDate(), (tempdispdatefrom.getMonth() + 1),tempdispdatefrom.getFullYear(),strDateShortPattern);
							   document.write(' ' + tempdispdatefrom );
						   </script>
						  </td>
					</tr>
                                        <xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record) = 0">
                                          <tr>
                                            <td><xsl:value-of select="$whiteSpace"/></td>
                                            <td class="instruction" colspan="2">
                                              <span translatable="true">There are no Actions that meet your restriction.</span>
                                            </td>
                                          </tr>
                                        </xsl:if>
				</table-->

				<xsl:if test="count(/*/afmTableGroup/dataSource/data/records/record) &gt; 0">
                        <div id="tbl-container">
			<table cellpadding="0" cellspacing="0" border="0">
				<script language="JavaScript">document.body.style.cursor = "wait";</script>
				<xsl:variable name="records" select="/afmXmlView/afmTableGroup/dataSource/data/records/record[position() &gt; 1]"/>
				<xsl:for-each select="/afmXmlView/afmTableGroup/dataSource/data/records/record[position() &gt; 1]">
					<xsl:sort select="@project.work_pkg_id.max" order="descending"/>
					<xsl:variable name="ownertittle" select="@project.work_pkg_id.max"/>
                    <xsl:variable name="space" translatable="true">Space</xsl:variable>
					<xsl:variable name="pvrownertittle" select="preceding-sibling::record[1]/@project.work_pkg_id.max"/>
					<xsl:if test="position() = 1">
						<script language="JavaScript">
							var date_overall_start = returnDate( '<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>');
							var date_overall_end = returnDate('<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[05]/@value"/>');
                            var overall_total_days = getDays(returnDate('<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>'),returnDate('<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[05]/@value"/>')); //duration
							var dayWidth;
							var local_path='<xsl:value-of select="'#Attribute%//@relativeFileDirectory%/'"/>';

							<xsl:if test="$viewtype='Day'">
								var dayWidth =16;
								var intScope = 0;
								</xsl:if>
							<xsl:if test="$viewtype!='Day'">
								dayWidth =8;
								var intScope = 1;
							</xsl:if>
						</script>
						<!-- Header -->
						<tr bgcolor="#333333">
							<td width="326" class="WeekHeaderFixed">
								<span translatable="true">Name</span>
							</td>
							<td width="62" class="WeekHeaderFixed">
								<span translatable="true">Duration</span>
							</td>
							<script language="JavaScript">
									document.write(drawMainHeader(date_overall_start, date_overall_end,dayWidth, intScope));</script>
						</tr>
						<!-- SubHeader -->
						<tr>
							<td colspan="2" class="daysFixed">
								<img alt="{$space}" src="Spacer.gif" height="1" width="400"/>
								<xsl:value-of select="$whiteSpace"/>
							</td>
							<script language="JavaScript">document.write(drawSubHeader(date_overall_start, date_overall_end,dayWidth, intScope));</script>
						</tr>
					</xsl:if>
					<!-- Owner Data row -->
					<xsl:if test="((@project.work_pkg_id.max!=$pvrownertittle) or (position()=1))">
						<xsl:if test="($showWorkPkgs = 1) ">
							<tr bgcolor="#CCCCCC">
								<td class="NameItemsHeader">
									<span>
										<xsl:value-of select="@project.work_pkg_id.max"/>
									</span>
								</td>
								<td class="NameItemsHeader">
									<span>
										<script>
                        var taskDuration = getDays(majorDate('<xsl:value-of select="@project.date_work_pkg_start.max"/>','<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>'),  minorDate('<xsl:value-of select="@project.date_work_pkg_end.max"/>','<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[05]/@value"/>')); //duration
                        var overallDuration = getDays(returnDate('<xsl:value-of select="@project.date_work_pkg_start.max"/>'), returnDate('<xsl:value-of select="@project.date_work_pkg_end.max"/>'));
              				  document.write('<span translatable="true"> Overall:</span>' + ' ' + (1+overallDuration));
									  </script>
									</span>
								</td>
								<script language="JavaScript">
											//var taskName = '<xsl:value-of select="@project.work_pkg_id.max"/>'; //action_title
											taskName ='';
											var daysPerWeek = '<xsl:value-of select="@project.days_per_week1.max"/>';
											var taskStartDate = majorDate('<xsl:value-of select="@project.date_work_pkg_start.max"/>','<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>');
											date_overall_start = returnDate('<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>');
											//majorDate('<xsl:value-of select="@project.date_overall_start.max"/>','<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>');
											document.write(drawBar(date_overall_start, taskStartDate, taskName, taskDuration, dayWidth, daysPerWeek, intScope, 1,overall_total_days));
										</script>
							</tr>
						</xsl:if>
						<!-- Child Data row -->
						<xsl:for-each select="$records[@project.work_pkg_id.max = $ownertittle]">
							<xsl:sort select="number(@project.activity_log_id.max)"/>
							<xsl:if test="$showWorkPkgs = 1">
								<tr bgcolor="#CCCCCC">
									<td class="NameItems">
										<span>
											<xsl:value-of select="number(@project.activity_log_id.max)"/> - <xsl:value-of select="@project.action_title.max"/>
										</span>
									</td>
									<td class="NameItems">
										<span>
											<script>
											  var taskDuration = getDays(minorDate('<xsl:value-of select="@project.date_scheduled_end.max"/>','<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[05]/@value"/>'),majorDate('<xsl:value-of select="@project.date_scheduled.max"/>','<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>')); 							//duration
										    //document.write(taskDuration);
                      </script>
											<xsl:value-of select="@project.duration.max"/>
										</span>
									</td>
									<script language="JavaScript">
											//var taskName = '<xsl:value-of select="@project.action_title.max"/>'; //action_title
											taskName ='';
											var daysPerWeek = '<xsl:value-of select="@project.days_per_week.max"/>';
											var taskStartDate = majorDate('<xsl:value-of select="@project.date_scheduled.max"/>','<xsl:value-of select="/afmXmlView/actionIn/queryParameters/queryParameter[04]/@value"/>');
											var activitylogid = '<xsl:value-of select="number(@project.activity_log_id.max)"/>';
											document.write(drawBar(date_overall_start, taskStartDate, taskName, taskDuration, dayWidth, daysPerWeek, intScope, 2,overall_total_days,activitylogid));
										</script>
								</tr>
							</xsl:if>
						</xsl:for-each>
					</xsl:if>
				</xsl:for-each>
				<script language="JavaScript">document.body.style.cursor = "default";</script>
			</table>
                        </div>
			</xsl:if>
                        </xsl:if>
		</div>

	</xsl:template>
	<xsl:include href="../../../ab-system/xsl/common.xsl"/>
	<xsl:include href="../../../ab-system/xsl/locale.xsl" />
</xsl:stylesheet>
