import ApiService from '@app/services/Api.service';


export const getClients = () => {
    return new Promise(async (res, rej) => {
      ApiService.requests.get(`User/GetClients`)
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

  const ClientService = {
    getClients
}

export default ClientService;