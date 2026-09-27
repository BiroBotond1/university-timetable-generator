class ApiService {
  fetchWithAuth!: (path: string, init?: RequestInit) => Promise<Response>;

  setFetcher(fetcher: (path: string, init?: RequestInit) => Promise<Response>) {
    this.fetchWithAuth = fetcher;
  }
}

export default new ApiService();
