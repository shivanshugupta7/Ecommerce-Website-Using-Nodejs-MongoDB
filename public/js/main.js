$(function(){
    //to add many options in content 
    if($('textarea#ta').length){
        CKEDITOR.replace('ta');
    }
   
    $('a.confirmDeletion').on('click',function(){
        if(!confirm('Confirm deletion'))
        return false
    });
    
    if($("[data-fancybox]").length){
        $("[data-fancybox]").fancybox();
    }


})

