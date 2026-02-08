import { appApi as api } from "@/lib/axios";

type DashboardShortlistItem = {
  job_id: string;
  title: string;
  company_name: string;
  location: string;
  match_score: number;
  strong_signals: string[];
  likely_gaps: string[];
  job_url: string;
};

type DashboardSnapshot = {
  strongest_cluster: {
    name: string;
    description: string;
  };
  most_common_gap: {
    name: string;
    description: string;
  };
};

type DashboardData = {
  shortlist: DashboardShortlistItem[];
  snapshot: DashboardSnapshot;
};

type BackendResponse<T> = {
  status: number;
  message: string;
  data: T;
};

export const getDashboard = async () => {
  const response = await api.get<BackendResponse<DashboardData>>("/api/dashboard", {
    withCredentials: true,
  });

  return response.data.data;
};
