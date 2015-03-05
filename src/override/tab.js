var app = chrome.runtime.getManifest();

var authCode = '';
chrome.storage.local.get('auth', function(code){
  authCode = code.auth;
});

// internal log function, displays logs on the page
var _log = function(data){
  if (typeof(data) !== "object"){
    $(".log").text(data);
  };
};

var showAuthButton = function(){
  var url = "https://instagram.com/oauth/authorize/?client_id=fdd685e3f1674541bf50829b962e9d1d&redirect_uri=" + window.location.origin   + "/src/auth/finished.html&response_type=token&scope=likes+relationships";
  $("#authLink").attr('href', url);
  $(".auth-button").removeClass('hidden');

  window.clearInterval(authInterval);
};

var getAuth = function(){
  showAuthButton();
  if (authCode.length !== 0){
    $(".auth-button").addClass("hidden");
    getInstagramFeed();
    if ($(".first-row").text().trim().length !== 0){
      _log("clearing auth interval");
      window.clearInterval(authInterval);
    }
  } else {
    showAuthButton();
  }

}

var getInstagramFeed = function(){
  var instagramUrl = "https://api.instagram.com/v1/users/self/feed";
  $.ajax({
    url: instagramUrl,
    data: {
      access_token: authCode
    },
    success: function(response){
      displayFeed(response);
    },
    dataType: 'jsonp'
  })
}

var displayFeed = function(feed){
  if ($(".first-row").text().length > 5){
    _log("clearing auth interval");
    window.clearInterval(authInterval);
  }
  for (var i = 0; i < 8; i++){
    if (feed.data[i].type === "image"){
      var post = feed.data[i];
      var imageUrl = post.images.standard_resolution.url;
      var username = post.user.username;
      var $el = $("<div class='photo'></div>");
      var $photo = $("<img src='" + imageUrl + "'>")
      var $username = $("<span class='username'>" + username + "</span>");
      $el.append($username).append($photo);
      if (i < 4){
        $(".first-row").append($el);
      } else {
        $(".second-row").append($el);
      }
    }
  }
}

// handle intervals better
var authInterval = '';
var runInterval = function(){
  authInterval = window.setInterval(getAuth, 100);
};

$(document).ready(function(){
  _log("running display feed");
  runInterval();
});
