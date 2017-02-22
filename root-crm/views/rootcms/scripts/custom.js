var menuxhr;
function __alertModalBox(msg){
	$("#globalMessage").html(msg);
	$('#globalPrompt').modal('show');
}
function dateTimeFromUnix(UNIX_timestamp){
	var a = new Date(UNIX_timestamp * 1000);
    
	var year = a.getFullYear();
	var month = a.getMonth()+1;
	var dateNum = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = year + '-' + month + '-' + dateNum + ' ' + hour + ':' + min ;

	return time;
}

function getTimestampFromDate(dateString){
	var dateParts = dateString.split('/'),	date;
	var newDate=dateParts[1]+"/"+dateParts[0]+"/"+dateParts[2];
	date = new Date(newDate);
	date= date.getTime();
	date= parseInt(date)/1000;
	return date;
}

function getTimestampFromDateTime(dateString){
	var dateTimeParts = dateString.split(' '),
	timeParts = dateTimeParts[1].split(':'),
	dateParts = dateTimeParts[0].split('-'),
	date;

	date = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
	date= date.getTime();
	date= parseInt(date)/1000;
	return date;
}
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function dataAsJson(name, form){
	var x = $("#"+name).serializeArray();
	var outputObj = new Object();
    $.each(x, function(i, field){
    	if(field.name!="id" && field.name!="table_name" && field.name!="unique_field" && field.name!="editorField" && field.name!="editorValue" && field.name!="data"){
    		$("input[name="+field.name+"]").removeAttr('name');
        	outputObj[field.name]   = field.value;
     	}
    });
    $("#data").val(JSON.stringify(outputObj));
	form.submit();
}

function switchInSystems(id){
	var jsonRow = backendDirectory+'/swtich_user_system?id='+id;
	$.getJSON(jsonRow,function(result){
		if(result.success){
			window.location.href=backendDirectory+"/index";
		}
	});
}

function fetch_users_sites(){
	$("#swtich_sites").html('');
	var jsonRow = backendDirectory+'/fetch_user_systems';
	$("#loggedInUserSystems").hide();
	$.getJSON(jsonRow,function(result){
		if(result.aaData){
			var contentHtmlStr="", countUserSystems=0;
			$.each(result.aaData, function(i,item){
				countUserSystems++;
				contentHtmlStr+='<li><a href="javascript:void(0)" onClick="switchInSystems(\''+item._id+'\'); return false;">'+item.name+'</li>';     
			});
			if(countUserSystems>=1){
				$("#loggedInUserSystems").show();
				$(".totalLoggedInUserSystems").html(countUserSystems);
				$("#swtich_sites").append(contentHtmlStr);
			}
		}
	});
}
function load_navigation_data(){
	$("#dashboard-menu").html('');
	var jsonRow = backendDirectory+'/load_navigator';
	var keyword= $("#menuSearchBox").val();
	if(keyword!='' && keyword!='undefined'){
		jsonRow +='?s='+keyword;
	}
	
	if(menuxhr) menuxhr.abort();
	menuxhr=$.getJSON(jsonRow,function(result){
		if(result.aaData){
			var urlStr = window.location.pathname;
			var findStr=backendDirectory;
			if(urlStr.indexOf(findStr)!==-1){
				var openedFileNameStr = urlStr.substring(findStr.length);
			}else{
				var openedFileNameStr = urlStr;
			}
			var table_html='<li class="treeview';
			
			if(openedFileNameStr=="index" || openedFileNameStr=="" || openedFileNameStr=="/"){
				table_html+=' active ';
			}	
			table_html+='"><a href="'+backendDirectory+'/"><i class="fa fa-dashboard"></i> <span>Dashboard</span><span class="pull-right-container"><i class="fa fa-angle-left pull-right"></i></span></a></li>';
			
			$.each(result.aaData, function(i,item){
				if(item.active==1){
					var activeMenuFlag=false;
					if(item.module_items){
						if(item.module_items!=""){
							try{
								var module_items = JSON.parse(item.module_items); 
        					}	catch (error){
       							var module_items =  item.module_items; 
    						}
						
							module_items.sort(dynamicSort("item_sort_order"));
							
							var iconNameStr='';
							if(item.icon_class!=""){
								iconNameStr='<i class="'+item.icon_class+'"></i>';
							}
							if(item.icon_path!=""){
								iconNameStr='<img width="24" height="24" src="'+item.icon_path+'" alt="">';
							}
														
							var subTableHtmlStr="";	
							$.each(module_items, function(i,row){
								var linkStr=row.link;
								/**if(linkStr.charAt(0)!="/"){
									linkStr="/"+linkStr;
								}**/
								if(openedFileNameStr==row.link){
									activeMenuFlag=true;
									subTableHtmlStr+='<li class="active">';
								}else{
									subTableHtmlStr+='<li>';
								}
								subTableHtmlStr+='<a href="'+backendDirectory+row.link+'" ';
								if(row.target==0){
									subTableHtmlStr+=' target="_blank" ';
								}
								subTableHtmlStr+='><i class="fa fa-circle-o"></i> '+row.label+'</a></li>';
							});
									
							if(activeMenuFlag){
								table_html+='<li class="active treeview">';
							}else{
								table_html+='<li class="treeview">';
							}
							table_html+='<a href="#">'+iconNameStr+' <span>'+item.name+'</span><span class="pull-right-container"><i class="fa fa-angle-left pull-right"></i></span></a>';
							table_html+='<ul class="treeview-menu">'+subTableHtmlStr+'</ul>';
						}
					}   
				}             
			});
			$("#dashboard-menu").append(table_html);
		}
	});
}
$(function () {
    load_navigation_data();
    fetch_users_sites();
});