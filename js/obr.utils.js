/**
 * Obramlyator
 * Version 2.2.2 beta
 * For last version please visit http://dert.ru/obr/
 *
 * This program is free for personal or non-commercial use
 * (c) 2010 Sergey Nechaev - http://sergeynechaev.com
 * 
 * @include "/Obr/js/jquery-doc.js"
 * @include "/Obr/js/obr.js"
 * @include "/Obr/js/obr.init.js"
 */


/**
 * Function to enable or disable DOM element
 *
 * @param {Object} elemControl Pointer to the control element (checkbox)
 * @param {Object} elemAction Pointer to the controlled element which is need to enable or disable
 * @return void
 */
function FieldSwitcher( elemControl, elemAction ) 
{
	var fldControl = document.getElementById( elemControl );
	var fldAction = document.getElementById( elemAction );
	fldAction.disabled = ( fldControl.checked == true ) ? false : true;
}

/**
 * Function to show or hide DOM element
 *
 * @param {Object} elemControl Pointer to the control element (checkbox)
 * @param {Object} elemHide Pointer to the controlled element which is need to show or hide
 * @return void
 */
function ShowHideElement( elemControl, elemHide ) 
{
	var fldControl = document.getElementById( elemControl );
	var fldHide = document.getElementById( elemHide );
	fldHide.style.display = ( fldControl.checked == true ) ? '' : 'none';
}

/**
 * Function to dynamically calculate the settings area height
 *
 * @return {Int} Height in pixels
 */
function CalculateSettingsAreaHeight()
{
	// compute the extra height for Mozilla Firefox to substract it from window height
	var extraHeight = 0;
	if( $.browser.mozilla ) {
		extraHeight = 33;
	}
	
	//  get the area height
	if( isSettingsCollapsed ) {
		return $(window).height() - 140;
	} else {
		if( resultFormat == 'bbcode' ) {
			return $(window).height() - 390 - extraHeight;
		} else {
			return $(window).height() - 450 - extraHeight;
		}
	}
}

/**
 * Function to dynamically calculate the sorting area size
 *
 * @return void
 */
function CalculateSortingAreaSize()
{
	$('#divSortImages').width( $(window).width() - 100 );
	$('#divSortImages, #divSortingArea').height( $(window).height() - 120 );
}

/**
 * Searches the given image src link in the existing images array
 * 
 * @param {String} imgSrcLink The source link of the searched image
 */
function SearchImg( imgSrcLink )
{
	if( !imgSrcLink ) return;
	
	for( var i = 0; i < arrImages.length; i++ ) {
		if( imgSrcLink == arrImages[i].srcLink ) {
			return true;
		}
	}
	return false;
}

/**
 * Function to determine whether the var is number or not
 * 
 * @param {Object} varNum
 * @return {Bool} True if the value is a valid number, false otherwise
 */
function IsNumber( varNum ) {
	return typeof varNum === 'number' && isFinite( varNum );
}

/**
 * Compares two arrays
 * 
 * @param {Array} arr1 The first array to compare
 * @param {Array} arr2 The second array to compare
 * @return {Boolean} True if arrays is equal false otherwise
 */
function IsEqualArrays( arr1, arr2 )
{
	if( !arr1 || !arr2 ) {
		return false;
	}
	if( arr1.length == arr2.length) {
		for( var i = 0; i < arr1.length; i++ ) {
			// go into recursive
			if(typeof arr1[i] == 'object') {
				if( !IsEqualArrays( arr1[i], arr2[i]) ) {
					return false;
				}
			} else if( arr1[i] != arr2[i] ) {
		        return false;
			}
    	}
    	return true;
	} else {
		return false;
	}
}

/**
 * Searches the given value in the array and returns the ID of the value.
 * This function only for Int and String values and for flat arrays.
 * 
 * @param {Array} arr The array to search in
 * @param {Mixed} needle What we're need to search
 * @return {Mixed} The ID of the value, false if not found
 */
function SearchArray( arr, needle ) {
    for( var i=0; i < arr.length; i++ ) {
	    if( arr[i] == needle ) return i;
    }
    return false;
}

/**
 * Debug - Alert the array's content
 * 
 * @param {Array} arr The array to alert
 * @return {void}
 */
function PrintArray( arr )
{
	var arrContent = "Result:\n";
	for( var i = 0; i < arr.length; i++ ) {
		arrContent += 'Elem#'+i+' = '+arr[i]+"\n";
	}
	alert( arrContent );
}

/**
 * Debug - Alert the array's content
 * 
 * @param {Array} arr The array to alert
 * @return {void}
 */
function PrintArrImages()
{
	var arrContent = "Result:\n";
	for( var i = 0; i < arrImages.length; i++ ) {
		//arrContent += 'Elem#'+i+' = '+arrImages[i].srcLink+"\n";
		arrContent += 'Elem#'+i+' = '+arrImages[i].txtBefore+"\n";
	}
	alert( arrContent );
}

/**
 * This function is deprecated.
 * 
 * CalculateTextareaHeight Function to dynamically calculate the textarea height
 * Formula:
 * height = ( str.count("\n") + (Math.ceil(str.length / MAX_SYMB_IN_ROW) - str.count("\n")) ) * STEP
 *
 * @param {Element} elem Pointer to the textarea
 * @param {Int} maxSymbInRow Maximum symbols into a row
 * @param {Int} stepSize Size of one column in pixels
 * @return {Int} Height in pixels
 */
function CalculateTextareaHeight( elem, maxSymbInRow, stepSize )
{
	//var tmpElem = document.getElementById( $(elem).attr("id") );
	//alert(tmpElem.scrollHeight);
	//alert( 'a='+$(elem)[0].scrollHeight );
	
	return $(elem)[0].scrollHeight;
	
	/*
	maxSymbInRow = maxSymbInRow || 100;
	stepSize = stepSize || 15;
	var colsBySymbols = Math.ceil( $(elem).val().length / maxSymbInRow - $(elem).val().split( "\n" ).length );
	if( colsBySymbols < 0 ) colsBySymbols = 0;
	return ( $(elem).val().split( "\n" ).length + colsBySymbols ) * stepSize;
	*/
}
