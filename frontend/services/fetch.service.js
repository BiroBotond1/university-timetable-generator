
class FetchService {
  defaultServerName = "http://127.0.0.1:3000/api/";

  async fetch(path, options) {
    return await fetch(this.defaultServerName + path, options);
  }

  async fetchWithAuth(path) {
    const token = localStorage.getItem('token'); 
    if(!token) {
      this.$router.push('/login');
      return;
    }

    const resp = await fetch(this.defaultServerName + path, {
      headers: {
        "Authorization": token,
      },
    });
    if(resp.status === 401) {
      localStorage.clear('token');
      this.$router.push('/login');
      return;
    }

    return resp;
  }
}

export default new FetchService();