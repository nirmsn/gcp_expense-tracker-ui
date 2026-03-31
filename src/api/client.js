import axios from "axios";

// In local dev these point to nginx proxy
// In production these are set via environment variables at build time
const AUTH_URL    = process.env.REACT_APP_AUTH_URL    || "/api/auth";
const FEED_URL    = process.env.REACT_APP_FEED_URL    || "/api/expenses/feed";
const FETCH_URL   = process.env.REACT_APP_FETCH_URL   || "/api/expenses/fetch";

function makeClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );

  return client;
}

const authClient  = makeClient(AUTH_URL);
const feedClient  = makeClient(FEED_URL);
const fetchClient = makeClient(FETCH_URL);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => authClient.post("/login",    data),
  register: (data) => authClient.post("/register", data),
};

// ── Categories (fetch service) ────────────────────────────────
export const categoryAPI = {
  list: () => fetchClient.get("/categories/"),
};

// ── Expenses — reads (fetch service) ─────────────────────────
export const fetchAPI = {
  list:    (params) => fetchClient.get("/",        { params }),
  summary: (params) => fetchClient.get("/summary", { params }),
  get:     (id)     => fetchClient.get(`/${id}`),
};

// ── Expenses — writes (feed service) ─────────────────────────
export const feedAPI = {
  create: (data)      => feedClient.post("/",      data),
  update: (id, data)  => feedClient.put(`/${id}`,  data),
  delete: (id)        => feedClient.delete(`/${id}`),
};
