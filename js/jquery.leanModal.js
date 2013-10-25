/*
 * leanModal v1.0 by Ray Stone - http://finelysliced.com.au
 *
 * Edited for the 'Obramlyator' - http://dert.ru/obr 
 * by Sergey Nechaev - http://sergeynechaev.com
 */

(function($){
 
    $.fn.extend({ 
         
        leanModal: function(options) {
 
            var defaults = {
                top: 100,
                overlay: 0.5
            }
                 
            options =  $.extend(defaults, options);
 
            return this.each(function() {
            
                var o = options;
               
                $(this).click(function(e) {
              
          	  	var overlay = $("<div id='lean_overlay'></div>");
              
              	var modal_id = $(this).attr("href");

				$("body").append(overlay);
                
				// overlay click event changed to select
				$("#lean_overlay").select(function() { 
                     close_modal(modal_id);                    
                });
                         	
              	var modal_height = $(modal_id).outerHeight();
        	  	var modal_width = $(modal_id).outerWidth();

        		$('#lean_overlay').css({ 'display' : 'block', opacity : 0 });

        		$('#lean_overlay').fadeTo(1,o.overlay);

        		$(modal_id).css({ 
        		
        			'display' : 'block',
        			'position' : 'fixed',
        			'opacity' : 0,
        			'z-index': 11000,
        			'left' : 50 + '%',
        			'margin-left' : -(modal_width/2) + "px",
        			'top' : o.top + "px"
        		
        		});

        		$(modal_id).fadeTo(2,1);

                e.preventDefault();
                		
              	});
             
            });

			function close_modal(modal_id){

        		$("#lean_overlay").fadeOut(1);

        		$(modal_id).css({ 'display' : 'none' });
			
			}
    
        }
    });
     
})(jQuery);