$(function(){


	var login = function(username,password){
		var index = $.inArray(username,pluck(userData.userList,'Username'));
		var pass = index === -1 ? -1 : userData.userList[index].Password;
		if (index > -1 && pass === password) {
			window.location.replace('home.html');
		} else {
			$('#username').val('');
			$('#password').val('');
		}
	};



	var validationRules = {
        username: {
	      identifier : 'username',
	      rules: [
	        {
	          type   : 'empty',
	          prompt : 'Please enter a username'
	        }
	      ]
	    },
	    password: {
	      identifier : 'password',
	      rules: [
	        {
	          type   : 'empty',
	          prompt : 'Please enter a password'
	        } 
	      ]
	    }
	  };
	

  	$('.ui.form').form(validationRules, {
		    inline	: true,
		    on    	: 'blur'
  		}
  	);

  	$(document).on('click','#submit-button',function(){
  		login($('#username').val(),$('#password').val());
  	});//login();

});