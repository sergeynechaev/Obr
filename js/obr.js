/**
 * Obramlyator
 * Version 2.2 beta
 * For last version please visit http://dert.ru/obr/
 *
 * This program is free for personal or non-commercial use
 * (c) 2010-2012 Sergey Nechaev - http://sergeynechaev.com
 * 
 * @include "/Obr/js/jquery-doc.js"
 * @include "/Obr/js/obr.init.js"
 * @include "/Obr/js/obr.utils.js"
 */

/*
 *  You may change these variables if you want 
 */
var strRepostButtonText = 'Разместить у себя в журнале'; /* LJ Repost Button text */

/* 
 * It's not recommended to change these variables. Do it on your own risk.
 * Remember that after changing some of these variables you may also have to
 * change some programming code to let it work correctly.
 */
var imagePreviewSize = 100;
var imgBorderSize = 0;
var imgBorderColor = '';
var ljCutAfter = 0;
var ljCutText = '';
var numberBeforePhoto = false;
var numberAltTitle = false;
var numberText = '';
var arrImages = new Array();
var arrImagesOrder = new Array();
var arrImagesOrderTemp = new Array();
var isTestContentCleared = false;
var resultFormat = 'html';
var resultFormatOutputType = 'lj';
var arrMenus = new Array( 'MenuHowto', 
						  'MenuSimple',
						  'MenuExt',
						  'MenuHistory',
						  'MenuAbout' );
var isExtFormat = true;
var isNumberBeforePhoto = true;
var isNumberAfterPhoto = false;
var isSettingsCollapsed = false;
var isDoPizdatoPressed = false;
var PreviewWindow;
var helpTextBeforePhoto = 'Перед каждой картинкой можно написать любой текст (эта тестовая фраза не будет видна при выводе и просмотре результата).';
var helpTextAfterPhoto = 'Также текст можно написать и после фото.';

/**
 * Class ObrImage
 *
 * @param {String} srcLink The link to the image. This param is obligatory.
 * @param {Int} imgWidth The image's width in pixels
 * @param {Int} imgHeight The image's height in pixels
 * @param {String} txtBefore The text before the image
 * @param {String} txtAfter The text after the image
 * @param {Bool} isActive Show the image in final result or not  --not used yet
 * @return void
 */
function ObrImage( srcLink, imgWidth, imgHeight, txtBefore, txtAfter, isActive )
{
	imgWidth = imgWidth || '';
	imgHeight = imgHeight || '';
	txtBefore = txtBefore || '';
	txtAfter = txtAfter || '';
	isActive = isActive || true;
	
	this.srcLink = srcLink;
	this.imgWidth = imgWidth;
	this.imgHeight = imgHeight;
	this.txtBefore = txtBefore;
	this.txtAfter = txtAfter;
	this.isActive = isActive;
}

/**
 * This function creates a simple result.
 * In case of Ext format is used this function creates images preview.
 *
 * @return void
 */
function DoPizdato()
{
	if( $("#txtSourceText").val() == '' ) {
		alert( 'Дайте мне ссылок на фото, и побольше, побольше!' );
		return false;
	}
	
	// get settings
	GetSettings();
	
	// parse the source text
	var re = /https?:\/\/[._\w\d\-\/&%\?;А-Яа-я]+/gi;
	var tmpRes = $("#txtSourceText").val().match( re ) || [];
	
	// get only links ending with picture ext (gif, jpeg, png, bmp)
	// or links started with '/pic' word - special for LJ picture hosting
	for( var i = 0; i < tmpRes.length; i++ ) {
	   if( tmpRes[i] != '' && ( tmpRes[i].search(/\.?[jpe?g|png|gif|bmp]$/i) != -1 
	                         || tmpRes[i].search(/\/pic\/[\w\d]{8}$/i) != -1 ) ) {
	                         	
			// check if we already have image in the stack
			if( !SearchImg( tmpRes[i] ) ) {
				arrImages.push( new ObrImage( tmpRes[i] ) );
				// add IDs to further sort images
				arrImagesOrder.push( arrImages.length - 1 );
				// set the 100% size if new images exists
				imagePreviewSize = 100;
			}
	   }
	}
	
	// save the temporary images sorting order
    arrImagesOrderTemp = arrImagesOrder.slice(0);
	
	// preview or create the result depending on the format type
	if( isExtFormat && arrImages.length > 0 ) {
		
		// add the help text for the first run
		if( !isDoPizdatoPressed ) {
			arrImages[0].txtBefore = helpTextBeforePhoto;
			arrImages[0].txtAfter = helpTextAfterPhoto;
		}
		
		// collapse the settings area and show the trigger button
		$('#imgToggleSettings').show();
		$('#divToggleSettings').trigger('click');
		
		// animate the color of the collapse settings area button
		$('#divToggleSettings').animate( 
			{backgroundColor: "#eeeeee"}, 400 ).animate( 
			{backgroundColor: "#cc0000"}, 400 ).animate( 
			{backgroundColor: "#eeeeee"}, 400 ).animate( 
			{backgroundColor: "#cc0000"}, 400 ).animate( 
			{backgroundColor: "#eeeeee"}, 400 ).animate( 
			{backgroundColor: "#009900"}, 400 );
		
		// show the buttons to resize, sort and preview images
		$('#divSelectImageSize').html( '<div id="divImgSizeSwitcher"><p style="margin:0 0 7px 0;font-size:11px;">Для удобства просмотра выберите масштаб<br />(при создании результата будет взят оригинал)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span id="spanImgSize_33" class="switchImgSize">33%</span>&nbsp;<span id="spanImgSize_50" class="switchImgSize">50%</span>&nbsp;<span id="spanImgSize_67" class="switchImgSize">67%</span>&nbsp;<span id="spanImgSize_100" class="switchImgSize switchImgSizeActive">оригинал</span>&nbsp;&nbsp;&nbsp;&nbsp; <span class="middot">|</span>&nbsp;&nbsp;&nbsp;&nbsp;<a id="hrefSortImages" rel="leanModal" name="divSortImages" href="#divSortImages">сортировка</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="middot">|</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id="spanPreviewResult">просмотр</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="middot">|</span>&nbsp;&nbsp;&nbsp;&nbsp;<span id="spanScrollToTop">вверх</span>&nbsp;<span class="spanSlashGray">/</span><span id="spanScrollToBottom">вниз</span></p></div>' );
		
		// set the area for preview HTML
		$('#divCopyright').hide();
		$('#divSelectImageSize').show();
		$('#spanExtRefreshHelpText').show();
		$('#btnDoExtOne').val( 'Обновить' );
		
		// fill the preview area with images		
		PreviewHTML();
		
		// every call we need to set handler for popup modal window
		$('a[rel*=leanModal]').leanModal({ top: 35, overlay: 0.7 });
		
		UpdateSortingArea();
		
	} else {
		
		// fill the textarea with the result
		if( resultFormat == 'html' ) {
			$("#txtDestText").val( CreateHTML() );
		} else {
			$("#txtDestText").val( CreateBBCode() );
		}
		
		$('#spanRefreshHelpText').show();
		$('#btnDo').val( 'Обновить' );
		
		$("#txtDestText").focus();
	}
	
	isDoPizdatoPressed = true;
}

/**
 * DoMegaPizdato The function to create a yummy result
 *
 * @return void
 */
function DoMegaPizdato()
{
	// get settings
	GetSettings();
	
	// fill the extended textarea with the result
	if( resultFormat == 'html' ) {
		$("#txtDestTextExt").val( CreateHTML( true ) );
	} else {
		$("#txtDestTextExt").val( CreateBBCode( true ) );
	}
	$("#txtDestTextExt").focus();
}

/**
 * Function to preview result into the special area for improving
 *
 * @return void
 */
function PreviewHTML()
{
	var txtResult = '';
	var iPhotoNumber = 0;
	var lastImgID = -1;
	
	for( var i = 0; i < arrImagesOrder.length; i++ ) {
		
		var imgPointer = arrImagesOrder[i];
		
		if( arrImages[imgPointer].isActive ) {
			
			// add image container
			txtResult += '<div id="divImgContainer_'+i+'">';
			
			// get the photo number text
			if( numberText != '' ) {
				var curNumberText = ( numberText.search( "@obrfn@" ) == -1) ? numberText+( iPhotoNumber+1 ) : numberText.replace( "@obrfn@", (iPhotoNumber+1) );
			}
			
			// add the number and text before foto
			if( $("#chkAddNumber").attr('checked') && isNumberBeforePhoto ) {
				txtResult += '<table id="tableBeforeImg_'+imgPointer+'" class="tableBeforeImg" cellpadding="0" cellspacing="0" border="0"><tr><td class="tdBeforeImgNumber"><span id="spanImgNumber_'+imgPointer+'">'+curNumberText+'</span></td><td class="tdBeforeImgCaption">';
			}
			txtResult += '<p id="pTxtBeforeImg_'+imgPointer+'" class="pTxtBeforeImg"><textarea class="inpTxtBeforeImg" name="inpTxtBeforeImg_'+imgPointer+'" id="inpTxtBeforeImg_'+imgPointer+'">'+arrImages[imgPointer].txtBefore+'</textarea></p>';
			if( $("#chkAddNumber").attr('checked') && isNumberBeforePhoto ) {
				txtResult += '</td></tr></table>';
			}
			
			// set image width and height
			if( arrImages[imgPointer].imgWidth == '' || arrImages[imgPointer].imgHeight == '' ) {
				
				var imgTemp = new Image();
				imgTemp.src = arrImages[imgPointer].srcLink;
				imgTemp.id = "imgPreview_"+imgPointer;
				imgTemp.onload = function(){ SetImageWidthHeight( this ); }
				
				// check if the image is already in cache
				if( imgTemp.width ) { arrImages[imgPointer].imgWidth = imgTemp.width; }
				if( imgTemp.height ) { arrImages[imgPointer].imgHeight = imgTemp.height; }
			}
			
			// create img tag
			txtResult += '<img id="imgPreview_'+imgPointer+'" class="imgPreviewHtml" src="'+arrImages[imgPointer].srcLink+'"';
			if( $("#chkAddBorder").attr('checked') ) {
				txtResult += ' style="border:solid '+imgBorderSize+'px '+imgBorderColor+'"';
			}
			txtResult += ' align="top" />';
	
			// arrows to move images up and down
			var uarrStyle = ( i ) ? 'visible' : 'hidden';
			var darrStyle = ( i < arrImagesOrder.length - 1 ) ? 'visible' : 'hidden';
			
			// cut the 'up' arrow near the first image
			if( !iPhotoNumber && i ) {
				uarrStyle = 'hidden';
			}
			
			txtResult += '<span class="moveArrowUp" id="spanMoveImgUp_'+imgPointer+'" style="visibility: '+uarrStyle+'">&uarr;</span><span class="moveArrowDown" id="spanMoveImgDown_'+imgPointer+'" style="visibility: '+darrStyle+'">&darr;</span>';
			
			// 'delete' button
			txtResult += '<span class="delImage" id="spanDeleteImg_'+imgPointer+'">x</span>';
	
			// text after photo
			if( $("#chkAddNumber").attr('checked') && isNumberAfterPhoto ) {
				txtResult += '<table class="tableAfterImg" cellpadding="0" cellspacing="0" border="0"><tr><td class="tdAfterImgNumber"><span id="spanImgNumber_'+imgPointer+'">'+curNumberText+'</span></td><td class="tdAfterImgCaption">';
			}
			txtResult += '<p id="pTxtAfterImg_'+imgPointer+'" class="pTxtAfterImg"><textarea class="inpTxtAfterImg" name="inpTxtAfterImg_'+imgPointer+'" id="inpTxtAfterImg_'+imgPointer+'">'+arrImages[imgPointer].txtAfter+'</textarea></p><br />';
			if( $("#chkAddNumber").attr('checked') && isNumberAfterPhoto ) {
				txtResult += '</td></tr></table>';
			}
			
			// close image container
			txtResult += '</div>';
			
			iPhotoNumber++;
			
			lastImgID = imgPointer;
			
		} else {	// add container to display deleted image
			
			// add invisible empty image container to avoid incorrect moving images up and down
			txtResult += '<div id="divImgContainer_'+i+'">';
			txtResult += '<p id="pTxtBeforeImg_'+imgPointer+'" class="pTxtBeforeImg"></p>';
			txtResult += '</div>';
			$("#divImgContainer_"+i).hide();
			
			// start the deleted image container
			txtResult += '<div class="divImgDeleted" id="divImgContainerDeleted_'+imgPointer+'">';
			txtResult += '<span class="textPreviewDeletedImg" id="spanPreviewDeletedImg_'+imgPointer+'">Картинка удалена</span><div class="previewDeletedImg" id="divPreviewDeletedImg_'+imgPointer+'">';
			
			// text before deleted image
			txtResult += '<p style="margin:0;">'+arrImages[imgPointer].txtBefore+'</p>';
			
			// compute the preview width of the deleted image
			if ( arrImages[imgPointer].imgWidth >= arrImages[imgPointer].imgHeight ) {
				var imgSize = ' width="200"';
			} else if ( arrImages[imgPointer].imgWidth < arrImages[imgPointer].imgHeight ) {
				var imgSize = ' height="200"';
			} else {
				var imgSize = ' width="200"';
			}
			
			// add deleted image
			txtResult += '<img'+imgSize+' src="'+arrImages[imgPointer].srcLink+'"';
			if( $("#chkAddBorder").attr('checked') ) {
				txtResult += ' style="border:solid '+imgBorderSize+'px '+imgBorderColor+'"';
			}
			txtResult += ' vspace="5" />';
			
			// text after deleted image
			txtResult += '<p style="margin:0;">'+arrImages[imgPointer].txtAfter+'</p>';
			
			txtResult += '</div>';
			txtResult += '&nbsp; <span class="rightarrow">&rarr;</span> &nbsp; <span class="restoreImg" id="spanRestoreImg_'+imgPointer+'">Восстановить</span>';
			txtResult += '</div>';
			
		} // END if( arrImages[imgPointer].isActive )
	} // END for( var i = 0; i < arrImagesOrder.length; i++ ) {
	
	// set the result area
	txtResult += '<br /><input type="button" id="btnDoExtTwo" name="btnDoExtTwo" onclick="DoMegaPizdato()" class="buttonExt" value="Жамк &mdash; два!">';
	txtResult += '<br /><br />Получить: <span id="spanResultLJExt" class="spanResultSwitch';
	if( resultFormatOutputType == 'lj' ) {
		txtResult += ' spanResultSwitchActive';
	}
	txtResult += '">html для ЖЖ</span>&nbsp;<span id="spanResultHtmlExt" class="spanResultSwitch';
	if( resultFormatOutputType == 'html' ) {
		txtResult += ' spanResultSwitchActive';
	}
	txtResult += '">чистый html</span>';
	txtResult += '<br /><br />';
	txtResult += '<textarea id="txtDestTextExt" name="txtDestTextExt" cols="65" rows="18" onfocus="select(this);"></textarea>';
	txtResult += ' <label for="txtDestTextExt"><i>результат</i></label>';

	// show the generated HTML
	$('#divImproveResult').html( txtResult );
	
	// cut the 'down' arrow near the last image
	if( !arrImages[arrImagesOrder[i-1]].isActive && lastImgID >= 0 ) {
		$("#spanMoveImgDown_"+lastImgID).css( "visibility", "hidden" );
	}
	
	// restore images size
	$("#spanImgSize_"+imagePreviewSize).trigger( "click" );

	// resize generated textareas
	FitAllTextarea();
}

/**
 * Function to preview the html result in the separate window
 * 
 * @return void
 */
function PreviewResult()
{
	if( typeof( PreviewWindow ) !== "undefined" ) {
		//alert(PreviewWindow.document.readyState);
		PreviewWindow.close();
	}
	PreviewWindow = window.open( "", "PreviewResult", "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=1200,height="+($(window).height()-30) );
	PreviewWindow.document.write( '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' );
	PreviewWindow.document.write( "\n");
	PreviewWindow.document.write( '<html>' );
	PreviewWindow.document.write( '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' );
	PreviewWindow.document.write( '<title>Предварительный просмотр &mdash; &laquo;Обрамлятор&raquo;</title></head>' );
	PreviewWindow.document.write( '<body style="background-color:#ffffff; color:#000000; margin:30px; font-family: \'Times New Roman\',Times,Georgia,Serif; font-size:18px;">' );
	PreviewWindow.document.write( CreateHTML( true, 'html' ) );
	PreviewWindow.document.write( '</body></html>' );
}

/**
 * Function to set handlers and highlights to the newly created elements.
 * Using 'delegate' to let events work for the elements which is not created yet.
 *
 * @return void
 */
function SetHandlers()
{
	// add highlights - text before & after images
	$("body").delegate('p[id^="pTxtBeforeImg"], p[id^="pTxtAfterImg"]', "mouseover", function(){
		if( $(this).attr('edit') != 'true' ) {
			$(this).css( "background-color", "#cae9f7" );
		}
    });
	$("body").delegate('p[id^="pTxtBeforeImg"], p[id^="pTxtAfterImg"]', "mouseout", function(){
		if( $(this).attr('edit') != 'true' ) {
			$(this).css( "background-color", "#ffffff" );
		}
    });

	// add highlights - arrows to move image up & down, 'delete' and 'restore' button
	$("body").delegate('.moveArrowUp', "mouseover", function(){
		$(this).css( "color", "#009900" );
    });
	$("body").delegate('.moveArrowUp', "mouseout", function(){
		$(this).css( "color", "#cccccc" );
    });
	$("body").delegate('.moveArrowDown', "mouseover", function(){
		$(this).css( "color", "#0066cc" );
    });
	$("body").delegate('.moveArrowDown', "mouseout", function(){
		$(this).css( "color", "#cccccc" );
    });
    $("body").delegate('.delImage', "mouseover", function(){
		$(this).css( "color", "#cc0000" );
    });
	$("body").delegate('.delImage', "mouseout", function(){
		$(this).css( "color", "#cccccc" );
    });
    $("body").delegate('.restoreImg', "mouseover", function(){
		$(this).css( "color", "#009900" );
    });
	$("body").delegate('.restoreImg', "mouseout", function(){
		$(this).css( "color", "#888888" );
    });

	// add click - text before & after images
	$("body").delegate('p[id^="pTxtBeforeImg"], p[id^="pTxtAfterImg"]', "click", function(){
		$(this).css( "border", "1px solid #cccccc" );
		$(this).css( "background-color", "#f7ffe5" );
		$(this).attr( 'edit', 'true' );
		
		// get the image id & the element's name
		elemID = parseInt( $(this).context.id.replace( /pTxtBeforeImg_|pTxtAfterImg_/i, '') );
		elemInpName = $(this).context.id.replace( /^p/, 'inp' );
		
		// remove the help text
		if( $("#"+elemInpName).val() == helpTextBeforePhoto || $("#"+elemInpName).val() == helpTextAfterPhoto ) {
			$("#"+elemInpName).val('');
		}
    });

	// add focusout event to save the image text
	$("body").delegate('p[id^="pTxtBeforeImg"], p[id^="pTxtAfterImg"]', "focusout", function(){
		$(this).css( "border", "1px solid #ffffff" );
		$(this).css( "background-color", "#ffffff" );
		$(this).removeAttr( 'edit' );
		
		// get the image id & the element's name
		elemID = parseInt( $(this).context.id.replace( /pTxtBeforeImg_|pTxtAfterImg_/i, '') );
		elemInpName = $(this).context.id.replace( /^p/, 'inp' );
		
		// save text
		if( elemInpName.search( /before/i ) != -1 ) {
			arrImages[elemID].txtBefore = $("#"+elemInpName).val();
		} else if( elemInpName.search( /after/i ) != -1 ) {
			arrImages[elemID].txtAfter = $("#"+elemInpName).val();
		}
    });

	// dynamic textarea handlers
    $("body").delegate('textarea[id^="inpTxtBeforeImg"], textarea[id^="inpTxtAfterImg"]', "keyup", function(){
		$(this).autoResize({
		    maxHeight: 2000,
		    minHeight: 25,
		    extraSpace: 2,
		    animate: false
		});
    });

	// handler to sort images
	$("body").delegate('span[id^="spanMoveImgUp"]', "click", function(){
		$(this).css( "color", "#cccccc" );
		MoveImageUpDown( $(this), 'up' );
    });
	$("body").delegate('span[id^="spanMoveImgDown"]', "click", function(){
		$(this).css( "color", "#cccccc" );
		MoveImageUpDown( $(this), 'down' );
    });
    
    // handler to delete image
    $("body").delegate('span[id^="spanDeleteImg"]', "click", function(){
		$(this).css( "color", "#cccccc" );
		DeleteImage( $(this) );
    });
    
    // handler to restore image
    $("body").delegate('span[id^="spanRestoreImg"]', "click", function(){
		$(this).css( "color", "#009900" );
		RestoreImage( $(this) );
    });
    
    // handler to preview the deleted image
    $("body").delegate('span[id^="spanPreviewDeletedImg"]', "mouseover", function(){
		$(this).css( "color", "#0066cc" );
		imgID = parseInt( $(this).context.id.replace( /spanPreviewDeletedImg_/i, '' ) );
		elemOffset = $("#divImgContainerDeleted_"+imgID).offset();
		$("#divPreviewDeletedImg_"+imgID).css("top", elemOffset.top+32+"px");
		$("#divPreviewDeletedImg_"+imgID).show();
    });
    $("body").delegate('span[id^="spanPreviewDeletedImg"]', "mouseout", function(){
		$(this).css( "color", "#888888" );
		imgID = parseInt( $(this).context.id.replace( /spanPreviewDeletedImg_/i, '' ) );
		$("#divPreviewDeletedImg_"+imgID).hide();
    });
	
	// handler to resize images
	$("body").delegate('span[id^="spanImgSize"]', "click", function(){
		$('span[id^="spanImgSize"]').removeClass( 'switchImgSizeActive' );
		$(this).addClass( 'switchImgSizeActive' );
		ResizeImages( $(this) );
    });
    
    // handler to scroll preview area
    $("body").delegate('#spanScrollToTop', "click", function(){
    	$('#divImproveResult').scrollTo("0", 400);
    });
    $("body").delegate('#spanScrollToBottom', "click", function(){
    	$('#divImproveResult').scrollTo("max", 400);
    });
    
	// handler to preview result in new window
    $("body").delegate('#spanPreviewResult', "click", function(){
		PreviewResult();
	});
	
	// handler to change result format output type in the Ext mode
	$("body").delegate('#spanResultLJExt', "click", function(){
		$('#spanResultHtmlExt').removeClass( 'spanResultSwitchActive' );
		$(this).addClass( 'spanResultSwitchActive' );
		resultFormatOutputType = 'lj';
		if( $('#txtDestTextExt').val() ) {
			$('#btnDoExtTwo').trigger("click");
		}
    });
    $("body").delegate('#spanResultHtmlExt', "click", function(){
		$('#spanResultLJExt').removeClass( 'spanResultSwitchActive' );
		$(this).addClass( 'spanResultSwitchActive' );
		resultFormatOutputType = 'html';
		if( $('#txtDestTextExt').val() ) {
			$('#btnDoExtTwo').trigger("click");
		}
    });
}

/**
 * Function to delete image
 *
 * @param {Object} delElem Pointer to the element containing image ID
 * @return void
 */
function DeleteImage( delElem )
{
	// get the image ID
	var imgPointer = parseInt( $(delElem).attr("id").replace( /spanDeleteImg_/i, '' ) );
	
	arrImages[imgPointer].isActive = false;
	
	PreviewHTML();
	
	UpdateSortingArea();
}

/**
 * Function to restore image
 *
 * @param {Object} restElem Pointer to the element containing image ID
 * @return void
 */
function RestoreImage( restElem )
{
	// get the image ID
	var imgPointer = parseInt( $(restElem).attr("id").replace( /spanRestoreImg_/i, '' ) );
	
	arrImages[imgPointer].isActive = true;
	
	PreviewHTML();
	
	UpdateSortingArea();
}

/**
 * Function to move image up or down
 *
 * @param {Object} moveElem Pointer to the element containing switch ID
 * @param {String} moveDirection Direction to move - "up" or "down"
 * @return void
 */
function MoveImageUpDown( moveElem, moveDirection )
{
	// get the current and the move positions
	var posCurrent = parseInt( moveElem.parent().get(0).id.replace( /divImgContainer_/i, '' ) );
	if( !IsNumber( posCurrent ) ) return;
	
	if( moveDirection == 'up' ) {
		var posMove = posCurrent - 1;
		// check if image is not active
		while( !arrImages[arrImagesOrder[posMove]].isActive && posMove >= 0 ) {
			posMove--;
		}
	} else if( moveDirection == 'down' ) {
		var posMove = posCurrent + 1;
		// check if image is not active
		while( !arrImages[arrImagesOrder[posMove]].isActive && posMove <= arrImagesOrder.length - 1 ) {
			posMove++;
		}
	} else {
		return;
	}
	
	if( posMove < 0 || posMove > arrImagesOrder.length - 1 ) return;
	
	// get the element ids'
	var currentElemID = arrImagesOrder[posCurrent];
	var moveElemID = arrImagesOrder[posMove];
	
	arrImagesOrder[posCurrent] = moveElemID;
	arrImagesOrder[posMove] = currentElemID;
    
    // update the temporary images sorting order
    arrImagesOrderTemp = arrImagesOrder.slice(0);
    UpdateSortingArea();
    
    // rebuild the preview area
	PreviewHTML();
	
}

/**
 * Function to update the sorting area with newly sorted images
 * 
 * @return void
 */
function UpdateSortingArea()
{
	var txtResult = '';
	
	for( var i = 0; i < arrImagesOrder.length; i++ ) {
		var imgPointer = arrImagesOrder[i];
		
		// compute the preview width of the image
		if ( arrImages[imgPointer].imgWidth >= arrImages[imgPointer].imgHeight ) {
			var imgSize = ' width="200"';
		} else if ( arrImages[imgPointer].imgWidth < arrImages[imgPointer].imgHeight ) {
			var imgSize = ' height="200"';
		} else {
			var imgSize = ' width="200"';
		}
		
		var liStyle = (!arrImages[imgPointer].isActive) ? ' style="background:#ffffff url(\'images/img_deleted.png\') no-repeat center top;"' : '';
		var imgStyle = (!arrImages[imgPointer].isActive) ? ' style="opacity:0.4; filter:alpha(opacity=40);"' : '';
		
		txtResult += '<li id="'+arrImagesOrder[i]+'" class="ui-state-default"'+liStyle+'><center><img src="'+arrImages[imgPointer].srcLink+'"'+imgSize+imgStyle+'></center></li>';
	}
	$('#sortable').html( txtResult );
}

/**
 * Handler for 'Save' button in the sorting area. 
 * 
 * @return void
 */
function SortSave()
{
	if( !IsEqualArrays( arrImagesOrder, arrImagesOrderTemp) ) {
		// copy the sorting order
		arrImagesOrder = arrImagesOrderTemp.slice(0);
		// rebuild the preview area
		PreviewHTML();
	}
	// close the area
	$("#lean_overlay").trigger("select");
	
	UpdateSortingArea();
}

/**
 * Handler for 'Cancel' button in the sorting area. 
 * 
 * @return void
 */
function SortCancel()
{
	if( !IsEqualArrays( arrImagesOrder, arrImagesOrderTemp) ) {
		if( !confirm("Изменения не сохранятся. Все равно закрыть?") ) { 
			return;
		}
	}
	// close the area
	$("#lean_overlay").trigger("select");
	
	// restore the sorting order
	arrImagesOrderTemp = arrImagesOrder.slice(0);
	
	UpdateSortingArea();
}


/**
 * Function to resize previewed images
 *
 * @param {Object} Pointer to the element containing size parameter
 * @return void
 */
function ResizeImages( sizeElem )
{
	var imgWidth = '';
	// get the size
	imagePreviewSize = parseInt( sizeElem.context.id.replace( /spanImgSize_/i, '') );
	// resize all previewed images
	if( imagePreviewSize == 100 ) {
		$('img[id^="imgPreview"]').css( 'width', '' );
	} else {
		$('img[id^="imgPreview"]').each( function( i ){
			imgWidth = arrImages[parseInt( $(this).context.id.replace( /imgPreview_/i, '') )].imgWidth;
			if( imgWidth ) {
				$(this).css( 'width', Math.ceil( imgWidth * imagePreviewSize / 100 )+"px" );
			}
		});
	}
}

/**
 * Function to set image width and height
 *
 * @param {Object} Pointer to the image
 * @return void
 */
function SetImageWidthHeight( img )
{
	// get the image id
	var imgID = parseInt( img.id.replace( /imgPreview_/i, '') );
	// set the image properties
	arrImages[imgID].imgWidth = img.width;
	arrImages[imgID].imgHeight = img.height;
	
	// update the sorting area with the correct images' sizes
	$('#sortable li[id="'+imgID+'"] img').removeAttr('width');
	$('#sortable li[id="'+imgID+'"] img').removeAttr('height');
	if ( arrImages[imgID].imgWidth >= arrImages[imgID].imgHeight ) {
		$('#sortable li[id="'+imgID+'"] img').width(200);
	} else {
		$('#sortable li[id="'+imgID+'"] img').height(200);
	}
}

/**
 * Function to convert text to HTML. Replace \n with br tag, etc.
 * 
 * @param {String} strText Plain text which we need to convert to
 * @return {String}
 */
function ConvertTextToHtml( strText )
{
	// prepare the text, replace /n with <br>
	return strText.replace( /\n/g, "<br />");
}

/**
 * Function to resize textarea to fit the text
 *
 * @return void
 */
function FitAllTextarea()
{
	$('textarea[id^="inpTxtBeforeImg"], textarea[id^="inpTxtAfterImg"]').each( function() {
		$(this).autoResize({
		    maxHeight: 2000,
		    minHeight: 25,
		    extraSpace: 2,
		    animate: false
		});
	});
}

/**
 * Creates final HTML result
 *
 * @param {Bool} isExtFeatures Whether to use extended format features or not
 * @param {String} _resultFormatOutputType Override the global resultFormatOutputType var
 * @return {String} The result in the given format to insert into a blog
 */
function CreateHTML( isExtFeatures, _resultFormatOutputType )
{
	isExtFeatures = isExtFeatures || false;
	_resultFormatOutputType = _resultFormatOutputType || resultFormatOutputType;
	var txtResult = ''; /* true html result */
	var txtResultLJ = ''; /* special for LJ html */
	var imgTxtBefore = '';
	var imgTxtAfter = '';
	var flagLjCutIsSet = false;
	var iPhotoNumber = 0;
	
	// we need to add an empty p tag to prevent LJ for inserting wrong p tag at the beginning of the post
	if( arrImagesOrder.length ) txtResult += '<p style="margin:0;"></p>';
	
	for( var i = 0; i < arrImagesOrder.length; i++ ) {
		
		if( arrImages[arrImagesOrder[i]].isActive ) {
		
			// check and remove the help text
			imgTxtBefore = ( arrImages[arrImagesOrder[i]].txtBefore == helpTextBeforePhoto ) ? '' : arrImages[arrImagesOrder[i]].txtBefore;
			imgTxtAfter = ( arrImages[arrImagesOrder[i]].txtAfter == helpTextAfterPhoto ) ? '' : arrImages[arrImagesOrder[i]].txtAfter;
			
			// add lj-cut
			if( $("#chkAddLjcut").attr('checked') && ljCutAfter == iPhotoNumber ) {
				txtResult += '<lj-cut text="'+ljCutText+'"><cut><!--more-->';
				txtResultLJ += '<lj-cut text="'+ljCutText+'"><cut><!--more-->';
				flagLjCutIsSet = true;
			}
			
			// get the photo number text
			if( numberText != '' ) {
				var curNumberText = ( numberText.search( "@obrfn@" ) == -1) ? numberText : numberText.replace( "@obrfn@", (iPhotoNumber+1) );
			}
			
			if( ($("#chkAddNumber").attr('checked') && isNumberBeforePhoto) || (isExtFeatures && imgTxtBefore != '') ) {
				
				txtResult += '<p style="margin:0 0 8px 0;line-height:130%;">';
			
				// add number before photo
				if( $("#chkAddNumber").attr('checked') && isNumberBeforePhoto ) {
					txtResult += curNumberText+' ';
					txtResultLJ += curNumberText+' ';
				}
				// add text before img
				if( isExtFeatures && imgTxtBefore != '' ) {
					txtResult += ConvertTextToHtml( imgTxtBefore );
					txtResultLJ += imgTxtBefore;
				}
			
				txtResult += '</p>';
				txtResultLJ += "\n";
			}
			
			// add the p tag (image container)
			txtResult += '<p style="margin:0;">';
			
			// create img tag
			txtResult += '<img src="'+arrImages[arrImagesOrder[i]].srcLink+'"';
			txtResultLJ += '<img src="'+arrImages[arrImagesOrder[i]].srcLink+'"';
			if( isExtFeatures && arrImages[arrImagesOrder[i]].imgWidth != '' ) {
				txtResult += ' width="'+arrImages[arrImagesOrder[i]].imgWidth+'" height="'+arrImages[arrImagesOrder[i]].imgHeight+'"';
				txtResultLJ += ' width="'+arrImages[arrImagesOrder[i]].imgWidth+'" height="'+arrImages[arrImagesOrder[i]].imgHeight+'"';
			}
			if( $("#chkAddBorder").attr('checked') ) {
				txtResult += ' style="border:solid '+imgBorderSize+'px '+imgBorderColor+'"';
				txtResultLJ += ' style="border:solid '+imgBorderSize+'px '+imgBorderColor+'"';
			}
			if( $("#chkAddNumberAltTitle").attr('checked') ) {
				txtResult += ' alt="'+curNumberText+'" title="'+curNumberText+'"';
				txtResultLJ += ' alt="'+curNumberText+'" title="'+curNumberText+'"';
			}
			txtResult += " />";
			txtResultLJ += ' vspace="5" />'; // END image tag
			
			// close the p tag (image container)
			txtResult += '</p>';
	
			// add number after photo and text after img
			if( ( $("#chkAddNumber").attr('checked') && isNumberAfterPhoto ) || 
										( isExtFeatures && imgTxtAfter != '' ) ) {
				txtResult += '<p style="margin:6px 0 0 0;line-height:130%;">';
				txtResultLJ += "\n";
			}
			if( $("#chkAddNumber").attr('checked') && isNumberAfterPhoto ) {
				txtResult += curNumberText+' ';
				txtResultLJ += curNumberText+' ';
			}
			if( isExtFeatures && imgTxtAfter != '' ) {
				txtResult += ConvertTextToHtml( imgTxtAfter );
				txtResultLJ += imgTxtAfter;
			}
			if( ( $("#chkAddNumber").attr('checked') && isNumberAfterPhoto ) || ( isExtFeatures && imgTxtAfter != '' ) ) {
				txtResult += '</p>';
			}
	
			// add empty string after every img
			txtResult += '<p style="margin:0;">&nbsp;</p>';
			txtResultLJ += "\n\n";
			
			iPhotoNumber++;
			
		} // END if( arrImages[arrImagesOrder[i]].isActive )
	} // END for( var i = 0; i < arrImagesOrder.length; i++ )
	
	
	if( $("#chkAddRepost").attr('checked') || $("#chkAddLikes").attr('checked') ) {
		txtResultLJ += "\n";
	}
	
	/* DEPRECATED
	// add repost button
	if( $("#chkAddRepost").attr('checked') ) {
		txtResult += '<p style="margin:5px 0 0 0;"><lj-repost button="'+strRepostButtonText+'" /></p>';
		txtResultLJ += '<lj-repost button="'+strRepostButtonText+'" />';
	}
	*/
	
	
	// add the link to Obramlyator
	if( $("#chkAddCopyright").attr('checked') ) {
		txtResult += '<p style="margin:5px 0 0 0;font-size:smaller;color:#777777;">Оформлено с помощью &laquo;<a href="http://dert.ru/obr/" style="color:#777777;text-decoration:underline;">Обрамлятора</a>&raquo;</p>';
		txtResultLJ += '<small>Оформлено с помощью &laquo;<a href="http://dert.ru/obr/" style="color:#777777;text-decoration:underline;">Обрамлятора</a>&raquo;</small>'+"\n";
	}
	// add social networks 'likes' and repost button
	if( $("#chkAddLikes").attr('checked') ) {
		txtResult += '<p style="margin:5px 0 0 0;"><lj-like /></p>';
		txtResultLJ += '<lj-like />';
	}
	
	// close the lj-cut tag and correct its text
	if( flagLjCutIsSet ) {
		txtResult = txtResult.replace( "@obrljcut@", (iPhotoNumber - ljCutAfter ) );
		txtResultLJ = txtResultLJ.replace( "@obrljcut@", (iPhotoNumber - ljCutAfter ) );
		txtResult += ( isExtFeatures ) ? '</cut></lj-cut><p style="margin:5px 0 0 0;">&nbsp;</p>' : "\n</cut></lj-cut>\n";
		txtResultLJ += "\n</cut></lj-cut>\n";
	}
	
	if( _resultFormatOutputType == 'html' ) {
		return txtResult;
	} else {
		return txtResultLJ;
	}
}

/**
 * Function to create BBCode
 *
 * @param {Bool} isExtFeatures To use extended format features or not
 * @return {String} The result in BBCode format to insert into a forum
 */
function CreateBBCode( isExtFeatures )
{
	isExtFeatures = isExtFeatures || false;
	var txtResult = '';
	var imgTxtBefore = '';
	var imgTxtAfter = '';
	var iPhotoNumber = 0;
	
	for( var i = 0; i < arrImagesOrder.length; i++ ) {
		
		if( arrImages[arrImagesOrder[i]].isActive ) {
		
			// check and remove the help text
			imgTxtBefore = ( arrImages[arrImagesOrder[i]].txtBefore == helpTextBeforePhoto ) ? '' : arrImages[arrImagesOrder[i]].txtBefore;
			imgTxtAfter = ( arrImages[arrImagesOrder[i]].txtAfter == helpTextAfterPhoto ) ? '' : arrImages[arrImagesOrder[i]].txtAfter;
			
			// get the photo number text
			if( numberText != '' ) {
				var curNumberText = ( numberText.search( "@obrfn@" ) == -1) ? numberText : numberText.replace( "@obrfn@", (iPhotoNumber+1) );
			}
			// add number before photo
			if( $("#chkAddNumber").attr('checked') && isNumberBeforePhoto ) {
				txtResult += curNumberText+" ";
			}
			
			// add text before img
			if( isExtFeatures && imgTxtBefore != '' ) {
				txtResult += imgTxtBefore;
			}
			if( ($("#chkAddNumber").attr('checked') && isNumberBeforePhoto) ||
					(isExtFeatures && imgTxtBefore != '') ) {
				txtResult += "\n";
			}
			
			// create img bbcode
			txtResult += '[img]'+arrImages[arrImagesOrder[i]].srcLink+'[/img]'+"\n";
			
			// add number after photo and text after img
			if( $("#chkAddNumber").attr('checked') && isNumberAfterPhoto ) {
				txtResult += curNumberText+' ';
			}
			if( isExtFeatures && imgTxtAfter != '' ) {
				txtResult += imgTxtAfter;
			}
			if( ( $("#chkAddNumber").attr('checked') && isNumberAfterPhoto ) ||
								( isExtFeatures && imgTxtAfter != '' ) ) {
				txtResult += "\n";
			}
			txtResult += "\n";
			
			iPhotoNumber++;
			
		} // END if( arrImages[arrImagesOrder[i]].isActive ) {
	} // END for( var i = 0; i < arrImagesOrder.length; i++ ) {
	
	// add obramlyator link
	if( $("#chkAddCopyright").attr('checked') ) {
		txtResult += '[size=8]Оформлено с помощью «[url=http://dert.ru/obr/]Обрамлятора[/url]»[/size]'+"\n\n";
	}
	
	return txtResult;
}

/**
 * Gets settings from the settings area
 *
 * @return void
 */
function GetSettings()
{
	// img border
	if( $("#chkAddBorder").attr('checked') ) {
		imgBorderSize = ( parseInt( $("#inpBorderSize").val() ) >=0 ) ? parseInt( $("#inpBorderSize").val() ) : 0;
		imgBorderColor = ( $("#inpBorderColor").val() != '' ) ? $("#inpBorderColor").val() : '#000000';
	} else {
		imgBorderSize = 0;
		imgBorderColor = '';
	}
	
	// lj-cut
	if( $("#chkAddLjcut").attr('checked') ) {
		ljCutAfter = ( parseInt( $("#inpLjCutAfter").val() ) >=0) ? parseInt( $("#inpLjCutAfter").val() ) : 1;
		ljCutText = $("#inpLjCutText").val().replace(/\"/g, "");
		// check if double # is set
		if( ljCutText.search( "##" ) != -1 ) {
			ljCutText = ljCutText.replace( "##", "#@obrljcut@");
		} else if( ljCutText.search( "#" ) != -1 ) {
			ljCutText = ljCutText.replace( "#", "@obrljcut@");
		}
	} else {
		ljCutAfter = 0;
		ljCutText = '';
	}
	
	// number of the photo
	numberText = $("#inpAddNumberText").val().replace( /\"/g, "" );
	// check if double # is set
	if( numberText.search( "##" ) != -1 ) {
		numberText = numberText.replace( "##", "#@obrfn@");
	} else if( numberText.search( "#" ) != -1 ) {
		numberText = numberText.replace( "#", "@obrfn@");
	}
}

/**
 * Function to clear source text field from the test content
 *
 * @return void
 */
function ClearTestContent()
{
	if( isTestContentCleared == false ) {
		$("#txtSourceText").val('');
		$("#txtDestText").val('');
		isTestContentCleared = true;
	}
}

/**
 * Function to set result format HTML | BBCode
 *
 * @param {String} txtResultFormat The format's name ( html | bbcode )
 * @return void
 */
function SetResultFormat( txtResultFormat )
{
	if( txtResultFormat == resultFormat ) {
		return false;
	}

	if( txtResultFormat == 'html' ) {

		resultFormat = 'html';

		// switch HTML <-> BBCode
		$("#spanResultHtml").css('font-weight', 'bold');
		$("#spanResultHtml").css('cursor', 'auto');
		$("#spanResultHtml").css('border-bottom', '0px');
		$("#spanResultHtml").css('color', '#000000');
		$("#spanResultBBCode").css('font-weight', 'normal');
		$("#spanResultBBCode").css('cursor', 'pointer');
		$("#spanResultBBCode").css('border-bottom', '1px dashed #777777');
		$("#spanResultBBCode").css('color', '#555555');

		// show settings
		$("#pBorder").show();
		$("#pLjcut").show();
		$("#spanAddRepostLikes").show();

	} else if( txtResultFormat == 'bbcode' ) {

		resultFormat = 'bbcode';

		// switch HTML <-> BBCode
		$("#spanResultBBCode").css('font-weight', 'bold');
		$("#spanResultBBCode").css('cursor', 'auto');
		$("#spanResultBBCode").css('border-bottom', '0px');
		$("#spanResultBBCode").css('color', '#000000');
		$("#spanResultHtml").css('font-weight', 'normal');
		$("#spanResultHtml").css('cursor', 'pointer');
		$("#spanResultHtml").css('border-bottom', '1px dashed #777777');
		$("#spanResultHtml").css('color', '#555555');

		// hide settings
		$("#pBorder").hide();
		$("#pLjcut").hide();
		$("#spanAddRepostLikes").hide();
	}
	
	// change the height of the settings area
	$('#divImproveResult').height( CalculateSettingsAreaHeight() );
}

/**
 * Function to switch menu tabs
 *
 * @param {String} menu The name (elementID) of the menu
 * @return void
 */
function SwitchMenu( menu )
{
	for( var i = 0; i < arrMenus.length; i++ ) {
		if( arrMenus[i] == menu) {
			$("#"+arrMenus[i]).addClass('divMenuActive');
			$("#"+arrMenus[i]).removeClass('divMenu');
			$("#tab"+arrMenus[i]).show();
		} else {
			$("#"+arrMenus[i]).addClass('divMenu');
			$("#"+arrMenus[i]).removeClass('divMenuActive');
			$("#tab"+arrMenus[i]).hide();
		}
		if( menu == 'MenuExt' ) {
			$("#tabMenuSimple").show();
			$("#tabMenuSimpleResult").hide();
			$("#divToggleSettings").show();
			if( isDoPizdatoPressed ) {
				$('#divCopyright').hide();
			}
			// show/hide buttons in case of expanded/collapsed settings area
			if (isSettingsCollapsed) {
				$('#SettingsCollapseWrapper').hide();
				$('#divMenuExtDo').hide();
			} else {
				$('#SettingsCollapseWrapper').show();
				$('#divMenuExtDo').show();
			}
			isExtFormat = true;
		} else {
			isExtFormat = false;
			$("#divToggleSettings").hide();
			$('#divCopyright').show();
		}
		if( menu == 'MenuSimple' ) {
			$("#tabMenuSimpleResult").show();
			$('#SettingsCollapseWrapper').show();
		}
	}
}