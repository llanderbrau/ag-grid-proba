const gridOptions = {
  columnDefs: [
    // group cell renderer needed for expand / collapse icons
    { field: 'name', cellRenderer: 'agGroupCellRenderer' },
    { field: 'account' },
    { field: 'calls' },
    { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
  ],
  defaultColDef: {
    flex: 1,
  },
  getRowNodeId: function (data) {
    return data.account;
  },
  masterDetail: true,
  enableCellChangeFlash: true,
  detailCellRendererParams: {
    refreshStrategy: 'rows',

    template: function (params) {
      return (
        '<div class="ag-details-row ag-details-row-fixed-height">' +
        '<div style="padding: 4px; font-weight: bold;">' +
        params.data.name +
        ' ' +
        params.data.calls +
        ' calls</div>' +
        '<div ref="eDetailGrid" class="ag-details-grid ag-details-grid-fixed-height"/>' +
        '</div>'
      );
    },

    detailGridOptions: {
      rowSelection: 'multiple',
      enableCellChangeFlash: true,
      immutableData: true,
      getRowNodeId: function (data) {
        return data.callId;
      },
      columnDefs: [
        { field: 'callId', checkboxSelection: true },
        { field: 'direction' },
        { field: 'number', minWidth: 150 },
        { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
        { field: 'switchCode', minWidth: 150 },
      ],
      defaultColDef: {
        flex: 1,
        sortable: true,
      },
    },
    getDetailRowData: function (params) {
      // params.successCallback([]);
      params.successCallback(params.data.callRecords);
    },
  },
  onFirstDataRendered: onFirstDataRendered,
};

let allRowData;

function onFirstDataRendered(params) {
  // arbitrarily expand a row for presentational purposes
  setTimeout(function () {
    params.api.getDisplayedRowAtIndex(0).setExpanded(true);
  }, 0);

  setInterval(function () {
    if (!allRowData) {
      return;
    }

    const data = allRowData[0];

    const newCallRecords = [];
    data.callRecords.forEach(function (record, index) {
      newCallRecords.push({
        name: record.name,
        callId: record.callId,
        duration: record.duration + (index % 2),
        switchCode: record.switchCode,
        direction: record.direction,
        number: record.number,
      });
    });

    data.callRecords = newCallRecords;
    data.calls++;

    const tran = {
      update: [data],
    };

    params.api.applyTransaction(tran);
  }, 2000);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
    .then((response) => response.json())
    .then(function (data) {
      allRowData = data;
      gridOptions.api.setRowData(data);
    });
});
