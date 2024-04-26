/* eslint-disable */
import React, { Component, useEffect } from "react";
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

export default function UppyUpload(props: any) {
  let uppy: any;
  const dispatch = useDispatch();
  const uploadedFiles = useSelector(
    (state: Array<IUploadFiles>) => store.getState().uploadfile
  );
  useEffect(() => {
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
        height: 200,
        width: "100%",
      })
      .use(DropTarget, {
        target: document.body,
      })
      .use(AwsS3Multipart, {
          limit: 4,
          //companionUrl:'http://localhost:8080/',
          companionUrl: 'https://maxtra-uppy-server.azurewebsites.net/'
        },
      )
      //.use(XHRUpload, { endpoint: 'http://localhost:5107/api/Upload/Upload', formData: true, bundle: true, fieldName:'fileupload' })
      .on("complete", (result: UploadResult) => {
        console.log(result);

        let files = result.successful.filter(function (item) {
          return uploadedFiles.filter((x) => x.filename !== item.name);
        });

        for (let i = 0; i < files.length; i++) {
          dispatch(
            setUploadedFiles({
              fileId: files[i].id,
              filename: files[i].name,
              size: files[i].size,
              fileextension: files[i].extension,
              filepath: files[i].uploadURL,
            })
          );
        }
        props.onCompleteCallback();
      })
      .setOptions({
        restrictions: {
          //allowedFileTypes: props.filePreference ? props.filePreference.split(',') : ['.pdf','.doc','.docx'],
          allowedFileTypes: ['.pdf','.doc','.docx'],
          maxNumberOfFiles: (props.admin && props.admin === true ? 1 : 10)
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
