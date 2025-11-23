import { useRouter } from 'vue-router';

class ApiService {
  fetchWithAuth!: (path: string) => Promise<Response>;

  setFetcher(fetcher: (path: string) => Promise<Response>) {
    this.fetchWithAuth = fetcher;
  }
}

export default new ApiService();