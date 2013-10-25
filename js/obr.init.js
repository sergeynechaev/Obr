/**
 * Obramlyator
 * Version 2.2 beta
 * For last version please visit http://dert.ru/obr/
 *
 * This program is free for personal or non-commercial use
 * (c) 2010-2012 Sergey Nechaev - http://sergeynechaev.com
 * 
 * @include "/Obr/js/jquery-doc.js"
 * @include "/Obr/js/obr.js"
 * @include "/Obr/js/obr.utils.js"
 */

$(document).ready(function(){
	
	/*
	if ($.browser.msie){
		alert("Internet Explorer!")};
	if ($.browser.mozilla){
		alert("Mozilla Firefox!")};
	if ($.browser.webkit){
		alert("Google Chrome или Safari!")};
	if ($.browser.opera){
		alert("Opera!")};
		*/

	// set colorpicker
	$('#colorSelector, #inpBorderColor').ColorPicker({
		color: $('#inpBorderColor').val(),
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#colorSelector span').css('backgroundColor', '#' + hex);
			$('#inpBorderColor').val('#' + hex);
		},
		onSubmit: function (hsb, hex, rgb) {
			$('#colorSelector span').css('backgroundColor', '#' + hex);
			$('#inpBorderColor').val('#' + hex);
		}
	});

	// menu hover
	$(".divMenu, .divMenuActive").hover(function () {
		$(this).toggleClass("divMenuHover");
    });

	// menu click
	$('div[id^="Menu"]').click(function () {
		SwitchMenu( $(this).context.id );
    });
    
    // link to the Ext format section
	$("#spanExtFormatLink").click( function() {
		$('#MenuExt').trigger("click");
	});

	// add number before/after photo
	$('#spanAddNumberBefore').click( function() { 
		$('#spanAddNumberAfter').removeClass( 'switchAddNumberActive' );
		$(this).addClass( 'switchAddNumberActive' );
		isNumberBeforePhoto = true;
		isNumberAfterPhoto = false;
	});
	$('#spanAddNumberAfter').click( function() { 
		$('#spanAddNumberBefore').removeClass( 'switchAddNumberActive' );
		$(this).addClass( 'switchAddNumberActive' );
		isNumberBeforePhoto = false;
		isNumberAfterPhoto = true;
	});
	
	// animate color of expand/collapse button settings
	$('#divToggleSettings').mouseover( function() {
		$('#divToggleSettings').css("background-color", "#777777");
	});
	$('#divToggleSettings').mouseout( function() {
		if( isSettingsCollapsed ) {
			$('#divToggleSettings').css("background-color", "#009900");
		} else {
			$('#divToggleSettings').css("background-color", "#0066cc");
		}
	});

	// handler to expand and collapse settings
	$('#divToggleSettings').click( function() { 
		
		$('#SettingsCollapseWrapper').slideToggle("slow", function() {
			// animation complete
		});
		
		if( isSettingsCollapsed ) {
			// show the buttons
			$('#divMenuExtDo').fadeIn("fast");
			$('#imgToggleSettings').attr("src", "images/btn_collapse.gif");
			$('#divToggleSettings').animate( {backgroundColor: "#0066cc"}, 1000 );
		} else {
			// hide the buttons
			$('#divMenuExtDo').fadeOut("fast");
			$('#imgToggleSettings').attr("src", "images/btn_expand.gif");
			$('#divToggleSettings').animate( {backgroundColor: "#009900"}, 1000 );
		}
		
		// trig the status
		isSettingsCollapsed = (isSettingsCollapsed) ? false : true;
		
		// change the height of the settings area after animation complete
		$('#divImproveResult').height( CalculateSettingsAreaHeight() );
		
		// recalculate the sorting area size
		CalculateSortingAreaSize();
	});
	
	// sorting image area's handler
	$("#sortable").sortable({ items: 'li', opacity: 0.8, revert: true });
	$("#sortable").disableSelection();
	$("#sortable").bind( "sortupdate", function( event, ui ) {
		arrImagesOrderTemp = $('#sortable').sortable( 'toArray' );
	});
	
	// sorting image area's save button click
	$("#spanSortImagesSave").click( function() {
		SortSave();
	});
	
	// sorting image area's close button click
	$("#spanSortImagesClose").click( function() {
		SortCancel();
	});
	
	// handler to change result format output type in the Simple mode
	$('#spanResultLJSimple').click( function() {
		$('#spanResultHtmlSimple').removeClass( 'spanResultSwitchActive' );
		$(this).addClass( 'spanResultSwitchActive' );
		resultFormatOutputType = 'lj';
		if( $('#txtDestText').val() ) {
			$('#btnDo').trigger("click");
		}
    });
    $('#spanResultHtmlSimple').click( function() {
		$('#spanResultLJSimple').removeClass( 'spanResultSwitchActive' );
		$(this).addClass( 'spanResultSwitchActive' );
		resultFormatOutputType = 'html';
		if( $('#txtDestText').val() ) {
			$('#btnDo').trigger("click");
		}
    });
    
    // mark and open all external links in the new window
    $("#tabMenuAbout a[href^='http'], #tabMenuHistory a[href^='http'], #divCopyright a[href^='http']").each( function() {
    	//var extHref = new RegExp('/' + window.location.host + '/');
   		//if( !extHref.test( $(this).href ) ) {
    		$(this).attr( "target", "_blank" );
	   		$(this).after( '<img src="images/extlink.png" title="Ссылка откроется в новом окне" alt="Ссылка откроется в новом окне" border="0" />' );
   		//}
    });
    
    // for the first run set handlers to the newly created elements
    SetHandlers();
});

// change the area's sizes if window resize
$(window).resize(function() {
	// recalculate the settings area height
	if( $('#divCopyright').is(":hidden") ) {
		$('#divImproveResult').height( CalculateSettingsAreaHeight() );
	}
	// recalculate the sorting area size
	if( $('#divSortImages').is(":visible") ) {
		$("#lean_overlay").hide();
		$("#divSortImages").css({ "display" : "none" });
		CalculateSortingAreaSize();
		$("#hrefSortImages").trigger("click");
	} else {
		CalculateSortingAreaSize();
	}
});

// check if the user try to leave the page
window.onbeforeunload = function() {
	if( isDoPizdatoPressed ) {
		return "Вы точно хотите уйти со страницы Обрамлятора? Картинки и подписи к ним не сохранятся.";
	}
}

// preload images
var image1 = $('<img />').attr('src', 'images/btn_expand.gif');
var image2 = $('<img />').attr('src', 'images/img_deleted.png');