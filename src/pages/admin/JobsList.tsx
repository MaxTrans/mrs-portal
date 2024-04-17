import { Column, Formatters, GridOption, OnEventArgs, SlickgridReact, SlickgridReactInstance, SlickGrid } from 'slickgrid-react';
import { useEffect, useRef, useState } from 'react';
import JobService from '@app/services/jobService';
import LookupService from '@app/services/lookupService';
import Select from 'react-select'
import Button from 'react-bootstrap/Button';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import NorificationModal from '../Modals/Notification';
import PageLoader from '@app/utils/loading';
import ConfigSettings from '@app/utils/config';
import { useSelector } from 'react-redux';
import store from '../../store/store';
import IUser from '../../store/Models/User';


interface Props { }

interface State {
  title: string;
  subTitle: string;
  gridOptions1?: GridOption;
  gridOptions2?: GridOption;
  columnDefinitions1: Column[];
  columnDefinitions2: Column[];
}
let reactGrid!: SlickgridReactInstance;
let grid1!: SlickGrid;


const JobsList = () => {

  const user = useSelector((state: IUser) => store.getState().auth);
  console.log(user);

  const [dataset, setData] = useState<any[]>([]);
  const [usersList, setUsers] = useState([]);
  const [statusList, setStatus] = useState([]);
  const [fileList, setFiles] = useState([]);
  const [showloader, setLoader] = useState(true);


  // Files Modal 
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);



  let selectedStatus: string = '';
  let selectedClient: string = '';

  const columns: Column[] = [
    { id: 'jobId', name: 'Job Id', field: 'jobId', sortable: true , maxWidth: 100 },
    // { id: 'name', name: 'Name', field: 'name', sortable: true },
    // { id: 'notes', name: 'Notes', field: 'notes', sortable: true },
    {
      id: 'isSingleJob', name: 'Single Job', field: 'isSingleJob', sortable: true, maxWidth: 90,
      formatter: (row, cell, value, colDef, dataContext) => {
        return value ? '<i class="fa fa-check-square" aria-hidden="true"></i>' : '';
      },
      cssClass: 'text-center text-primary'
    },
    { id: 'AssignTo', name: 'Assign To', field: 'AssignTo', sortable: true },
    { id: 'l1User', name: 'L1 User', field: 'l1User', sortable: true },
    { id: 'l2User', name: 'L2 User', field: 'l2User', sortable: true },
    { id: 'l3User', name: 'L3 User', field: 'l3User', sortable: true },
    {
      id: 'files', name: 'File', field: 'files', sortable: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (dataContext.isSingleJob)
          return value.length > 0 ? '<a heef="#" class="pointer">View Files</a>' : '';
        else
          return value.length > 0 ? '<a heef="#">' + value[0].FileName + '</a>' : '';
      },
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log(args.dataContext);
        if (args.dataContext.isSingleJob) {
          setFiles(args.dataContext.files);
          handleShow();
        }
        else {
          toast.info('File Downloaded.')
        }
      }
    },
    { id: 'userName', name: 'Client', field: 'userName' },
    { id: 'statusName', name: 'Status', field: 'statusName', },
    { id: 'createdDateTime', name: 'Created Date', field: 'createdDateTime', sortable: true, formatter: Formatters.dateIso },
    {
      id: 'notification',
      field: 'unReadMessages',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (value == 0) {
          return '<div><i class="fa fa-commenting pointer"></i></div>';
        }
        else {
          return '<div>' +
            '<i class="fa fa-commenting pointer"></i>' +
            '<span class="badge rounded-pill badge-notification bg-danger" style="position: absolute;top: 3px;left: 15px;font-size:9px">' + value + '</span>' +
            '</div>';
        }
      },
      minWidth: 30,
      maxWidth: 40,
      cssClass: 'text-primary',
      onCellClick: (_e: any, args: OnEventArgs) => {
        getNotifications(args.dataContext.id);
        // reactGrid.gridService.highlightRow(args.row, 1500);
        // reactGrid.gridService.setSelectedRow(args.row);
      },
    },
    {
      id: 'action',
      name: '',
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
  const gridOptions: GridOption = {
    ...ConfigSettings.gridOptions,
    ...{
      datasetIdPropertyName: 'uid',
      enableCellMenu: true,
      cellMenu: {
        onCommand: (_e, args) => function () { },
        onOptionSelected: (_e, args) => {
          const dataContext = args && args.dataContext;
          if (dataContext && dataContext.hasOwnProperty('completed')) {
            dataContext.completed = args.item.option;
          }
        },
      }
    }
  };

  function reactGridReady(reactGridInstance: SlickgridReactInstance) {
    reactGrid = reactGridInstance;
  }

  const loadData = () => {
    setLoader(true);
    JobService.getJobs(user.id, selectedStatus, selectedClient).then((response: any) => {
      if (response.isSuccess) {
        let data = response.data.map((item: any) => {
          item.files = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles : [];
          item.uid = crypto.randomUUID();
          return item;
        });
        console.log(data);
        setData(data);

      }
    }).finally(() => {
      setLoader(false);
    });
  }

  let getUsers = async () => {
    const response: any = await LookupService.getUsers('client');
    if (response.isSuccess) {
      setUsers(response.data.map((item: any) => {
        return { 'value': item.id, 'label': item.value };
      })
      );
      console.log(response.data);
    }
  }

  let getStatus = async () => {
    const response: any = await LookupService.getStatus('status');
    if (response.isSuccess) {
      setStatus(response.data.map((item: any) => {
        return { 'value': item.id, 'label': item.value };
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
  }, []);

  const FileBody = () => {
    let files = fileList.map((item: any) => <tr><td>{item.FileName}</td><td width={30} className='text-center'><a href='#'><i className="fa fa-download" aria-hidden="true"></i></a></td></tr>);

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

  // Notifications

  function reloadGridData() {
    loadData();
  };
  const childRef: any = useRef();

  // trigger child method to load notifications
  let getNotifications = async (jobId: string) => {
    childRef.current.getNotifications(jobId)
  }

  function loadshow() {
    setLoader(true)
  }

  return (

    <>
      {showloader && <PageLoader></PageLoader>}
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
                    <Button variant="primary" onClick={reloadGridData}>Search</Button>
                  </div>
                </div>
                <div className='row pt-4'>
                  <div className='col-md-12' style={{ zIndex: '0' }}>
                    <SlickgridReact gridId="grid1"
                      columnDefinitions={columns}
                      gridOptions={gridOptions!}
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

      <Modal show={show} onHide={handleClose} centered={false}>
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

      <NorificationModal title='alert' okBottonText='OK' cancelBottonText='Close' ref={childRef} reloadGridData={reloadGridData}></NorificationModal>
    </>

  );

};

export default JobsList;