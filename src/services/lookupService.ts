import ApiService from '@app/services/Api.service';

export const getUsers = (role: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get('Lookup/getuserlookup?role=' + role)
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

  export const getStatus = (type: string) => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get('Lookup/getstatuslookup?type=' + type)
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

 

  const LookupService = {
    getUsers,
    getStatus
}

export default LookupService;