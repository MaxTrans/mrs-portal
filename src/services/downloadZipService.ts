import JSZip from "jszip";
import { saveAs } from "file-saver";
import ApiService from "@app/services/Api.service";
import { url } from 'inspector';
import { AxiosRequestConfig } from 'axios';

export class DownloadModel {
    link: string = '';
    fileSize: number = 0;
    fileName: string = '';
}


export const getFile = (url: string) => {
    const httpOptions: AxiosRequestConfig = {
        headers: {
            'Content-Type': getContentType(url),
        },
        responseType: 'blob',
    };

    return new Promise(async (res, rej) => {
        ApiService.requests.get(url, httpOptions)
            .then((response) => {
                return res(response);
            })
    });
};

function getFile1(url: string) {
    const httpOptions: AxiosRequestConfig = {
        headers: {
            'Content-Type': getContentType(url),
        },
        responseType: 'blob',
    };

    return ApiService.requests.get(url, httpOptions)

}

async function downlodFile(fileInfo: any, callback: Function){
    fetch(fileInfo.SourceFilePath)
    .then((res:any) => res.blob())
    .then((blob:any) => {
      callback();
      saveAs(blob, fileInfo.FileName);
    });
}

async function createZip(files: any[], zipName: string, callback: Function) {
    const name = zipName + '.zip';
    var zip = new JSZip();
    // tslint:disable-next-line:prefer-for-of
    // for (let counter = 0; counter < files.length; counter++) {
    //     const element = files[counter];
    //     const fileData: any = await getFile(element);
    //     const b: any = new Blob([fileData], {
    //         type: fileData.type,
    //     });

    //     zip.file(element.substring(element.lastIndexOf('/') + 1),b,);
    // }
    const imagesFetcher = await Promise.all(
        files.map(async (file, index) => {
          const res = await fetch(file.SourceFilePath);
  
          return res.blob();
        })
      );
  
      imagesFetcher.forEach((fileBlob, index) => {
        let file = files[index];
        zip.file(file.FileName, fileBlob );
      });

    zip.generateAsync({ type: 'blob' }).then((content) => {
        if (callback) callback();
        if (content) {
            saveAs(content, name);
        }
    });
}

function getContentType(url: string): string {
    let extension: string = new RegExp(/(?:\.([^.]+))?$/).exec(url)[1];
    var contentType = '';

    switch (extension) {
        case 'pdf': {
            return 'application/pdf';
        }
        case 'xlsx': {
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }
        case 'xsl': {
            return 'application/vnd.ms-excel';
        }
        case 'csv': {
            return 'application/vnd.ms-excel';
        }
        case 'jpg': {
            return 'image/jpg';
        }
        case 'jpge': {
            return 'image/jpge';
        }
        default: {
            return 'application/json-patch+json';
        }
    }
}


const DownloadZipService = {
    getFile,
    createZip,
    downlodFile
}

export default DownloadZipService;

