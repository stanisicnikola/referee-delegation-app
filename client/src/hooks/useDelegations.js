import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { delegationsApi } from "../api";
import { toast } from "react-toastify";
import { matchKeys } from "./useMatches";

export const delegationKeys = {
  all: ["delegations"],
  statistics: () => [...delegationKeys.all, "statistics"],
  myDelegations: () => [...delegationKeys.all, "my-delegations"],
  matchDelegation: (matchId) => [...delegationKeys.all, "match", matchId],
  availableReferees: (matchId) => [
    ...delegationKeys.all,
    "available-referees",
    matchId,
  ],
};

export const useDelegationStatistics = () => {
  return useQuery({
    queryKey: delegationKeys.statistics(),
    queryFn: () => delegationsApi.getStatistics(),
  });
};

export const useMyDelegations = () => {
  return useQuery({
    queryKey: delegationKeys.myDelegations(),
    queryFn: () => delegationsApi.getMyDelegations(),
  });
};

export const useMatchDelegation = (matchId) => {
  return useQuery({
    queryKey: delegationKeys.matchDelegation(matchId),
    queryFn: () => delegationsApi.getMatchDelegation(matchId),
    enabled: !!matchId,
  });
};

export const useAvailableRefereesForMatch = (matchId) => {
  return useQuery({
    queryKey: delegationKeys.availableReferees(matchId),
    queryFn: () => delegationsApi.getAvailableReferees(matchId),
    enabled: !!matchId,
  });
};

export const useDelegateReferees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }) =>
      delegationsApi.delegateReferees(matchId, data),
    onSuccess: (data, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.pendingDelegation(),
      });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(matchId) });
      toast.success(data?.message || "Referees delegated successfully!", {
        toastId: "delegation-create",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delegate referees.",
        { toastId: "delegation-create-error" },
      );
    },
  });
};

export const useUpdateRefereeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, refereeId, data }) =>
      delegationsApi.updateRefereeRole(matchId, refereeId, data),
    onSuccess: (data, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      toast.success(data?.message || "Referee role updated successfully!", {
        toastId: "delegation-role-update",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update referee role.",
        { toastId: "delegation-role-update-error" },
      );
    },
  });
};

export const useRemoveRefereeFromMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, refereeId }) =>
      delegationsApi.removeReferee(matchId, refereeId),
    onSuccess: (data, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.pendingDelegation(),
      });
      toast.success(
        data?.message || "Referee removed from match successfully!",
        { toastId: "delegation-remove" },
      );
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to remove referee.",
        { toastId: "delegation-remove-error" },
      );
    },
  });
};

export const useConfirmAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId) => delegationsApi.confirmAssignment(matchId),
    onSuccess: (data, matchId) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: delegationKeys.myDelegations(),
      });
      toast.success(data?.message || "Assignment confirmed successfully!", {
        toastId: "delegation-confirm",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to confirm assignment.",
        { toastId: "delegation-confirm-error" },
      );
    },
  });
};

export const useRejectAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, data }) =>
      delegationsApi.rejectAssignment(matchId, data),
    onSuccess: (data, { matchId }) => {
      queryClient.invalidateQueries({
        queryKey: delegationKeys.matchDelegation(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: delegationKeys.myDelegations(),
      });
      toast.success(data?.message || "Assignment rejected successfully!", {
        toastId: "delegation-reject",
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to reject assignment.",
        { toastId: "delegation-reject-error" },
      );
    },
  });
};
