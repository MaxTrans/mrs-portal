import { ContentHeader } from '@components';
import { Column, Formatters, GridOption, OnEventArgs, SlickgridReact, SlickgridReactInstance } from 'slickgrid-react';
import { useEffect, useState } from 'react';
import JobService from '@app/services/jobService';
import LookupService from '@app/services/lookupService';
import Select from 'react-select'
import Button from 'react-bootstrap/Button';
import { lookup } from 'dns';
import { Modal, TabPane } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { faL } from '@fortawesome/free-solid-svg-icons';

interface Props { }

interface State {
  title: string;
  subTitle: string;
  gridOptions1?: GridOption;
  gridOptions2?: GridOption;
  columnDefinitions1: Column[];
  columnDefinitions2: Column[];
}



const JobsList = () => {
  let reactGrid!: SlickgridReactInstance;
  const [dataset, setData] = useState([]);
  const [usersList, setUsers] = useState([]);
  const [statusList, setStatus] = useState([]);
  const [fileList, setFiles] = useState([]);

  // Files Modal 
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let selectedStatus: string = '';
  let selectedClient: string = '';

  const columns: Column[] = [
    { id: 'name', name: 'Name', field: 'name', sortable: true },
    { id: 'notes', name: 'Notes', field: 'notes', sortable: true },
    { id: 'isSingleJob', name: 'Single Job', field: 'isSingleJob', sortable: true, width: 35,
      formatter: (row, cell, value, colDef, dataContext) => {
        return value ? '<i class="fa fa-check-square" aria-hidden="true"></i>' : '';
      },
      cssClass: 'text-center text-primary'
    },
    { id: 'AssignTo', name: 'Assign To', field: 'AssignTo', sortable: true},
    { id: 'l1User', name: 'L1 User', field: 'l1User', sortable: true },
    { id: 'l2User', name: 'L2 User', field: 'l2User', sortable: true },
    { id: 'l3User', name: 'L3 User', field: 'l3User', sortable: true },
    { id: 'files', name: 'File', field: 'files', sortable: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if(dataContext.isSingleJob)
        return value.length > 0 ? '<a heef="#" class="pointer">View Files</a>' : '';
        else
          return value.length > 0 ? '<a heef="#">' + value[0].FileName + '</a>' : '';
      },
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log(args.dataContext);
        if(args.dataContext.isSingleJob)
        {
          setFiles(args.dataContext.files);
          handleShow();
        }
        else{
          toast.info('File Downloaded.')
        }
      }
    },
    { id: 'userName', name: 'Client', field: 'userName' },
    { id: 'statusName', name: 'Status', field: 'statusName',  },
    { id: 'createdDateTime', name: 'Created Date', field: 'createdDateTime', sortable: true, formatter: Formatters.dateIso },
    {
      id: 'notification',
      field: 'id',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        return '<div>' +
          // '<a class="btn text-white" style="background-color: #25d366;" href="#!" role="button">' +
          '<i class="fa fa-commenting pointer"></i>'+
          //'</a>' +
          '<span class="badge rounded-pill badge-notification bg-danger" style="position: absolute;top: 3px;left: 15px;font-size:9px">10</span>' +
          '</div>';
      },
      minWidth: 30,
      maxWidth: 40,
      cssClass: 'text-primary',
      // use onCellClick OR grid.onClick.subscribe which you can see down below
      onCellClick: (_e: any, args: OnEventArgs) => {
        console.log(args);
        alert('Comments');
        // reactGrid.gridService.highlightRow(args.row, 1500);
        // reactGrid.gridService.setSelectedRow(args.row);
      },
    },
    {
      id: 'action',
      name: 'Action',
      field: 'id',
      maxWidth: 100,
      formatter: () => `<div class="btn btn-default btn-xs">Action <i class="fa fa-caret-down"></i></div>`,
      cellMenu: {
        //commandTitle: 'Commands',
        // width: 200,
        commandItems: [
          {
            command: 'upload',
            title: 'Upload File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            action: (_e, args) => {
              console.log(args.dataContext, args.column);
              alert('Upload');
            },
          },
          {
            command: 'split',
            title: 'Split Job',
            iconCssClass: 'fa fa-clone text-info',
            positionOrder: 66,
            action: (_e, args) => {
              console.log(args.dataContext, args.column);
              alert('Split');
            },
          },
          {
            command: 'merge', title: 'Merge Job', positionOrder: 64,
            iconCssClass: 'fa fa-compress text-info', cssClass: 'red', textCssClass: 'text-italic color-danger-light',
            action: (_e, args) => {
              console.log(args.dataContext, args.column);
              alert('Merge');
            },
          },
        ]
      }
    }
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
      pageSizes: [5, 10, 15, 20, 25, 50],
      pageSize: 15
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
    gridHeight: 500,
    enableCellMenu: true,

    cellMenu: {
      // all the Cell Menu callback methods (except the action callback)
      // are available under the grid options as shown below
      onCommand: (_e, args) => function() {},
      onOptionSelected: (_e, args) => {
        // change "Completed" property with new option selected from the Cell Menu
        const dataContext = args && args.dataContext;
        if (dataContext && dataContext.hasOwnProperty('completed')) {
          dataContext.completed = args.item.option;
          //this.reactGrid.gridService.updateItem(dataContext);
        }
      },
      onBeforeMenuShow: ((_e, args) => {
        // for example, you could select the row that the click originated
        // this.reactGrid.gridService.setSelectedRows([args.row]);
        console.log('Before the Cell Menu is shown', args);
      }),
      onBeforeMenuClose: ((_e, args) => console.log('Cell Menu is closing', args)),
    },

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
      let data = response.data.map((item:any) => {
        item.files = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles : [];
        return item;
      });

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
  
   const FileBody = () => {
    let files = fileList.map((item:any) => <tr><td>{item.FileName}</td><td width={30} className='text-center'><a href='#'><i className="fa fa-download" aria-hidden="true"></i></a></td></tr>);

    return (
        <table border={0} width={'100%'} className="table table-sm">
          <thead>
            <tr>
            <th className='table-primary'>File Name</th>
            <th className='table-primary'>Action</th>
            </tr>
          </thead>
          <tbody>
            {files}
          </tbody>
        </table>
      );
  }


  return (
    <>
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

    <Modal show={show} onHide={handleClose} size="md" centered={false}>
        {/* <Modal.Header placeholder={'Files'} closeButton={true}>
          <Modal.Title>Files</Modal.Title>
        </Modal.Header> */}
        <Modal.Body className='p-1'>
          <FileBody></FileBody>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} className='btn-sm'>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose} className='btn-sm'>
            Download Zip
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    
  );

  
};

export default JobsList;
