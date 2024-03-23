/* eslint-disable */
import React, { Component } from'react'
import { DashboardModal, DragDrop, ProgressBar, FileInput}  from'@uppy/react';
import Dashboard from '@uppy/dashboard';
import DropTarget from "@uppy/drop-target";
import Uppy from '@uppy/core';
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import '@uppy/progress-bar/dist/style.css'
import '@uppy/drag-drop/dist/style.css'
import XHRUpload from '@uppy/xhr-upload';

type Componentstate = { };

export default class UppyUpload extends Component<{},Componentstate> {
  
  uppy: any;
  constructor (props: any) {
    super(props)
  }

  componentDidMount(): void {
    this.uppy = new Uppy({ id: 'uppyloader', autoProceed: true, debug: true })
                    .use(Dashboard, {
                      inline: true,
                      target: "#uppyUpload",
                      showProgressDetails: true,
                      proudlyDisplayPoweredByUppy: false,
	                    height:150,
                      width:300
                    })
                    .use(DropTarget, {
                      target: document.body,
                    })
                    .use(XHRUpload, { endpoint: 'http://localhost:5107/api/Intake/Upload', formData: true, bundle: true, fieldName:'fileupload' });
  }

  componentWillUnmount () {
    this.uppy.close({ reason: 'unmount' })
  }

  render() {
    return (
        <div id="uppyUpload">
        </div>
    );
  }
  
}

