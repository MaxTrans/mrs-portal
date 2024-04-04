/* eslint-disable */
import React, { Component, useEffect } from'react'
import { DashboardModal, DragDrop, ProgressBar, FileInput}  from'@uppy/react';
import Dashboard from '@uppy/dashboard';
import DropTarget from "@uppy/drop-target";
import Uppy, { UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/progress-bar/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import XHRUpload from '@uppy/xhr-upload';
import { useDispatch } from 'react-redux';
import { setUploadedFiles } from '@store/reducers/fileupload';


export default function UppyUpload() {
  let uppy: any;
  const dispatch = useDispatch();

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
                    .on('complete', (result: any) =>{
                        console.log(result);
                        dispatch(setUploadedFiles({
                          fileId: result.uploadID,
                          filename: result.successful[0].data.name,
                          size: result.successful[0].data.size,
                          fileextension: result.successful[0].extension,
                          filepath: result.successful[0].data.name
                        }))
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
  


