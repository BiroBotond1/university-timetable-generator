import { useRouter } from 'vue-router';

class FetchService {
  private defaultServerName: string = "http://127.0.0.1:3000/api/";

  async fetch(path: string, options?: RequestInit) {
    return await fetch(this.defaultServerName + path, options);
  }

  async fetchWithAuth(path: string) {
    const token = localStorage.getItem('token'); 
    if(!token) {
      useRouter().push('/login');
      throw "Not logged in!"
    }

    const resp = await fetch(this.defaultServerName + path, {
      headers: {
        "Authorization": token,
      },
    });
    if(resp.status === 401) {
      localStorage.removeItem('token');
      useRouter().push('/login');
      throw "Bad Token!"
    }

    return resp;
  }
}

export default new FetchService();