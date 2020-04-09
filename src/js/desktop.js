(function($, PLUGIN_ID) {
  'use strict';

  async function getDataDB() {
    let respone = await fetch('https://5e831d2c78337f00160aea14.mockapi.io/timekeeper');
    let data = await respone.json();
    return data;

  }
  function updateRecord(app_id,record_id,record){
    kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', {
      "app": app_id,
      "id": record_id,
      "record":  record
    }, function(resp) {
      // success
      console.log(resp);
    }, function(error) {
      // error
      console.log(error);
    });
  }
  function deleteRecrod(app_id,record_id){
    kintone.api(kintone.api.url('/k/v1/records', true), 'DELETE', {
      'app': app_id,
      'ids': record_id
    }, function(resp) {
      // success
      console.log(resp);
    }, function(error) {
      // error
      console.log(error);
    });
  }
  function synchronizedDB(dataToPut) {
    let body = {
      app: kintone.app.getId(),
      records: dataToPut
    };
    kintone.api(kintone.api.url('/k/v1/records', true), 'GET', {
      'app': kintone.app.getId(),
      'query': 'order by $id asc',
      'fields': ['id','name', 'job', 'id_employee', 'date', 'updated_date']
    }, function(resp) {
      let dataToCompare = resp['records'].map(item => {
        // delete item.id;
        item['name'] = {'value': item['name']['value']};
        item['job'] = {'value': item['job']['value']};
        item['id_employee'] = {'value': item['id_employee']['value']};
        item['date'] = {'value': item['date']['value']};
        item['updated_date'] = {'value': item['updated_date']['value']};
        return item;
      });
      if (dataToPut.length > dataToCompare.length){
        for (let i = dataToCompare.length;i<dataToPut.length;i++){
          kintone.api(kintone.api.url('/k/v1/record', true), 'POST', {
            'app': kintone.app.getId(),
            'record': dataToPut[i]
          }, function(resp) {
            // success
            console.log(resp);
          }, function(error) {
            // error
            console.log(error);
          });
        }
        for (let i = 0;i<dataToCompare.length;i++){
          if (dataToCompare[i]['updated_date']['value'] !== dataToPut[i]['updated_date']['value']){
            updateRecord(kintone.app.getId(),dataToCompare[i]['id']['value'], dataToPut[i]);
          }
        }
      } else if (dataToPut.length < dataToCompare.length){
        for (let i = dataToCompare.length-1;i>=dataToPut.length;i--){
          let arr = [];
          arr.push(dataToCompare[i]['id']['value']);
          deleteRecrod(kintone.app.getId(),arr)
        }
        for (let i = 0;i<dataToPut.length;i++){
          if (dataToCompare[i]['updated_date']['value'] !== dataToPut[i]['updated_date']['value']){
            updateRecord(kintone.app.getId(), dataToCompare[i]['id']['value'], dataToPut[i]);
          }
        }
      } else {
        for (let i = 0;i<dataToCompare.length;i++){
          if (dataToCompare[i]['updated_date']['value'] !== dataToPut[i]['updated_date']['value']){
            updateRecord(kintone.app.getId(), dataToCompare[i]['id']['value'], dataToPut[i]);
          }
        }
      }
      if (resp['records'] == null){
        kintone.api(kintone.api.url('/k/v1/records', true), 'POST', body, function(resp) {
          // success
          console.log(resp);
        }, function(error) {
          // error
          console.log(error);
        });
      }
    }, function(error) {
      // error
      console.log(error);
    });
  }
  getDataDB().then(data => {
    const dataToPut = data.map(item => {
      delete item.id;
      item['name'] = {'value': item['name']};
      item['job'] = {'value': item['job']};
      item['id_employee'] = {'value': item['id_employee']};
      item['date'] = {'value': item['date']};
      item['updated_date'] = {'value': item['updated_date']};
      return item;
    });
    synchronizedDB(dataToPut);
  });

  function createModal(){
    if (document.getElementById ('dialog') != null) {
      return;
    }
    let values = ["name", "date"];

    let select = document.createElement("select");
    select.id = "filter";
    select.setAttribute('style', 'margin-right: 10px');

    for (const val of values) {
      let option = document.createElement("option");
      option.value = val;
      option.text = val.charAt(0).toUpperCase() + val.slice(1);
      select.appendChild(option);
    }

    let label = document.createElement("label");
    label.innerHTML = "Choose your filter: ";
    label.htmlFor = "filter";

    let close_button = document.createElement('a');
    close_button.id = 'close_button';
    close_button.innerHTML = 'X';
    close_button.setAttribute('style', 'border: hidden; height: 16px');

    let apply_button = document.createElement('button');
    apply_button.id = 'apply_button';
    apply_button.innerHTML = 'Apply';
    apply_button.setAttribute('style', 'margin-right: 10px');

    let input = document.createElement('input');
    input.id = 'input';
    input.placeholder = 'Please input value';
    input.setAttribute('style', 'margin-right: 10px; height: 16px');

    let modal_dialog = document.createElement('div');
    modal_dialog.setAttribute('class', 'modal-dialog');

    let modal_content = document.createElement('div');
    modal_content.setAttribute('class', 'modal-content');
    modal_content.appendChild(label).appendChild(select);
    modal_content.appendChild(input);
    modal_content.appendChild(apply_button);
    modal_content.appendChild(close_button);


    let dialog = document.createElement('div');
    dialog.setAttribute('class', 'modal');
    dialog.setAttribute('class', 'fade');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('id', 'dialog');
    dialog.appendChild(modal_dialog).appendChild(modal_content);

    close_button.onclick = function() {
      dialog.remove();
    };

    apply_button.onclick = function() {
      if (select.value === 'name'){
        let uri = encodeURI('?query=name="' + input.value + '"');
        window.location.href = 'https://trainingkintone.cybozu.com/k/9/' + uri;
      }
      else if(select.value === 'date') {
        let uri = encodeURI('?query=date="' + input.value + '"');
        window.location.href = 'https://trainingkintone.cybozu.com/k/9/' + uri;
      }
    };

    kintone.app.getHeaderMenuSpaceElement().appendChild(dialog);
  }
  kintone.events.on('app.record.index.show', function(event) {
    let config = kintone.plugin.app.getConfig(PLUGIN_ID);
    //Prevent duplication of the button
    if (document.getElementById ('my_index_button') != null) {
      return;
    }
    // Set a button
    let myIndexButton = document.createElement('button');
    myIndexButton.id = 'my_index_button';
    myIndexButton.innerHTML = 'Filter';

    // Button onclick function
    myIndexButton.onclick = function() {
      createModal();
    };
    kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
    // create the inner modal div with appended argument
  });

})(jQuery, kintone.$PLUGIN_ID);
