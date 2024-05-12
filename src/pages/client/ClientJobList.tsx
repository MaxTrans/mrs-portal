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

let reactGrid!: SlickgridReactInstance;
let grid1!: SlickGrid;

const ClientJobList = () => {

  const [dataset, setData] = useState<any[]>([]);
  const [statusList, setStatus] = useState([]);
  const [fileList, setFiles] = useState([]);
  const [showloader, setLoader] = useState(true);
//  const [mergeFileName, setMergeFileName] = useState('');

  // Files Modal 
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const user = useSelector((state: IUser) => store.getState().auth);

  let selectedStatus: string = '';
  let selectedClient: string = user.id;

  const columns: Column[] = [
    { id: 'jobId', name: 'Job Id', field: 'jobId', sortable: true },
    // { id: 'notes', name: 'Notes', field: 'notes', sortable: true },
    { id: 'createdDateTime', name: 'Date', field: 'createdDateTime', sortable: true, formatter: Formatters.dateIso,maxWidth: 150 },
    
    {
      id: 'files', name: 'Job Name', field: 'files', sortable: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (dataContext.isSingleJob)
          return value.length > 0 ? `<i class="fa fa-file-archive-o text-info" aria-hidden="true"></i> <a href="#" class="pointer">${dataContext.name}.zip</a>` : '';
        else{
          let icon =  getFileIcon(value[0].FileExtension);
          return value.length > 0 ? `<i class="fa ${icon}" aria-hidden="true"></i> <a href="#" class="pointer">${value[0].FileName}</a>` : '';
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
          window.open(fileInfo.SourceFilePath,'_blank');
          
        }
      }
    },
    {
      id: 'isSingleJob', name: 'Job Type  ', field: 'isSingleJob', sortable: true, maxWidth: 120,
      formatter: (row, cell, value, colDef, dataContext) => {
        return value ? `<div title='Merge Upload'>M(${dataContext.files.length})</div>` : `<div title='Single Upload'>S(${dataContext.files.length})</div>`;
      },
      cssClass: 'text-left px-4'
    },
    { id: 'pagecount', name: 'No. of Pages', field: 'files', sortable: true, maxWidth: 120,
      formatter: (row, cell, value, colDef, dataContext) => {
        let pageCount = 0;
        value.forEach((item:any) => {
            pageCount += item.PageCount ? item.PageCount : 0;
        });
        return pageCount.toString();
      }
    },
    {
      id: 'uploadFiles', name: 'Upload Files', field: 'uploadFiles', sortable: true,
      formatter: (row, cell, value, colDef, dataContext) => {
        if (value.length == 0)
          return '';
        else if(value.length == 1)
        {
          let icon =  getFileIcon(value[0].FileExtension);
          return value.length > 0 ? `<i class="fa ${icon}" aria-hidden="true"></i> <a href="#" class="pointer">${value[0].FileName}</a>` : '';
        }
        else
          return '<i class="fa fa-file-archive-o text-info" aria-hidden="true"></i> <a  target="_blank" href="#">uploadfiles.zip</a>';
      },
      onCellClick: (e: Event, args: OnEventArgs) => {
        console.log(args.dataContext);
        if (args.dataContext.uploadFiles.length > 1) {
          downloadZip(args.dataContext.uploadFiles, 'uploadfiles');
        }
        else {
          let fileInfo: any = args.dataContext.uploadFiles[0];
          window.open(fileInfo.SourceFilePath,'_blank');
          
        }
      }
    },
    { id: 'statusName', name: 'Status', field: 'statusName',  maxWidth: 180},
    
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
        getNotifications(args.dataContext.id);
      },
    },
    {
      id: 'delete',
      field: 'statusName',
      toolTip: 'Delete',
      excludeFromColumnPicker: true,
      excludeFromGridMenu: true,
      excludeFromHeaderMenu: true,
      formatter: (row, cell, value, colDef, dataContext) => {
         return value == "Pending" ? '<i class="fa fa-trash pointer"></i>' : '';
      },
      //params: { iconCssClass: 'fa fa-trash pointer' },
      minWidth: 30,
      maxWidth: 30,
      cssClass: 'text-danger',
      onCellClick: (_e: any, args: OnEventArgs) => {
        if(confirm('Do you want to delete this record?'))
          deleteJob(args.dataContext.id);
      },
    }
  ];
  
  // this._darkModeGrid1 = this.isBrowserDarkModeEnabled();
  const gridOptions: GridOption = {
    ...ConfigSettings.gridOptions,
    ...{
      datasetIdPropertyName: 'uid',
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
          item.files = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles.filter((item:any) => !item.IsUploadFile) : [];
          item.uploadFiles = item.jobFiles ? JSON.parse(item.jobFiles).JobFiles.filter((item:any) => item.IsUploadFile) : [];
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

  const deleteJob = (jobId:string) => {
    JobService.deleteJob(jobId, user.id).then((response: any) => {
      if (response.isSuccess) {
        toast.success('Job deleted successfully.');
        reloadGridData();
      }
    }).finally(() => {
      
    });
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

  function downloadFile(fileInfo: any){
    saveAs(fileInfo.SourceFilePath, fileInfo.FileName);
  };

  function downloadZip(mergeFileList: any [], mergeFileName: string){
      DownloadZipService.createZip(mergeFileList, mergeFileName, function() {});
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

  useEffect(() => {
    getStatus();
    loadData();
  }, []);

  const FileBody = () => {
    let files = fileList.map((item: any) => <tr key={item.FileName}><td>{item.FileName}</td><td width={30} className='text-center'> <Button onClick={() => downloadFile(item)} className='btn-sm pointer'> <i className="fa fa-download" aria-hidden="true"></i></Button></td></tr>);

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

export default ClientJobList;
