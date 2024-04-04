import ApiService from '@app/services/Api.service';

export const getJobs = (JobStatus: string, createdBy: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get('Job/getjobs?jobStatus=' + JobStatus + '&createdBy=' + createdBy)
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
    getJobs
}

export default JobService;