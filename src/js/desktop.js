(function($, PLUGIN_ID) {
  'use strict';

  async function getDataDB() {
    let respone = await fetch('https://5e831d2c78337f00160aea14.mockapi.io/timekeeper');
    let data = await respone.json();
    return data;

  }
  function updateRecord(app_id,records){
    kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', {
      "app": app_id,
      "records":  records
    }, function(resp) {
      // success
      window.location.reload();
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
      window.location.reload();
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
        let data = [];
        for (let i = dataToCompare.length;i<dataToPut.length;i++){
          data.push(dataToPut[i]);
        }
        kintone.api(kintone.api.url('/k/v1/records', true), 'POST', {
          'app': kintone.app.getId(),
          'records': data
        }, function(resp) {
          // success
          window.location.reload();
          console.log(resp);
        }, function(error) {
          // error
          console.log(error);
        });
        let dataToUpdate = [];
        for (let i = 0;i<dataToCompare.length;i++){
          if (dataToCompare[i]['updated_date']['value'] !== dataToPut[i]['updated_date']['value']){
            let data = {
              id: parseInt(dataToCompare[i]['id']['value']),
              record: dataToPut[i]
            };
            dataToUpdate.push(data);
          }
        }
        if (dataToUpdate.length !== 0){
          updateRecord(kintone.app.getId(), dataToUpdate);
        }
      } else if (dataToPut.length < dataToCompare.length){
        let arr = [];
        for (let i = dataToCompare.length-1;i>=dataToPut.length;i--){
          arr.push(dataToCompare[i]['id']['value']);
        }
        deleteRecrod(kintone.app.getId(),arr);
        let dataToUpdate = [];
        for (let i = 0;i<dataToPut.length;i++){
          if (dataToCompare[i]['updated_date']['value'] !== dataToPut[i]['updated_date']['value']){
            let data = {
              id: parseInt(dataToCompare[i]['id']['value']),
              record: dataToPut[i]
            };
            dataToUpdate.push(data);
          }
        }
        if (dataToUpdate.length !== 0){
          updateRecord(kintone.app.getId(), dataToUpdate);
        }
      } else {
        let dataToUpdate = [];
        for (let i = 0;i<dataToCompare.length;i++){
          if (dataToCompare[i]['updated_date']['value'] !== dataToPut[i]['updated_date']['value']){
            let data = {
              id: parseInt(dataToCompare[i]['id']['value']),
              record: dataToPut[i]
            };
            dataToUpdate.push(data);
          }
        }
        if (dataToUpdate.length !== 0){
          updateRecord(kintone.app.getId(), dataToUpdate);
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

  function createModal(){
    if (document.getElementById ('dialog') != null) {
      return;
    }
    let values = ["name", "date"];

    let select = document.createElement("select");
    select.id = "filter";
    select.setAttribute('style', 'margin-right: 10px');
    select.setAttribute('class', 'swal2-select');

    for (const val of values) {
      let option = document.createElement("option");
      option.value = val;
      option.text = val.charAt(0).toUpperCase() + val.slice(1);
      select.appendChild(option);
    }


    let input = document.createElement('input');
    input.id = 'input';
    input.placeholder = 'Please input value';
    input.setAttribute('class', 'swal2-input');
    input.setAttribute('style', 'width: auto');

    let modal_dialog = document.createElement('div');
    modal_dialog.setAttribute('class', 'modal-dialog');

    let modal_content = document.createElement('div');
    modal_content.setAttribute('class', 'modal-content');
    modal_content.appendChild(select);
    modal_content.appendChild(input);

    Swal.fire({
      title: 'Choose your field you want to filter',
      html:
      modal_content
      ,
      focusConfirm: false,
      showCancelButton: true,
    }).then(function (result) {
      console.log(result);
      if (result.value){
        if (select.value === 'name'){
          let uri = encodeURI('?query=name="' + input.value + '"');
          window.location.href = 'https://trainingkintone.cybozu.com/k/9/' + uri;
        }
        else if(select.value === 'date') {
          let uri = encodeURI('?query=date="' + input.value + '"');
          window.location.href = 'https://trainingkintone.cybozu.com/k/9/' + uri;
        }
      }
      });
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

    kintone.app.getHeaderMenuSpaceElement().appendChild(myIndexButton);
    // create the inner modal div with appended argument
  });

})(jQuery, kintone.$PLUGIN_ID);
