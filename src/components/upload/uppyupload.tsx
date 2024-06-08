/* eslint-disable */
import React, { Component, useEffect, useState } from "react";
import { DashboardModal, DragDrop, ProgressBar, FileInput } from "@uppy/react";
import Dashboard from "@uppy/dashboard";
import DropTarget from "@uppy/drop-target";
import Uppy, { UploadResult, UppyFile } from "@uppy/core";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "@uppy/progress-bar/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import XHRUpload from "@uppy/xhr-upload";
import { useDispatch, useSelector } from "react-redux";
import { setUploadedFiles, removeUploadedFiles } from "@store/reducers/fileupload";
import store from "@app/store/store";
import IUploadFiles from "@app/store/Models/UploadFiles";
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import LookupService from "@app/services/lookupService";

export default function UppyUpload(props: any) {
  let uppy: any;
  const uploadUrl = import.meta.env.VITE_S3_URL;

  const [ fileTypes, setFileTypes ] = useState([]);
  const dispatch = useDispatch();
  const uploadedFiles = useSelector(
    (state: Array<IUploadFiles>) => store.getState().uploadfile
  );
  const getFileTypes = async () => {
    const response: any = await LookupService.getStatus('filetypes');
    if (response.isSuccess) {
        setFileTypes(response.data)
      }
  }
  
  useEffect(() => {
    if (props.admin && props.admin === true){
        getFileTypes();
    }
    return (uppy = new Uppy({
      id: "uppyloader",
      autoProceed: false,
      debug: true,
      onBeforeUpload: (files:any) => {
        if (props.onBeforeUpload){
          props.onBeforeUpload();
        }
        return true;
      }
    })
      .use(Dashboard, {
        inline: true,
        target: "#uppyUpload",
        showProgressDetails: true,
        proudlyDisplayPoweredByUppy: false,
        height: 300,
        width: "100%"
      })
      .use(DropTarget, {
        target: document.body,
      })
      .use(AwsS3Multipart, {
          limit: 4,
          companionUrl: uploadUrl
          //companionUrl: 'https://maxtra-uppy-server.azurewebsites.net/'
        },
      )
      //.use(XHRUpload, { endpoint: 'http://localhost:5107/api/Upload/Upload', formData: true, bundle: true, fieldName:'fileupload' })
      .on("complete", (result: UploadResult) => {
        console.log(result);

        let files = result.successful.filter(function (item) {
          return uploadedFiles.filter((x) => x.filename !== item.name);
        });

        for (let i = 0; i < files.length; i++) {
          const extension = '.' + files[i].name.split('.')[1];
          dispatch(
            setUploadedFiles({
              fileId: files[i].id,
              filename: files[i].name,
              size: files[i].size,
              fileextension: props.filePreference && props.filePreference != '' ? props.filePreference : extension,
              filepath: files[i].uploadURL
            })
          );
        }
        props.onCompleteCallback();
      })
      .setOptions({
        restrictions: {
          allowedFileTypes: props.filePreference ? props.filePreference === '.pdflnk' ? ['.pdf'] : props.filePreference.split(',')  : ['.pdf','.doc','.docx','.*'],
          maxNumberOfFiles: (props.admin && props.admin === true ? 1 : 10),
          maxFileSize: 1073741824
        },
      }));
  }, []);

  useEffect(() => {
    return () => {
      uppy?.close({ reason: "unmount" });
    };
  }, []);


  return <div id="uppyUpload"></div>;
}
