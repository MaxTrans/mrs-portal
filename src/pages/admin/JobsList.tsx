import { Column ,Formatters, GridOption, OnEventArgs, SlickgridReact, SlickgridReactInstance, SlickGrid, MenuCommandItem } from 'slickgrid-react';
import { useEffect, useRef, useState } from 'react';
import JobService from '@app/services/jobService';
import LookupService from '@app/services/lookupService';
import Select from 'react-select'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ModalHeader from 'react-bootstrap/ModalHeader';
import { toast } from 'react-toastify';
import NorificationModal from '../Modals/Notification';
import PageLoader from '@app/utils/loading';
import ConfigSettings from '@app/utils/config';
import { useSelector, useDispatch } from 'react-redux';
import store from '../../store/store';
import IUser from '../../store/Models/User';
import UppyUpload from "@app/components/upload/uppyupload";
import { removeUploadedFiles } from '@store/reducers/fileupload';import { saveAs } from 'file-saver';
import DownloadZipService from '@app/services/downloadZipService';

import ApiService from '@app/services/Api.service';
import { AxiosResponse } from 'axios';

interface Props { }

interface State {
  title: string;
  subTitle: string;
  gridOptions1?: GridOption;
  gridOptions2?: GridOption;
  columnDefinitions1: Column[];
  columnDefinitions2: Column[];
}
//let reactGrid!: SlickgridReactInstance;
let grid1!: SlickGrid;


const JobsList = () => {

  const user = useSelector((state: IUser) => store.getState().auth);
  
  
  const dispatch = useDispatch();
  const [reactGrid, setGrid] = useState<SlickgridReactInstance>();
  const [dataset, setData] = useState<any[]>([]);
  const [usersList, setUsers] = useState([]);
  const [statusList, setStatus] = useState([]);
  const [fileList, setFiles] = useState([]);
  const [mergeFileName, setMergeFileName] = useState('');
  const [showloader, setLoader] = useState(true);
  const [uploadTypes, setUploadTypes] = useState([]);
  const [selectedStatus, setStatusFilter] = useState('');
  const [selectedClient, setClientFilter] = useState('');
  const [filename, setFilename] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  const MenuCommandItems: MenuCommandItem[] = Array<MenuCommandItem>();
  // Files Modal 
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // upload modal
  const [ jobId, setJobId ] = useState('');
  const [ fileType, setFileType] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const handleUploadClose = () => { setShowUpload(false); setJobId(''); dispatch(removeUploadedFiles()); }
  const handleUploadShow = () => setShowUpload(true);

  const uploadFiles = () => {
    const files = {
        jobId: jobId,
        UploadFiles: store.getState().uploadfile,
        createdBy: user.id,
    }
    ApiService.requests.post('Upload/AdminFileUpload', files)
            .then((response) => {
                if(response.isSuccess)
                {
                    toast.success('File uploaded successfully');
                    handleUploadClose();
                    reloadGridData();
                }
                else
                {
                    toast.error((response as AxiosResponse).data);
                }
            });
    
  }
  const columns: Column[] = [
    { id: 'jobId', name: 'Job Id', field: 'jobId', sortable: true, maxWidth:80 },
    { id: 'createdDateTime', name: 'Date', field: 'createdDateTime', sortable: true, formatter: Formatters.dateIso, maxWidth: 100 },
    {
      id: 'files', name: 'Job Name', field: 'files', sortable: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (dataContext.isSingleJob)
          return value.length > 0 ? `<i class="fa fa-file-archive-o text-info" aria-hidden="true"></i> <a  target="_blank" href="#">${dataContext.name}.zip</a>` : '';
        else{
          let icon =  getFileIcon(value[0].FileExtension);
          return value.length > 0 ? `<i class="fa ${icon}" aria-hidden="true"></i> <a href="#" class="pointer">${value[0].FileName}</a>` : '';
        }
      },
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log(args.dataContext);
        if (args.dataContext.isSingleJob) {
          setFiles(args.dataContext.files);
          setMergeFileName(args.dataContext.name)
          //handleShow();
          downloadZip();
        }
        else {
          let fileInfo: any = args.dataContext.files[0];
          //window.open(fileInfo.SourceFilePath,'_blank');
          downloadFile(fileInfo);
        }
        updateJobStatus(args.dataContext.id,'In Progress');
      }
    },
    // { id: 'name', name: 'Name', field: 'name', sortable: true },
    // { id: 'notes', name: 'Notes', field: 'notes', sortable: true },
    {
      id: 'isSingleJob', name: 'Job Type  ', field: 'isSingleJob', sortable: true, maxWidth: 120,
      formatter: (row, cell, value, colDef, dataContext) => {
        return value ? `<div title='Merge Upload'>M(${dataContext.files.length})</div>` : `<div title='Single Upload'>S(${dataContext.files.length})</div>`;
      },
      cssClass: 'text-left px-4'
    },
    { id: 'AssignTo', name: 'Assign To', field: 'AssignTo', sortable: true, maxWidth: 100 },
    // { id: 'l1User', name: 'L1 User', field: 'l1User', sortable: true, maxWidth: 100 },
    // { id: 'l2User', name: 'L2 User', field: 'l2User', sortable: true, maxWidth: 100 },
    // { id: 'l3User', name: 'L3 User', field: 'l3User', sortable: true, maxWidth: 100 },
    
    { id: 'userName', name: 'Client', field: 'userName', maxWidth: 100 },
    {
      id: 'uploadFiles', name: 'Upload Files', field: 'uploadFiles', sortable: true, minWidth:100,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (value.length == 0)
          return '';
        else if(value.length == 1)
        {
          let icon =  getFileIcon(value[0].FileExtension);
          return value.length > 0 ? `<i class="fa ${icon}" aria-hidden="true"></i> <a href="#" class="pointer">${value[0].FileName}</a>` : '';
        }
        else
        return '<a  target="_blank" href="#">View Files</a>';

      },
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log(args.dataContext);
        if (args.dataContext.uploadFiles.length > 1) {
          setFiles(args.dataContext.uploadFiles);
          setMergeFileName('uploadfiles');
          handleShow();
        }
        else {
          let fileInfo: any = args.dataContext.uploadFiles[0];
          //window.open(fileInfo.SourceFilePath,'_blank');
          downloadFile(fileInfo);
        }
        updateJobStatus(args.dataContext.id,'In Progress');
      }
    },
    { id: 'statusName', name: 'Status', field: 'statusName', maxWidth: 100 },
    { id: 'pagecount', name: 'No. of Pages', field: 'files', sortable: true, maxWidth: 100,
      formatter: (row, cell, value, colDef, dataContext) => {
        let pageCount = 0;
        value.forEach((item:any) => {
            pageCount += item.PageCount ? item.PageCount : 0;
        });
        return pageCount.toString();
      },
      cssClass: 'text-center px-4'
    },
    { id: 'tat', name: 'TAT', field: 'tat', maxWidth: 100 },
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
            title: 'Upload Word File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.doc' || x == '.docx') > -1
              if(args.dataContext.uploadFiles.length == 0)
                return isShow
              else
              {
                let fileexits = args.dataContext.uploadFiles.find((file:any) => file.FileExtension == '.doc' || file.FileExtension == '.docx');
                return isShow && !fileexits;
              }
            },
            action: (_e, args) => {
                setJobId(args.dataContext.id);
                setFileType('.docx');
                handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Reupload Word File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.doc' || x == '.docx') > -1
              if(args.dataContext.uploadFiles.length > 0)
              {
                let fileexits = args.dataContext.uploadFiles.find((file:any) => file.FileExtension == '.doc' || file.FileExtension == '.docx');
                return isShow && fileexits;
              }
              else 
                return false;

            },
            action: (_e, args) => {
                setJobId(args.dataContext.id);
                setFileType('.docx');
                handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Upload PDF File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.pdf') > -1;
              if(args.dataContext.uploadFiles.length == 0)
                return isShow
              else
              {
                let fileexits = args.dataContext.uploadFiles.find((file:any) => file.FileExtension == '.pdf');
                return isShow && !fileexits;
              }
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
                setFileType('.pdf');
                handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Reupload PDF File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.pdf') > -1;
              if(args.dataContext.uploadFiles.length > 0)
              {
                let fileexits = args.dataContext.uploadFiles.find((file:any) => file.FileExtension == '.pdf');
                return isShow && fileexits;
              }
              else 
                return false;
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
                setFileType('.pdf');
                handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Upload PDF Link File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.pdflnk') > -1;
              if(args.dataContext.uploadFiles.length == 0)
                return isShow
              else
              {
                let fileexits = args.dataContext.uploadFiles.find((file:any) => file.FileExtension == '.pdflnk');
                return isShow && !fileexits;
              }
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
              setFileType('.pdflnk');
              handleUploadShow();
            },
          },
          {
            command: 'upload',
            title: 'Reupload PDF Link File',
            iconCssClass: 'fa fa-upload text-success',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              let isShow = (args.dataContext.filePreference as string).split(',').findIndex((x) => x == '.pdflnk') > -1;
              if(args.dataContext.uploadFiles.length > 0)
              {
                let fileexits = args.dataContext.uploadFiles.find((file:any) => file.FileExtension == '.pdflnk');
                return isShow && fileexits;
              }
              else 
                return false;
            },
            action: (_e, args) => {
              setJobId(args.dataContext.id);
              setFileType('.pdflnk');
              handleUploadShow();
            },
          },
          {
            command: 'split',
            title: 'Split Job',
            iconCssClass: 'fa fa-clone text-info',
            positionOrder: 66,
            itemVisibilityOverride(args) {
              return (args.dataContext.statusName == 'Pending' || args.dataContext.statusName == 'In Progress');
            },
            action: (_e, args) => {
              console.log(args.dataContext, args.column);
              alert('Split');
            },
          },
          {
            command: 'merge', title: 'Merge Job', positionOrder: 64,
            iconCssClass: 'fa fa-compress text-info', cssClass: 'red', textCssClass: 'text-italic color-danger-light',
            itemVisibilityOverride(args) {
              return (args.dataContext.statusName == 'Pending' || args.dataContext.statusName == 'In Progress');
            },
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
    setGrid(reactGridInstance);
  }

  const getFileIcon = (fileExt:string) => {
    //['pdf','.pdf','pdflink',''].indexOf(value[0].FileExtension) > -1 ?  '<i class="fa fa-file-pdf-o text-danger" aria-hidden="true"></i>' : '<i class="fa fa-file-word-o text-primary" aria-hidden="true"></i>';

    switch(fileExt){
      case 'pdf':
      case '.pdf':
      case 'pdflink':
      case '.pdflink':
        return 'fa-file-pdf-o text-danger'; break;
      case 'doc':
      case '.doc':
      case 'docx':
      case '.docx':
        return 'fa-file-word-o text-primary'; break;
      default: return 'fa-file text-info';
    }

  };

  const loadData = (isreload:boolean) => {
    setLoader(true);
    JobService.getJobs(user.id, selectedStatus, selectedClient, filename, fromDate, toDate, initialLoad).then((response: any) => {
      if (response.isSuccess) {
        let data = response.data.map((item: any) => {
          item.files = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles.filter((item:any) => !item.IsUploadFile) : [];
          item.uploadFiles = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles.filter((item:any) => item.IsUploadFile) : [];
          item.uid = crypto.randomUUID();
          return item;
        });
        console.log(data);
        if(isreload && reactGrid){
           reactGrid.dataView.setItems(data);
        }
        else
          setData(data);
      }
    }).catch(() => {
      setLoader(false);
    }).finally(() => {
      setLoader(false);
    });

    setInitialLoad(false);
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
    let status = response.data.map((item: any) => {
      return { 'value': item.id, 'label': item.value };
    });

      setStatus(status)
      // set default status on load
      // let defaultFilters: any[] = ['Pending','In Progress'];
      // let defaultStatus = status.filter((item:any) => defaultFilters.indexOf(item.label) > -1).map((item:any) => item.value).join(',');
      // setStatusFilter(defaultStatus);
      console.log(response.data);
    }
  }

  const onStatusChange = (newValue: any, actionMeta: any) => {
    let selStatus = newValue ? newValue.map((val: any, index: number) => val.value).join(',') : '';
    setStatusFilter(selStatus);
  };

  const onClientChange = (newValue: any, actionMeta: any) => {
    let selClients = newValue ? newValue.map((val: any, index: number) => val.value).join(',') : '';
    setClientFilter(selClients);
  };

  function downloadFile(fileInfo: any){
    setLoader(true);
    DownloadZipService.downlodFile(fileInfo, function() {
      setLoader(false);
    });
  };

  function downloadZip(){
    setLoader(true);
      DownloadZipService.createZip(fileList, mergeFileName, function() {
        setLoader(false);
      });
  }

  const updateJobStatus = (jobId:string, status: string) => {
    JobService.updateJobStatus(jobId, user.id, status).then((response: any) => {
      if (response.isSuccess) {
        //toast.success(`Job ${status} successfully.`);
        reloadGridData();
      }
    }).finally(() => {
      
    });
  }

  // const defaultStatus = [
  //   {value:'FAB98251-70C2-410B-BC09-9B66F9234E30', label: 'Pending'},
  //   {value:'4A6B36E0-FA7C-4F8D-8FE3-4E10A57D07B6', label: 'In Progress'}
  // ];
  

  useEffect(() => {
    getUsers();
    getStatus();
    loadData(false);
  }, []);

  const FileBody = () => {
    let files = fileList.map((item: any) => <tr key={item.FileName}><td><i className={"fa " + getFileIcon(item.FileExtension)} aria-hidden="true"></i> {item.FileName}</td><td width={30} className='text-center'> <a href={item.SourceFilePath} target='_blank'> <i className="fa fa-download" aria-hidden="true"></i></a></td></tr>);

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
    loadData(true);
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

                <div className="col-md-3">
                  <div className="form-group">
                      <label>Select Status </label>
                      <Select options={statusList} isClearable={true} onChange={onStatusChange} isMulti={true}  closeMenuOnSelect={false}/>
                  </div>
                </div>  

                <div className="col-md-2">
                  <div className="form-group">
                      <label>Select Client </label>
                      <Select options={usersList} isClearable={true} onChange={onClientChange} isMulti={true} closeMenuOnSelect={false}/>
                  </div>
                </div>  

                <div className="col-md-2">
                  <div className="form-group">
                      <label>Filename </label>
                      <input  className="form-control" type='text' name='txtFilename' onChange={(e) => setFilename(e.target.value)} value={filename} />
                  </div>
                </div>  

                <div className="col-md-2">
                  <div className="form-group">
                      <label>From Date </label>
                      <input  className="form-control" type='date' name='txtFromDate' onChange={(e) => setFromDate(e.target.value)} value={fromDate} />
                  </div>
                </div>  

                <div className="col-md-2">
                  <div className="form-group">
                      <label>To Date </label>
                      <input  className="form-control" type='date' name='txtToDate' onChange={(e) => setToDate(e.target.value)} value={toDate} />
                  </div>
                </div> 

                <div className="col-md-1">
                  <div className="form-group">
                      <label>&nbsp; </label><br></br>
                      <Button variant="primary" onClick={(e) => loadData(false)}>Search</Button>
                  </div>
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
          <Button variant="primary" onClick={downloadZip} className='btn-sm'>
            Download Zip
          </Button>
        </Modal.Footer>
      </Modal>


      <Modal show={showUpload} onHide={handleUploadClose} centered={false}>
        <ModalHeader placeholder={undefined}>
            Upload File
        </ModalHeader>
        <Modal.Body className='p-1'>
            <UppyUpload admin={true} onCompleteCallback={uploadFiles} filePreference={fileType} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleUploadClose} className='btn-sm'>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <NorificationModal title='alert' okBottonText='OK' cancelBottonText='Close' ref={childRef} reloadGridData={reloadGridData}></NorificationModal>
    </>

  );

};

export default JobsList;
