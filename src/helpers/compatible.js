;(function (root, factory) {
  if (!String.prototype['replaceAll']) {
    String.prototype.replaceAll = function (newString, oldString) {
      return this.replace(new RegExp(newString, "g"), oldString)
    }
  }
})(window);  
