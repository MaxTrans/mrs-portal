import ApiService from '@app/services/Api.service';

export const getJobs = (userId:string, JobStatus: string, createdBy: string, filename: string | null = null, fromDate: string | null = null, toDate: string | null = null) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`Job/getjobs?userId=${userId}&jobStatus=${JobStatus}&${createdBy != null ? 'createdBy=' + createdBy : ''}&${filename != null ? 'filename=' + filename : ''}&${fromDate != null ? 'fromDate=' + fromDate : ''}&${toDate != null ? 'toDate=' + toDate : ''}`)
      .then((response) => {
        if(response.isSuccess)
        {
          return res(response);
        }
        else
        {
          return rej({ message: response.message });
        }
      })
    });
  };

  export const deleteJob = (jobId:string, userId:string, status: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`Job/deletejob?jobId=${jobId}&userId=${userId}&status=${status}`)
      .then((response) => {
        if(response.isSuccess)
        {
          return res(response);
        }
        else
        {
          return rej({ message: response.message });
        }
      })
    });
  };

  export const updateJobStatus = (jobId:string, userId:string, status: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`Job/updateJobStatus?jobId=${jobId}&userId=${userId}&status=${status}`)
      .then((response) => {
        if(response.isSuccess)
        {
          return res(response);
        }
        else
        {
          return rej({ message: response.message });
        }
      })
    });
  };

  const JobService = {
    getJobs,
    deleteJob,
    updateJobStatus
}

export default JobService;