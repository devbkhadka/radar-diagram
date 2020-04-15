// JavaScript Document

    jQuery(document).ready(function () {
        jQuery("#accordion").hide();
        jQuery("#accordion div").hide();

        jQuery("#filterBtn").click(function () {
            jQuery("#accordion").slideToggle("fast");
            jQuery(this).toggleClass("active");
            jQuery("#accordion>div").hide();
            jQuery("#accordion>div:first").show();
            return false;
        });
    });
    function initAccordion(){
        jQuery("#accordion").hide();
        jQuery("#accordion div").hide();

		jQuery("#accordion h3").click(function () {
		    jQuery(this).next('div').slideToggle("fast").siblings('div:visible').slideUp("fast");
		    if (jQuery(this).hasClass('opened')) { jQuery(this).removeClass(); }
		    else { jQuery(this).addClass('opened').siblings('h3.opened').removeClass(); }
		});
         
    }
