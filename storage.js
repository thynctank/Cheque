function Storage() {
  this.db = openDatabase("Cheque");
} 

Storage.prototype = {
  _buildRows: function(resultSet) {
    var rows = [];
    for(var i = 0, j = resultSet.rows.length; i < j; i++) {
      rows.push(resultSet.rows.item(i));
    }
    return rows;
  },
  // success always takes an array of row objects, failure takes an error string
  run: function(sql, success, failure) {
    var self = this;
    if(success) {
      var oldSuccess = success;
      success = function(resultSet) {
        oldSuccess(self._buildRows(resultSet));
      };
    }
    else {
      success = function(resultSet) {
        console.log(self._buildRows(resultSet));
      };
    }
    
    console.log(sql);
    this.db.transaction(function(tx) {
      tx.executeSql(sql, [], 
        function(tx, resultSet) {
          success(resultSet);
        },
        function(tx, error) {
          if(failure)
            failure(error.message);
        }
      );
    });
  },
  // cols should be obj literal with {colName: colType, colName: colType}
  createTable: function(name, cols, success, failure) {
    var colSql = "";
    for(colName in cols) {
      colSql += ", " + colName + " " + cols[colName];
    }
    
    var sql = "CREATE TABLE " + name + " (id INTEGER PRIMARY KEY AUTOINCREMENT" + colSql + ")";
    this.run(sql, success, failure);
  },
  dropTable: function(name, success, failure) {
    var sql = "DROP TABLE " + name;
    this.run(sql, success, failure);
  },
  // conditions is obj literal with {colName: reqVal, colName: reqVal}
  read: function(table, conditions, success, failure) {
    var conditionSql = "";
    for(colName in conditions) {
      if(typeof conditions[colName] === "string")
        conditionSql += colName + " = '" + conditions[colName] + "' AND ";
      else
        conditionSql += colName + " = " + conditions[colName] + " AND ";
    }
    conditionSql = conditionSql.slice(0, -4);
    
    var sql = "SELECT * FROM " + table;
    if(conditions)
      sql += " WHERE " + conditionSql;

    this.run(sql, success, failure);
  },
  // data is obj literal with {colName: colVal, colName: colVal}
  write: function(table, data, success, failure) {
    if(data.id) {
      // build assignment pairs and trim trailing comma
      var setSql = "";
      for(colName in data) {
        if(typeof data[colName] === "string")
          setSql += colName + " = '" + data[colName] + "', ";
        else
          setSql += colName + " = " + data[colName] + ", ";
      }
      setSql = setSql.slice(0, -2);
      
      var sql = "UPDATE " + table + " SET " + setSql + " WHERE id = " + data.id;
    }
    else {
      var colSql = "", valSql = "";
      for(colName in data) {
        colSql += colName + ", ";
        if(typeof data[colName] === "string")
          valSql += "'" + data[colName] + "', ";
        else
          valSql += data[colName] + ", ";
      }
      colSql = colSql.slice(0, -2);
      valSql = valSql.slice(0, -2);
      
      var sql = "INSERT INTO " + table + " (" + colSql + ") VALUES(" + valSql + ")";
    }
    this.run(sql, success, failure);
  },
  // conditions is an obj literal with {colName: reqVal, colName: reqVal}
  erase: function(table, conditions, success, failure) {
    var conditionSql = "";
    for(colName in conditions) {
      if(typeof conditions[colName] === "string")
        conditionSql += colName + " = " + "'" + conditions[colName] + "' AND ";
      else
        conditionSql += colName + " = " + conditions[colName] + " AND ";
    }
    conditionSql = conditionSql.slice(0, -4);
    var sql = "DELETE FROM " + table + " WHERE " + conditionSql;
    this.run(sql, success, failure);
  },
  transact: function(func, success, failure) {}
};