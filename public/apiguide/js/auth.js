
function ajaxFunc(method, url, callback) {
  var xhr = null;

  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject('Microsoft.XMLHttp');
  }
  xhr.open(method, url, true);
  xhr.setRequestHeader("authorization","Bearer " +window.localStorage.getItem('token') || '');//表头信息
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      callback(xhr);
    }
  };
  xhr.send();
}

if(window.location.href.indexOf('/apiguide/')!==-1){
  ajaxFunc('GET', '/api/v2/platform/assets/clusters?offset=0&limit=5&timestamp='+new Date().getTime(), function(res) {
    var responseText = JSON.parse(res.responseText)
    if(res.status===401||responseText['error']&&responseText.error.code===401){
      window.location.href='/#/login'
    }
  });
}
