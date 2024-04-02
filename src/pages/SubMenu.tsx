import { ContentHeader } from '@components';
import { Column, Formatters, GridOption, OnEventArgs, SlickgridReact, SlickgridReactInstance } from 'slickgrid-react';
import { useEffect, useState } from 'react';
import JobService from '@app/services/jobService';
import LookupService from '@app/services/lookupService';
import Select from 'react-select'
import Button from 'react-bootstrap/Button';
import { lookup } from 'dns';

interface Props { }

interface State {
  title: string;
  subTitle: string;
  gridOptions1?: GridOption;
  gridOptions2?: GridOption;
  columnDefinitions1: Column[];
  columnDefinitions2: Column[];
}

const SubMenu = () => {
  let reactGrid!: SlickgridReactInstance;
  const [dataset, setData] = useState([]);
  const [usersList, setUsers] = useState([]);
  const [statusList, setStatus] = useState([]);

  let selectedStatus: string = '';
  let selectedClient: string = '';

  const columns: Column[] = [
    { id: 'name', name: 'Name', field: 'name', sortable: true },
    { id: 'notes', name: 'Notes', field: 'notes', sortable: true },
    { id: 'isSingleJob', name: 'Single Job', field: 'isSingleJob', sortable: true, width: 35,
      formatter: (row, cell, value, colDef, dataContext) => {
        return value ? '<i class="fa fa-check-square" aria-hidden="true"></i>' : '';
      },
      cssClass: 'text-center'
    },
    { id: 'AssignTo', name: 'Assign To', field: 'AssignTo', sortable: true},
    { id: 'l1User', name: 'L1 User', field: 'l1User', sortable: true },
    { id: 'l2User', name: 'L2 User', field: 'l2User', sortable: true },
    { id: 'l3User', name: 'L3 User', field: 'l3User', sortable: true },
    { id: 'userName', name: 'Client', field: 'userName' },
    { id: 'statusName', name: 'Status', field: 'statusName',  },
    { id: 'createdDateTime', name: 'Created Date', field: 'createdDateTime', sortable: true, formatter: Formatters.dateIso },
    {
      id: 'edit',
      field: 'id',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: Formatters.icon,
      params: { iconCssClass: 'fa fa-edit pointer' },
      minWidth: 30,
      maxWidth: 30,
      cssClass: 'text-primary',
      // use onCellClick OR grid.onClick.subscribe which you can see down below
      onCellClick: (_e: any, args: OnEventArgs) => {
        console.log(args);
        reactGrid.gridService.highlightRow(args.row, 1500);
        reactGrid.gridService.setSelectedRow(args.row);
      },
    },
    {
      id: 'delete',
      field: 'id',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: Formatters.icon,
      params: { iconCssClass: 'fa fa-trash pointer' },
      minWidth: 30,
      maxWidth: 30,
      cssClass: 'text-danger',
      // use onCellClick OR grid.onClick.subscribe which you can see down below
      /*
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log(args);
        this.alertWarning = `Deleting: ${args.dataContext.title}`;
      }
      */
    },
  ];
  // this._darkModeGrid1 = this.isBrowserDarkModeEnabled();
  const gridOptions1: GridOption = {
    enableAutoResize: true,      // true by default
    enableCellNavigation: true,
    enableHeaderMenu: false,
    enableFiltering: true,
    enableCheckboxSelector: false,
    enableRowSelection: true,
    enablePagination: true,
    pagination: {
      pageSizes: [5, 10, 20, 25, 50],
      pageSize: 25
    },
    rowSelectionOptions: {
      // True (Single Selection), False (Multiple Selections)
      selectActiveRow: true
    },
    //autoHeight:true,
    rowHeight: 35,
    headerRowHeight: 0,
    enableColumnPicker: true,
    // exportOptions: {
    //   exportWithFormatter: true
    // },
    enableGridMenu: false,
    gridMenu: {
      columnTitle: 'Columns',
      menuWidth: 17,
      hideExportCsvCommand: true,
      resizeOnShowHeaderRow: true
    },
    enableColumnReorder: true,
    gridWidth: '100%',
    gridHeight: 500

    //enableColumnReorder: false,
    //enableSorting: true,
    //createPreHeaderPanel: true,
    //showPreHeaderPanel: true,
    //preHeaderPanelHeight: 25,
    //explicitInitialization: true,

  };
  
  // {
  //    gridHeight: 600,
  //    gridWidth: 1200,
  //   enableAutoResize: false,
  //   enableSorting: true,
  //   enablePagination: true,
  //   pagination: {
  //     pageSizes: [5, 10, 20, 25, 50],
  //     pageSize: 50
  //   },
  // };
  
  function reactGridReady(reactGridInstance: SlickgridReactInstance) {
    reactGrid = reactGridInstance;
  }
  
  let loadData = async () => {
    const response: any = await JobService.getJobs(selectedStatus, selectedClient);
    if(response.isSuccess)
    {
      setData(response.data);
    }
  }

  let getUsers = async () => {
    const response: any = await LookupService.getUsers('client');
    if(response.isSuccess)
    {
      setUsers(response.data.map((item:any) => { 
        return { 'value' : item.id, 'label': item.value };
      })
    );
      console.log(response.data);
    }
  }

  let getStatus = async () => {
    const response: any = await LookupService.getStatus('status');
    if(response.isSuccess)
    {
      setStatus(response.data.map((item:any) => { 
          return { 'value' : item.id, 'label': item.value };
        })
      );
      console.log(response.data);
    }
  }

  const onStatusChange = (newValue: any, actionMeta: any) => {
     selectedStatus = newValue ? newValue.value : '';
  };

  const onClientChange = (newValue: any, actionMeta: any) => {
    selectedClient = newValue ? newValue.value : '';
 };

  useEffect(() => {
    getUsers();
    getStatus();
    loadData();
   },[]);
  

  return (
    <div>
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Jobs</h3>
            </div>
            <div className="card-body">
              <div className='row'>
              
                    <div className='col-md-2 text-right'> Select Status</div>
                    <div className='col-md-3'> 
                    <Select options={statusList} isClearable={true} onChange={onStatusChange} />
                    </div>
                    <div className='col-md-2 text-right'> Select Client</div>
                    <div className='col-md-3'> 
                      <Select options={usersList} isClearable={true} onChange={onClientChange} />
                    </div>
                    <div className='col-md-1'>
                    <Button variant="primary" onClick={loadData}>Search</Button>
                    </div> 
                </div>
                <div className='row pt-4'>
                <div className='col-md-12' style={{zIndex: '0'}}>
                    <SlickgridReact gridId="grid1"
                        columnDefinitions={columns}
                        gridOptions={gridOptions1!}
                        dataset={dataset}
                        onReactGridCreated={e => { reactGridReady(e.detail); }}
                    />
                </div>
              </div>  
            
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubMenu;
