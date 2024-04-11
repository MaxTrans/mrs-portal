/* eslint-disable */
import React, { Component, useEffect } from'react'
import { DashboardModal, DragDrop, ProgressBar, FileInput}  from'@uppy/react';
import Dashboard from '@uppy/dashboard';
import DropTarget from "@uppy/drop-target";
import Uppy, { UploadResult, UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/progress-bar/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import XHRUpload from '@uppy/xhr-upload';
import { useDispatch, useSelector } from 'react-redux';
import { setUploadedFiles } from '@store/reducers/fileupload';
import store from '@app/store/store';
import IUploadFiles from '@app/store/Models/UploadFiles';


export default function UppyUpload() {
  let uppy: any;
  const dispatch = useDispatch();
  const uploadedFiles = useSelector((state: Array<IUploadFiles>) => store.getState().uploadfile);
  useEffect(() => {
    uppy = new Uppy({ id: 'uppyloader', autoProceed: false, debug: true })
                    .use(Dashboard, {
                      inline: true,
                      target: "#uppyUpload",
                      showProgressDetails: true,
                      proudlyDisplayPoweredByUppy: false,
	                    height:200,
                      width:500,
                    })
                    .use(DropTarget, {
                      target: document.body,
                    })
                    .use(XHRUpload, { endpoint: 'http://localhost:5107/api/Upload/Upload', formData: true, bundle: true, fieldName:'fileupload' })
                    .on('complete', (result: UploadResult) =>{
                        
                        let files = result.successful.filter(function(item) {
                            return uploadedFiles.filter(x => x.filename  !== item.name)
                        });
                        
                        for(let i= 0; i <= files.length - 1; i++){
                          dispatch(setUploadedFiles({
                            fileId: files[i].id,
                            filename: files[i].name,
                            size: files[i].size,
                            fileextension: files[i].extension,
                            filepath: files[i].name
                          }));
                      }
                      
                    })
                    .setOptions({
                      restrictions: {
                        allowedFileTypes:['.pdf']
                      }
                    })
  },[]);

  useEffect(() => {
    return () => {
      uppy?.close({ reason: 'unmount' })
    }
  },[])
  
    return (
        <div id="uppyUpload">
        </div>
    );
}
  


