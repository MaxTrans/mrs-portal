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
import IUser from '@app/store/Models/User';
import store from '@app/store/store';
import { useSelector } from 'react-redux';
import DownloadZipService from '@app/services/downloadZipService';
import { saveAs } from 'file-saver';
import { useNavigate } from "react-router-dom";
import { blob } from 'stream/consumers';
import { faL } from '@fortawesome/free-solid-svg-icons';
import confirm from '@app/components/confirm/confirmService';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';

//let reactGrid!: SlickgridReactInstance;
let grid1!: SlickGrid;

const ClientJobList = () => {

  const [reactGrid, setGrid] = useState<SlickgridReactInstance>();
  const [dataset, setData] = useState<any[]>([]);
  const [statusList, setStatus] = useState([]);
  const [fileList, setFiles] = useState([]);
  const [showloader, setLoader] = useState(true);
  const [mergeFileName, setMergeFileName] = useState('');
  const [selectedStatus, setStatusFilter] = useState('');
  const [filename, setFilename] = useState('');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [initialLoad, setInitialLoad] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
//  const [mergeFileName, setMergeFileName] = useState('');
  // const [defaultStatus, setDefaultStatus] = useState([]);
  // Files Modal 
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const user = useSelector((state: IUser) => store.getState().auth);
  const navigate = useNavigate();
  let selectedClient: string = user.id;

  const columns: Column[] = [
    { id: 'jobId', name: 'ID', field: 'jobId', sortable: true, maxWidth:80 },
    // { id: 'notes', name: 'Notes', field: 'notes', sortable: true },
    { id: 'createdDateTime', name: 'Date', field: 'createdDateTime', sortable: true, formatter: Formatters.dateUs, maxWidth: 100 },
    
    {
      id: 'files', name: 'FILE NAME <i class="fa fa-upload text-success ml-1" aria-hidden="true"></i>', field: 'files', sortable: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (dataContext.isSingleJob)
          return value.length > 0 ? `<i class="fa fa-file-archive-o text-info" aria-hidden="true"></i> <a href="#" class="pointer" title="${dataContext.name}">${dataContext.name}.zip</a>` : '';
        else{
          let icon =  getFileIcon(value[0].FileExtension);
          return value.length > 0 ? `<i class="fa ${icon}" aria-hidden="true"></i> <a href="#" class="pointer" title="${value[0].FileName}">${value[0].FileName}</a>` : '';
        }
      },
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log(args.dataContext);
        if (args.dataContext.isSingleJob) {
          //setMergeFileName(args.dataContext.name);
          //setFiles(args.dataContext.files);
          downloadZip(args.dataContext.files, args.dataContext.name);
          //handleShow();
        }
        else {
          let fileInfo: any = args.dataContext.files[0];
          //window.open(fileInfo.SourceFilePath,'_blank');
          downloadFile(fileInfo);
        }
       
      }
    },
    {
      id: 'isSingleJob', name: 'JOB TYPE  ', field: 'isSingleJob', sortable: true, maxWidth: 120,
      formatter: (row, cell, value, colDef, dataContext) => {
        return value ? `<div title='Merge Upload'>M(${dataContext.files.length})</div>` : `<div title='Single Upload'>S(${dataContext.files.length})</div>`;
      },
      cssClass: 'text-left px-4'
    },
    { id: 'pagecount', name: '#PAGES', field: 'files', sortable: true, maxWidth: 120,
      formatter: (row, cell, value, colDef, dataContext) => {
        let pageCount = 0;
        value.forEach((item:any) => {
            pageCount += item.PageCount ? item.PageCount : 0;
        });
        return pageCount.toString();
      }
    },
    {
      id: 'uploadFiles', name: 'FILES <i class="fa fa-download text-success ml-1" aria-hidden="true"></i>', field: 'uploadFiles', sortable: true, maxWidth: 100,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (value.length == 0)
          return '';
        else{
          
          let content = '';
          if(value)
          value.forEach((file:any) => {
              let fileicon = getFileIcon(file.FileExtension);
              content += `<i class="fa ${fileicon} fa-2 pointer" aria-hidden="true" title="${file.FileName}" data-id="${file.Id}"></i>&nbsp;`;
          });

          return content;
        }
          
      },
      onCellClick: (e: any, args: OnEventArgs) => {
        let fileid = e.target.attributes['data-id'];
        if(fileid.value){
          let fileinfo = args.dataContext.uploadFiles.find((item:any) => item.Id == fileid.value);
          downloadFile(fileinfo);
        }
        //updateJobStatus(args.dataContext.id,'Downloaded');
      }
    },
    { id: 'statusName', name: 'STATUS', field: 'statusName',  maxWidth: 180},
    { id: 'tat', name: 'TAT', field: 'tat', maxWidth: 100
    ,formatter: (row, cell, value, colDef, dataContext) => {
      if (typeof value === 'string' && value.endsWith("Hours")) {
        return value.replace("Hours", "Hrs");
      } else {
        return value.toString();
      }
    }
     },
    {
      id: 'notification',
      field: 'unReadMessages',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      toolTip: 'Notifications',
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
        setShowNotification(args.dataContext)
        getNotifications(args.dataContext.id);
      },
    },
    {
      id: 'action',
      name: '',
      field: 'statusName',
      maxWidth: 100,
      formatter: (row, cell, value, colDef, dataContext) => {
        if(value == 'Pending')
          return `<div class="btn btn-default btn-xs" >Action <i class="fa fa-caret-down"></i></div>`;  
        else
          return '';
      },
      cellMenu: {
        menuUsabilityOverride: function (args) {
          return (args.dataContext.statusName === 'Pending'); 
        },
        //commandTitle: 'Commands',
        // width: 200,
        commandItems: [
          {
            command: 'Void',
            title: 'Void',
            iconCssClass: 'fa fa-trash text-danger',
            positionOrder: 66,
            // itemVisibilityOverride(args) {
            //   return (args.dataContext.statusName == 'Pending' || args.dataContext.statusName == 'InProgress' )
            // },
            action: (_e, args) => {
              confirm('Are you sure you want to Void this record?', { title: 'Confirm', cancelLabel: 'No', okLabel: 'Yes' }).then((res:boolean) => {
                if(res)
                  deleteJob(args.dataContext.id,'Void'); 
              });
            },
          },
          {
            command: 'Duplicate',
            title: 'Duplicate',
            iconCssClass: 'fa fa-files-o text-info',
            positionOrder: 66,
            action: (_e, args) => {
              confirm('Are you sure you want to Duplicate this record?', { title: 'Confirm', cancelLabel: 'No', okLabel: 'Yes' }).then((res:boolean) => {
                if(res)
                deleteJob(args.dataContext.id,'Duplicate');
              });
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
      enableCellMenu: true,
      datasetIdPropertyName: 'uid',
    }
  };


  function reactGridReady(reactGridInstance: SlickgridReactInstance) {
    setGrid(reactGridInstance);
  }

  const loadData = (isreload:boolean) => {
    setLoader(true);
    let fDate = fromDate ? moment(fromDate).format('MM-DD-YYYY') : '';
    let tDate = toDate ? moment(toDate).format('MM-DD-YYYY') : '';
    JobService.getJobs(user.id, selectedStatus, selectedClient, filename, fDate, tDate, initialLoad).then((response: any) => {
      if (response.isSuccess) {
        let data = response.data.map((item: any) => {
          item.files = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles.filter((item:any) => !item.IsUploadFile) : [];
          item.uploadFiles = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles.filter((item:any) => item.IsUploadFile) : [];
          item.uid = crypto.randomUUID();
          return item;
        });
        console.log(data);
        if(reactGrid && isreload)
          reactGrid.dataView.setItems(data)
        else
          setData(data);
      }
    }).finally(() => {
      setLoader(false);
    });
  }

  const deleteJob = (jobId:string, status: string) => {
    JobService.deleteJob(jobId, user.id, status).then((response: any) => {
      if (response.isSuccess) {
        toast.success(`Job ${status} successfully.`);
        reloadGridData();
      }
    }).finally(() => {
      
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



  let getStatus = async () => {
    LookupService.getStatus('status').then(
      (response: any) => {
        if (response.isSuccess) {
          setStatus(response.data.map((item: any) => {
            return { 'value': item.id, 'label': item.value };
          }));
          let status = response.data.map((item: any) =>   {
            if (item.value == 'Pending' || item.value == 'In Progress') 
                return item.id 
          }).join(',');
          status = status.split(',').filter((x: any) => { if (x.trim() != '') return x}).join(',');
          let dStatus = response.data.map((item: any) => { 
            if (item.value == 'Pending' || item.value == 'In Progress') 
              return { 'value': item.id, 'label': item.value } 
          });
          dStatus = dStatus.filter((element: any) => !!element);
          //setStatusFilter(status);
        
      }});
    
  }

  const onStatusChange = (newValue: any, actionMeta: any) => {
    let selStatus = newValue ? newValue.map((val: any, index: number) => val.value).join(',') : '';
    setStatusFilter(selStatus);
  };

  function downloadFile(fileInfo: any){
    setLoader(true);
    DownloadZipService.downlodFile(fileInfo, function(){
      setLoader(false);
    });
  };

  function downloadZip(mergeFileList: any [], mergeFileName: string){
      setLoader(true);
      DownloadZipService.createZip(mergeFileList, mergeFileName, function() {
        setLoader(false);
      });
  }

  function downloadZipPopUp(){
    DownloadZipService.createZip(fileList, mergeFileName, function() {});
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

  function search()
  {
    if(initialLoad)
      setInitialLoad(false);
    else
      loadData(false);  
  }

  useEffect(() => {
    loadData(false);
  }, [initialLoad]);

  useEffect(() => {
    getStatus();
    loadData(false);
  }, []);

  // useEffect(() => {
    
  // }, [selectedStatus]);

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
              <div className="card-header d-flex">
                <div className='col-md-4'>
                  <h3 className="card-title">Jobs</h3>
                </div>
                <div className='col-md-8 d-flex flex-row-reverse'>
                  <Button style={{ backgroundColor:'#b8f9d3', color:'black', marginLeft:'5px'}} className='btn-sm' onClick={(e) => navigate('/intake', { state: { isSingle: true } })}>
                    Merge Upload
                  </Button>
                  <Button  style={{ backgroundColor:'#dce9ff', color:'black' }} className='btn-sm' onClick={(e) => navigate('/intake', { state: { isSingle: false } })}>
                    Single Upload
                  </Button>
                </div>
              </div>
              <div className="card-body">
                <div className='row'>
                <div className="col-md-3">
                  <div className="form-group">
                      <label>Select Status </label>
                      <Select options={statusList} isClearable={true} onChange={onStatusChange} isMulti={true}  closeMenuOnSelect={false}/>
                  </div>
                </div>  

                <div className="col-md-3">
                  <div className="form-group">
                      <label>File Name </label>
                      <input className="form-control" type='text' name='txtFilename' onChange={(e) => setFilename(e.target.value)} value={filename} />
                  </div>
                </div>  

                <div className="col-md-2">
                  <div className="form-group">
                      <label>From Date </label><br></br>
                      <DatePicker id="txtFromDate" name='txtFromDate' onChange={(date:any) => setFromDate(date)}  selected={fromDate}  className="form-control" dateFormat="MM/dd/yyyy"/>
                  </div>
                </div>  

                <div className="col-md-2">
                  <div className="form-group">
                      <label>To Date </label><br></br>
                      <DatePicker id="txtToDate" name='txtToDate' onChange={(date:any) => setToDate(date)}  selected={toDate}  className="form-control" dateFormat="MM/dd/yyyy"/>
                  </div>
                </div>  
                <div className="col-md-2">
                  <div className="form-group">
                      <label>&nbsp; </label><br></br>
                     <Button variant="primary" onClick={(e) => search()}>Search</Button>
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
          <Button variant="primary" onClick={downloadZipPopUp} className='btn-sm'>
            Download Zip
          </Button>
        </Modal.Footer>
      </Modal>

      <NorificationModal title='alert' okBottonText='OK' cancelBottonText='Close' details={showNotification} ref={childRef} reloadGridData={reloadGridData}></NorificationModal>
    </>

  );

};

export default ClientJobList;
