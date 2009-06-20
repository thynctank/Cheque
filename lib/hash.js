function Hash(obj) {
  this.data = obj || {};
};

Hash.prototype = {
  has: function(key) {
    if(this.data.hasOwnProperty(key))
      return true;
    else
      return false;
  },
  set: function(key, value) {
    this.data[key] = value;
  },
  get: function(key) {
    return this.data[key];
  },
  remove: function(key) {
    delete this.data[key];
  },
  getLength: function() {
    var length = 0;
    for(var i in this.data) {
       if(this.data.hasOwnProperty(i))
        length++;
    }
    return length;
  },
  each: function(iterator, bind) {
    for(var property in this.data) {
      if(this.data.hasOwnProperty(property))
        iterator.call(bind, this.data[property], property);
    }
  },
  getValues: function() {
    var keys = [];
    this.each(function(val) {
      keys.push(val);
    });
    return keys;
  },
  getKeys: function() {
    var values = [];
    this.each(function(val, key) {
      values.push(key);
    });
    return values;
  }
};