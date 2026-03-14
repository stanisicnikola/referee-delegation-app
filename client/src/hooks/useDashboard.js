import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export const dashboardKeys = {
  all: ["dashboard"],
  data: (period) => [...dashboardKeys.all, period],
};

export const useDashboard = (period = "7days") => {
  return useQuery({
    queryKey: dashboardKeys.data(period),
    queryFn: () => dashboardApi.getData(period),
    refetchInterval: 60000,
  });
};
