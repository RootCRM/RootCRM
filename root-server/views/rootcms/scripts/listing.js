var xhrStatus;

var pageSize=15, totalNum=0, totalDisplayedNum=0;
var start=0, end=pageSize;
var accessRightCode=parseInt(access_right);
var complete=false, completeScroll=false;

function generateHeading(e, upperCase){
	if(typeof upperCase == 'undefined' && upperCase==''){ 
		var upperCase=false;
	} 
	var patt=/[^A-Za-z0-9]/g;
	var result=e.replace(patt,' ');
	result=result.replace(/\s+/g, ' ');
	if(upperCase==true){
		result=result.toUpperCase();
	}else{
		result=result.substr(0, 1).toUpperCase() + result.substr(1);
	}
	return result;
}

	function searchKeyword(e){
		var searchField= $("#"+e).val();
		if(searchField!=""){
			$('#table-breakpoint').basictable('destroy');
			$("#documents_data").html('');
			$("#"+e).removeClass("errorPlaceHolder");
			$('#display_more_btn').hide();
			$('#img_loading_div').show();
			searchStr=searchField;
			start=0;
			end=start+pageSize;
			load_data();
		}else{
			$("#"+e).addClass("errorPlaceHolder");
			$("#"+e).attr("placeholder" , "Please enter search term here");
			$("#"+e).focus();
		}
	}
	
    $(document).ready(function() {
    	$('#table').basictable();
    	
    	$('#display_more_btn').hide();
		$('#img_loading_div').show();
		load_data();
		
		$("#searchBtn").click(function()	{
			searchKeyword('searchField');
		});
		
		$('#searchField').keypress(function (e) {
  			if (e.which == 13) {
    			searchKeyword('searchField');
  			}
		});
		$("#searchBtn").click(function()	{
			searchKeyword('searchField');
		});
		$(window).scroll(function(){
			if ($(window).scrollTop() == $(document).height() - $(window).height()){
				if(complete==false && completeScroll==false) {
					load_more();
				}
			}
		});	
	});

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = month + ' ' + date + ' ' + year + ', ' + hour + ':' + min ;
  return time;
}

function refresh_data(){
	$('#table-breakpoint').basictable('destroy');
	searchStr="";
	$(".searchFieldClass").val("");
	$("#documents_data").html('');
	$('#display_more_btn').hide();
	$('#img_loading_div').show();
	start=0;
	end=start+pageSize;
	load_data();
}
function load_more(){
	$('#table-breakpoint').basictable('destroy');
	$('#display_more_btn').hide();
	$('#img_loading_div').show();
	if(start==0)	{
		start=end+1;
	} else{
		start=end;
	}
	end=start+pageSize;
	load_data();
}
	
	function load_data(){
		completeScroll=true;
		$(".alert").remove();
		var jsonRow=backendDirectory+"/api_fetch_list?start="+start+"&limit="+pageSize+"&templateStr="+templateStr+"&s="+searchStr;
		if(xhrStatus) xhrStatus.abort();
		xhrStatus=$.getJSON(jsonRow,function(html){
			if(html.error){
				complete=true;
				$(".topOptionsClass").hide();
				$("#table-breakpoint").before('<div class="alert alert-danger">'+html.error+'</div>');
			}else{
				var editorPage="javascript:void(0)";
				if(html.total){
					totalNum=parseInt(html.total);
				}
				if(html.iTotalRecordsReturned){
					totalDisplayedNum=totalDisplayedNum+parseInt(html.iTotalRecordsReturned);
				}
				if(totalDisplayedNum>0 && totalNum>0){
					$(".display_records_count").html("Showing "+totalDisplayedNum+" out of "+totalNum);
				}
				if (typeof html.display_columns !== 'undefined' && html.display_columns !== null && html.display_columns!="" && start==0){
					var headFootStr="";
					$.each(html.display_columns, function(i,row){
						headFootStr+="<th>"+generateHeading(row)+"</th>";
					});
					$(".headFootClass").html("<tr>"+headFootStr+"</tr>");
					
				}
				if (typeof html.table !== 'undefined' && html.table !== null && html.table!="" && start==0){
					$("#pageMainHeading").html(generateHeading(html.table)+" <small>LIST VIEW</small>");
					$("#breadcrumbTitle").html(generateHeading(html.table));
				}
				if (typeof html.enable_search !== 'undefined' && html.enable_search !== null && (html.enable_search==true ||  html.enable_search=="true") && start==0){
					$(".form-inline").show();
				}
				if (typeof html.editor !== 'undefined' && html.editor !== null && html.editor!=""){
					editorPage=backendDirectory+"/"+html.editor;
					
					$(".editorLink").attr("href", editorPage);
					$(".editorLink").show();
				}
								
				if(html.aaData.length>0){
					var contentHtml="";
					$.each(html.aaData, function(i,row){
						contentHtml+="<tr>";
						var uniqueFieldVal="";
						if (typeof html.uniqueField !== 'undefined' && html.uniqueField !== null && row.hasOwnProperty(html.uniqueField) ==true){
							uniqueFieldVal=row[html.uniqueField];
						}
						if (typeof html.display_columns !== 'undefined' && html.display_columns !== null && html.display_columns!=""){
							$.each(html.display_columns, function(k,col){
								if(col!="Action"){
									if(row.hasOwnProperty(col)==true && (col=="Modified" || col=="modified_timestamp" || col=="modified" || col=="Created" || col=="created_timestamp" || col=="created")){
										contentHtml+="<td>"+timeConverter(row[col])+"</td>";
									}else if(row.hasOwnProperty(col)==true && (col=="Status" || col=="status" || col=="active")){
										if (typeof html.table !== 'undefined' && html.table !== null && html.table=="email_queue"){
											contentHtml+="<td>"+row[col]+"</td>";
										}else{
											if(row[col]==1 || row[col]=="1"){
												contentHtml+='<td><span class="label label-success">Active</span></td>';
											}else{
												contentHtml+='<td><span class="label label-danger">Inactive</span></td>';
											}
										}
									}else if(row.hasOwnProperty(col)){
										contentHtml+="<td>"+row[col]+"</td>";
									}else{
										contentHtml+="<td></td>";
									}
								}
							});
						}else{
							$.each(row, function(j,rowDetails){
								if (typeof html.uniqueField !== 'undefined' && html.uniqueField !== null && html.uniqueField == j){
									uniqueFieldVal=rowDetails;
								}
								contentHtml+="<td>"+rowDetails+"</td>";
							});
						}
						if (typeof html.uniqueField !== 'undefined' && html.uniqueField !== null && uniqueFieldVal!=""){
							if(accessRightCode==0){
								contentHtml+='<td class="actions-list"><a href="javascript:void(0)" onClick="alert(\'Sorry you do not have access to this option!\');"><i class="fa fa-pencil"></i></a></td>';
							}else{
								contentHtml+='<td class="actions-list"><a href="'+editorPage+'?'+html.uniqueField+'='+uniqueFieldVal+'" title="Edit"><i class="fa fa-pencil"></i></a></td>';
							}
						}
						contentHtml+="</tr>";
					});
					$("#documents_data").append(contentHtml);
					
					if(html.total && html.iTotalRecordsReturned && html.iTotalRecordsReturned==html.total){
						complete=true;
					}else{
						complete=false;
					}
     			}else{
     				complete=true;
					$("#table-breakpoint").before('<div class="alert alert-danger alert-dismissable"><button class="close" aria-hidden="true" data-dismiss="alert" type="button">×</button>No more records found!</div>');
     			}
     			//initialize table
				$('#table-breakpoint').basictable({
        			breakpoint: 751
     			});
			}
			
			if(end< totalNum){
				$('#display_more_btn').show();
			}
			$('#img_loading_div').hide();
			completeScroll=false;
		});
	}